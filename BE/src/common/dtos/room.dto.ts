import { t } from 'elysia'

// Schema cho response Room
export const RoomSchema = t.Object({
	uuid: t.String(),
	code: t.String(),
	name: t.String(),
	openTime: t.Union([t.String(), t.Null()]),
	closeTime: t.Union([t.String(), t.Null()]),
	createdBy: t.String(),
	createdAt: t.Union([t.String(), t.Null()]),
	updatedAt: t.Union([t.String(), t.Null()])
})

export type Room = typeof RoomSchema.static

// Schema cho options khi tạo Room
export const CreateRoomOptionsSchema = t.Optional(
	t.Object({
		questionIdList: t.Optional(t.Array(t.String())),
		testcaseIdList: t.Optional(t.Array(t.String()))
	})
)

// Schema cho request tạo Room
export const CreateRoomSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 100 }),
	openTime: t.String(),
	closeTime: t.String(),
	options: CreateRoomOptionsSchema
})

export type CreateRoomDto = typeof CreateRoomSchema.static

// Schema cho response tạo Room
export const CreateRoomResponseSchema = t.Object({
	status: t.Number(),
	description: t.String()
})

export type CreateRoomResponse = typeof CreateRoomResponseSchema.static

// Schema cho request cập nhật Room
export const UpdateRoomSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
	openTime: t.Optional(t.String()),
	closeTime: t.Optional(t.String())
})

export type UpdateRoomDto = typeof UpdateRoomSchema.static

// Schema cho response cập nhật Room
export const UpdateRoomResponseSchema = t.Object({
	message: t.String()
})

export type UpdateRoomResponse = typeof UpdateRoomResponseSchema.static
