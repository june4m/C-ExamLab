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
