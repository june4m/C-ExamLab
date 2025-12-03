import { t } from 'elysia'

// User Profile Response
export const UserProfileSchema = t.Object({
	uuid: t.String(),
	email: t.String(),
	fullName: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()]),
	lastLogin: t.Union([t.String(), t.Null()])
})

export type UserProfile = typeof UserProfileSchema.static

// Join Room Request
export const JoinRoomSchema = t.Object({
	roomCode: t.String({ minLength: 6, maxLength: 6 })
})

export type JoinRoomDto = typeof JoinRoomSchema.static

// Join Room Response
export const JoinRoomResponseSchema = t.Object({
	message: t.String(),
	roomId: t.String(),
	roomName: t.String(),
	openTime: t.Union([t.String(), t.Null()]),
	closeTime: t.Union([t.String(), t.Null()])
})

export type JoinRoomResponse = typeof JoinRoomResponseSchema.static
