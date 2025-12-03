import { Elysia } from 'elysia'
import { wrapResponse } from '../common/dtos/response'
import { NODE_ENV } from '../configurations/env'

/**
 * Sanitize error message for production
 * Removes sensitive information like stack traces, file paths, etc.
 */
const sanitizeError = (error: unknown): string => {
	if (error instanceof Error) {
		// In production, only return the error message without stack trace
		if (NODE_ENV === 'production') {
			// Remove file paths and line numbers
			let message = error.message
			// Remove common sensitive patterns
			message = message.replace(/\/[^\s]+/g, '[path]')
			message = message.replace(/at\s+.*/g, '')
			return message.trim() || 'An unexpected error occurred'
		}
		// In development, return full error message
		return error.message
	}

	if (typeof error === 'string') {
		return error
	}

	return 'An unexpected error occurred'
}

/**
 * Get appropriate HTTP status code from error
 */
const getErrorStatusCode = (error: unknown): number => {
	if (error && typeof error === 'object' && 'status' in error) {
		const status = Number(error.status)
		if (!isNaN(status) && status >= 400 && status < 600) {
			return status
		}
	}

	// Check for MySQL/database errors
	if (error && typeof error === 'object') {
		const dbError = error as any
		// MySQL error codes
		if (
			dbError.code === 'ER_NO_SUCH_TABLE' ||
			dbError.code === 'ER_BAD_FIELD_ERROR'
		) {
			return 500
		}
		if (dbError.code === 'ER_DUP_ENTRY') {
			return 409
		}
		if (dbError.code === 'ER_ACCESS_DENIED_ERROR') {
			return 500
		}
	}

	// Default error codes based on error type
	if (error instanceof TypeError) return 400
	if (error instanceof ReferenceError) return 500
	if (error instanceof SyntaxError) return 400

	return 500
}

/**
 * Extract underlying MySQL error from Drizzle wrapped errors
 */
const extractMySQLError = (error: any): any | null => {
	// Check if error itself is a MySQL error
	if (error?.code || error?.errno || error?.sqlState || error?.sqlMessage) {
		return error
	}

	// Check for cause property (common in modern error handling)
	if (error?.cause) {
		const cause = extractMySQLError(error.cause)
		if (cause) return cause
	}

	// Check for nested error properties
	if (error?.error) {
		const nested = extractMySQLError(error.error)
		if (nested) return nested
	}

	// Check all properties for MySQL error patterns
	if (error && typeof error === 'object') {
		for (const key in error) {
			if (error[key] && typeof error[key] === 'object') {
				const nested = extractMySQLError(error[key])
				if (nested) return nested
			}
		}
	}

	return null
}

/**
 * Error handling middleware
 * Catches all errors and handles them appropriately
 */
export const errorHandler = (app: Elysia) => {
	return app.onError(({ code, error, set, request }) => {
		// Try to extract underlying MySQL error from Drizzle wrapped errors
		const mysqlError = extractMySQLError(error)
		const dbError = mysqlError || (error as any)

		// Get appropriate status code
		const statusCode = getErrorStatusCode(dbError)

		// Enhanced logging for 500 errors
		if (statusCode === 500) {
			// Check if it's a database error
			const isDbError =
				dbError.code || dbError.errno || dbError.sqlState || dbError.sqlMessage

			if (isDbError) {
				console.error('[500 Error Handler - Database Error]', {
					code,
					method: request.method,
					path: request.url,
					drizzleError: error instanceof Error ? error.message : String(error),
					mysqlError: {
						code: dbError.code,
						errno: dbError.errno,
						sqlState: dbError.sqlState,
						sqlMessage: dbError.sqlMessage,
						sql: dbError.sql,
						message: dbError.message
					},
					timestamp: new Date().toISOString()
				})
			} else {
				// Check if error message suggests database issue
				const errorMsg = error instanceof Error ? error.message : String(error)
				const isDbRelated =
					errorMsg.includes('Failed query') ||
					errorMsg.includes('database') ||
					errorMsg.includes('table') ||
					errorMsg.includes('column')

				console.error('[500 Error Handler]', {
					code,
					method: request.method,
					path: request.url,
					error:
						error instanceof Error
							? {
									name: error.name,
									message: error.message,
									stack: NODE_ENV === 'development' ? error.stack : undefined
							  }
							: String(error),
					isDbRelated,
					timestamp: new Date().toISOString()
				})

				// In development, log full stack trace and all error properties
				if (NODE_ENV === 'development') {
					if (error instanceof Error && error.stack) {
						console.error('[Stack Trace]', error.stack)
					}
					// Log all error properties to help debug
					if (error && typeof error === 'object') {
						console.error('[Error Properties]', {
							keys: Object.keys(error),
							values: Object.fromEntries(
								Object.entries(error).map(([k, v]) => [
									k,
									typeof v === 'object' && v !== null ? Object.keys(v) : v
								])
							)
						})
					}
				}
			}
		} else {
			// Log other errors (4xx, etc.)
			console.error('[Error Handler]', {
				code,
				statusCode,
				method: request.method,
				path: request.url,
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString()
			})
		}

		// Sanitize error message
		const sanitizedMessage = sanitizeError(error)

		// Set status
		set.status = statusCode

		// Return sanitized error response
		return wrapResponse(null, statusCode, '', sanitizedMessage)
	})
}
