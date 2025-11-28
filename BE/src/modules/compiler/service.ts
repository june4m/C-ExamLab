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

type OptimizationLevel = 0 | 1 | 2 | 3 | 's'

export class CompilerService {
	private containerName = 'c_compiler_persistent'
	private containerReady = false

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
			]).catch(() => { })
		} catch {
			// Container doesn't exist
		}

		// Pull image if needed
		await this.ensureDockerImage()

		// Create and start persistent container
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
				'2',
				'--memory',
				`${DEFAULT_MEMORY_LIMIT * 2}m`,
				'--pids-limit',
				'100',
				'--security-opt',
				'no-new-privileges',
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
			console.log('✓ Compiler container stopped')
		} catch (error) {
			console.error('Failed to stop container:', error)
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
					} catch (error: any) {
						// If permission denied, try with sudo
						if (error.code === 'EPERM' || error.code === 'EACCES') {
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
				console.error(`Failed to cleanup file ${file}:`, error)
			}
		}
	}

	private executeCommand(
		command: string,
		args: string[],
		input?: string,
		timeLimit: number = DEFAULT_TIME_LIMIT
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
			})

			process.stderr.on('data', data => {
				stderr += data.toString()
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
		return this.writeAndCompile(code, sourceFileName, executableFileName, optimizationLevel)
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

	async compileC(request: CompileRequest): Promise<CompileResult> {
		const timeLimit = request.timeLimit || DEFAULT_TIME_LIMIT
		const optimizationLevel = request.optimizationLevel ?? 0
		const workspaceId = randomBytes(8).toString('hex')
		const sourceFileName = `code_${workspaceId}.c`
		const executableFileName = `code_${workspaceId}`

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
			const script = `echo "${encodedCode}" | base64 -d > ${sourceFileName} && gcc ${sourceFileName} -o ${executableFileName} ${gccFlags} 2>&1 && echo "___COMPILE_SUCCESS___" && timeout ${timeoutSeconds}s ./${executableFileName} 2>&1`

			const compileStart = Date.now()
			const result = await this.executeCommand(
				'docker',
				[
					'exec',
					'-i',
					this.containerName,
					'sh',
					'-c',
					script
				],
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
				2000
			).catch(() => { })

			// Check for compilation errors
			if (!output.includes('___COMPILE_SUCCESS___')) {
				// Compilation failed - output contains compile errors
				const compileError = output || stderr || 'Compilation failed'
				const compilationTime = Date.now() - compileStart

				return {
					success: false,
					compilationError: compileError,
					compilationTime,
					executionTime: compilationTime
				}
			}

			// Extract program output (after compile marker)
			const parts = output.split('___COMPILE_SUCCESS___')
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
				2000
			).catch(() => { })

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}
		}
	}

	async judge(request: JudgeRequest): Promise<JudgeResult> {
		const results: JudgeResult['results'] = []
		let passed = 0
		let failed = 0
		const workspaceId = randomBytes(8).toString('hex')
		const sourceFileName = `code_${workspaceId}.c`
		const executableFileName = `code_${workspaceId}`

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
				for (let i = 0; i < request.testCases.length; i++) {
					results.push({
						testCase: i + 1,
						passed: false,
						input: request.testCases[i].input,
						expectedOutput: request.testCases[i].expectedOutput,
						error: `Compilation error: ${compileResult.error}`
					})
				}

				// Cleanup
				await this.executeCommand(
					'docker',
					['exec', this.containerName, 'rm', '-f', sourceFileName],
					undefined,
					5000
				).catch(() => { })

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
						testResult.error = runResult.stderr
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
					testResult.error =
						error instanceof Error ? error.message : 'Execution failed'
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
				5000
			).catch(() => { })
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
				5000
			).catch(() => { })

			// If no results yet, return all as failed
			if (results.length === 0) {
				for (let i = 0; i < request.testCases.length; i++) {
					results.push({
						testCase: i + 1,
						passed: false,
						input: request.testCases[i].input,
						expectedOutput: request.testCases[i].expectedOutput,
						error: error instanceof Error ? error.message : 'Unknown error'
					})
				}
				failed = request.testCases.length
			}
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
	async judgeFromFile(request: JudgeFromFileRequest): Promise<JudgeResult> {
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

		const result = await this.judge(judgeRequest)

		// Enhance results with test case metadata (points, etc.)
		result.results = result.results.map((r, index) => {
			const testCaseInfo = testCaseInfos[index]
			return {
				...r,
				// Add metadata if needed in the future
			}
		})

		return result
	}
}

export const compilerService = new CompilerService()
