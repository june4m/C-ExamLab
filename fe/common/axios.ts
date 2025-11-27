import axios from "axios"

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
    // Add auth token or other headers here if needed
    // const token = getToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
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
    // Handle errors globally here if needed
    // if (error.response?.status === 401) {
    //   // Handle unauthorized
    // }
    return Promise.reject(error)
  }
)
