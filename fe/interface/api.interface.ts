// Base API interfaces

export interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

export interface ApiErrorResponse {
	error: string
	message?: string
	statusCode?: number
}
