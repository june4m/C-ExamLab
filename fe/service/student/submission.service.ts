'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	SubmitAnswerRequest,
	SubmitAnswerResponse,
	GetSubmissionsRequest,
	GetSubmissionsResponse
} from '@/interface/student/submission.interface'

export function useSubmitAnswer() {
	return useMutation({
		mutationFn: async (
			request: SubmitAnswerRequest
		): Promise<SubmitAnswerResponse> => {
			const { data } = await axios.post<SubmitAnswerResponse>(
				'/student/questions/submission',
				request
			)
			return data
		},
		onError: (error) => {
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
			const { data } = await axios.post<GetSubmissionsResponse>(
				'/student/rooms/submissiones',
				request
			)
			return data
		},
		enabled: !!roomId && !!studentId,
		onError: (error) => {
			console.error('Get submissions error:', error)
		}
	})
}

