import { t } from 'elysia'
export const UserProfileSchema = t.Object({
	uuid: t.String(),
	email: t.String(),
	fullName: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()]),
	lastLogin: t.Union([t.String(), t.Null()]),
})

export type UserProfile = typeof UserProfileSchema.static
