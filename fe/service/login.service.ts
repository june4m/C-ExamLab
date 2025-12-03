import { useMutation } from '@tanstack/react-query'
<<<<<<< HEAD

interface LoginRequest {
	email: string
	password: string
}

interface LoginResponse {
	accesstoken: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
=======
import { axiosGeneral as axios } from '@/common/axios'
import type {
	LoginRequest,
	LoginResponse,
	ApiResponse
} from '@/interface/auth/login.interface'
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest): Promise<LoginResponse> => {
<<<<<<< HEAD
			const res = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!res.ok) throw new Error('Login failed')
			return res.json()
=======
			const { data } = await axios.post<ApiResponse<LoginResponse>>(
				'/auth/login',
				payload
			)

			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Login failed')
			}

			return data.data
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
		}
	})
}
