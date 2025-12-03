// Register service interfaces

export interface RegisterRequest {
	username: string
	password: string
}

export interface RegisterResponse {
	accesstoken: string
}
