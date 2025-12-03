'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { LogoutResponse } from '@/interface/auth/logout.interface'

export function useLogout() {
	return useMutation({
		mutationFn: async () => {
			const { data } = await axios.post<LogoutResponse>('/auth/logout', {})
			return data
		}
	})
}
