'use client'

import { useQuery } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { ExamListResponse } from '@/interface/student/exam.interface'

export function useGetExams(roomId: string) {
	return useQuery({
		queryKey: ['student', 'rooms', roomId, 'exams'],
		queryFn: async () => {
			const { data } = await axios.get<ExamListResponse>(
				`/user/student/rooms/${roomId}/exams`
			)
			return data
		},
		enabled: !!roomId, // Only fetch if roomId is provided
		staleTime: 2 * 60 * 1000 // 2 minutes - exams may change
	})
}

export function useGetQuestion(roomId: string, questionId: string) {
	return useQuery({
		queryKey: ['student', 'rooms', roomId, 'exams', questionId],
		queryFn: async () => {
			// First get the exams list to find the question
			const { data: examsData } = await axios.get<ExamListResponse>(
				`/user/student/rooms/${roomId}/exams`
			)
			const question = examsData.exams.find(
				exam => exam.questionId === questionId
			)

			if (!question) {
				throw new Error('Question not found')
			}

			// Fetch description if description_path exists
			// Note: This assumes description_path is a URL or API endpoint
			// If it's a file path, you may need a backend endpoint to serve it
			let description = ''
			if (question.description_path) {
				try {
					// Try to fetch as a URL (could be relative or absolute)
					const descriptionUrl = question.description_path.startsWith('http')
						? question.description_path
						: `${axios.defaults.baseURL || ''}${question.description_path}`

					const { data: descData } = await axios.get<string>(descriptionUrl, {
						responseType: 'text',
						// Don't add auth token for description files if they're public
						headers: {
							Authorization: undefined
						}
					})
					description = descData
				} catch (error) {
					console.warn(
						'Failed to fetch description from path:',
						question.description_path,
						error
					)
					// Don't throw - just leave description empty, component will handle it
					description = ''
				}
			}

			return {
				...question,
				description
			}
		},
		enabled: !!roomId && !!questionId,
		staleTime: 5 * 60 * 1000 // 5 minutes - question details don't change often
	})
}
