'use client'

<<<<<<< HEAD
import { useEffect, useState } from 'react'
=======
import { useEffect } from 'react'
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function Home() {
	const router = useRouter()
	const token = useAuthStore(state => state.token)
<<<<<<< HEAD
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

=======

	useEffect(() => {
		if (!token) {
			router.push('/login')
		} else {
			router.push('/dashboard')
		}
	}, [token, router])

>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<p className="text-muted-foreground">Redirecting...</p>
			</div>
		</div>
	)
}
