'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	ExecuteCodeRequest,
	ExecuteCodeResponse
} from '@/interface/student/execute.interface'

// Backend JudgeFromFile request format
interface JudgeFromFileRequest {
	code: string
	roomId: string
	questionId: string
	includePrivate?: boolean
	timeLimit?: number
	memoryLimit?: number
	optimizationLevel?: 0 | 1 | 2 | 3 | 's'
}

// Backend JudgeResult response format (direct response, not wrapped)
interface JudgeResult {
	passed: number
	failed: number
	total: number
	results: Array<{
		testCase: number
		passed: boolean
		input: string
		expectedOutput: string
		actualOutput?: string
		error?: string
		errorCode?: string
		executionTime?: number
	}>
	error?: string
	errorCode?: string
	lineNumber?: number
	columnNumber?: number
	errorDetails?: string
}

export function useExecuteCode() {
	return useMutation({
		mutationFn: async (
			request: ExecuteCodeRequest
		): Promise<ExecuteCodeResponse> => {
			// Use judge-from-file endpoint with only example test cases (includePrivate: false)
			const backendRequest: JudgeFromFileRequest = {
				code: request.answerCode,
				roomId: request.roomId,
				questionId: request.questionId,
				includePrivate: false // Only use example/public test cases for execution
			}

			// Backend returns JudgeResult directly (not wrapped in ApiResponse)
			const { data } = await axios.post<JudgeResult>(
				'/compiler/judge-from-file',
				backendRequest
			)

			// Check for compilation/judge error
			if (data.error) {
				// Return error response with full error details
				const errorResponse: ExecuteCodeResponse = {
					results: [],
					error: data.error,
					errorCode: data.errorCode,
					lineNumber: data.lineNumber,
					columnNumber: data.columnNumber,
					errorDetails: data.errorDetails
				}
				return errorResponse
			}

			// Check if all results have compilation errors (indicates compilation failed)
			const hasCompilationError =
				data.results.length > 0 &&
				data.results.every(r => r.error && !r.actualOutput)

			if (hasCompilationError && data.results[0]?.error) {
				// Extract error info from first result
				const firstError = data.results[0].error
				const errorResponse: ExecuteCodeResponse = {
					results: [],
					error: firstError,
					errorCode: data.results[0].errorCode || data.errorCode,
					errorDetails: firstError
				}
				return errorResponse
			}

			// Transform backend response to frontend format
			// Map each test case result to ExecuteResult format
			const response: ExecuteCodeResponse = {
				results: data.results.map(result => ({
					currentTestCase: result.actualOutput || result.error || '(no output)',
					exampleTestCase: result.expectedOutput || '(no expected output)'
				}))
			}

			return response
		},
		onError: error => {
			console.error('Execute code error:', error)
		}
	})
}
