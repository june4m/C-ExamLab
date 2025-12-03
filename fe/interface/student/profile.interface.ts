// Student Profile interfaces

export interface StudentProfileResponse {
	studentId: string
	full_name: string
	email: string
	created_at: Date | string | null
	updated_at: Date | string | null
}

export interface UpdateProfileRequest {
	full_name: string
	email: string
}

export interface UpdateProfileResponse {
	message: string
}
