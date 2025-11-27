"use client"

import { useMutation } from "@tanstack/react-query"
import { axiosGeneral as axios } from "@/common/axios"
import type {
  LoginResponse,
  LoginRequest,
} from "@/interface/auth/login.interface"

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await axios.post<LoginResponse>("/auth/login", payload)
      return data
    },
    onSuccess: (data) => {
      console.log("Login successful:", data.message)
    },
    onError: (error: Error) => {
      console.error("Login failed:", error.message)
    },
  })
}
