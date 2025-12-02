// Login service interfaces

export interface LoginRequest {
	username: string
	password: string
}

export interface LoginResponse {
	accesstoken: string
}
