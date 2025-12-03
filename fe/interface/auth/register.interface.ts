// Register service interfaces

export interface RegisterRequest {
	email: string
	password: string
	fullName: string
}

export interface RegisterResponse {
	accesstoken: string
}
