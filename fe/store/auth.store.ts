import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
	uuid: string
	email: string
	fullName: string | null
	createdAt?: string | null
	lastLogin?: string | null
}

interface AuthState {
	token: string | null
	user: User | null
	isAuthenticated: boolean
	setToken: (token: string | null) => void
	setUser: (user: User | null) => void
	login: (token: string, user: User) => void
	logout: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			token: null,
			user: null,
			isAuthenticated: false,
			setToken: token =>
				set({
					token,
					isAuthenticated: !!token
				}),
			setUser: user =>
				set({
					user
				}),
			login: (token, user) =>
				set({
					token,
					user,
					isAuthenticated: !!token
				}),
			logout: () =>
				set({
					token: null,
					user: null,
					isAuthenticated: false
				})
		}),
		{
			name: 'auth-storage'
		}
	)
)
