"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { create } from "zustand"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("auth-token") : null,
  isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("auth-token") : false,
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error("Logout failed")
      return res.json()
    },
  })
}

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
}

export function LogoutButton({
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
}: LogoutButtonProps) {
  const router = useRouter()
  const { mutate: logout, isPending } = useLogout()
  const logoutStore = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        logoutStore()
        router.push("/login")
      },
      onError: () => {
        logoutStore()
        router.push("/login")
      },
    })
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout} disabled={isPending} className={className}>
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  )
}
