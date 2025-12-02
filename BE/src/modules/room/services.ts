import { eq } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { rooms } from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type {
	CreateRoomDto,
	UpdateRoomDto,
	Room,
	CreateRoomResponse,
	UpdateRoomResponse
} from '../../common/dtos/room.dto'

// Helper to format room data for response
const formatRoom = (room: any): Room => ({
	uuid: room.uuid,
	code: room.code,
	name: room.name,
	openTime: room.openTime?.toISOString() ?? null,
	closeTime: room.closeTime?.toISOString() ?? null,
	createdBy: room.createdBy,
	createdAt: room.createdAt?.toISOString() ?? null,
	updatedAt: room.updatedAt?.toISOString() ?? null
})

export const roomService = {
	createRoom: async ({ body, user, set }: any) => {
		const { name, openTime, closeTime, options } = body as CreateRoomDto

		// Generate random 6-char code
		const code = Math.random().toString(36).substring(2, 8).toUpperCase()

		// Check if room code already exists (regenerate if needed)
		const [existingRoom] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.code, code))

		if (existingRoom) {
			set.status = 409
			return wrapResponse(
				null,
				409,
				'',
				'Room code collision, please try again'
			)
		}

		const newUuid = crypto.randomUUID()
		// Handle both ISO format and "YYYY-MM-DD HH:mm:ss" format
		const parsedOpenTime = new Date(openTime.replace(' ', 'T'))
		const parsedCloseTime = new Date(closeTime.replace(' ', 'T'))

		await db.insert(rooms).values({
			uuid: newUuid,
			code,
			name,
			openTime: isNaN(parsedOpenTime.getTime()) ? null : parsedOpenTime,
			closeTime: isNaN(parsedCloseTime.getTime()) ? null : parsedCloseTime,
			createdBy: user.userId
		})

		// TODO: Handle options.questionIdList and options.testcaseIdList if provided
		// This will be implemented when question/testcase modules are ready

		const response: CreateRoomResponse = {
			status: 201,
			description: 'Room created successfully'
		}

		return wrapResponse(response, 201, 'Room created successfully')
	},

	getRooms: async ({ user }: any) => {
		const roomList = await db
			.select()
			.from(rooms)
			.where(eq(rooms.createdBy, user.userId))

		return wrapResponse(
			roomList.map(formatRoom),
			200,
			'Rooms retrieved successfully'
		)
	},

	getAllRooms: async () => {
		const roomList = await db.select().from(rooms)

		return wrapResponse(
			roomList.map(formatRoom),
			200,
			'All rooms retrieved successfully'
		)
	},

	getRoomById: async ({ params, user, set }: any) => {
		const { id } = params

		const [room] = await db.select().from(rooms).where(eq(rooms.uuid, id))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check ownership
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		return wrapResponse(formatRoom(room), 200, 'Room retrieved successfully')
	},

	updateRoom: async ({ params, body, user, set }: any) => {
		const { id } = params
		const { name, openTime, closeTime } = body as UpdateRoomDto

		const [room] = await db.select().from(rooms).where(eq(rooms.uuid, id))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check ownership
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const updateValues: any = { updatedAt: new Date() }
		if (name !== undefined) updateValues.name = name
		if (openTime !== undefined) {
			// Handle both ISO format and "YYYY-MM-DD HH:mm:ss" format
			const parsedOpenTime = new Date(openTime.replace(' ', 'T'))
			updateValues.openTime = isNaN(parsedOpenTime.getTime())
				? null
				: parsedOpenTime
		}
		if (closeTime !== undefined) {
			const parsedCloseTime = new Date(closeTime.replace(' ', 'T'))
			updateValues.closeTime = isNaN(parsedCloseTime.getTime())
				? null
				: parsedCloseTime
		}

		await db.update(rooms).set(updateValues).where(eq(rooms.uuid, id))

		const response: UpdateRoomResponse = {
			message: 'success'
		}

		return wrapResponse(response, 200, 'Room updated successfully')
	},

	deleteRoom: async ({ params, user, set }: any) => {
		const { id } = params

		const [room] = await db.select().from(rooms).where(eq(rooms.uuid, id))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check ownership
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		await db.delete(rooms).where(eq(rooms.uuid, id))

		return wrapResponse(null, 200, 'Room deleted successfully')
	}
}
