// Student Profile interfaces

export interface StudentProfileResponse {
	studentId: string
	full_name: string
	email: string
	created_at: Date | string
	updated_at: Date | string
}

export interface UpdateProfileRequest {
	studentId?: string
	full_name: string
	email: string
}

export interface UpdateProfileResponse {
	message: string
}
