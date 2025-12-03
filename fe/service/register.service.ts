import { useMutation } from '@tanstack/react-query'

interface RegisterRequest {
	email: string
	password: string
	fullName: string
}

interface RegisterResponse {
	accesstoken: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function useRegister() {
	return useMutation({
		mutationFn: async (payload: RegisterRequest): Promise<RegisterResponse> => {
			const res = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!res.ok) throw new Error('Registration failed')
			return res.json()
		}
	})
}
