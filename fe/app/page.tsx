'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'

interface AuthState {
	token: string | null
	isAuthenticated: boolean
	setToken: (token: string | null) => void
	logout: () => void
}

const useAuthStore = create<AuthState>()(set => ({
	token:
		typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null,
	isAuthenticated:
		typeof window !== 'undefined'
			? !!localStorage.getItem('auth-token')
			: false,
	setToken: (token: string | null) => {
		if (typeof window !== 'undefined') {
			if (token) {
				localStorage.setItem('auth-token', token)
			} else {
				localStorage.removeItem('auth-token')
			}
		}
		set({ token, isAuthenticated: !!token })
	},
	logout: () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth-token')
		}
		set({ token: null, isAuthenticated: false })
	}
}))

export default function Home() {
	const router = useRouter()
	const token = useAuthStore(state => state.token)

	useEffect(() => {
		if (!token) {
			router.push('/login')
		} else {
			router.push('/dashboard')
		}
	}, [token, router])

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<p className="text-muted-foreground">Redirecting...</p>
			</div>
		</div>
	)
}
