/**
 * Compiler Error Codes
 * Standardized error codes for compiler service responses
 */

export enum CompilerErrorCode {
	// Compilation errors
	COMPILATION_ERROR = 'COMPILATION_ERROR',
	SYNTAX_ERROR = 'SYNTAX_ERROR',

	// Runtime errors
	RUNTIME_ERROR = 'RUNTIME_ERROR',
	SEGMENTATION_FAULT = 'SEGMENTATION_FAULT',
	FLOATING_POINT_EXCEPTION = 'FLOATING_POINT_EXCEPTION',
	MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',

	// Timeout errors
	TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
	COMPILATION_TIMEOUT = 'COMPILATION_TIMEOUT',

	// System errors
	SERVER_BUSY = 'SERVER_BUSY',
	CONTAINER_ERROR = 'CONTAINER_ERROR',
	INTERNAL_ERROR = 'INTERNAL_ERROR',

	// Validation errors
	INVALID_CODE = 'INVALID_CODE',
	CODE_TOO_LARGE = 'CODE_TOO_LARGE',
	DANGEROUS_CODE = 'DANGEROUS_CODE',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface CompilerError {
	code: CompilerErrorCode
	message: string
	details?: string
}

/**
 * Detect error type from error message
 */
export function detectErrorCode(errorMessage: string): CompilerErrorCode {
	const msg = errorMessage.toLowerCase()

	// Compilation errors
	if (msg.includes('error:') || msg.includes('fatal error:')) {
		return CompilerErrorCode.COMPILATION_ERROR
	}

	// Runtime errors
	if (msg.includes('segmentation fault') || msg.includes('sigsegv')) {
		return CompilerErrorCode.SEGMENTATION_FAULT
	}
	if (msg.includes('floating point exception') || msg.includes('sigfpe')) {
		return CompilerErrorCode.FLOATING_POINT_EXCEPTION
	}
	if (msg.includes('killed') || msg.includes('oom')) {
		return CompilerErrorCode.MEMORY_LIMIT_EXCEEDED
	}

	// Timeout
	if (msg.includes('time limit exceeded') || msg.includes('timeout')) {
		return CompilerErrorCode.TIME_LIMIT_EXCEEDED
	}

	// System errors
	if (
		msg.includes('cannot fork') ||
		msg.includes('resource temporarily unavailable')
	) {
		return CompilerErrorCode.SERVER_BUSY
	}

	// Default
	return CompilerErrorCode.RUNTIME_ERROR
}

/**
 * Create user-friendly error message
 */
export function createErrorMessage(
	code: CompilerErrorCode,
	details?: string
): CompilerError {
	const messages: Record<CompilerErrorCode, string> = {
		[CompilerErrorCode.COMPILATION_ERROR]: 'Compilation failed',
		[CompilerErrorCode.SYNTAX_ERROR]: 'Syntax error in code',
		[CompilerErrorCode.RUNTIME_ERROR]: 'Runtime error occurred',
		[CompilerErrorCode.SEGMENTATION_FAULT]:
			'Segmentation fault (invalid memory access)',
		[CompilerErrorCode.FLOATING_POINT_EXCEPTION]:
			'Floating point exception (division by zero)',
		[CompilerErrorCode.MEMORY_LIMIT_EXCEEDED]: 'Memory limit exceeded',
		[CompilerErrorCode.TIME_LIMIT_EXCEEDED]: 'Time limit exceeded',
		[CompilerErrorCode.COMPILATION_TIMEOUT]: 'Compilation timeout',
		[CompilerErrorCode.SERVER_BUSY]: 'Server is busy, please try again',
		[CompilerErrorCode.CONTAINER_ERROR]: 'Container error',
		[CompilerErrorCode.INTERNAL_ERROR]: 'Internal server error',
		[CompilerErrorCode.INVALID_CODE]: 'Invalid code',
		[CompilerErrorCode.CODE_TOO_LARGE]: 'Code size exceeds limit',
		[CompilerErrorCode.DANGEROUS_CODE]: 'Code contains dangerous patterns',
		[CompilerErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded'
	}

	return {
		code,
		message: messages[code],
		details: details ? sanitizeErrorDetails(details) : undefined
	}
}

/**
 * Sanitize error details for user display
 */
function sanitizeErrorDetails(details: string): string {
	return (
		details
			// Remove absolute paths
			.replace(/\/[a-zA-Z0-9/_.-]+\//g, '')
			// Remove container IDs
			.replace(/container [a-f0-9]{12,}/gi, 'container')
			// Remove file IDs
			.replace(/code_[a-f0-9]{16,}/gi, 'code.c')
			// Remove temporary paths
			.replace(/\/tmp\/[a-zA-Z0-9/_.-]+/g, 'code.c')
			// Clean up timeout messages
			.replace(/timeout: the monitored command dumped core\n/gi, '')
			// Limit length
			.substring(0, 2000)
	)
}
