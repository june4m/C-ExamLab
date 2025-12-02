// Logout service interfaces

export interface LogoutRequest {
	// Empty object - no body required
}

export interface LogoutResponse {
	message?: string
	success?: boolean
}
