'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'

// Interfaces
export interface TestCase {
	id: string
	roomId: string
	questionId: string
	testCaseNumber: number
	input: string
	expectedOutput: string
	isPublic: boolean
	points: number
	description: string
	createdAt?: string
}

export interface TestCasesResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: TestCase[]
}

export interface CreateTestCaseRequest {
	roomId: string
	questionId: string
	testCaseNumber: number
	input: string
	expectedOutput: string
	isPublic: boolean
	points: number
	description: string
}

export interface CreateTestCaseResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		message: string
	}
}

// Hooks
export function useGetTestCases(roomId: string, questionId: string) {
	return useQuery({
		queryKey: ['admin', 'testcases', roomId, questionId],
		queryFn: async () => {
			const { data } = await axios.get<TestCasesResponse>(
				`/testcase/room/${roomId}/question/${questionId}`
			)
			return data
		},
		enabled: !!roomId && !!questionId,
		staleTime: 2 * 60 * 1000
	})
}

export function useCreateTestCase() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: CreateTestCaseRequest) => {
			const { data } = await axios.post<CreateTestCaseResponse>(
				'/testcase',
				payload
			)
			return data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin', 'testcases', variables.roomId, variables.questionId]
			})
		}
	})
}
