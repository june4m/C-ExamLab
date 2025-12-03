'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
	children: React.ReactNode
	redirectTo?: string
	fallback?: React.ReactNode
	requiredRole?: string
}

/**
 * Component to protect routes - only renders children if user is authenticated
 * @param children - Content to render if authenticated
 * @param redirectTo - Path to redirect to if not authenticated (defaults to '/login')
 * @param fallback - Optional loading/fallback component to show while checking auth
 * @param requiredRole - Optional role required to access the route
 */
export function ProtectedRoute({
	children,
	redirectTo = '/login',
	fallback = null,
	requiredRole
}: ProtectedRouteProps) {
	const { isAuthenticated, token, user } = useAuth()
	const router = useRouter()

	useEffect(() => {
		// Check authentication status and redirect if not authenticated
		if (!isAuthenticated || !token) {
			router.push(redirectTo)
			return
		}

		// Check role if required
		if (requiredRole && user?.role !== requiredRole) {
			router.push('/dashboard')
		}
	}, [isAuthenticated, token, user, router, redirectTo, requiredRole])

	// Show fallback or nothing if not authenticated
	if (!isAuthenticated || !token) {
		return <>{fallback}</>
	}

	// Show fallback if role doesn't match
	if (requiredRole && user?.role !== requiredRole) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
