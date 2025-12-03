'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	StudentProfileResponse,
	UpdateProfileRequest,
	UpdateProfileResponse
} from '@/interface/student/profile.interface'

// ApiResponse wrapper type matching backend
interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

// Backend response format (camelCase)
interface BackendProfileResponse {
	uuid: string
	email: string
	fullName: string | null
	createdAt: string | null
	lastLogin: string | null
}

export function useGetProfile() {
	return useQuery({
		queryKey: ['student', 'profile'],
		queryFn: async () => {
			const { data } = await axios.get<ApiResponse<BackendProfileResponse>>(
				'/user/profile'
			)
			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Failed to fetch profile')
			}

			// Transform backend response (camelCase) to frontend format (snake_case)
			const backendData = data.data
			const profile: StudentProfileResponse = {
				studentId: backendData.uuid,
				full_name: backendData.fullName || '',
				email: backendData.email,
				created_at: backendData.createdAt || null,
				updated_at: backendData.lastLogin || null
			}

			return profile
		},
		staleTime: 5 * 60 * 1000 // 5 minutes - profile doesn't change often
	})
}

export function useUpdateProfile() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (
			payload: UpdateProfileRequest & { studentId?: string }
		) => {
			// Get studentId from auth store if not provided
			let studentId = payload.studentId
			if (!studentId && typeof window !== 'undefined') {
				const { useAuthStore } = await import('@/store/auth.store')
				const user = useAuthStore.getState().user
				studentId = user?.uuid
			}

			if (!studentId) {
				throw new Error('Student ID is required')
			}

			// Backend expects studentId, full_name, and email
			const requestPayload = {
				studentId,
				full_name: payload.full_name,
				email: payload.email
			}

			const { data } = await axios.patch<ApiResponse<UpdateProfileResponse>>(
				'/user/student/profile',
				requestPayload
			)
			if (!data.success || !data.data) {
				throw new Error(
					data.error || data.message || 'Failed to update profile'
				)
			}
			return data.data
		},
		onSuccess: () => {
			// Invalidate and refetch profile data after successful update
			queryClient.invalidateQueries({ queryKey: ['student', 'profile'] })
		}
	})
}
