import { t } from 'elysia'

// Schema for student response
export const StudentSchema = t.Object({
	studentId: t.String(),
	studentFullName: t.Union([t.String(), t.Null()]),
	studentEmail: t.String(),
	isBanned: t.Boolean(),
	lastLogin: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()]),
	updatedAt: t.Union([t.String(), t.Null()])
})

export type Student = typeof StudentSchema.static

// Schema for update user request
export const UpdateUserSchema = t.Object({
	studentFullName: t.Optional(t.String()),
	studentEmail: t.Optional(t.String({ format: 'email' }))
})

export type UpdateUserDto = typeof UpdateUserSchema.static

// Schema for ban/unban response
export const BanResponseSchema = t.Object({
	message: t.String()
})

export type BanResponse = typeof BanResponseSchema.static
