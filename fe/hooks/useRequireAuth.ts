'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

/**
 * Hook to protect routes - redirects to login if not authenticated
 * @param redirectTo - Optional redirect path (defaults to '/login')
 * @returns Auth state
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, token, router, redirectTo])

  return useAuth()
}

