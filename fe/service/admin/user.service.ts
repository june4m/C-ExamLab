'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	AdminUsersResponse,
	BanUserResponse
} from '@/interface/admin/user.interface'

export function useGetAdminUsers() {
	return useQuery({
		queryKey: ['admin', 'users'],
		queryFn: async () => {
			const { data } = await axios.get<AdminUsersResponse>('/admin/users')
			return data
		},
		staleTime: 2 * 60 * 1000 // 2 minutes
	})
}

export function useBanUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const { data } = await axios.post<BanUserResponse>(
				`/admin/users/${userId}/ban`
			)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
		}
	})
}

export function useUnbanUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const { data } = await axios.post<BanUserResponse>(
				`/admin/users/${userId}/unban`
			)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
		}
	})
}
