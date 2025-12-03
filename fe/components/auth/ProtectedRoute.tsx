'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { Loader2 } from 'lucide-react'

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
<<<<<<< HEAD
	const { isAuthenticated, token, user } = useAuth()
=======
	const { isAuthenticated, token } = useAuth()
	const hasHydrated = useAuthStore(state => state._hasHydrated)
>>>>>>> origin/main
	const router = useRouter()
	const isHydrated = useIsHydrated()

	useEffect(() => {
<<<<<<< HEAD
		if (!isHydrated) return

		if (!isAuthenticated || !token) {
=======
		// Only redirect after store has hydrated and user is not authenticated
		if (hasHydrated && (!isAuthenticated || !token)) {
>>>>>>> origin/main
			router.push(redirectTo)
			return
		}
<<<<<<< HEAD

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

=======
	}, [hasHydrated, isAuthenticated, token, router, redirectTo])

	// Show loading state while hydrating
	if (!hasHydrated) {
		return (
			<>
				{fallback || (
					<div className="flex min-h-screen items-center justify-center">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-sm text-muted-foreground">Loading...</p>
						</div>
					</div>
				)}
			</>
		)
	}

	// Show fallback or nothing if not authenticated (after hydration)
>>>>>>> origin/main
	if (!isAuthenticated || !token) {
		return <>{fallback}</>
	}

	if (requiredRole && user?.role !== requiredRole) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
