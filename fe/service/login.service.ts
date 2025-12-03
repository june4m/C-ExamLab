import { useMutation } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	LoginRequest,
	LoginResponse,
	ApiResponse
} from '@/interface/auth/login.interface'

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest): Promise<LoginResponse> => {
			const { data } = await axios.post<ApiResponse<LoginResponse>>(
				'/auth/login',
				payload
			)

			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Login failed')
			}

			return data.data
		}
	})
}
