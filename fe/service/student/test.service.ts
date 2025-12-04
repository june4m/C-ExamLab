'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	TestAnswerRequest,
	TestAnswerResponse
} from '@/interface/student/test.interface'

// ApiResponse wrapper type matching backend
interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

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

// Backend JudgeResult response format
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
		executionTime?: number
	}>
	error?: string
}

// ApiResponse wrapper type matching backend
interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

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

// Backend JudgeResult response format
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
		executionTime?: number
	}>
	error?: string
}

export function useTestAnswer() {
	return useMutation({
		mutationFn: async (
			request: TestAnswerRequest
		): Promise<TestAnswerResponse> => {
			// Transform frontend request to backend format
			const backendRequest: JudgeFromFileRequest = {
				code: request.answerCode,
				roomId: request.roomId,
				questionId: request.questionId,
				includePrivate: false // Only use public test cases for testing
			}

			const { data } = await axios.post<ApiResponse<JudgeResult>>(
				'/compiler/judge-from-file',
				backendRequest
			)

			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Failed to test answer')
			}

			const judgeResult = data.data

			// Check for compilation error
			// - Top-level error field indicates compilation/judge error
			// - Empty results might mean test cases couldn't be loaded
			// - All results having errors without actualOutput suggests compilation failed
			const hasCompilationError =
				!!judgeResult.error ||
				(judgeResult.results.length > 0 &&
					judgeResult.results.every(r => r.error && !r.actualOutput))

			// Transform backend response to frontend format
			const response: TestAnswerResponse = {
				compileStatus: hasCompilationError ? false : 'success',
				results: judgeResult.results.map(result => ({
					index: result.testCase,
					input: result.input,
					expectedOutput: result.expectedOutput,
					actualOutput: result.actualOutput || '',
					passed: result.passed,
					error: result.error || null
				})),
				overallPassed:
					judgeResult.passed === judgeResult.total && judgeResult.total > 0
			}

			return response
		},
		onError: error => {
			console.error('Test answer error:', error)
		}
	})
}
