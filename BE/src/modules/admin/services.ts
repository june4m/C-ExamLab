import { eq, and, like } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { accounts, rooms, roomParticipants } from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type { Student, LeaderboardResponse, LeaderboardStudent, AddStudentToRoomDto, AddStudentToRoomResponse, RoomParticipant, RoomParticipantsList, RemoveStudentResponse } from './model'

// Helper to format student data
const formatStudent = (account: any): Student => ({
	studentId: account.uuid,
	studentFullName: account.fullName ?? null,
	studentEmail: account.email,
	isBanned: account.isBanned === 1,
	lastLogin: account.lastLogin?.toISOString() ?? null,
	createdAt: account.createdAt?.toISOString() ?? null,
	updatedAt: account.updatedAt?.toISOString() ?? null
})

export const adminService = {
	getStudents: async () => {
		// Get all users with role = 'USER' (students)
		const students = await db
			.select()
			.from(accounts)
			.where(eq(accounts.role, 'USER'))

		return wrapResponse(
			students.map(formatStudent),
			200,
			'Students retrieved successfully'
		)
	},

	getStudentsByName: async ({ params }: any) => {
		const { userName } = params

		// Search students by name (partial match)
		const students = await db
			.select()
			.from(accounts)
			.where(
				and(eq(accounts.role, 'USER'), like(accounts.fullName, `%${userName}%`))
			)

		return wrapResponse(
			students.map(formatStudent),
			200,
			'Students retrieved successfully'
		)
	},

	updateUser: async ({ params, body, set }: any) => {
		const { userId } = params
		const { studentFullName, studentEmail } = body

		// Check if user exists
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Check if email already exists (if updating email)
		if (studentEmail && studentEmail !== user.email) {
			const [existingUser] = await db
				.select()
				.from(accounts)
				.where(eq(accounts.email, studentEmail))

			if (existingUser) {
				set.status = 409
				return wrapResponse(null, 409, '', 'Email already exists')
			}
		}

		const updateValues: any = { updatedAt: new Date() }
		if (studentFullName !== undefined) updateValues.fullName = studentFullName
		if (studentEmail !== undefined) updateValues.email = studentEmail

		await db.update(accounts).set(updateValues).where(eq(accounts.uuid, userId))

		// Get updated user
		const [updatedUser] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		return wrapResponse(
			formatStudent(updatedUser),
			200,
			'User updated successfully'
		)
	},

	banUser: async ({ params, set }: any) => {
		const { userId } = params

		// Check if user exists
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Cannot ban admin
		if (user.role === 'ADMIN') {
			set.status = 400
			return wrapResponse(null, 400, '', 'Cannot ban admin user')
		}

		// Check if already banned
		if (user.isBanned === 1) {
			set.status = 400
			return wrapResponse(null, 400, '', 'User is already banned')
		}

		await db
			.update(accounts)
			.set({ isBanned: 1, updatedAt: new Date() })
			.where(eq(accounts.uuid, userId))

		return wrapResponse({ message: 'success' }, 200, 'User banned successfully')
	},

	unbanUser: async ({ params, set }: any) => {
		const { userId } = params

		// Check if user exists
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Check if not banned
		if (user.isBanned === 0) {
			set.status = 400
			return wrapResponse(null, 400, '', 'User is not banned')
		}

		await db
			.update(accounts)
			.set({ isBanned: 0, updatedAt: new Date() })
			.where(eq(accounts.uuid, userId))

		return wrapResponse({ message: 'success' }, 200, 'User unbanned successfully')
	},

	getLeaderboard: async ({ params, user, set }: any) => {
		const { roomId } = params

		// Get room info
		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of this room')
		}

		// Get all participants in the room
		const participants = await db
			.select({
				studentId: accounts.uuid,
				studentFullName: accounts.fullName,
				studentEmail: accounts.email
			})
			.from(roomParticipants)
			.innerJoin(accounts, eq(roomParticipants.accountUuid, accounts.uuid))
			.where(eq(roomParticipants.roomUuid, roomId))

		const studentList: LeaderboardStudent[] = participants.map(p => ({
			studentId: p.studentId,
			studentFullName: p.studentFullName ?? null,
			studentEmail: p.studentEmail
		}))

		const response: LeaderboardResponse = {
			roomName: room.name,
			openTime: room.openTime?.toISOString() ?? null,
			closeTime: room.closeTime?.toISOString() ?? null,
			createdAt: room.createdAt?.toISOString() ?? null,
			students: studentList
		}

		return wrapResponse(response, 200, 'Leaderboard retrieved successfully')
	},

	addStudentToRoom: async ({ body, user, set }: any) => {
		const { roomId, studentId } = body as AddStudentToRoomDto

		// Check if room exists
		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of this room')
		}

		// Check if student exists
		const [student] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, studentId))

		if (!student) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Student not found')
		}

		// Check if student is not an admin
		if (student.role === 'ADMIN') {
			set.status = 400
			return wrapResponse(null, 400, '', 'Cannot add admin to room')
		}

		// Check if student is already in the room
		const [existingParticipant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, roomId),
					eq(roomParticipants.accountUuid, studentId)
				)
			)

		if (existingParticipant) {
			set.status = 409
			return wrapResponse(null, 409, '', 'Student is already in this room')
		}

		// Add student to room
		await db.insert(roomParticipants).values({
			roomUuid: roomId,
			accountUuid: studentId
		})

		const response: AddStudentToRoomResponse = {
			message: 'success'
		}

		return wrapResponse(response, 201, 'Student added to room successfully')
	},

	// Get all participants in a room
	getRoomParticipants: async ({ params, user, set }: any) => {
		const { roomId } = params

		const [room] = await db.select().from(rooms).where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of this room')
		}

		const participants = await db
			.select({
				participantId: roomParticipants.uuid,
				studentId: accounts.uuid,
				studentFullName: accounts.fullName,
				studentEmail: accounts.email,
				joinedAt: roomParticipants.joinedAt
			})
			.from(roomParticipants)
			.innerJoin(accounts, eq(roomParticipants.accountUuid, accounts.uuid))
			.where(eq(roomParticipants.roomUuid, roomId))

		const participantList: RoomParticipant[] = participants.map(p => ({
			participantId: p.participantId,
			studentId: p.studentId,
			studentFullName: p.studentFullName ?? null,
			studentEmail: p.studentEmail,
			joinedAt: p.joinedAt?.toISOString() ?? null
		}))

		const response: RoomParticipantsList = {
			roomId: room.uuid,
			roomName: room.name,
			participants: participantList
		}

		return wrapResponse(response, 200, 'Participants retrieved successfully')
	},

	// Search participants by name in a room
	searchRoomParticipants: async ({ params, user, set }: any) => {
		const { roomId, studentName } = params

		const [room] = await db.select().from(rooms).where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of this room')
		}

		const participants = await db
			.select({
				participantId: roomParticipants.uuid,
				studentId: accounts.uuid,
				studentFullName: accounts.fullName,
				studentEmail: accounts.email,
				joinedAt: roomParticipants.joinedAt
			})
			.from(roomParticipants)
			.innerJoin(accounts, eq(roomParticipants.accountUuid, accounts.uuid))
			.where(
				and(
					eq(roomParticipants.roomUuid, roomId),
					like(accounts.fullName, `%${studentName}%`)
				)
			)

		const participantList: RoomParticipant[] = participants.map(p => ({
			participantId: p.participantId,
			studentId: p.studentId,
			studentFullName: p.studentFullName ?? null,
			studentEmail: p.studentEmail,
			joinedAt: p.joinedAt?.toISOString() ?? null
		}))

		return wrapResponse(participantList, 200, 'Participants found')
	},

	// Remove student from room
	removeStudentFromRoom: async ({ params, user, set }: any) => {
		const { roomId, studentId } = params

		const [room] = await db.select().from(rooms).where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of this room')
		}

		const [participant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, roomId),
					eq(roomParticipants.accountUuid, studentId)
				)
			)

		if (!participant) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Student not found in this room')
		}

		await db
			.delete(roomParticipants)
			.where(eq(roomParticipants.uuid, participant.uuid))

		const response: RemoveStudentResponse = {
			message: 'success'
		}

		return wrapResponse(response, 200, 'Student removed from room successfully')
	}
}
