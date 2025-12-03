'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	SubmitAnswerRequest,
	SubmitAnswerResponse,
	GetSubmissionsRequest,
	GetSubmissionsResponse
} from '@/interface/student/submission.interface'

// ApiResponse wrapper type matching backend
interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

export function useSubmitAnswer() {
	return useMutation({
		mutationFn: async (
			request: SubmitAnswerRequest
		): Promise<SubmitAnswerResponse> => {
			const { data } = await axios.post<ApiResponse<SubmitAnswerResponse>>(
				'/user/student/questions/submission',
				request
			)
			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Failed to submit answer')
			}
			return data.data
		},
		onError: error => {
			console.error('Submit answer error:', error)
		}
	})
}

export function useGetSubmissions(roomId: string, studentId: string) {
	return useQuery({
		queryKey: ['submissions', roomId, studentId],
		queryFn: async (): Promise<GetSubmissionsResponse> => {
			const request: GetSubmissionsRequest = {
				roomId,
				studentId
			}
			// Note: API has typo "submissiones" instead of "submissions"
			const { data } = await axios.post<ApiResponse<GetSubmissionsResponse>>(
				'/user/student/rooms/submissiones',
				request
			)
			if (!data.success || !data.data) {
				throw new Error(
					data.error || data.message || 'Failed to fetch submissions'
				)
			}
			return data.data
		},
		enabled: !!roomId && !!studentId
	})
}
