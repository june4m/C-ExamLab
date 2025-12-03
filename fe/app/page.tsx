'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function Home() {
	const router = useRouter()
	const token = useAuthStore(state => state.token)
	const user = useAuthStore(state => state.user)
	const [isHydrated, setIsHydrated] = useState(false)

	// Wait for hydration from localStorage
	useEffect(() => {
		setIsHydrated(true)
	}, [])

	useEffect(() => {
		// Only redirect after hydration is complete
		if (!isHydrated) return

		if (!token) {
			router.push('/login')
		} else if (user?.role === 'ADMIN') {
			router.push('/admin/dashboard')
		} else {
			router.push('/dashboard')
		}
	}, [isHydrated, token, user, router])

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<p className="text-muted-foreground">Redirecting...</p>
			</div>
		</div>
	)
}
