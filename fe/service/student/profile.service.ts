'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	StudentProfileResponse,
	UpdateProfileRequest,
	UpdateProfileResponse
} from '@/interface/student/profile.interface'

export function useGetProfile() {
	return useQuery({
		queryKey: ['student', 'profile'],
		queryFn: async () => {
			const { data } = await axios.get<StudentProfileResponse>(
				'/student/profile'
			)
			return data
		},
		staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
	})
}

export function useUpdateProfile() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: UpdateProfileRequest) => {
			const { data } = await axios.patch<UpdateProfileResponse>(
				'/student/profile',
				payload
			)
			return data
		},
		onSuccess: () => {
			// Invalidate and refetch profile data after successful update
			queryClient.invalidateQueries({ queryKey: ['student', 'profile'] })
		}
	})
}

