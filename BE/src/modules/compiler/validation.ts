/**
 * Input Validation and Sanitization Utilities
 * Security functions to validate and sanitize compiler inputs
 */

import { CompilerConfig } from './config'
import type {
	CompileRequest,
	JudgeRequest,
	JudgeFromFileRequest
} from './model'

export class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}

/**
 * Sanitize error messages to remove sensitive information
 * Removes absolute paths, container IDs, and file IDs
 */
export function sanitizeErrorMessage(error: string): string {
	return (
		error
			// Remove absolute paths
			.replace(/\/[a-zA-Z0-9/_.-]+\//g, '[path]/')
			// Remove container IDs (12+ hex chars)
			.replace(/container [a-f0-9]{12,}/gi, 'container [id]')
			// Remove file IDs
			.replace(/code_[a-f0-9]{16,}/gi, 'code_[id]')
			// Remove temporary directory paths
			.replace(/\/tmp\/[a-zA-Z0-9/_.-]+/g, '/tmp/[file]')
	)
}

/**
 * Validate code content for security issues
 * Checks for dangerous patterns and size limits
 */
export function validateCode(code: string): void {
	// Check if code exists
	if (!code || typeof code !== 'string') {
		throw new ValidationError('Code must be a non-empty string')
	}

	// Check if code is empty or only whitespace
	if (code.trim().length === 0) {
		throw new ValidationError('Code cannot be empty or contain only whitespace')
	}

	// Check minimum size
	if (code.length < CompilerConfig.MIN_CODE_SIZE) {
		throw new ValidationError(
			`Code must be at least ${CompilerConfig.MIN_CODE_SIZE} byte(s)`
		)
	}

	// Check maximum size
	if (code.length > CompilerConfig.MAX_CODE_SIZE) {
		throw new ValidationError(
			`Code size exceeds maximum allowed (${CompilerConfig.MAX_CODE_SIZE} bytes). Current size: ${code.length} bytes`
		)
	}

	// Check for dangerous patterns
	for (const pattern of CompilerConfig.DANGEROUS_PATTERNS) {
		if (pattern.test(code)) {
			throw new ValidationError(
				'Code contains potentially dangerous operations. System calls and low-level operations are not allowed.'
			)
		}
	}

	// Check for null bytes (potential injection)
	if (code.includes('\0')) {
		throw new ValidationError('Code cannot contain null bytes')
	}
}

/**
 * Validate execution time limit
 */
export function validateTimeLimit(timeLimit?: number): number {
	if (timeLimit === undefined || timeLimit === null) {
		return CompilerConfig.DEFAULT_TIMEOUT
	}

	if (typeof timeLimit !== 'number' || !Number.isFinite(timeLimit)) {
		throw new ValidationError('Time limit must be a valid number')
	}

	if (timeLimit < CompilerConfig.MIN_TIMEOUT) {
		throw new ValidationError(
			`Time limit must be at least ${CompilerConfig.MIN_TIMEOUT}ms`
		)
	}

	if (timeLimit > CompilerConfig.MAX_TIMEOUT) {
		throw new ValidationError(
			`Time limit cannot exceed ${CompilerConfig.MAX_TIMEOUT}ms`
		)
	}

	return timeLimit
}

/**
 * Validate test cases
 */
export function validateTestCases(
	testCases: Array<{ input: string; expectedOutput: string }>
): void {
	if (!Array.isArray(testCases)) {
		throw new ValidationError('Test cases must be an array')
	}

	if (testCases.length === 0) {
		throw new ValidationError('At least one test case is required')
	}

	if (testCases.length > CompilerConfig.MAX_TEST_CASES) {
		throw new ValidationError(
			`Number of test cases exceeds maximum allowed (${CompilerConfig.MAX_TEST_CASES}). Received: ${testCases.length}`
		)
	}

	// Validate each test case
	for (let i = 0; i < testCases.length; i++) {
		const testCase = testCases[i]

		if (!testCase || typeof testCase !== 'object') {
			throw new ValidationError(`Test case ${i + 1} must be an object`)
		}

		if (typeof testCase.input !== 'string') {
			throw new ValidationError(`Test case ${i + 1}: input must be a string`)
		}

		if (typeof testCase.expectedOutput !== 'string') {
			throw new ValidationError(
				`Test case ${i + 1}: expectedOutput must be a string`
			)
		}

		// Check input size
		if (testCase.input.length > CompilerConfig.MAX_TEST_CASE_INPUT_SIZE) {
			throw new ValidationError(
				`Test case ${i + 1}: input size exceeds maximum allowed (${
					CompilerConfig.MAX_TEST_CASE_INPUT_SIZE
				} bytes)`
			)
		}

		// Check expected output size
		if (
			testCase.expectedOutput.length > CompilerConfig.MAX_TEST_CASE_OUTPUT_SIZE
		) {
			throw new ValidationError(
				`Test case ${i + 1}: expected output size exceeds maximum allowed (${
					CompilerConfig.MAX_TEST_CASE_OUTPUT_SIZE
				} bytes)`
			)
		}

		// Check for null bytes
		if (
			testCase.input.includes('\0') ||
			testCase.expectedOutput.includes('\0')
		) {
			throw new ValidationError(`Test case ${i + 1}: cannot contain null bytes`)
		}
	}
}

/**
 * Validate optimization level
 */
export function validateOptimizationLevel(level?: number | string): void {
	if (level === undefined || level === null) {
		return // Optional, defaults will be used
	}

	// Allow 's' for size optimization
	if (level === 's') {
		return
	}

	if (typeof level !== 'number' || !Number.isInteger(level)) {
		throw new ValidationError('Optimization level must be an integer or "s"')
	}

	const validLevels = [0, 1, 2, 3]
	if (!validLevels.includes(level)) {
		throw new ValidationError(
			`Invalid optimization level. Must be one of: ${validLevels.join(
				', '
			)}, or "s"`
		)
	}
}

/**
 * Validate entire CompileRequest
 */
export function validateCompileRequest(request: CompileRequest): void {
	if (!request || typeof request !== 'object') {
		throw new ValidationError('Request must be an object')
	}

	validateCode(request.code)

	// Validate input if provided
	if (request.input !== undefined && request.input !== null) {
		if (typeof request.input !== 'string') {
			throw new ValidationError('Input must be a string')
		}

		if (request.input.length > CompilerConfig.MAX_TEST_CASE_INPUT_SIZE) {
			throw new ValidationError(
				`Input size exceeds maximum allowed (${CompilerConfig.MAX_TEST_CASE_INPUT_SIZE} bytes)`
			)
		}
	}

	// Validate time limit
	if (request.timeLimit !== undefined) {
		validateTimeLimit(request.timeLimit)
	}

	// Validate optimization level
	validateOptimizationLevel(request.optimizationLevel)
}

/**
 * Validate entire JudgeRequest
 */
export function validateJudgeRequest(request: JudgeRequest): void {
	if (!request || typeof request !== 'object') {
		throw new ValidationError('Request must be an object')
	}

	validateCode(request.code)
	validateTestCases(request.testCases)

	if (request.timeLimit !== undefined) {
		validateTimeLimit(request.timeLimit)
	}

	validateOptimizationLevel(request.optimizationLevel)
}

/**
 * Validate JudgeFromFileRequest
 */
export function validateJudgeFromFileRequest(
	request: JudgeFromFileRequest
): void {
	if (!request || typeof request !== 'object') {
		throw new ValidationError('Request must be an object')
	}

	validateCode(request.code)

	// Validate roomId
	if (!request.roomId || typeof request.roomId !== 'string') {
		throw new ValidationError('roomId must be a non-empty string')
	}

	// Validate questionId
	if (!request.questionId || typeof request.questionId !== 'string') {
		throw new ValidationError('questionId must be a non-empty string')
	}

	if (request.timeLimit !== undefined) {
		validateTimeLimit(request.timeLimit)
	}

	validateOptimizationLevel(request.optimizationLevel)
}

/**
 * Generate a secure random workspace ID
 * Validates that the ID doesn't contain path traversal characters
 */
export function generateSecureWorkspaceId(): string {
	const crypto = require('crypto')
	const id = crypto.randomBytes(8).toString('hex')

	// Extra validation to prevent path traversal (defense in depth)
	if (id.includes('..') || id.includes('/') || id.includes('\\')) {
		throw new Error('Generated workspace ID contains invalid characters')
	}

	return id
}

/**
 * Validate filename to prevent path traversal
 */
export function validateFileName(fileName: string): void {
	if (!fileName || typeof fileName !== 'string') {
		throw new ValidationError('Filename must be a non-empty string')
	}

	// Check for path traversal attempts
	if (
		fileName.includes('..') ||
		fileName.includes('/') ||
		fileName.includes('\\')
	) {
		throw new ValidationError(
			'Filename cannot contain path separators or traversal sequences'
		)
	}

	// Check for null bytes
	if (fileName.includes('\0')) {
		throw new ValidationError('Filename cannot contain null bytes')
	}

	// Validate extension
	const extension = fileName.split('.').pop()?.toLowerCase()
	if (
		!extension ||
		!CompilerConfig.ALLOWED_EXTENSIONS.includes(extension as any)
	) {
		throw new ValidationError(
			`Invalid file extension. Allowed extensions: ${CompilerConfig.ALLOWED_EXTENSIONS.join(
				', '
			)}`
		)
	}
}
