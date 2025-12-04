import { eq, and, like } from 'drizzle-orm'
import { db } from '../../configurations/database'
import {
	accounts,
	rooms,
	roomParticipants,
	questions,
	testCases,
	submissions
} from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type {
	Student,
	LeaderboardResponse,
	LeaderboardStudent,
	AddStudentToRoomDto,
	AddStudentToRoomResponse,
	RoomParticipant,
	RoomParticipantsList,
	RemoveStudentResponse,
	GetTestcasesResponse,
	CreateTestcaseDto,
	CreateTestcaseResponse,
	UpdateTestcaseDto,
	UpdateTestcaseResponse,
	RoomScoresResponse
} from './model'

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

		return wrapResponse(
			{ message: 'success' },
			200,
			'User unbanned successfully'
		)
	},

	getLeaderboard: async ({ params, user, set }: any) => {
		const { roomId } = params

		// Get room info
		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
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
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
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

		// Add student to room with joined_at = null (student hasn't joined yet)
		await db.insert(roomParticipants).values({
			roomUuid: roomId,
			accountUuid: studentId,
			joinedAt: null
		})

		const response: AddStudentToRoomResponse = {
			message: 'success'
		}

		return wrapResponse(response, 201, 'Student added to room successfully')
	},

	// Get all participants in a room
	getRoomParticipants: async ({ params, user, set }: any) => {
		const { roomId } = params

		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
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

		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
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

		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
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
	},

	// Get testcases of a question
	getTestcases: async ({ query, user, set }: any) => {
		const { questionId } = query

		// Check if question exists
		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		// Check if user is owner of the room containing this question
		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room || room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		// Get all testcases for this question
		const testcaseList = await db
			.select({
				testcaseId: testCases.uuid,
				index: testCases.index,
				input_path: testCases.inputPath,
				output_path: testCases.outputPath,
				is_hidden: testCases.isHidden
			})
			.from(testCases)
			.where(eq(testCases.questionUuid, questionId))

		const response: GetTestcasesResponse = {
			questionId,
			testcaseList: testcaseList.map(tc => ({
				testcaseId: tc.testcaseId,
				index: tc.index,
				input_path: tc.input_path,
				output_path: tc.output_path,
				is_hidden: tc.is_hidden ?? 1
			}))
		}

		return wrapResponse(response, 200, 'Testcases retrieved successfully')
	},

	// Create a testcase for a question
	createTestcase: async ({ body, user, set }: any) => {
		const { questionId, index, input_path, output_path, is_hidden } =
			body as CreateTestcaseDto

		// Check if question exists
		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		// Check if user is owner of the room containing this question
		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room || room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		// Check if testcase with same index already exists
		const [existingTestcase] = await db
			.select()
			.from(testCases)
			.where(
				and(eq(testCases.questionUuid, questionId), eq(testCases.index, index))
			)

		if (existingTestcase) {
			set.status = 409
			return wrapResponse(
				null,
				409,
				'',
				'Testcase with this index already exists'
			)
		}

		// Create testcase
		const [newTestcase] = await db
			.insert(testCases)
			.values({
				questionUuid: questionId,
				index,
				inputPath: input_path,
				outputPath: output_path,
				isHidden: is_hidden
			})
			.$returningId()

		const response: CreateTestcaseResponse = {
			message: 'success',
			testcaseId: newTestcase.uuid
		}

		return wrapResponse(response, 201, 'Testcase created successfully')
	},

	// Update a testcase
	updateTestcase: async ({ body, user, set }: any) => {
		const { questionId, testcaseId, index, input_path, output_path, is_hidden } =
			body as UpdateTestcaseDto

		// Check if question exists
		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		// Check if user is owner of the room containing this question
		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room || room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		// Check if testcase exists
		const [testcase] = await db
			.select()
			.from(testCases)
			.where(eq(testCases.uuid, testcaseId))

		if (!testcase) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Testcase not found')
		}

		// Check if testcase belongs to the question
		if (testcase.questionUuid !== questionId) {
			set.status = 400
			return wrapResponse(
				null,
				400,
				'',
				'Testcase does not belong to this question'
			)
		}

		// Check if another testcase with same index exists (excluding current)
		const [existingTestcase] = await db
			.select()
			.from(testCases)
			.where(
				and(
					eq(testCases.questionUuid, questionId),
					eq(testCases.index, index)
				)
			)

		if (existingTestcase && existingTestcase.uuid !== testcaseId) {
			set.status = 409
			return wrapResponse(
				null,
				409,
				'',
				'Another testcase with this index already exists'
			)
		}

		// Update testcase
		await db
			.update(testCases)
			.set({
				index,
				inputPath: input_path,
				outputPath: output_path,
				isHidden: is_hidden
			})
			.where(eq(testCases.uuid, testcaseId))

		const response: UpdateTestcaseResponse = {
			message: 'success'
		}

		return wrapResponse(response, 200, 'Testcase updated successfully')
	},

	// Get all students' scores in a room
	getRoomScores: async ({ params, user, set }: any) => {
		const { roomId } = params

		// Get room info
		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
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

		// Get all questions in the room
		const roomQuestions = await db
			.select({
				questionId: questions.uuid,
				title: questions.title,
				score: questions.score
			})
			.from(questions)
			.where(eq(questions.roomUuid, roomId))

		// Get all submissions for this room
		const allSubmissions = await db
			.select({
				uuid: submissions.uuid,
				questionUuid: submissions.questionUuid,
				accountUuid: submissions.accountUuid,
				score: submissions.score,
				status: submissions.status
			})
			.from(submissions)
			.innerJoin(questions, eq(submissions.questionUuid, questions.uuid))
			.where(eq(questions.roomUuid, roomId))

		// Calculate scores for each student
		const studentsWithScores = participants.map(student => {
			let totalScore = 0
			const questionResults = roomQuestions.map(q => {
				const studentSubmissions = allSubmissions.filter(
					s =>
						s.questionUuid === q.questionId &&
						s.accountUuid === student.studentId
				)
				const attempts = studentSubmissions.length

				let myScore = 0
				let solved = false

				for (const sub of studentSubmissions) {
					if (sub.status === 'AC') {
						solved = true
						if ((sub.score ?? 0) > myScore) {
							myScore = sub.score ?? q.score ?? 0
						}
					} else if ((sub.score ?? 0) > myScore) {
						myScore = sub.score ?? 0
					}
				}

				if (myScore === q.score) {
					solved = true
				}

				totalScore += myScore

				return {
					questionId: q.questionId,
					title: q.title,
					maxScore: q.score,
					myScore,
					solved,
					attempts
				}
			})

			return {
				studentId: student.studentId,
				studentFullName: student.studentFullName ?? null,
				studentEmail: student.studentEmail,
				totalScore,
				questions: questionResults
			}
		})

		// Sort by totalScore descending
		studentsWithScores.sort((a, b) => b.totalScore - a.totalScore)

		const response: RoomScoresResponse = {
			roomId: room.uuid,
			roomName: room.name,
			students: studentsWithScores
		}

		return wrapResponse(response, 200, 'Room scores retrieved successfully')
	}
}
