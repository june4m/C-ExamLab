'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { ApiResponse } from '@/interface'
import type {
	QuizDetail,
	SubmitBody,
	QuestionWithUuid,
	AnswerWithUuid
} from '@/interface/admin/quiz.interface'

// Get quiz by ID (for students to take)
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

// Submit quiz answers
export function submitQuiz(id: string, payload: SubmitBody): Promise<{
	score: number
	totalPoints: number
	percentage: number
	grade: string
}> {
	return axios
		.post<ApiResponse<{ score: number; totalPoints: number; percentage: number; grade: string }>>(
			`/quiz/${id}/submit`,
			payload
		)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(res.data.error || res.data.message || 'Failed to submit quiz')
			}
			return res.data.data
		})
}

// Get all quizzes (for students to browse)
export function getQuizzes(): Promise<Array<{
	uuid: string
	title: string
	description: string | null
	isActive: boolean
	createdAt: string
}>> {
	return axios
		.get<ApiResponse<Array<{
			uuid: string
			title: string
			description: string | null
			isActive: boolean
			createdAt: string
		}>>>('/quiz')
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(res.data.error || res.data.message || 'Failed to fetch quizzes')
			}
			return res.data.data
		})
}

// React Query Hooks
export function useGetQuiz(id: string) {
	return useQuery({
		queryKey: ['quiz', id],
		queryFn: () => getQuiz(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000 // 5 minutes
	})
}

export function useGetQuizzes() {
	return useQuery({
		queryKey: ['quizzes'],
		queryFn: getQuizzes,
		staleTime: 2 * 60 * 1000 // 2 minutes
	})
}

export function useSubmitQuiz() {
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: SubmitBody }) =>
			submitQuiz(id, payload)
	})
}

