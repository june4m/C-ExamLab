import { eq, and } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { accounts, rooms, roomParticipants } from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type { JoinRoomDto, JoinRoomResponse } from './model'

export const userService = {
	getProfile: async ({ user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const [userProfile] = await db
			.select({
				uuid: accounts.uuid,
				email: accounts.email,
				fullName: accounts.fullName,
				createdAt: accounts.createdAt,
				lastLogin: accounts.lastLogin,
				role: accounts.role
			})
			.from(accounts)
			.where(eq(accounts.uuid, user.userId))

		if (!userProfile) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		return wrapResponse(
			{
				...userProfile,
				createdAt: userProfile.createdAt?.toISOString() || null,
				lastLogin: userProfile.lastLogin?.toISOString() || null
			},
			200,
			'Profile retrieved successfully'
		)
	},

	joinRoom: async ({ body, user, set }: any) => {
		const { roomCode } = body as JoinRoomDto

		// Find room by code
		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.code, roomCode.toUpperCase()))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		const now = new Date()

		// Check if room has openTime
		if (room.openTime) {
			// Calculate 15 minutes before openTime
			const earliestJoinTime = new Date(room.openTime.getTime() - 15 * 60 * 1000)

			if (now < earliestJoinTime) {
				set.status = 400
				const openTimeStr = room.openTime.toISOString()
				return wrapResponse(null, 400, '', `Room is not open yet. You can join 15 minutes before ${openTimeStr}`)
			}
		}

		// Check if room is closed
		if (room.closeTime && now > room.closeTime) {
			set.status = 400
			return wrapResponse(null, 400, '', 'Room is already closed')
		}

		// Check if student is already in the room
		const [existingParticipant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, room.uuid),
					eq(roomParticipants.accountUuid, user.userId)
				)
			)

		if (existingParticipant) {
			// Already joined, return success
			const response: JoinRoomResponse = {
				message: 'Already joined',
				roomId: room.uuid,
				roomName: room.name,
				openTime: room.openTime?.toISOString() ?? null,
				closeTime: room.closeTime?.toISOString() ?? null
			}
			return wrapResponse(response, 200, 'You are already in this room')
		}

		// Add student to room
		await db.insert(roomParticipants).values({
			roomUuid: room.uuid,
			accountUuid: user.userId
		})

		const response: JoinRoomResponse = {
			message: 'success',
			roomId: room.uuid,
			roomName: room.name,
			openTime: room.openTime?.toISOString() ?? null,
			closeTime: room.closeTime?.toISOString() ?? null
		}

		return wrapResponse(response, 201, 'Joined room successfully')
	}
}
