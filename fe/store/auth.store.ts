import { create } from "zustand"

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  logout: () => void
}

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth-token")
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  setToken: (token: string | null) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth-token", token)
      } else {
        localStorage.removeItem("auth-token")
      }
    }
    set({ token, isAuthenticated: !!token })
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
    }
    set({ token: null, isAuthenticated: false })
  },
}))
