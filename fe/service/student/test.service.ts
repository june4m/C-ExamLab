'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	TestAnswerRequest,
	TestAnswerResponse
} from '@/interface/student/test.interface'

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

			const { data } = await axios.post<JudgeResult>(
				'/compiler/judge-from-file',
				backendRequest
			)

			// Check for compilation error
			// - Top-level error field indicates compilation/judge error
			// - Empty results might mean test cases couldn't be loaded
			// - All results having errors without actualOutput suggests compilation failed
			const hasCompilationError =
				!!data.error ||
				(data.results.length > 0 &&
					data.results.every(r => r.error && !r.actualOutput))

			// Transform backend response to frontend format
			const response: TestAnswerResponse = {
				compileStatus: hasCompilationError ? false : 'success',
				results: data.results.map(result => ({
					index: result.testCase,
					input: result.input,
					expectedOutput: result.expectedOutput,
					actualOutput: result.actualOutput || '',
					passed: result.passed,
					error: result.error || null
				})),
				overallPassed: data.passed === data.total && data.total > 0
			}

			return response
		},
		onError: error => {
			console.error('Test answer error:', error)
		}
	})
}
