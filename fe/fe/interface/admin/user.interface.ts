// Admin User interfaces

export interface AdminUser {
	studentId: string
	studentFullName: string
	studentEmail: string
	isBanned: boolean
	lastLogin: string
	createdAt: string
	updatedAt: string
}

export interface AdminUsersResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: AdminUser[]
}

export interface BanUserResponse {
	success: boolean
	code: number
	message: string
	error: string
	data: {
		message: string
	}
}
