"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { create } from "zustand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

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

function useLogin() {
  return useMutation({
    mutationFn: async (payload: { username: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Login failed")
      return res.json() as Promise<{ accesstoken: string }>
    },
  })
}

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    username?: string
    password?: string
    general?: string
  }>({})

  const { mutate: login, isPending } = useLogin()
  const setToken = useAuthStore((state) => state.setToken)

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!username.trim()) {
      newErrors.username = "Username is required"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    login(
      { username, password },
      {
        onSuccess: (data) => {
          setToken(data.accesstoken)
          router.push("/")
        },
        onError: (error: Error) => {
          setErrors({ general: error.message || "Login failed. Please try again." })
        },
      },
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errors.general && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.general}</span>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) setErrors({ ...errors, username: undefined })
              }}
              disabled={isPending}
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              disabled={isPending}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
