'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	ExecuteCodeRequest,
	ExecuteCodeResponse
} from '@/interface/student/execute.interface'

export function useExecuteCode() {
	return useMutation({
		mutationFn: async (
			request: ExecuteCodeRequest
		): Promise<ExecuteCodeResponse> => {
			const { data } = await axios.post<ExecuteCodeResponse>(
				'/student/questions/execute',
				request
			)
			return data
		},
		onError: (error) => {
			console.error('Execute code error:', error)
		}
	})
}

