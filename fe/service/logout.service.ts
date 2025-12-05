'use client'

import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type { LogoutResponse } from '@/interface/auth/logout.interface'
import type { ApiResponse } from '@/interface'

export function useLogout() {
	return useMutation({
		mutationFn: async (): Promise<LogoutResponse> => {
			const { data } = await axios.post<ApiResponse<null>>('/auth/logout', {})

			if (!data.success) {
				throw new Error(data.error || data.message || 'Logout failed')
			}

			return data
		}
	})
}
