'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	TestAnswerRequest,
	TestAnswerResponse
} from '@/interface/student/test.interface'

export function useTestAnswer() {
	return useMutation({
		mutationFn: async (request: TestAnswerRequest): Promise<TestAnswerResponse> => {
			const { data } = await axios.post<TestAnswerResponse>(
				'/student/questions/test',
				request
			)
			return data
		},
		onError: (error) => {
			console.error('Test answer error:', error)
		}
	})
}

