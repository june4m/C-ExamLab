'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

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
	const router = useRouter()

	useEffect(() => {
		// Check authentication status and redirect if not authenticated
		if (!isAuthenticated || !token) {
			router.push(redirectTo)
		}
	}, [isAuthenticated, token, router, redirectTo])

	// Show fallback or nothing if not authenticated
	if (!isAuthenticated || !token) {
		return <>{fallback}</>
	}

	return <>{children}</>
}
