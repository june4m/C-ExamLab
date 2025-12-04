'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'

// Interfaces matching BE response
export interface TestCase {
	testcaseId: string
	index: number
	input: string
	output: string
	is_hidden: number
}

export interface TestCasesResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		questionId: string
		testcaseList: TestCase[]
	}
}

export interface CreateTestCaseRequest {
	questionId: string
	index: number
	input_path: string
	output_path: string
	is_hidden: boolean
}

export interface CreateTestCaseResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		message: string
		testcaseId: string
	}
}

export interface UpdateTestCaseRequest {
	questionId: string
	testcaseId: string
	index: number
	input_path: string
	output_path: string
	is_hidden: boolean
}

// Hooks
export function useGetTestCases(questionId: string) {
	return useQuery({
		queryKey: ['admin', 'testcases', questionId],
		queryFn: async () => {
			const { data } = await axios.get<TestCasesResponse>(
				`/admin/testcases?questionId=${questionId}`
			)
			return data
		},
		enabled: !!questionId,
		staleTime: 2 * 60 * 1000
	})
}

export function useCreateTestCase() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: CreateTestCaseRequest) => {
			const { data } = await axios.post<CreateTestCaseResponse>(
				'/admin/testcases/create-testcase',
				payload
			)
			return data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin', 'testcases', variables.questionId]
			})
		}
	})
}

export function useUpdateTestCase() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: UpdateTestCaseRequest) => {
			const { data } = await axios.put(
				'/admin/testcases/update-testcase',
				payload
			)
			return data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin', 'testcases', variables.questionId]
			})
		}
	})
}

export function useDeleteTestCase() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			questionId,
			testcaseId
		}: {
			questionId: string
			testcaseId: string
		}) => {
			const { data } = await axios.delete(
				`/admin/testcases/${questionId}/${testcaseId}`
			)
			return data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin', 'testcases', variables.questionId]
			})
		}
	})
}
