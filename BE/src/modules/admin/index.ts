import Elysia, { t } from 'elysia'
import { requireAdmin } from '../../middlewares/requireAdmin'
import { adminService } from './services'
import {
	StudentSchema,
	UpdateUserSchema,
	BanResponseSchema,
	LeaderboardResponseSchema,
	AddStudentToRoomSchema,
	AddStudentToRoomResponseSchema,
	RoomParticipantsListSchema,
	RoomParticipantSchema,
	RemoveStudentResponseSchema,
	GetTestcasesResponseSchema
} from './model'
import { ApiResponseSchema } from '../../common/dtos/response'

export const admin = new Elysia({ prefix: '/admin', tags: ['Admin'] })
	.use(requireAdmin)

	// ==================== USER MANAGEMENT ====================

	// Get all students (users with role = 'USER')
	.get('/users', adminService.getStudents, {
		detail: {
			summary: 'Get all students',
			description: 'Retrieve list of all users with role USER'
		},
		response: {
			200: ApiResponseSchema(t.Array(StudentSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Search students by name (partial match)
	.get('/users/:userName', adminService.getStudentsByName, {
		detail: {
			summary: 'Search students by name',
			description: 'Search students by full name (partial match)'
		},
		params: t.Object({ userName: t.String() }),
		response: {
			200: ApiResponseSchema(t.Array(StudentSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Update student info (fullName, email)
	.patch('/users/:userId', adminService.updateUser, {
		detail: {
			summary: 'Update student info',
			description:
				'Update student fullName and/or email. All fields are optional.'
		},
		params: t.Object({ userId: t.String() }),
		body: UpdateUserSchema,
		response: {
			200: ApiResponseSchema(StudentSchema),
			404: ApiResponseSchema(t.Null()),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Ban a student (prevent login)
	.post('/users/:userId/ban', adminService.banUser, {
		detail: {
			summary: 'Ban student',
			description: 'Ban a student account. Banned users cannot login.'
		},
		params: t.Object({ userId: t.String() }),
		response: {
			200: ApiResponseSchema(BanResponseSchema),
			400: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Unban a student
	.post('/users/:userId/unban', adminService.unbanUser, {
		detail: {
			summary: 'Unban student',
			description: 'Unban a previously banned student account.'
		},
		params: t.Object({ userId: t.String() }),
		response: {
			200: ApiResponseSchema(BanResponseSchema),
			400: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// ==================== ROOM PARTICIPANTS ====================

	// Get room leaderboard (room info + participants list)
	.get('/leaderboard/:roomId', adminService.getLeaderboard, {
		detail: {
			summary: 'Get room leaderboard',
			description:
				'Get room info and list of students participating in the exam room.'
		},
		params: t.Object({ roomId: t.String() }),
		response: {
			200: ApiResponseSchema(LeaderboardResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Add student to room (admin manually adds student)
	.post('/room/add-student', adminService.addStudentToRoom, {
		detail: {
			summary: 'Add student to room',
			description:
				'Admin manually adds a student to an exam room. Student must exist and not be an admin.'
		},
		body: AddStudentToRoomSchema,
		response: {
			201: ApiResponseSchema(AddStudentToRoomResponseSchema),
			400: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get all participants in a room
	.get('/room/:roomId/participants', adminService.getRoomParticipants, {
		detail: {
			summary: 'Get room participants',
			description: 'Get list of all students who joined the exam room.'
		},
		params: t.Object({ roomId: t.String() }),
		response: {
			200: ApiResponseSchema(RoomParticipantsListSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Search participants by name in a room
	.get(
		'/room/:roomId/participants/search/:studentName',
		adminService.searchRoomParticipants,
		{
			detail: {
				summary: 'Search room participants',
				description: 'Search students in a room by name (partial match).'
			},
			params: t.Object({ roomId: t.String(), studentName: t.String() }),
			response: {
				200: ApiResponseSchema(t.Array(RoomParticipantSchema)),
				403: ApiResponseSchema(t.Null()),
				404: ApiResponseSchema(t.Null()),
				500: ApiResponseSchema(t.Null())
			}
		}
	)

	// Remove student from room
	.delete(
		'/room/:roomId/participants/:studentId',
		adminService.removeStudentFromRoom,
		{
			detail: {
				summary: 'Remove student from room',
				description: 'Remove a student from an exam room.'
			},
			params: t.Object({ roomId: t.String(), studentId: t.String() }),
			response: {
				200: ApiResponseSchema(RemoveStudentResponseSchema),
				403: ApiResponseSchema(t.Null()),
				404: ApiResponseSchema(t.Null()),
				500: ApiResponseSchema(t.Null())
			}
		}
	)

	// ==================== TESTCASES ====================

	// Get testcases of a question
	.get('/testcases', adminService.getTestcases, {
		detail: {
			summary: 'Get testcases',
			description: 'Get all testcases of a specific question.'
		},
		query: t.Object({
			questionId: t.String()
		}),
		response: {
			200: ApiResponseSchema(GetTestcasesResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
