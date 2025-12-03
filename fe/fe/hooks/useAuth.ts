'use client'

import { useAuthStore } from '@/store/auth.store'

/**
 * Hook to access authentication state and methods
 * @returns Auth state and utility functions
 */
export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    login,
    logout,
  }
}

