// Logout service interfaces

export interface LogoutRequest {
	// Empty object - no body required
}

export interface LogoutResponse {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: null
}

export interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}
