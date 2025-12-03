import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	RegisterRequest,
	RegisterResponse,
	ApiResponse
} from '@/interface/auth/register.interface'

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
}
