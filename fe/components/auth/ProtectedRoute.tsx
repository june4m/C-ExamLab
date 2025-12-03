'use client'

import { useEffect } from 'react'
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
	const hasHydrated = useAuthStore(state => state._hasHydrated)
	const router = useRouter()

	useEffect(() => {
		// Only redirect after store has hydrated
		if (!hasHydrated) return

		if (!isAuthenticated || !token) {
			router.push(redirectTo)
			return
		}

		// Redirect if user doesn't have required role
		if (requiredRole && user?.role !== requiredRole) {
			router.push('/dashboard')
		}
	}, [
		hasHydrated,
		isAuthenticated,
		token,
		user,
		router,
		redirectTo,
		requiredRole
	])

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
	if (!isAuthenticated || !token) {
		return <>{fallback}</>
	}

	// Show fallback if user doesn't have required role
	if (requiredRole && user?.role !== requiredRole) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
