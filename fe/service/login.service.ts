import { useMutation } from '@tanstack/react-query'

interface LoginRequest {
	email: string
	password: string
}

interface LoginResponse {
	accesstoken: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function useLogin() {
	return useMutation({
		mutationFn: async (payload: LoginRequest): Promise<LoginResponse> => {
			const res = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!res.ok) throw new Error('Login failed')
			return res.json()
		}
	})
}
