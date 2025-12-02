'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function Home() {
	const router = useRouter()
	const token = useAuthStore(state => state.token)

	useEffect(() => {
		// TODO: Check user role and redirect accordingly
		// For now, redirect to login if not authenticated
		// If authenticated, redirect based on role (student/admin)
		if (!token) {
			router.push('/login')
		} else {
			// TODO: Get user role from store/API and redirect
			// router.push('/student/dashboard') or router.push('/admin/dashboard')
			router.push('/student/dashboard')
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
