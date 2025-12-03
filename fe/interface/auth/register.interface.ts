// Register service interfaces

export interface RegisterRequest {
	email: string
	password: string
<<<<<<< HEAD
	fullName: string
=======
	fullName?: string
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
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
