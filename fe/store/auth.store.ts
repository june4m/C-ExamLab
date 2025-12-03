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
	_hasHydrated: boolean
	setToken: (token: string | null) => void
	setUser: (user: User | null) => void
	login: (token: string, user: User) => void
	logout: () => void
	setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			token: null,
			user: null,
			isAuthenticated: false,
			_hasHydrated: false,
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
				}),
			setHasHydrated: state => {
				set({
					_hasHydrated: state
				})
			}
		}),
		{
			name: 'auth-storage',
			onRehydrateStorage: () => (state, error) => {
				if (!error && state) {
					state.setHasHydrated(true)
				} else {
					// If there's an error or no state, still mark as hydrated
					// This handles the case where there's no stored data
					if (typeof window !== 'undefined') {
						useAuthStore.getState().setHasHydrated(true)
					}
				}
			}
		}
	)
)

// Set hydration flag on client side mount if not already set
if (typeof window !== 'undefined') {
	// Use a small timeout to ensure persist middleware has run
	setTimeout(() => {
		const state = useAuthStore.getState()
		if (!state._hasHydrated) {
			state.setHasHydrated(true)
		}
	}, 0)
}
