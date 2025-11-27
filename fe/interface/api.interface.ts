// Base API interfaces

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ApiErrorResponse {
  error: string
  message?: string
  statusCode?: number
}

