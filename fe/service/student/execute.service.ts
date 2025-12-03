'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	ExecuteCodeRequest,
	ExecuteCodeResponse
} from '@/interface/student/execute.interface'

// ApiResponse wrapper type matching backend
interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

export function useExecuteCode() {
	return useMutation({
		mutationFn: async (
			request: ExecuteCodeRequest
		): Promise<ExecuteCodeResponse> => {
			const { data } = await axios.post<ApiResponse<ExecuteCodeResponse>>(
				'/student/questions/execute',
				request
			)
			if (!data.success || !data.data) {
				throw new Error(
					data.error || data.message || 'Failed to execute code'
				)
			}
			return data.data
		},
		onError: (error) => {
			console.error('Execute code error:', error)
		}
	})
}

