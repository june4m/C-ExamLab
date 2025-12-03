'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
	children: React.ReactNode
	redirectTo?: string
	fallback?: React.ReactNode
	requiredRole?: string
}

// Hook to check if component is hydrated (client-side)
const emptySubscribe = () => () => {}
function useIsHydrated() {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false
	)
}

/**
 * Component to protect routes - only renders children if user is authenticated
 */
export function ProtectedRoute({
	children,
	redirectTo = '/login',
	fallback = null,
	requiredRole
}: ProtectedRouteProps) {
	const { isAuthenticated, token, user } = useAuth()
	const router = useRouter()
	const isHydrated = useIsHydrated()

	useEffect(() => {
		if (!isHydrated) return

		if (!isAuthenticated || !token) {
			router.push(redirectTo)
			return
		}

		if (requiredRole && user?.role !== requiredRole) {
			router.push('/dashboard')
		}
	}, [
		isHydrated,
		isAuthenticated,
		token,
		user,
		router,
		redirectTo,
		requiredRole
	])

	if (!isHydrated) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (!isAuthenticated || !token) {
		return <>{fallback}</>
	}

	if (requiredRole && user?.role !== requiredRole) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
