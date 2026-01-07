'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { ApiResponse } from '@/interface'
import type {
	QuizListItem,
	CreateQuizBody,
	SubmitBody,
	QuizDetail,
	QuizSubmissionResponse
} from '@/interface/admin/quiz.interface'

// Get all quizzes
// Note: Backend endpoint is /quiz (not /admin/quizzes)
export function getQuizzes(): Promise<QuizListItem[]> {
	return axios
		.get<ApiResponse<QuizListItem[]>>('/quiz')
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(res.data.error || res.data.message || 'Failed to fetch quizzes')
			}
			return res.data.data
		})
}

// Get single quiz by ID
export function getQuiz(id: string): Promise<QuizDetail> {
	return axios
		.get<ApiResponse<QuizDetail>>(`/quiz/${id}`)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(res.data.error || res.data.message || 'Failed to fetch quiz')
			}
			return res.data.data
		})
}

// Create new quiz (Admin only - backend checks isAdmin)
export function createQuiz(payload: CreateQuizBody): Promise<{ uuid: string }> {
	return axios
		.post<ApiResponse<{ uuid: string }>>('/quiz', payload)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(res.data.error || res.data.message || 'Failed to create quiz')
			}
			return res.data.data
		})
}

// Submit quiz
export function submitQuiz(id: string, payload: SubmitBody): Promise<QuizSubmissionResponse> {
	return axios
		.post<ApiResponse<{ score: number; totalPoints: number; percentage: number; grade: string }>>(
			`/quiz/${id}/submit`,
			payload
		)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(res.data.error || res.data.message || 'Failed to submit quiz')
			}
			// Map backend response to frontend format
			return {
				uuid: '', // Backend doesn't return uuid in submission response
				quizUuid: id,
				accountUuid: '', // Backend doesn't return accountUuid
				score: res.data.data.score,
				totalPoints: res.data.data.totalPoints,
				submittedAt: new Date().toISOString()
			}
		})
}

// React Query Hooks
export function useGetQuizzes() {
	return useQuery({
		queryKey: ['admin', 'quizzes'],
		queryFn: getQuizzes,
		staleTime: 2 * 60 * 1000 // 2 minutes
	})
}

export function useGetQuiz(id: string) {
	return useQuery({
		queryKey: ['admin', 'quiz', id],
		queryFn: () => getQuiz(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000 // 5 minutes
	})
}

export function useCreateQuiz() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: createQuiz,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] })
		}
	})
}

// Note: Backend returns { score, totalPoints, percentage, grade } for submit
// We map it to QuizSubmissionResponse format

export function useSubmitQuiz() {
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: SubmitBody }) =>
			submitQuiz(id, payload)
	})
}

