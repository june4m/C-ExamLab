import { readFile, writeFile, mkdir, readdir, unlink, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import type {
	TestCaseInfo,
	LoadTestCasesRequest,
	CreateTestCaseRequest,
	UpdateTestCaseRequest,
	DeleteTestCaseRequest
} from './model'

export class TestCaseService {
	private basePath: string

	constructor() {
		// Store test cases in testcases directory at BE root
		// Resolve path relative to this file: BE/src/modules/testcase/service.ts -> BE/testcases
		let currentDir: string

		// Bun supports import.meta.path, Node.js uses __dirname
		if (typeof import.meta !== 'undefined' && import.meta.path) {
			currentDir = dirname(import.meta.path)
		} else if (typeof __dirname !== 'undefined') {
			currentDir = __dirname
		} else {
			// Fallback: assume we're in BE directory
			currentDir = process.cwd()
		}

		const beDir = resolve(currentDir, '..', '..', '..')
		this.basePath = join(beDir, 'testcases')

		// Log the resolved path for debugging
		console.log(`[TestCaseService] Base path resolved to: ${this.basePath}`)
	}

	/**
	 * Get path to test case directory for a room and question
	 */
	private getTestCaseDir(roomId: string, questionId: string): string {
		return join(this.basePath, `room-${roomId}`, `question-${questionId}`)
	}

	/**
	 * Get path to input file
	 */
	private getInputFilePath(
		roomId: string,
		questionId: string,
		testCaseNumber: number
	): string {
		return join(
			this.getTestCaseDir(roomId, questionId),
			`${testCaseNumber}.inp`
		)
	}

	/**
	 * Get path to output file
	 */
	private getOutputFilePath(
		roomId: string,
		questionId: string,
		testCaseNumber: number
	): string {
		return join(
			this.getTestCaseDir(roomId, questionId),
			`${testCaseNumber}.out`
		)
	}

	/**
	 * Get path to metadata file (optional, stores isPublic, points, etc.)
	 */
	private getMetadataFilePath(
		roomId: string,
		questionId: string,
		testCaseNumber: number
	): string {
		return join(
			this.getTestCaseDir(roomId, questionId),
			`${testCaseNumber}.meta.json`
		)
	}

	/**
	 * Ensure directory exists
	 */
	private async ensureDir(dirPath: string): Promise<void> {
		if (!existsSync(dirPath)) {
			await mkdir(dirPath, { recursive: true })
		}
	}

	/**
	 * Load all test cases for a question
	 */
	async loadTestCases(request: LoadTestCasesRequest): Promise<TestCaseInfo[]> {
		const { roomId, questionId, includePrivate = false } = request
		const testCaseDir = this.getTestCaseDir(roomId, questionId)

		if (!existsSync(testCaseDir)) {
			console.warn(
				`[TestCaseService] Test case directory not found: ${testCaseDir} for roomId=${roomId}, questionId=${questionId}`
			)
			return []
		}

		const files = await readdir(testCaseDir)
		const testCaseNumbers = new Set<number>()

		// Find all test case numbers from .inp files
		for (const file of files) {
			if (file.endsWith('.inp')) {
				const testCaseNumber = parseInt(file.replace('.inp', ''), 10)
				if (!isNaN(testCaseNumber)) {
					testCaseNumbers.add(testCaseNumber)
				}
			}
		}

		if (testCaseNumbers.size === 0) {
			console.warn(
				`[TestCaseService] No test case files found in ${testCaseDir} for roomId=${roomId}, questionId=${questionId}`
			)
		}

		const testCases: TestCaseInfo[] = []
		let skippedPrivateCount = 0

		for (const testCaseNumber of Array.from(testCaseNumbers).sort(
			(a, b) => a - b
		)) {
			try {
				const inputPath = this.getInputFilePath(
					roomId,
					questionId,
					testCaseNumber
				)
				const outputPath = this.getOutputFilePath(
					roomId,
					questionId,
					testCaseNumber
				)
				const metadataPath = this.getMetadataFilePath(
					roomId,
					questionId,
					testCaseNumber
				)

				// Read input and output
				const input = await readFile(inputPath, 'utf-8')
				const expectedOutput = await readFile(outputPath, 'utf-8')

				// Read metadata if exists
				let metadata: {
					isPublic?: boolean
					points?: number
					description?: string
				} = {}
				if (existsSync(metadataPath)) {
					try {
						const metadataContent = await readFile(metadataPath, 'utf-8')
						metadata = JSON.parse(metadataContent)
					} catch {
						// Ignore metadata parse errors
					}
				}

				// Default to public if not specified (test cases without metadata are public by default)
				const isPublic =
					metadata.isPublic !== undefined ? metadata.isPublic : true

				// Skip private test cases if not including private
				if (!includePrivate && !isPublic) {
					skippedPrivateCount++
					continue
				}

				testCases.push({
					roomId,
					questionId,
					testCaseNumber,
					input,
					expectedOutput,
					isPublic,
					points: metadata.points,
					description: metadata.description
				})
			} catch (error) {
				console.error(
					`Failed to load test case ${testCaseNumber} for question ${questionId}:`,
					error
				)
				// Continue loading other test cases
			}
		}

		if (skippedPrivateCount > 0) {
			console.log(
				`[TestCaseService] Skipped ${skippedPrivateCount} private test case(s) for roomId=${roomId}, questionId=${questionId} (includePrivate=${includePrivate})`
			)
		}

		console.log(
			`[TestCaseService] Loaded ${testCases.length} test case(s) for roomId=${roomId}, questionId=${questionId} (includePrivate=${includePrivate})`
		)

		return testCases
	}

	/**
	 * Create a new test case
	 */
	async createTestCase(request: CreateTestCaseRequest): Promise<TestCaseInfo> {
		const {
			roomId,
			questionId,
			testCaseNumber,
			input,
			expectedOutput,
			isPublic,
			points,
			description
		} = request

		// Ensure directory exists
		const testCaseDir = this.getTestCaseDir(roomId, questionId)
		await this.ensureDir(testCaseDir)

		// Check if test case already exists
		const inputPath = this.getInputFilePath(roomId, questionId, testCaseNumber)
		if (existsSync(inputPath)) {
			throw new Error(
				`Test case ${testCaseNumber} already exists for question ${questionId} in room ${roomId}`
			)
		}

		// Write input and output files
		await writeFile(inputPath, input, 'utf-8')
		await writeFile(
			this.getOutputFilePath(roomId, questionId, testCaseNumber),
			expectedOutput,
			'utf-8'
		)

		// Write metadata if provided
		if (isPublic !== undefined || points !== undefined || description) {
			const metadata = {
				...(isPublic !== undefined && { isPublic }),
				...(points !== undefined && { points }),
				...(description && { description })
			}
			await writeFile(
				this.getMetadataFilePath(roomId, questionId, testCaseNumber),
				JSON.stringify(metadata, null, 2),
				'utf-8'
			)
		}

		return {
			roomId,
			questionId,
			testCaseNumber,
			input,
			expectedOutput,
			isPublic,
			points,
			description
		}
	}

	/**
	 * Update an existing test case
	 */
	async updateTestCase(request: UpdateTestCaseRequest): Promise<TestCaseInfo> {
		const {
			roomId,
			questionId,
			testCaseNumber,
			input,
			expectedOutput,
			isPublic,
			points,
			description
		} = request

		const inputPath = this.getInputFilePath(roomId, questionId, testCaseNumber)
		if (!existsSync(inputPath)) {
			throw new Error(
				`Test case ${testCaseNumber} does not exist for question ${questionId} in room ${roomId}`
			)
		}

		// Update input file if provided
		if (input !== undefined) {
			await writeFile(inputPath, input, 'utf-8')
		}

		// Update output file if provided
		if (expectedOutput !== undefined) {
			await writeFile(
				this.getOutputFilePath(roomId, questionId, testCaseNumber),
				expectedOutput,
				'utf-8'
			)
		}

		// Update metadata
		const metadataPath = this.getMetadataFilePath(
			roomId,
			questionId,
			testCaseNumber
		)
		let metadata: {
			isPublic?: boolean
			points?: number
			description?: string
		} = {}

		if (existsSync(metadataPath)) {
			try {
				const metadataContent = await readFile(metadataPath, 'utf-8')
				metadata = JSON.parse(metadataContent)
			} catch {
				// Ignore parse errors, start fresh
			}
		}

		// Update metadata fields
		if (isPublic !== undefined) metadata.isPublic = isPublic
		if (points !== undefined) metadata.points = points
		if (description !== undefined) metadata.description = description

		// Write updated metadata
		await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')

		// Read current input/output to return complete info
		const currentInput =
			input !== undefined ? input : await readFile(inputPath, 'utf-8')
		const currentOutput =
			expectedOutput !== undefined
				? expectedOutput
				: await readFile(
						this.getOutputFilePath(roomId, questionId, testCaseNumber),
						'utf-8'
				  )

		return {
			roomId,
			questionId,
			testCaseNumber,
			input: currentInput,
			expectedOutput: currentOutput,
			isPublic: metadata.isPublic,
			points: metadata.points,
			description: metadata.description
		}
	}

	/**
	 * Delete a test case
	 */
	async deleteTestCase(request: DeleteTestCaseRequest): Promise<void> {
		const { roomId, questionId, testCaseNumber } = request

		const inputPath = this.getInputFilePath(roomId, questionId, testCaseNumber)
		const outputPath = this.getOutputFilePath(
			roomId,
			questionId,
			testCaseNumber
		)
		const metadataPath = this.getMetadataFilePath(
			roomId,
			questionId,
			testCaseNumber
		)

		// Delete all related files
		const deletePromises: Promise<void>[] = []

		if (existsSync(inputPath)) {
			deletePromises.push(unlink(inputPath))
		}
		if (existsSync(outputPath)) {
			deletePromises.push(unlink(outputPath))
		}
		if (existsSync(metadataPath)) {
			deletePromises.push(unlink(metadataPath))
		}

		await Promise.all(deletePromises)
	}

	/**
	 * Get test case count for a question
	 */
	async getTestCaseCount(roomId: string, questionId: string): Promise<number> {
		const testCaseDir = this.getTestCaseDir(roomId, questionId)

		if (!existsSync(testCaseDir)) {
			return 0
		}

		const files = await readdir(testCaseDir)
		return files.filter(file => file.endsWith('.inp')).length
	}

	/**
	 * Check if test case exists
	 */
	async testCaseExists(
		roomId: string,
		questionId: string,
		testCaseNumber: number
	): Promise<boolean> {
		const inputPath = this.getInputFilePath(roomId, questionId, testCaseNumber)
		return existsSync(inputPath)
	}
}

export const testCaseService = new TestCaseService()
