/**
 * Error Parser Utilities
 * Functions to parse GCC errors and detect error types
 */

import { CompilerErrorCode } from './error-codes'

/**
 * Parse GCC error format to extract line, column, and error message
 * Format: file.c:line:column: error: message
 */
export interface ParsedGccError {
	lineNumber?: number
	columnNumber?: number
	errorMessage: string
	fileName?: string
}

export function parseGccError(errorText: string): ParsedGccError | null {
	// GCC error format: file.c:line:column: error: message
	// Example: code.c:5:5: error: expected ';' before 'return'
	// Can have multiple errors, we'll parse the first one
	const lines = errorText.split('\n')

	// Try to find the first error line (not warning)
	for (const line of lines) {
		const gccErrorPattern =
			/([^:]+):(\d+):(\d+):\s*(error|fatal error):\s*(.+)/i

		const match = line.match(gccErrorPattern)
		if (match) {
			return {
				fileName: match[1],
				lineNumber: parseInt(match[2], 10),
				columnNumber: parseInt(match[3], 10),
				errorMessage: match[5].trim()
			}
		}
	}

	// Fallback: try to find any error format (including warnings)
	for (const line of lines) {
		const gccErrorPattern =
			/([^:]+):(\d+):(\d+):\s*(error|warning|fatal error):\s*(.+)/i

		const match = line.match(gccErrorPattern)
		if (match) {
			return {
				fileName: match[1],
				lineNumber: parseInt(match[2], 10),
				columnNumber: parseInt(match[3], 10),
				errorMessage: match[5].trim()
			}
		}
	}

	// Fallback: try to find line number in other formats
	const linePattern = /line\s+(\d+)/i
	const lineMatch = errorText.match(linePattern)
	if (lineMatch) {
		return {
			lineNumber: parseInt(lineMatch[1], 10),
			errorMessage: errorText.trim()
		}
	}

	return {
		errorMessage: errorText.trim()
	}
}

/**
 * Detect error type from error message with detailed classification
 */
export function detectErrorCode(errorMessage: string): CompilerErrorCode {
	const msg = errorMessage.toLowerCase()

	// Runtime errors (check first to avoid false positives)
	if (
		(msg.includes('segmentation fault') || msg.includes('sigsegv')) &&
		!msg.includes('timeout:') &&
		!msg.includes('Terminated')
	) {
		return CompilerErrorCode.SEGMENTATION_FAULT
	}
	if (msg.includes('floating point exception') || msg.includes('sigfpe')) {
		return CompilerErrorCode.FLOATING_POINT_EXCEPTION
	}
	if (msg.includes('killed') || msg.includes('oom')) {
		return CompilerErrorCode.MEMORY_LIMIT_EXCEEDED
	}
	if (msg.includes('time limit exceeded') || msg.includes('timeout')) {
		return CompilerErrorCode.TIME_LIMIT_EXCEEDED
	}

	// Compilation errors - detailed classification
	if (msg.includes('error:') || msg.includes('fatal error:')) {
		// Declaration Error: undeclared, unknown type, etc.
		if (
			msg.includes('undeclared') ||
			msg.includes('unknown type') ||
			msg.includes('implicit declaration') ||
			msg.includes('has not been declared') ||
			msg.includes('was not declared')
		) {
			return CompilerErrorCode.DECLARATION_ERROR
		}

		// Type Mismatch Error: incompatible types, assignment, etc.
		if (
			msg.includes('incompatible type') ||
			msg.includes('incompatible types') ||
			msg.includes('assignment') ||
			msg.includes('cannot convert') ||
			msg.includes('invalid conversion') ||
			msg.includes('type mismatch') ||
			msg.includes('wrong type')
		) {
			return CompilerErrorCode.TYPE_MISMATCH_ERROR
		}

		// Scope Violation: variable out of scope
		if (
			msg.includes('out of scope') ||
			msg.includes('not in scope') ||
			msg.includes('scope') ||
			(msg.includes('undeclared') &&
				(msg.includes('first use') || msg.includes('each undeclared')))
		) {
			// Check if it's likely a scope issue (variable used before declaration in different scope)
			if (
				msg.includes('first use in this function') &&
				!msg.includes('did you mean')
			) {
				return CompilerErrorCode.SCOPE_VIOLATION
			}
		}

		// Syntax Error: missing semicolon, brackets, parentheses, etc.
		if (
			msg.includes('expected') ||
			msg.includes('missing') ||
			msg.includes('before') ||
			msg.includes('after') ||
			msg.includes('syntax error') ||
			msg.includes('parse error') ||
			msg.includes('unexpected') ||
			msg.includes('stray') ||
			msg.includes('unterminated') ||
			msg.includes('missing terminating') ||
			msg.includes('expected expression') ||
			msg.includes('expected declaration') ||
			msg.includes('expected identifier') ||
			msg.includes('expected primary-expression')
		) {
			return CompilerErrorCode.SYNTAX_ERROR
		}

		// Default compilation error
		return CompilerErrorCode.COMPILATION_ERROR
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

