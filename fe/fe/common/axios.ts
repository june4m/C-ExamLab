import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export const axiosGeneral = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - dynamically import auth store to avoid circular dependency
axiosGeneral.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const { useAuthStore } = await import("@/store/auth.store")
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
axiosGeneral.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const { useAuthStore } = await import("@/store/auth.store")
        useAuthStore.getState().logout()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
