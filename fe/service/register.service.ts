'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	RegisterResponse,
	RegisterRequest
} from '@/interface/auth/register.interface'

export function useRegister() {
	return useMutation({
		mutationFn: async (payload: RegisterRequest) => {
			const { data } = await axios.post<RegisterResponse>(
				'/auth/register',
				payload
			)
			return data
		}
	})
}
