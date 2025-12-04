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
import {
	CompilerErrorCode,
	detectErrorCode,
	createErrorMessage
} from './error-codes'

type OptimizationLevel = 0 | 1 | 2 | 3 | 's'

export class CompilerService {
	private containers: string[] = []
	private containerReady = false
	private activeCompilations = new Set<string>()
	private currentContainerIndex = 0

	/**
	 * Get next container in round-robin fashion
	 */
	private getNextContainer(): string {
		if (this.containers.length === 0) {
			throw new Error('No containers available. Ensure containers are started.')
		}
		const container = this.containers[this.currentContainerIndex]
		this.currentContainerIndex =
			(this.currentContainerIndex + 1) % this.containers.length
		return container
	}

	/**
	 * Build GCC compilation flags with optimization level
	 */
	private buildGccFlags(optimizationLevel: OptimizationLevel = 0): string {
		const optFlag = `-O${optimizationLevel}`
		return `${optFlag} -std=c11`
	}

	private async ensureContainer(): Promise<void> {
		if (this.containerReady) return

		console.log(
			`[CompilerService] Starting ${CompilerConfig.CONTAINER_POOL_SIZE} compiler containers...`
		)

		// Start container pool
		for (let i = 0; i < CompilerConfig.CONTAINER_POOL_SIZE; i++) {
			const containerName = `${CompilerConfig.CONTAINER_NAME_PREFIX}_${i}`
			this.containers.push(containerName)

			try {
				// Check if container exists and is running
				const { stdout } = await this.executeCommand('docker', [
					'inspect',
					'-f',
					'{{.State.Running}}',
					containerName
				]).catch(() => ({ stdout: 'false' }))

				if (stdout.trim() === 'true') {
					console.log(
						`[CompilerService] ✓ Container ${containerName} already running`
					)
					continue
				}

				// Remove old container if exists
				await this.executeCommand('docker', ['rm', '-f', containerName]).catch(
					() => {}
				)

				// Ensure image exists
				await this.ensureDockerImage()

				// Create and start container
				await this.executeCommand(
					'docker',
					[
						'run',
						'-d',
						'--name',
						containerName,
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
						'/workspace:rw,nodev,size=100m,exec',
						'-w',
						'/workspace',
						DOCKER_IMAGE,
						'sleep',
						'infinity'
					],
					undefined,
					30000
				)

				console.log(`[CompilerService] ✓ Container ${containerName} started`)
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error)
				console.error(
					`[CompilerService] Failed to start container ${containerName}:`,
					sanitizeErrorMessage(errorMessage)
				)
				throw error
			}
		}

		this.containerReady = true
		console.log(
			`[CompilerService] ✓ All ${CompilerConfig.CONTAINER_POOL_SIZE} containers ready`
		)
	}

	async stopContainer(): Promise<void> {
		if (!this.containerReady) return

		console.log('[CompilerService] Stopping all containers...')

		for (const containerName of this.containers) {
			try {
				await this.executeCommand('docker', ['rm', '-f', containerName])
				console.log(`[CompilerService] ✓ Container ${containerName} stopped`)
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error)
				console.error(
					`[CompilerService] Failed to stop container ${containerName}:`,
					sanitizeErrorMessage(errorMessage)
				)
			}
		}

		this.containerReady = false
		this.containers = []
		console.log('[CompilerService] ✓ All containers stopped')
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
	): Promise<{
		stdout: string
		stderr: string
		executionTime: number
		exitCode?: number
	}> {
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

				// Exit code 139 = 128 + 11 (SIGSEGV) = real segfault
				// Exit code 124 = timeout command's exit code when it kills a process
				// Exit code 137 = 128 + 9 (SIGKILL) = killed (could be timeout or OOM)
				if (code !== 0 && !stderr) {
					if (code === 139) {
						stderr = 'Segmentation fault'
					} else if (code === 124) {
						stderr = 'Time limit exceeded'
					} else if (code === 137) {
						stderr = 'Process killed (time limit or memory limit exceeded)'
					} else {
						stderr = `Process exited with code ${code}`
					}
				}

				resolve({ stdout, stderr, executionTime, exitCode: code ?? undefined })
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
		container: string,
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

			// Combine write + compile in one docker exec - gcc output is already executable
			const compileResult = await this.executeCommand(
				'docker',
				[
					'exec',
					'-i',
					container,
					'sh',
					'-c',
					`base64 -d > ${sourceFileName} && gcc ${sourceFileName} -o ${executableFileName} ${gccFlags} 2>&1`
				],
				encodedCode,
				10000
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
		container: string,
		code: string,
		sourceFileName: string,
		executableFileName: string,
		optimizationLevel: OptimizationLevel = 0
	): Promise<{ success: boolean; error?: string; compilationTime?: number }> {
		// Reuse writeAndCompile for consistency
		return this.writeAndCompile(
			container,
			code,
			sourceFileName,
			executableFileName,
			optimizationLevel
		)
	}

	private async runOnly(
		executableFileName: string,
		input: string,
		timeLimit: number,
		container: string
	): Promise<{
		stdout: string
		stderr: string
		executionTime: number
		exitCode?: number
	}> {
		const startTime = Date.now()

		// Use timeout with SIGKILL to avoid false segfault reports
		// Disable core dumps to prevent false segfault reports
		// Redirect stderr to stdout to capture all output
		const runResult = await this.executeCommand(
			'docker',
			[
				'exec',
				'-i',
				container,
				'sh',
				'-c',
				// Disable core dumps (ulimit -c 0) and run with timeout
				`ulimit -c 0 && timeout -s KILL ${Math.ceil(
					timeLimit / 1000
				)}s ./${executableFileName} 2>&1`
			],
			input,
			timeLimit + 1500
		)

		// Filter out timeout-related false segfault messages
		// When timeout kills a process, it might report "dumped core" which isn't a real segfault
		// Since we redirect stderr to stdout (2>&1), segfault messages might be in stdout
		let filteredStderr = runResult.stderr
		let filteredStdout = runResult.stdout

		// Check if this is a timeout-related kill (timeout command exits with status 124)
		// Also check for timeout messages in both stdout and stderr
		const hasTimeoutMessage =
			filteredStderr.includes('timeout:') ||
			filteredStdout.includes('timeout:') ||
			filteredStderr.includes('Terminated') ||
			filteredStdout.includes('Terminated') ||
			filteredStderr.includes('Killed') ||
			filteredStdout.includes('Killed')

		// Check for segfault messages in both stdout and stderr
		const hasSegfaultMessage =
			filteredStderr.includes('Segmentation fault') ||
			filteredStdout.includes('Segmentation fault') ||
			filteredStderr.includes('segmentation fault') ||
			filteredStdout.includes('segmentation fault')

		// If we have both timeout and segfault, it's likely a false positive from timeout kill
		if (hasTimeoutMessage && hasSegfaultMessage) {
			// Remove segfault messages from both stdout and stderr
			filteredStdout = filteredStdout
				.replace(/Segmentation fault.*core dumped[^\n]*\n?/gi, '')
				.replace(/segmentation fault.*core dumped[^\n]*\n?/gi, '')
				.replace(/timeout:.*dumped core[^\n]*\n?/gi, '')
				.trim()

			filteredStderr = filteredStderr
				.replace(/Segmentation fault.*core dumped[^\n]*\n?/gi, '')
				.replace(/segmentation fault.*core dumped[^\n]*\n?/gi, '')
				.replace(/timeout:.*dumped core[^\n]*\n?/gi, '')
				.trim()
		}

		return {
			stdout: filteredStdout,
			stderr: filteredStderr,
			executionTime: Date.now() - startTime,
			exitCode: runResult.exitCode
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
				const errorCode =
					error instanceof RateLimitError
						? CompilerErrorCode.RATE_LIMIT_EXCEEDED
						: CompilerErrorCode.INVALID_CODE
				const errorInfo = createErrorMessage(errorCode, error.message)

				return {
					success: false,
					error: errorInfo.message,
					errorCode: errorInfo.code,
					errorDetails: errorInfo.details
				}
			}
			throw error
		}

		// Check concurrent compilation limit
		if (
			this.activeCompilations.size >= CompilerConfig.MAX_CONCURRENT_COMPILATIONS
		) {
			const errorInfo = createErrorMessage(CompilerErrorCode.SERVER_BUSY)
			return {
				success: false,
				error: errorInfo.message,
				errorCode: errorInfo.code
			}
		}

		const timeLimit = request.timeLimit || DEFAULT_TIME_LIMIT
		const optimizationLevel = request.optimizationLevel ?? 0
		const workspaceId = generateSecureWorkspaceId()
		const sourceFileName = `code_${workspaceId}.c`
		const executableFileName = `code_${workspaceId}`

		// Track active compilation
		this.activeCompilations.add(workspaceId)

		let container: string | undefined
		try {
			// Ensure containers are ready first
			await this.ensureContainer()

			// Get container for this compilation
			container = this.getNextContainer()

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
				['exec', '-i', container, 'sh', '-c', script],
				request.input || '',
				timeLimit + 3000
			)

			const executionTime = Date.now() - startTime
			const output = result.stdout
			const stderr = result.stderr

			// Async cleanup - don't wait for it
			this.executeCommand(
				'docker',
				['exec', container, 'rm', '-f', sourceFileName, executableFileName],
				undefined,
				1500
			).catch(() => {})

			// Check for compilation errors - use indexOf for faster check
			const markerPos = output.indexOf(CompilerConfig.COMPILE_SUCCESS_MARKER)
			if (markerPos === -1) {
				// Compilation failed - output contains compile errors
				const compileError = output || stderr || 'Compilation failed'
				const compilationTime = Date.now() - compileStart
				const errorCode = detectErrorCode(compileError)
				const errorInfo = createErrorMessage(errorCode, compileError)

				return {
					success: false,
					error: errorInfo.message,
					errorCode: errorInfo.code,
					errorDetails: errorInfo.details,
					compilationTime,
					executionTime: compilationTime
				}
			}

			// Extract program output (after compile marker) - use substring for speed
			const programOutput = output
				.substring(markerPos + CompilerConfig.COMPILE_SUCCESS_MARKER.length)
				.trim()
			const compilationTime = Date.now() - compileStart

			// Check for runtime errors in output
			// Filter out timeout-related false positives
			const hasRealSegfault =
				programOutput.includes('Segmentation fault') &&
				!programOutput.includes('timeout:') &&
				!stderr.includes('timeout:')

			if (
				hasRealSegfault ||
				programOutput.includes('Floating point exception') ||
				(stderr.includes('killed') && !stderr.includes('timeout:'))
			) {
				const errorCode = detectErrorCode(programOutput + ' ' + stderr)
				const errorInfo = createErrorMessage(errorCode, programOutput)

				return {
					success: false,
					error: errorInfo.message,
					errorCode: errorInfo.code,
					errorDetails: errorInfo.details,
					compilationTime,
					executionTime
				}
			}

			return {
				success: true,
				output: programOutput,
				compilationTime,
				executionTime
			}
		} catch (error) {
			// Cleanup on error - async, don't wait
			if (container) {
				this.executeCommand(
					'docker',
					['exec', container, 'rm', '-f', sourceFileName, executableFileName],
					undefined,
					1500
				).catch(() => {})
			}

			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error'
			console.error(
				'[CompilerService] Compilation error:',
				sanitizeErrorMessage(errorMessage)
			)

			const errorCode = detectErrorCode(errorMessage)
			const errorInfo = createErrorMessage(errorCode, errorMessage)

			return {
				success: false,
				error: errorInfo.message,
				errorCode: errorInfo.code,
				errorDetails: errorInfo.details
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

		let container: string | undefined
		try {
			// Ensure containers are ready first
			await this.ensureContainer()

			// Get container for this judge session
			container = this.getNextContainer()

			// 1) Compile once with specified optimization level
			const optimizationLevel = request.optimizationLevel ?? 0
			const compileResult = await this.compileOnly(
				container,
				request.code,
				sourceFileName,
				executableFileName,
				optimizationLevel
			)

			if (!compileResult.success) {
				// All tests fail
				const errorMessage = compileResult.error || 'Unknown compilation error'
				const sanitizedError = sanitizeErrorMessage(errorMessage)

				for (let i = 0; i < request.testCases.length; i++) {
					results.push({
						testCase: i + 1,
						passed: false,
						input: request.testCases[i].input,
						expectedOutput: request.testCases[i].expectedOutput,
						error: `Compilation error: ${sanitizedError}`,
						actualOutput: undefined
					})
				}

				// Cleanup
				await this.executeCommand(
					'docker',
					['exec', container, 'rm', '-f', sourceFileName],
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
						timeLimit,
						container
					)

					testResult.executionTime = runResult.executionTime

					// Check exit code first - most reliable indicator
					// Exit code 139 = 128 + 11 (SIGSEGV) = real segfault
					// Exit code 124 = timeout command's exit code
					// Exit code 137 = 128 + 9 (SIGKILL) = killed (timeout or OOM)
					const isRealSegfault = runResult.exitCode === 139
					const isTimeoutKill =
						runResult.exitCode === 124 || runResult.exitCode === 137

					// Check for errors in both stdout and stderr (since stderr might be redirected)
					const combinedOutput = (
						runResult.stdout +
						' ' +
						runResult.stderr
					).toLowerCase()
					const hasSegfaultMessage =
						combinedOutput.includes('segmentation fault') ||
						combinedOutput.includes('sigsegv')
					const hasTimeoutMessage =
						combinedOutput.includes('timeout:') ||
						combinedOutput.includes('terminated') ||
						combinedOutput.includes('killed')

					// Filter out error messages from stdout for actualOutput
					let cleanStdout = runResult.stdout
					if (isRealSegfault || hasSegfaultMessage) {
						// Remove segfault messages from actual output
						cleanStdout = cleanStdout
							.replace(/Segmentation fault.*core dumped[^\n]*\n?/gi, '')
							.replace(/segmentation fault.*core dumped[^\n]*\n?/gi, '')
							.replace(/Segmentation fault[^\n]*\n?/gi, '')
							.replace(/segmentation fault[^\n]*\n?/gi, '')
							.trim()
					}
					if (isTimeoutKill || hasTimeoutMessage) {
						// Remove timeout messages from actual output
						cleanStdout = cleanStdout
							.replace(/timeout:.*[^\n]*\n?/gi, '')
							.replace(/Terminated[^\n]*\n?/gi, '')
							.replace(/Killed[^\n]*\n?/gi, '')
							.trim()
					}

					testResult.actualOutput = cleanStdout || undefined

					// Prioritize exit code over message content
					if (isRealSegfault) {
						// Exit code 139 = definite real segfault
						testResult.error = sanitizeErrorMessage(
							runResult.stderr || 'Segmentation fault'
						)
						failed++
					} else if (isTimeoutKill) {
						// Exit code 124 or 137 = timeout/kill
						testResult.error = 'Time limit exceeded'
						failed++
					} else if (hasSegfaultMessage && hasTimeoutMessage) {
						// Both messages present but exit code doesn't indicate segfault - likely timeout
						testResult.error = 'Time limit exceeded'
						failed++
					} else if (runResult.stderr && !runResult.stdout) {
						// Only stderr, no stdout - treat as error
						testResult.error = sanitizeErrorMessage(runResult.stderr)
						failed++
					} else if (
						hasSegfaultMessage &&
						!hasTimeoutMessage &&
						!isTimeoutKill
					) {
						// Segfault message without timeout indicators and not a timeout kill
						testResult.error = sanitizeErrorMessage(
							runResult.stderr || runResult.stdout || 'Segmentation fault'
						)
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

			// 3) Cleanup - async, don't wait
			this.executeCommand(
				'docker',
				['exec', container, 'rm', '-f', sourceFileName, executableFileName],
				undefined,
				1500
			).catch(() => {})
		} catch (error) {
			// Cleanup on error - async, don't wait
			if (container) {
				this.executeCommand(
					'docker',
					['exec', container, 'rm', '-f', sourceFileName, executableFileName],
					undefined,
					1500
				).catch(() => {})
			}

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
