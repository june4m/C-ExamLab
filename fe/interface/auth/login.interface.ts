// Login service interfaces

export interface LoginRequest {
	email: string
	password: string
}

export interface LoginResponse {
	user: {
		uuid: string
		email: string
		fullName: string | null
		role: string
	}
	token: string
}
