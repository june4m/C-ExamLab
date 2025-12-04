import { eq, and } from 'drizzle-orm'
import { db } from '../../configurations/database'
import {
	accounts,
	rooms,
	roomParticipants,
	questions,
	submissions,
	submissionDetails
} from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type {
	JoinRoomDto,
	JoinRoomResponse,
	UpdateStudentProfileDto,
	UpdateStudentProfileResponse,
	StudentRoomsResponse,
	RoomExamsResponse,
	SubmitQuestionDto,
	SubmitQuestionResponse,
	ViewMyScoreDto,
	ViewMyScoreResponse
} from './model'

// Helper to select only existing columns from rooms table
const selectRoomColumns = {
	uuid: rooms.uuid,
	code: rooms.code,
	name: rooms.name,
	openTime: rooms.openTime,
	closeTime: rooms.closeTime,
	createdBy: rooms.createdBy,
	createdAt: rooms.createdAt,
	updatedAt: rooms.updatedAt
}

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
				role: accounts.role,
				isBanned: accounts.isBanned,
				lastLogin: accounts.lastLogin,
				createdAt: accounts.createdAt,
				updatedAt: accounts.updatedAt
			})
			.from(accounts)
			.where(eq(accounts.uuid, user.userId))

		if (!userProfile) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		return wrapResponse(
			{
				studentId: userProfile.uuid,
				email: userProfile.email,
				fullName: userProfile.fullName,
				role: userProfile.role,
				isBanned: userProfile.isBanned === 1,
				lastLogin: userProfile.lastLogin?.toISOString() ?? null,
				createdAt: userProfile.createdAt?.toISOString() ?? null,
				updatedAt: userProfile.updatedAt?.toISOString() ?? null
			},
			200,
			'Profile retrieved successfully'
		)
	},

	joinRoom: async ({ body, user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const { roomCode } = body as JoinRoomDto

		// Find room by code
		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.code, roomCode))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if room is open
		const now = new Date()
		if (room.openTime && now < room.openTime) {
			set.status = 400
			return wrapResponse(null, 400, '', 'Room is not open yet')
		}
		if (room.closeTime && now > room.closeTime) {
			set.status = 400
			return wrapResponse(null, 400, '', 'Room is already closed')
		}

		// Check if student is already a participant
		const [existingParticipant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, room.uuid),
					eq(roomParticipants.accountUuid, user.userId)
				)
			)

		if (!existingParticipant) {
			// Add student to room
			await db.insert(roomParticipants).values({
				roomUuid: room.uuid,
				accountUuid: user.userId,
				joinedAt: now
			})
		} else if (!existingParticipant.joinedAt) {
			// Update joinedAt if student was pre-added but hasn't joined yet
			await db
				.update(roomParticipants)
				.set({ joinedAt: now })
				.where(eq(roomParticipants.uuid, existingParticipant.uuid))
		}

		const response: JoinRoomResponse = {
			message: 'success',
			roomId: room.uuid,
			roomName: room.name,
			openTime: room.openTime?.toISOString() ?? null,
			closeTime: room.closeTime?.toISOString() ?? null
		}

		return wrapResponse(response, 200, 'Joined room successfully')
	},

	updateProfile: async ({ body, user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const { studentId, full_name, email } = body as UpdateStudentProfileDto

		// Determine target user ID - admin can update any user, regular user can only update themselves
		const targetUserId = studentId || user.userId

		// If studentId is provided and different from current user, check if user is admin
		if (studentId && studentId !== user.userId) {
			const [currentUser] = await db
				.select({ role: accounts.role })
				.from(accounts)
				.where(eq(accounts.uuid, user.userId))

			if (!currentUser || currentUser.role !== 'ADMIN') {
				set.status = 403
				return wrapResponse(
					null,
					403,
					'',
					'You can only update your own profile'
				)
			}
		}

		// Check if target user exists
		const [targetUser] = await db
			.select({ uuid: accounts.uuid })
			.from(accounts)
			.where(eq(accounts.uuid, targetUserId))

		if (!targetUser) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Check if email already exists for another user
		if (email) {
			const [existingUser] = await db
				.select({ uuid: accounts.uuid })
				.from(accounts)
				.where(eq(accounts.email, email))

			if (existingUser && existingUser.uuid !== targetUserId) {
				set.status = 400
				return wrapResponse(
					null,
					400,
					'',
					'Email already in use by another account'
				)
			}
		}

		// Build update object
		const updateData: any = { updatedAt: new Date() }
		if (full_name !== undefined) updateData.fullName = full_name
		if (email !== undefined) updateData.email = email

		// Update the profile
		await db
			.update(accounts)
			.set(updateData)
			.where(eq(accounts.uuid, targetUserId))

		const response: UpdateStudentProfileResponse = {
			message: 'success'
		}

		return wrapResponse(response, 200, 'Profile updated successfully')
	},

	getStudentRooms: async ({ user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		// Get all rooms that the student has joined
		const studentRooms = await db
			.select({
				roomId: rooms.uuid,
				name: rooms.name,
				open_time: rooms.openTime,
				close_time: rooms.closeTime
			})
			.from(roomParticipants)
			.innerJoin(rooms, eq(roomParticipants.roomUuid, rooms.uuid))
			.where(eq(roomParticipants.accountUuid, user.userId))

		const response: StudentRoomsResponse = {
			roomList: studentRooms.map(room => ({
				roomId: room.roomId,
				name: room.name,
				open_time: room.open_time?.toISOString() ?? null,
				close_time: room.close_time?.toISOString() ?? null
			}))
		}

		return wrapResponse(response, 200, 'Rooms retrieved successfully')
	},

	getRoomExams: async ({ params, user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const { roomId } = params

		// Check if student is a participant of this room
		const [participant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, roomId),
					eq(roomParticipants.accountUuid, user.userId)
				)
			)

		if (!participant) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'You are not a participant of this room'
			)
		}

		// Get all questions/exams in the room
		const roomExams = await db
			.select({
				questionId: questions.uuid,
				title: questions.title,
				description_path: questions.descriptionPath,
				score: questions.score,
				time_limit: questions.timeLimit
			})
			.from(questions)
			.where(eq(questions.roomUuid, roomId))

		const response: RoomExamsResponse = {
			exams: roomExams.map(exam => ({
				questionId: exam.questionId,
				title: exam.title,
				description_path: exam.description_path,
				score: exam.score,
				time_limit: exam.time_limit
			}))
		}

		return wrapResponse(response, 200, 'Exams retrieved successfully')
	},

	submitQuestion: async ({ body, user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const { roomId, questionId, answerCode } = body as SubmitQuestionDto

		// Check if student is a participant of this room
		const [participant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, roomId),
					eq(roomParticipants.accountUuid, user.userId)
				)
			)

		if (!participant) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'You are not a participant of this room'
			)
		}

		// Check if question exists in this room
		const [question] = await db
			.select()
			.from(questions)
			.where(
				and(eq(questions.uuid, questionId), eq(questions.roomUuid, roomId))
			)

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found in this room')
		}

		// Check if room is open
		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (room) {
			const now = new Date()
			if (room.openTime && now < room.openTime) {
				set.status = 400
				return wrapResponse(null, 400, '', 'Room is not open yet')
			}
			if (room.closeTime && now > room.closeTime) {
				set.status = 400
				return wrapResponse(null, 400, '', 'Room is already closed')
			}
		}

		// Create submission record
		const [newSubmission] = await db
			.insert(submissions)
			.values({
				questionUuid: questionId,
				accountUuid: user.userId,
				filePath: answerCode,
				language: 'cpp',
				status: 'PENDING'
			})
			.$returningId()

		// Get the created submission
		const [submission] = await db
			.select()
			.from(submissions)
			.where(eq(submissions.uuid, newSubmission.uuid))

		// Get submission details if any
		const details = await db
			.select({
				testCaseIndex: submissionDetails.index,
				status: submissionDetails.status,
				runTime: submissionDetails.runTime,
				memoryUsed: submissionDetails.memoryUsed,
				stdout: submissionDetails.stdout,
				stderr: submissionDetails.stderr
			})
			.from(submissionDetails)
			.where(eq(submissionDetails.submissionUuid, submission.uuid))

		const response: SubmitQuestionResponse = {
			status: submission.status ?? 'PENDING',
			score: submission.score,
			totalRunTime: submission.totalRunTime,
			memoryUsed: submission.memoryUsed,
			details: details.map(d => ({
				testCaseIndex: d.testCaseIndex,
				status: d.status,
				runTime: d.runTime,
				memoryUsed: d.memoryUsed,
				stdout: d.stdout,
				stderr: d.stderr
			}))
		}

		return wrapResponse(response, 201, 'Submission created successfully')
	},

	viewMyScore: async ({ body, user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const { roomId, studentId } = body as ViewMyScoreDto

		// Verify the studentId matches the authenticated user
		if (studentId !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'You can only view your own score')
		}

		// Check if student is a participant of this room
		const [participant] = await db
			.select()
			.from(roomParticipants)
			.where(
				and(
					eq(roomParticipants.roomUuid, roomId),
					eq(roomParticipants.accountUuid, user.userId)
				)
			)

		if (!participant) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'You are not a participant of this room'
			)
		}

		// Get all questions in the room
		const roomQuestions = await db
			.select({
				questionId: questions.uuid,
				title: questions.title,
				score: questions.score
			})
			.from(questions)
			.where(eq(questions.roomUuid, roomId))

		// Get all submissions for this student in this room
		const studentSubmissions = await db
			.select({
				uuid: submissions.uuid,
				questionUuid: submissions.questionUuid,
				score: submissions.score,
				status: submissions.status
			})
			.from(submissions)
			.innerJoin(questions, eq(submissions.questionUuid, questions.uuid))
			.where(
				and(
					eq(questions.roomUuid, roomId),
					eq(submissions.accountUuid, user.userId)
				)
			)

		// Calculate scores per question
		let totalScore = 0
		const questionResults = roomQuestions.map(q => {
			const questionSubmissions = studentSubmissions.filter(
				s => s.questionUuid === q.questionId
			)
			const attempts = questionSubmissions.length

			// Find best submission (highest score or AC status)
			let bestSubmission: (typeof questionSubmissions)[0] | null = null
			let myScore = 0
			let solved = false

			for (const sub of questionSubmissions) {
				if (sub.status === 'AC') {
					solved = true
					if (
						!bestSubmission ||
						(sub.score ?? 0) > (bestSubmission.score ?? 0)
					) {
						bestSubmission = sub
						myScore = sub.score ?? q.score ?? 0
					}
				} else if ((sub.score ?? 0) > myScore) {
					bestSubmission = sub
					myScore = sub.score ?? 0
				}
			}

			// Check if full score achieved
			if (myScore === q.score) {
				solved = true
			}

			totalScore += myScore

			return {
				questionId: q.questionId,
				title: q.title,
				score: q.score,
				myScore,
				solved,
				attempts,
				bestSubmissionId: bestSubmission?.uuid ?? null
			}
		})

		const response: ViewMyScoreResponse = {
			totalScore,
			questions: questionResults
		}

		return wrapResponse(response, 200, 'Score retrieved successfully')
	}
}
