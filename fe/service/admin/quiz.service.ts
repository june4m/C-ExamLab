'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { ApiResponse } from '@/interface'
import type {
	QuizListItem,
	CreateQuizBody,
	SubmitBody,
	QuizDetail,
	QuizSubmissionResponse,
	ImportQuizQuestionsBody,
	ImportQuizQuestionsResponse,
	AddQuestionBody,
	AddQuestionResponse,
	CopyQuestionsBody,
	CopyQuestionsResponse
} from '@/interface/admin/quiz.interface'

// Get all quizzes
// Note: Backend endpoint is /quiz (not /admin/quizzes)
export function getQuizzes(): Promise<QuizListItem[]> {
	return axios.get<ApiResponse<QuizListItem[]>>('/quiz').then(res => {
		if (!res.data.success || !res.data.data) {
			throw new Error(
				res.data.error || res.data.message || 'Failed to fetch quizzes'
			)
		}
		return res.data.data
	})
}

// Get single quiz by ID
export function getQuiz(id: string): Promise<QuizDetail> {
	return axios.get<ApiResponse<QuizDetail>>(`/quiz/${id}`).then(res => {
		if (!res.data.success || !res.data.data) {
			throw new Error(
				res.data.error || res.data.message || 'Failed to fetch quiz'
			)
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
				throw new Error(
					res.data.error || res.data.message || 'Failed to create quiz'
				)
			}
			return res.data.data
		})
}

// Submit quiz
export function submitQuiz(
	id: string,
	payload: SubmitBody
): Promise<QuizSubmissionResponse> {
	return axios
		.post<
			ApiResponse<{
				score: number
				totalPoints: number
				percentage: number
				grade: string
			}>
		>(`/quiz/${id}/submit`, payload)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(
					res.data.error || res.data.message || 'Failed to submit quiz'
				)
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

// Import Quiz Questions - POST /quiz/import
export function importQuizQuestions(
	payload: ImportQuizQuestionsBody
): Promise<ImportQuizQuestionsResponse> {
	return axios
		.post<ApiResponse<ImportQuizQuestionsResponse>>('/quiz/import', payload)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(
					res.data.error || res.data.message || 'Failed to import questions'
				)
			}
			return res.data.data
		})
}

export function useImportQuizQuestions() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: importQuizQuestions,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] })
			queryClient.invalidateQueries({ queryKey: ['admin', 'quiz'] })
		}
	})
}

// Add Question to Quiz - POST /quiz/{id}/questions
export function addQuestionToQuiz(
	quizId: string,
	payload: AddQuestionBody
): Promise<AddQuestionResponse> {
	return axios
		.post<ApiResponse<AddQuestionResponse>>(
			`/quiz/${quizId}/questions`,
			payload
		)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(
					res.data.error || res.data.message || 'Failed to add question'
				)
			}
			return res.data.data
		})
}

export function useAddQuestionToQuiz() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			quizId,
			payload
		}: {
			quizId: string
			payload: AddQuestionBody
		}) => addQuestionToQuiz(quizId, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin', 'quiz', variables.quizId]
			})
		}
	})
}

// Copy Questions from Another Quiz - POST /quiz/{id}/copy-questions
export function copyQuestionsFromQuiz(
	targetQuizId: string,
	payload: CopyQuestionsBody
): Promise<CopyQuestionsResponse> {
	return axios
		.post<ApiResponse<CopyQuestionsResponse>>(
			`/quiz/${targetQuizId}/copy-questions`,
			payload
		)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(
					res.data.error || res.data.message || 'Failed to copy questions'
				)
			}
			return res.data.data
		})
}

export function useCopyQuestionsFromQuiz() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			targetQuizId,
			payload
		}: {
			targetQuizId: string
			payload: CopyQuestionsBody
		}) => copyQuestionsFromQuiz(targetQuizId, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin', 'quiz', variables.targetQuizId]
			})
		}
	})
}

// Create Empty Quiz - POST /quiz/create
export interface CreateEmptyQuizBody {
	title: string
	description?: string
}

export function createEmptyQuiz(
	payload: CreateEmptyQuizBody
): Promise<{ uuid: string }> {
	return axios
		.post<ApiResponse<{ uuid: string }>>('/quiz/create', payload)
		.then(res => {
			if (!res.data.success || !res.data.data) {
				throw new Error(
					res.data.error || res.data.message || 'Failed to create quiz'
				)
			}
			return res.data.data
		})
}

export function useCreateEmptyQuiz() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: createEmptyQuiz,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] })
		}
	})
}
