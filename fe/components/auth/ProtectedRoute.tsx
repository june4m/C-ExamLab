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
}

/**
 * Component to protect routes - only renders children if user is authenticated
 * @param children - Content to render if authenticated
 * @param redirectTo - Path to redirect to if not authenticated (defaults to '/login')
 * @param fallback - Optional loading/fallback component to show while checking auth
 */
export function ProtectedRoute({
	children,
	redirectTo = '/login',
	fallback = null
}: ProtectedRouteProps) {
	const { isAuthenticated, token } = useAuth()
	const hasHydrated = useAuthStore(state => state._hasHydrated)
	const router = useRouter()

	useEffect(() => {
		// Only redirect after store has hydrated and user is not authenticated
		if (hasHydrated && (!isAuthenticated || !token)) {
			router.push(redirectTo)
		}
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
	if (!isAuthenticated || !token) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
