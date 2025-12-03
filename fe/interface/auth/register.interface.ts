// Register service interfaces

export interface RegisterRequest {
	email: string
	password: string
	fullName?: string
}

export interface RegisterResponse {
	user: {
		uuid: string
		email: string
		fullName: string | null
	}
	token: string
}

export interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}
