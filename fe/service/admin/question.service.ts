'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'

// Interfaces
export interface CreateQuestionRequest {
	title: string
	descriptionPath: string
	score: number
	timeLimit: number
	memoryLimit: number
	order: number
	roomId: string
}

export interface CreateQuestionResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		message: string
		questionUuid: string
	}
}

export interface Question {
	uuid: string
	roomId: string
	code: string
	title: string
	descriptionPath: string
	score: number
	timeLimit: number
	memoryLimit: number
	order: number
	createdAt: string
}

export interface QuestionsResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		listQuestion: Question[]
	}
}

// Hooks
export function useGetAdminQuestions() {
	return useQuery({
		queryKey: ['admin', 'questions'],
		queryFn: async () => {
			const { data } = await axios.get<QuestionsResponse>(
				'/admin/questions/getAllQuestion'
			)
			return data
		},
		staleTime: 2 * 60 * 1000
	})
}

export function useCreateQuestion() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: CreateQuestionRequest) => {
			const { data } = await axios.post<CreateQuestionResponse>(
				'/admin/questions/create-question',
				payload
			)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
		}
	})
}

export interface UpdateQuestionRequest {
	questionId: string
	title: string
	descriptionPath: string
	score: number
	timeLimit: number
	memoryLimit: number
	order: number
	roomId: string
}

export interface UpdateQuestionResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		message: string
	}
}

export function useUpdateQuestion() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: UpdateQuestionRequest) => {
			const { data } = await axios.put<UpdateQuestionResponse>(
				'/admin/questions/update-question',
				payload
			)
			return data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
			queryClient.invalidateQueries({
				queryKey: ['admin-room-questions', variables.roomId]
			})
		}
	})
}
