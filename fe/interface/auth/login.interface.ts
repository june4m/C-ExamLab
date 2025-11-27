// Login service interfaces

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message?: string
  token?: string
  user?: {
    id: string
    email: string
    name?: string
  }
}
