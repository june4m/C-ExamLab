import { unlink, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { spawn } from 'child_process'
import { randomBytes } from 'crypto'
import { join } from 'path'
import { tmpdir } from 'os'
import {
	DEFAULT_TIME_LIMIT,
	DEFAULT_MEMORY_LIMIT,
	DOCKER_IMAGE
} from '../../common/constant/compiler.constant'
import type {
	CompileRequest,
	CompileResult,
	JudgeRequest,
	JudgeFromFileRequest,
	JudgeResult
} from './model'
import { testCaseService } from '../testcase/service'
import { CompilerConfig } from './config'
import {
	validateCompileRequest,
	validateJudgeRequest,
	validateJudgeFromFileRequest,
	sanitizeErrorMessage,
	generateSecureWorkspaceId,
	ValidationError
} from './validation'
import { compilerRateLimiter, RateLimitError } from './rate-limiter'

type OptimizationLevel = 0 | 1 | 2 | 3 | 's'

export class CompilerService {
	private containerName = CompilerConfig.CONTAINER_NAME
	private containerReady = false
	private activeCompilations = new Set<string>()

	/**
	 * Build GCC compilation flags with optimization level
	 */
	private buildGccFlags(optimizationLevel: OptimizationLevel = 0): string {
		const optFlag = `-O${optimizationLevel}`
		return `${optFlag} -std=c11 -Wall -Wextra`
	}

	private async ensureContainer(): Promise<void> {
		if (this.containerReady) return

		try {
			// Check if container exists and is running
			const { stdout } = await this.executeCommand('docker', [
				'inspect',
				'-f',
				'{{.State.Running}}',
				this.containerName
			])

			if (stdout.trim() === 'true') {
				this.containerReady = true
				return
			}

			// Remove old container if exists but not running
			await this.executeCommand('docker', [
				'rm',
				'-f',
				this.containerName
			]).catch(error => {
				console.warn(
					'[CompilerService] Failed to remove old container:',
					error.message
				)
			})
		} catch (error) {
			// Container doesn't exist - this is fine
			console.log(
				'[CompilerService] Container does not exist, will create new one'
			)
		}

		// Pull image if needed
		await this.ensureDockerImage()

		// Create and start persistent container with enhanced security
		await this.executeCommand(
			'docker',
			[
				'run',
				'-d',
				'--name',
				this.containerName,
				'--network',
				'none',
				'--cpus',
				CompilerConfig.CONTAINER_CPUS,
				'--memory',
				`${CompilerConfig.CONTAINER_MEMORY_MB}m`,
				'--memory-swap',
				`${CompilerConfig.CONTAINER_MEMORY_MB}m`,
				'--pids-limit',
				`${CompilerConfig.CONTAINER_PIDS_LIMIT}`,
				'--security-opt',
				'no-new-privileges',
				'--cap-drop',
				'ALL',
				'--read-only',
				'--tmpfs',
				'/workspace:rw,noexec,nosuid,size=100m',
				'-w',
				'/workspace',
				DOCKER_IMAGE,
				'sleep',
				'infinity'
			],
			undefined,
			30000
		)

		this.containerReady = true
		console.log('✓ Persistent compiler container started')
	}

	async stopContainer(): Promise<void> {
		if (!this.containerReady) return

		try {
			await this.executeCommand('docker', ['rm', '-f', this.containerName])
			this.containerReady = false
			console.log('[CompilerService] ✓ Compiler container stopped')
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error(
				'[CompilerService] Failed to stop container:',
				sanitizeErrorMessage(errorMessage)
			)
		}
	}
	private async createTempFile(
		code: string,
		extension: string
	): Promise<string> {
		const fileName = `code_${randomBytes(16).toString('hex')}.${extension}`
		const filePath = join(tmpdir(), fileName)
		await writeFile(filePath, code, 'utf-8')
		return filePath
	}

	private async ensureDockerImage(): Promise<void> {
		// Check if Docker image exists
		try {
			await this.executeCommand('docker', ['image', 'inspect', DOCKER_IMAGE])
		} catch {
			// Pull image if not exists
			console.log(`Pulling Docker image ${DOCKER_IMAGE}...`)
			await this.executeCommand(
				'docker',
				['pull', DOCKER_IMAGE],
				undefined,
				120000
			)
		}
	}

	private async cleanup(...files: string[]): Promise<void> {
		for (const file of files) {
			try {
				if (existsSync(file)) {
					try {
						await unlink(file)
					} catch (error: unknown) {
						const err = error as NodeJS.ErrnoException
						// If permission denied, try with sudo
						if (err.code === 'EPERM' || err.code === 'EACCES') {
							await this.executeCommand(
								'sudo',
								['rm', '-f', file],
								undefined,
								5000
							)
						} else {
							throw error
						}
					}
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error)
				console.error(
					`[CompilerService] Failed to cleanup file:`,
					sanitizeErrorMessage(errorMessage)
				)
			}
		}
	}

	private executeCommand(
		command: string,
		args: string[],
		input?: string,
		timeLimit: number = DEFAULT_TIME_LIMIT,
		maxOutputSize: number = CompilerConfig.MAX_OUTPUT_SIZE
	): Promise<{ stdout: string; stderr: string; executionTime: number }> {
		return new Promise((resolve, reject) => {
			const startTime = Date.now()
			const process = spawn(command, args)

			let stdout = ''
			let stderr = ''
			let killed = false

			const timeout = setTimeout(() => {
				killed = true
				process.kill('SIGKILL')
				reject(new Error(`Execution time limit exceeded (${timeLimit}ms)`))
			}, timeLimit)

			process.stdout.on('data', data => {
				stdout += data.toString()
				if (stdout.length > maxOutputSize) {
					killed = true
					process.kill('SIGKILL')
					clearTimeout(timeout)
					reject(
						new Error(`Output size exceeded limit (${maxOutputSize} bytes)`)
					)
				}
			})

			process.stderr.on('data', data => {
				stderr += data.toString()
				if (stderr.length > CompilerConfig.MAX_ERROR_OUTPUT_SIZE) {
					killed = true
					process.kill('SIGKILL')
					clearTimeout(timeout)
					reject(
						new Error(
							`Error output size exceeded limit (${CompilerConfig.MAX_ERROR_OUTPUT_SIZE} bytes)`
						)
					)
				}
			})

			process.on('error', error => {
				clearTimeout(timeout)
				reject(error)
			})

			process.on('close', code => {
				clearTimeout(timeout)
				const executionTime = Date.now() - startTime

				if (killed) return

				if (code !== 0 && !stderr) {
					stderr = `Process exited with code ${code}`
				}

				resolve({ stdout, stderr, executionTime })
			})

			if (input) {
				process.stdin.write(input)
				process.stdin.end()
			}
		})
	}

	/**
	 * Write code to file and compile in one docker exec call (optimized)
	 * Uses base64 to safely handle any special characters in code
	 */
	private async writeAndCompile(
		code: string,
		sourceFileName: string,
		executableFileName: string,
		optimizationLevel: OptimizationLevel = 0
	): Promise<{ success: boolean; error?: string; compilationTime?: number }> {
		try {
			const compileStart = Date.now()

			// Encode code to base64 to avoid shell escaping issues
			const encodedCode = Buffer.from(code, 'utf-8').toString('base64')
			const gccFlags = this.buildGccFlags(optimizationLevel)

			// Combine write + compile in one docker exec to reduce overhead
			const compileResult = await this.executeCommand(
				'docker',
				[
					'exec',
					'-i',
					this.containerName,
					'sh',
					'-c',
					`base64 -d > ${sourceFileName} && gcc ${sourceFileName} -o ${executableFileName} ${gccFlags} 2>&1`
				],
				encodedCode,
				15000
			)

			const compilationTime = Date.now() - compileStart
			const compileErrors = compileResult.stderr || compileResult.stdout

			if (compileErrors && compileErrors.includes('error:')) {
				return {
					success: false,
					error: compileErrors,
					compilationTime
				}
			}

			return { success: true, compilationTime }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Compilation failed'
			}
		}
	}

	private async compileOnly(
		code: string,
		sourceFileName: string,
		executableFileName: string,
		optimizationLevel: OptimizationLevel = 0
	): Promise<{ success: boolean; error?: string; compilationTime?: number }> {
		// Reuse writeAndCompile for consistency
		return this.writeAndCompile(
			code,
			sourceFileName,
			executableFileName,
			optimizationLevel
		)
	}

	private async runOnly(
		executableFileName: string,
		input: string,
		timeLimit: number
	): Promise<{ stdout: string; stderr: string; executionTime: number }> {
		const startTime = Date.now()

		const runResult = await this.executeCommand(
			'docker',
			[
				'exec',
				'-i',
				this.containerName,
				'timeout',
				`${Math.ceil(timeLimit / 1000)}s`,
				'sh',
				'-c',
				`./${executableFileName}`
			],
			input,
			timeLimit + 2000
		)

		return {
			stdout: runResult.stdout,
			stderr: runResult.stderr,
			executionTime: Date.now() - startTime
		}
	}

	async compileC(
		request: CompileRequest,
		identifier: string = 'anonymous'
	): Promise<CompileResult> {
		// Validate request and check rate limit
		try {
			validateCompileRequest(request)
			compilerRateLimiter.checkLimit(identifier)
		} catch (error) {
			if (error instanceof ValidationError || error instanceof RateLimitError) {
				return {
					success: false,
					error: error.message
				}
			}
			throw error
		}

		// Check concurrent compilation limit
		if (
			this.activeCompilations.size >= CompilerConfig.MAX_CONCURRENT_COMPILATIONS
		) {
			return {
				success: false,
				error: 'Server is busy. Please try again in a moment.'
			}
		}

		const timeLimit = request.timeLimit || DEFAULT_TIME_LIMIT
		const optimizationLevel = request.optimizationLevel ?? 0
		const workspaceId = generateSecureWorkspaceId()
		const sourceFileName = `code_${workspaceId}.c`
		const executableFileName = `code_${workspaceId}`

		// Track active compilation
		this.activeCompilations.add(workspaceId)

		try {
			await this.ensureContainer()
			const startTime = Date.now()

			// Encode code to base64 to avoid shell escaping issues
			const encodedCode = Buffer.from(request.code, 'utf-8').toString('base64')
			const gccFlags = this.buildGccFlags(optimizationLevel)
			const timeoutSeconds = Math.ceil(timeLimit / 1000)

			// Ultra-optimized: Write + Compile + Run in ONE docker exec call
			// Use markers to separate compile output from program output
			// STDIN is used for program input only
			const script = `echo "${encodedCode}" | base64 -d > ${sourceFileName} && gcc ${sourceFileName} -o ${executableFileName} ${gccFlags} 2>&1 && echo "${CompilerConfig.COMPILE_SUCCESS_MARKER}" && timeout ${timeoutSeconds}s ./${executableFileName} 2>&1`

			const compileStart = Date.now()
			const result = await this.executeCommand(
				'docker',
				['exec', '-i', this.containerName, 'sh', '-c', script],
				request.input || '',
				timeLimit + 5000
			)

			const executionTime = Date.now() - startTime
			const output = result.stdout
			const stderr = result.stderr

			// Async cleanup - don't wait for it
			this.executeCommand(
				'docker',
				[
					'exec',
					this.containerName,
					'rm',
					'-f',
					sourceFileName,
					executableFileName
				],
				undefined,
				CompilerConfig.CLEANUP_TIMEOUT
			).catch(error => {
				console.warn(
					'[CompilerService] Cleanup warning:',
					sanitizeErrorMessage(error.message)
				)
			})

			// Check for compilation errors
			if (!output.includes(CompilerConfig.COMPILE_SUCCESS_MARKER)) {
				// Compilation failed - output contains compile errors
				const compileError = sanitizeErrorMessage(
					output || stderr || 'Compilation failed'
				)
				const compilationTime = Date.now() - compileStart

				return {
					success: false,
					compilationError: compileError,
					compilationTime,
					executionTime: compilationTime
				}
			}

			// Extract program output (after compile marker)
			const parts = output.split(CompilerConfig.COMPILE_SUCCESS_MARKER)
			const programOutput = parts[1]?.trim() || ''
			const compilationTime = Date.now() - compileStart

			return {
				success: true,
				output: programOutput,
				compilationTime,
				executionTime
			}
		} catch (error) {
			// Cleanup on error
			this.executeCommand(
				'docker',
				[
					'exec',
					this.containerName,
					'rm',
					'-f',
					sourceFileName,
					executableFileName
				],
				undefined,
				CompilerConfig.CLEANUP_TIMEOUT
			).catch(cleanupError => {
				console.warn(
					'[CompilerService] Cleanup failed:',
					sanitizeErrorMessage(cleanupError.message)
				)
			})

			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error'
			console.error(
				'[CompilerService] Compilation error:',
				sanitizeErrorMessage(errorMessage)
			)

			return {
				success: false,
				error: sanitizeErrorMessage(errorMessage)
			}
		} finally {
			// Always remove from active compilations
			this.activeCompilations.delete(workspaceId)
		}
	}

	async judge(
		request: JudgeRequest,
		identifier: string = 'anonymous'
	): Promise<JudgeResult> {
		// Validate request and check rate limit
		try {
			validateJudgeRequest(request)
			compilerRateLimiter.checkLimit(identifier)
		} catch (error) {
			if (error instanceof ValidationError || error instanceof RateLimitError) {
				const results: JudgeResult['results'] = request.testCases.map(
					(tc, i) => ({
						testCase: i + 1,
						passed: false,
						input: tc.input,
						expectedOutput: tc.expectedOutput,
						error: error.message
					})
				)
				return {
					passed: 0,
					failed: request.testCases.length,
					total: request.testCases.length,
					results
				}
			}
			throw error
		}

		// Check concurrent compilation limit
		if (
			this.activeCompilations.size >= CompilerConfig.MAX_CONCURRENT_COMPILATIONS
		) {
			const results: JudgeResult['results'] = request.testCases.map(
				(tc, i) => ({
					testCase: i + 1,
					passed: false,
					input: tc.input,
					expectedOutput: tc.expectedOutput,
					error: 'Server is busy. Please try again in a moment.'
				})
			)
			return {
				passed: 0,
				failed: request.testCases.length,
				total: request.testCases.length,
				results
			}
		}

		const results: JudgeResult['results'] = []
		let passed = 0
		let failed = 0
		const workspaceId = generateSecureWorkspaceId()
		const sourceFileName = `code_${workspaceId}.c`
		const executableFileName = `code_${workspaceId}`

		// Track active compilation
		this.activeCompilations.add(workspaceId)

		try {
			await this.ensureContainer()

			// 1) Compile once with specified optimization level
			const optimizationLevel = request.optimizationLevel ?? 0
			const compileResult = await this.compileOnly(
				request.code,
				sourceFileName,
				executableFileName,
				optimizationLevel
			)

			if (!compileResult.success) {
				// All tests fail
				const sanitizedError = sanitizeErrorMessage(
					compileResult.error || 'Unknown compilation error'
				)
				for (let i = 0; i < request.testCases.length; i++) {
					results.push({
						testCase: i + 1,
						passed: false,
						input: request.testCases[i].input,
						expectedOutput: request.testCases[i].expectedOutput,
						error: `Compilation error: ${sanitizedError}`
					})
				}

				// Cleanup
				await this.executeCommand(
					'docker',
					['exec', this.containerName, 'rm', '-f', sourceFileName],
					undefined,
					CompilerConfig.CLEANUP_TIMEOUT
				).catch(error => {
					console.warn(
						'[CompilerService] Cleanup warning:',
						sanitizeErrorMessage(error.message)
					)
				})

				return {
					passed: 0,
					failed: request.testCases.length,
					total: request.testCases.length,
					results
				}
			}

			// 2) Run each test case (compile once, run many)
			const timeLimit = request.timeLimit || DEFAULT_TIME_LIMIT

			for (let i = 0; i < request.testCases.length; i++) {
				const testCase = request.testCases[i]
				const testResult = {
					testCase: i + 1,
					passed: false,
					input: testCase.input,
					expectedOutput: testCase.expectedOutput,
					actualOutput: undefined as string | undefined,
					error: undefined as string | undefined,
					executionTime: undefined as number | undefined
				}

				try {
					const runResult = await this.runOnly(
						executableFileName,
						testCase.input,
						timeLimit
					)

					testResult.executionTime = runResult.executionTime
					testResult.actualOutput = runResult.stdout

					if (runResult.stderr && !runResult.stdout) {
						testResult.error = sanitizeErrorMessage(runResult.stderr)
						failed++
					} else {
						// Compare output
						const expectedTrimmed = testCase.expectedOutput.trim()
						const actualTrimmed = runResult.stdout.trim()

						if (expectedTrimmed === actualTrimmed) {
							testResult.passed = true
							passed++
						} else {
							testResult.error = 'Output mismatch'
							failed++
						}
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Execution failed'
					testResult.error = sanitizeErrorMessage(errorMessage)
					failed++
				}

				results.push(testResult)
			}

			// 3) Cleanup
			await this.executeCommand(
				'docker',
				[
					'exec',
					this.containerName,
					'rm',
					'-f',
					sourceFileName,
					executableFileName
				],
				undefined,
				CompilerConfig.CLEANUP_TIMEOUT
			).catch(error => {
				console.warn(
					'[CompilerService] Cleanup warning:',
					sanitizeErrorMessage(error.message)
				)
			})
		} catch (error) {
			// Cleanup on error
			await this.executeCommand(
				'docker',
				[
					'exec',
					this.containerName,
					'rm',
					'-f',
					sourceFileName,
					executableFileName
				],
				undefined,
				CompilerConfig.CLEANUP_TIMEOUT
			).catch(cleanupError => {
				console.warn(
					'[CompilerService] Cleanup failed:',
					sanitizeErrorMessage(cleanupError.message)
				)
			})

			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error'
			console.error(
				'[CompilerService] Judge error:',
				sanitizeErrorMessage(errorMessage)
			)

			// If no results yet, return all as failed
			if (results.length === 0) {
				const sanitizedError = sanitizeErrorMessage(errorMessage)
				for (let i = 0; i < request.testCases.length; i++) {
					results.push({
						testCase: i + 1,
						passed: false,
						input: request.testCases[i].input,
						expectedOutput: request.testCases[i].expectedOutput,
						error: sanitizedError
					})
				}
				failed = request.testCases.length
			}
		} finally {
			// Always remove from active compilations
			this.activeCompilations.delete(workspaceId)
		}

		return {
			passed,
			failed,
			total: request.testCases.length,
			results
		}
	}

	/**
	 * Judge code with test cases loaded from file system
	 */
	async judgeFromFile(
		request: JudgeFromFileRequest,
		identifier: string = 'anonymous'
	): Promise<JudgeResult> {
		// Validate request
		try {
			validateJudgeFromFileRequest(request)
		} catch (error) {
			if (error instanceof ValidationError) {
				return {
					passed: 0,
					failed: 0,
					total: 0,
					results: []
				}
			}
			throw error
		}

		// Load test cases from file system
		const testCaseInfos = await testCaseService.loadTestCases({
			roomId: request.roomId,
			questionId: request.questionId,
			includePrivate: request.includePrivate || false
		})

		if (testCaseInfos.length === 0) {
			return {
				passed: 0,
				failed: 0,
				total: 0,
				results: []
			}
		}

		// Convert to TestCase format
		const testCases = testCaseInfos.map(tc => ({
			input: tc.input,
			expectedOutput: tc.expectedOutput
		}))

		// Judge with loaded test cases
		const judgeRequest: JudgeRequest = {
			code: request.code,
			testCases,
			timeLimit: request.timeLimit,
			memoryLimit: request.memoryLimit,
			optimizationLevel: request.optimizationLevel
		}

		const result = await this.judge(judgeRequest, identifier)

		// Enhance results with test case metadata (points, etc.)
		result.results = result.results.map((r, index) => {
			const testCaseInfo = testCaseInfos[index]
			return {
				...r
				// Add metadata if needed in the future
			}
		})

		return result
	}
}

export const compilerService = new CompilerService()
