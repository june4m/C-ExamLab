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
	const { isAuthenticated, token } = useAuth()
	const hasHydrated = useAuthStore(state => state._hasHydrated)
	const user = useAuthStore(state => state.user)
	const router = useRouter()

	useEffect(() => {
		// Only redirect after store has hydrated and user is not authenticated
		if (hasHydrated && (!isAuthenticated || !token)) {
			router.push(redirectTo)
			return
		}

		// Redirect if role doesn't match
		if (hasHydrated && requiredRole && user?.role !== requiredRole) {
			// Redirect to appropriate dashboard based on actual role
			if (user?.role === 'ADMIN') {
				router.push('/admin')
			} else {
				router.push('/dashboard')
			}
			return
		}
	}, [
		hasHydrated,
		isAuthenticated,
		token,
		router,
		redirectTo,
		requiredRole,
		user?.role
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

	// Strictly check role - prevent cross-role access
	// If requiredRole is set, user must have exactly that role
	if (requiredRole) {
		// If user role doesn't match required role, don't render children
		if (user?.role !== requiredRole) {
			// Return fallback while redirect is happening
			return (
				<>
					{fallback || (
						<div className="flex min-h-screen items-center justify-center">
							<div className="flex flex-col items-center gap-3">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								<p className="text-sm text-muted-foreground">Redirecting...</p>
							</div>
						</div>
					)}
				</>
			)
		}
	}

	return <>{children}</>
}
