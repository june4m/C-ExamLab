/**
 * Error Message Utilities
 * Functions to create user-friendly error messages
 */

import {
	CompilerErrorCode,
	type CompilerError
} from './error-codes'
import { parseGccError } from './error-parser'

/**
 * Sanitize error details for user display
 * Preserves line numbers and error messages while cleaning up paths
 */
function sanitizeErrorDetails(details: string): string {
	// Split by lines to process each error separately
	const lines = details.split('\n')
	const sanitizedLines: string[] = []

	for (const line of lines) {
		// Skip empty lines
		if (!line.trim()) {
			sanitizedLines.push(line)
			continue
		}

		let sanitized = line
			// Remove absolute paths but keep relative file names
			.replace(/\/[a-zA-Z0-9/_.-]+\/([^:]+):/g, '$1:')
			// Remove container IDs
			.replace(/container [a-f0-9]{12,}/gi, 'container')
			// Replace file IDs with code.c
			.replace(/code_[a-f0-9]{16,}/gi, 'code.c')
			// Remove temporary paths but keep filename
			.replace(/\/tmp\/[a-zA-Z0-9/_.-]+/g, 'code.c')
			// Clean up timeout messages
			.replace(/timeout: the monitored command dumped core/gi, '')

		sanitizedLines.push(sanitized)
	}

	const result = sanitizedLines.join('\n').trim()
	// Limit length but try to keep complete error messages
	return result.length > 2000 ? result.substring(0, 2000) + '...' : result
}

/**
 * Create user-friendly error message with line number information
 */
export function createErrorMessage(
	code: CompilerErrorCode,
	details?: string
): CompilerError {
	// Parse GCC error to extract line number and message
	const parsedError = details ? parseGccError(details) : null
	const lineNumber = parsedError?.lineNumber
	const columnNumber = parsedError?.columnNumber
	const cleanMessage = parsedError?.errorMessage || details

	const messages: Record<CompilerErrorCode, string> = {
		[CompilerErrorCode.COMPILATION_ERROR]: 'Compilation failed',
		[CompilerErrorCode.SYNTAX_ERROR]: 'Syntax error',
		[CompilerErrorCode.DECLARATION_ERROR]: 'Declaration error',
		[CompilerErrorCode.TYPE_MISMATCH_ERROR]: 'Type mismatch error',
		[CompilerErrorCode.SCOPE_VIOLATION]: 'Scope violation',
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

	// Build message with line number if available
	let message = messages[code]
	if (lineNumber !== undefined) {
		message = `${message} at line ${lineNumber}`
		if (columnNumber !== undefined) {
			message = `${message}, column ${columnNumber}`
		}
	}

	return {
		code,
		message,
		details: cleanMessage ? sanitizeErrorDetails(cleanMessage) : undefined,
		lineNumber,
		columnNumber
	}
}

