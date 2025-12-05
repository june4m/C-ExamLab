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
import { testCaseService } from '../testcase/service'
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

// Helper to select room columns
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

export const adminService = {
	getStudents: async () => {
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

		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

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

		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		if (user.role === 'ADMIN') {
			set.status = 400
			return wrapResponse(null, 400, '', 'Cannot ban admin user')
		}

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

		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

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

		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

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
		const { roomId, studentIds } = body as AddStudentToRoomDto

		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Admins can bypass ownership check
		if (!user.isAdmin && room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const existingParticipants = await db
			.select({ accountUuid: roomParticipants.accountUuid })
			.from(roomParticipants)
			.where(eq(roomParticipants.roomUuid, roomId))

		const existingStudentIds = new Set(
			existingParticipants.map(p => p.accountUuid)
		)

		let added = 0
		let skipped = 0
		const errors: { studentId: string; reason: string }[] = []
		const studentsToAdd: {
			roomUuid: string
			accountUuid: string
			joinedAt: null
		}[] = []

		for (const studentId of studentIds) {
			if (existingStudentIds.has(studentId)) {
				skipped++
				errors.push({ studentId, reason: 'Already in room' })
				continue
			}

			const [student] = await db
				.select()
				.from(accounts)
				.where(eq(accounts.uuid, studentId))

			if (!student) {
				skipped++
				errors.push({ studentId, reason: 'Student not found' })
				continue
			}

			if (student.role === 'ADMIN') {
				skipped++
				errors.push({ studentId, reason: 'Cannot add admin to room' })
				continue
			}

			studentsToAdd.push({
				roomUuid: roomId,
				accountUuid: studentId,
				joinedAt: null
			})
		}

		if (studentsToAdd.length > 0) {
			await db.insert(roomParticipants).values(studentsToAdd)
			added = studentsToAdd.length
		}

		const response: AddStudentToRoomResponse = {
			message: added > 0 ? 'success' : 'no students added',
			added,
			skipped,
			errors
		}

		return wrapResponse(
			response,
			added > 0 ? 201 : 200,
			`${added} student(s) added to room successfully`
		)
	},

	getRoomParticipants: async ({ params, user, set }: any) => {
		const { roomId } = params

		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		const participants = await db
			.select({
				participantId: roomParticipants.uuid,
				studentId: accounts.uuid,
				studentFullName: accounts.fullName,
				studentEmail: accounts.email,
				joinedAt: roomParticipants.joinedAt,
				isBanned: accounts.isBanned
			})
			.from(roomParticipants)
			.innerJoin(accounts, eq(roomParticipants.accountUuid, accounts.uuid))
			.where(eq(roomParticipants.roomUuid, roomId))

		const participantList: RoomParticipant[] = participants.map(p => ({
			participantId: p.participantId,
			studentId: p.studentId,
			studentFullName: p.studentFullName ?? null,
			studentEmail: p.studentEmail,
			joinedAt: p.joinedAt?.toISOString() ?? null,
			isBanned: p.isBanned === 1
		}))

		const response: RoomParticipantsList = {
			roomId: room.uuid,
			roomName: room.name,
			participants: participantList
		}

		return wrapResponse(response, 200, 'Participants retrieved successfully')
	},

	searchRoomParticipants: async ({ params, user, set }: any) => {
		const { roomId, studentName } = params

		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
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

	removeStudentFromRoom: async ({ params, user, set }: any) => {
		const { roomId, studentId } = params

		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Admins can bypass ownership check
		if (!user.isAdmin && room.createdBy !== user.userId) {
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

	getTestcases: async ({ query, user, set }: any) => {
		const { questionId } = query

		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Admins can bypass ownership check
		if (!user.isAdmin && room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

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
				input: tc.input_path,
				output: tc.output_path,
				is_hidden: tc.is_hidden ?? 1
			}))
		}

		return wrapResponse(response, 200, 'Testcases retrieved successfully')
	},

	createTestcase: async ({ body, user, set }: any) => {
		const { questionId, index, input_path, output_path, is_hidden } =
			body as CreateTestcaseDto

		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Admins can bypass ownership check
		if (!user.isAdmin && room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

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

		const isHiddenValue =
			typeof is_hidden === 'boolean' ? (is_hidden ? 1 : 0) : is_hidden

		// Save to database
		const [newTestcase] = await db
			.insert(testCases)
			.values({
				questionUuid: questionId,
				index,
				inputPath: input_path,
				outputPath: output_path,
				isHidden: isHiddenValue
			})
			.$returningId()

		// Also create files in the file system for the compiler service
		try {
			await testCaseService.createTestCase({
				roomId: question.roomUuid,
				questionId: questionId,
				testCaseNumber: index,
				input: input_path, // input_path contains the actual content
				expectedOutput: output_path, // output_path contains the actual content
				isPublic: isHiddenValue === 0, // is_hidden: 0 = public, 1 = hidden/private
				points: undefined,
				description: undefined
			})
		} catch (error) {
			// If file creation fails, log error but don't fail the request
			// The database record is already created
			console.error(
				`[AdminService] Failed to create test case files for question ${questionId}, index ${index}:`,
				error
			)
		}

		const response: CreateTestcaseResponse = {
			message: 'success',
			testcaseId: newTestcase.uuid
		}

		return wrapResponse(response, 201, 'Testcase created successfully')
	},

	updateTestcase: async ({ body, user, set }: any) => {
		const {
			questionId,
			testcaseId,
			index,
			input_path,
			output_path,
			is_hidden
		} = body as UpdateTestcaseDto

		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Admins can bypass ownership check
		if (!user.isAdmin && room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const [testcase] = await db
			.select()
			.from(testCases)
			.where(eq(testCases.uuid, testcaseId))

		if (!testcase) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Testcase not found')
		}

		if (testcase.questionUuid !== questionId) {
			set.status = 400
			return wrapResponse(
				null,
				400,
				'',
				'Testcase does not belong to this question'
			)
		}

		const [existingTestcase] = await db
			.select()
			.from(testCases)
			.where(
				and(eq(testCases.questionUuid, questionId), eq(testCases.index, index))
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

		const isHiddenValue =
			typeof is_hidden === 'boolean' ? (is_hidden ? 1 : 0) : is_hidden

		const oldIndex = testcase.index

		// Update database
		await db
			.update(testCases)
			.set({
				index,
				inputPath: input_path,
				outputPath: output_path,
				isHidden: isHiddenValue
			})
			.where(eq(testCases.uuid, testcaseId))

		// Also update files in the file system
		try {
			// If index changed, we need to delete old file and create new one
			if (oldIndex !== index) {
				// Delete old test case file (if it exists)
				try {
					await testCaseService.deleteTestCase({
						roomId: question.roomUuid,
						questionId: questionId,
						testCaseNumber: oldIndex
					})
				} catch (deleteError) {
					// Ignore if old file doesn't exist
					console.warn(
						`[AdminService] Old test case file not found for deletion (question ${questionId}, index ${oldIndex})`
					)
				}
			}

			// Try to update, or create if it doesn't exist
			try {
				await testCaseService.updateTestCase({
					roomId: question.roomUuid,
					questionId: questionId,
					testCaseNumber: index,
					input: input_path,
					expectedOutput: output_path,
					isPublic: isHiddenValue === 0, // is_hidden: 0 = public, 1 = hidden/private
					points: undefined,
					description: undefined
				})
			} catch (updateError) {
				// If update fails because file doesn't exist, create it instead
				if (
					updateError instanceof Error &&
					updateError.message.includes('does not exist')
				) {
					await testCaseService.createTestCase({
						roomId: question.roomUuid,
						questionId: questionId,
						testCaseNumber: index,
						input: input_path,
						expectedOutput: output_path,
						isPublic: isHiddenValue === 0,
						points: undefined,
						description: undefined
					})
				} else {
					throw updateError
				}
			}
		} catch (error) {
			// If file update fails, log error but don't fail the request
			console.error(
				`[AdminService] Failed to update test case files for question ${questionId}, index ${index}:`,
				error
			)
		}

		const response: UpdateTestcaseResponse = {
			message: 'success'
		}

		return wrapResponse(response, 200, 'Testcase updated successfully')
	},

	deleteTestcase: async ({ params, user, set }: any) => {
		const { questionId, testcaseId } = params

		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.uuid, questionId))

		if (!question) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		const [room] = await db
			.select()
			.from(rooms)
			.where(eq(rooms.uuid, question.roomUuid))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Admins can bypass ownership check
		if (!user.isAdmin && room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const [testcase] = await db
			.select()
			.from(testCases)
			.where(eq(testCases.uuid, testcaseId))

		if (!testcase) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Testcase not found')
		}

		if (testcase.questionUuid !== questionId) {
			set.status = 400
			return wrapResponse(
				null,
				400,
				'',
				'Testcase does not belong to this question'
			)
		}

		// Delete from database
		await db.delete(testCases).where(eq(testCases.uuid, testcaseId))

		// Also delete files from the file system
		try {
			await testCaseService.deleteTestCase({
				roomId: question.roomUuid,
				questionId: questionId,
				testCaseNumber: testcase.index
			})
		} catch (error) {
			// If file deletion fails, log error but don't fail the request
			// The database record is already deleted
			console.error(
				`[AdminService] Failed to delete test case files for question ${questionId}, index ${testcase.index}:`,
				error
			)
		}

		return wrapResponse(
			{ message: 'success' },
			200,
			'Testcase deleted successfully'
		)
	},

	getRoomScores: async ({ params, user, set }: any) => {
		const { roomId } = params

		const [room] = await db
			.select(selectRoomColumns)
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		const participants = await db
			.select({
				studentId: accounts.uuid,
				studentFullName: accounts.fullName,
				studentEmail: accounts.email
			})
			.from(roomParticipants)
			.innerJoin(accounts, eq(roomParticipants.accountUuid, accounts.uuid))
			.where(eq(roomParticipants.roomUuid, roomId))

		const roomQuestions = await db
			.select({
				questionId: questions.uuid,
				title: questions.title,
				score: questions.score
			})
			.from(questions)
			.where(eq(questions.roomUuid, roomId))

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

		studentsWithScores.sort((a, b) => b.totalScore - a.totalScore)

		const response: RoomScoresResponse = {
			roomId: room.uuid,
			roomName: room.name,
			students: studentsWithScores
		}

		return wrapResponse(response, 200, 'Room scores retrieved successfully')
	}
}
