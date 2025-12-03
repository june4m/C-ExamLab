// User interfaces

export interface User {
	studentId: string
	fullName: string
	email: string
	lastLogin: string
	createdAt: string
	updatedAt: string
}

// API interfaces for users
export interface UserRequest {
	fullName: string
	email: string
	password?: string
}

export interface UserResponse extends User {
	id: string
}
