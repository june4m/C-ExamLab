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

  // Default error codes based on error type
  if (error instanceof TypeError) return 400
  if (error instanceof ReferenceError) return 500
  if (error instanceof SyntaxError) return 400

  return 500
}

/**
 * Error handling middleware
 * Only runs in production to catch and sanitize all errors
 */
export const errorHandler = (app: Elysia) => {
  // Only apply error handling in production
  // if (NODE_ENV !== 'production') {
  //   return app
  // }

  return app.onError(({ code, error, set }) => {
    // Log error for monitoring (in production, you might want to send to logging service)
    console.error('[Error Handler]', {
      code,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })

    // Sanitize error message
    const sanitizedMessage = sanitizeError(error)

    // Get appropriate status code
    const statusCode = getErrorStatusCode(error)

    // Set status
    set.status = statusCode

    // Return sanitized error response
    return wrapResponse(null, statusCode, '', sanitizedMessage)
  })
}

