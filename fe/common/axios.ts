import axios from "axios"
import { useAuthStore } from "@/store/auth.store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export const axiosGeneral = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
axiosGeneral.interceptors.request.use(
  (config) => {
    // Add auth token to headers
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosGeneral.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 errors - unauthorized
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      useAuthStore.getState().logout()
      // Only redirect if we're in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
