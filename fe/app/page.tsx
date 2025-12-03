'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

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
