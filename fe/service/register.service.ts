import { useMutation } from '@tanstack/react-query'
import type {
	RegisterRequest,
	RegisterResponse,
	ApiResponse
} from '@/interface/auth/register.interface'
import { axiosGeneral as axios } from '@/common/axios'

export function useRegister() {
	return useMutation({
		mutationFn: async (payload: RegisterRequest): Promise<RegisterResponse> => {
			const { data } = await axios.post<ApiResponse<RegisterResponse>>(
				'/auth/register',
				payload
			)

			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Registration failed')
			}

			return data.data
		}
	})
	return useMutation({
		mutationFn: async (payload: RegisterRequest): Promise<RegisterResponse> => {
			const { data } = await axios.post<ApiResponse<RegisterResponse>>(
				'/auth/register',
				payload
			)

			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Registration failed')
			}

			return data.data
		}
	})
}
