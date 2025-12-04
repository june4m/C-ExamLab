import Elysia, { t } from 'elysia'
import { requireAuth } from '../../middlewares/requireAuth'
import { userService } from './service'
import { ApiResponseSchema } from '../../common/dtos/response'
import { UserProfileSchema, JoinRoomSchema, JoinRoomResponseSchema, UpdateStudentProfileSchema, UpdateStudentProfileResponseSchema, StudentRoomsResponseSchema, RoomExamsResponseSchema, SubmitQuestionSchema, SubmitQuestionResponseSchema, ViewMyScoreSchema, ViewMyScoreResponseSchema } from './model'

export const user = new Elysia({ prefix: '/user', tags: ['User'] })
	.use(requireAuth)

	// Get current user profile
	.get('/profile', userService.getProfile, {
		detail: { summary: 'Get user profile', description: 'Get current logged-in user profile information.' },
		response: {
			200: ApiResponseSchema(UserProfileSchema),
			401: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Join exam room by room code
	// - Student can only join 15 minutes before room opens
	// - Cannot join after room closes
	// - Room code is 6 characters (sent via email)
	.post('/join-room', userService.joinRoom, {
		detail: {
			summary: 'Join exam room',
			description: 'Student joins an exam room using room code. Can only join 15 minutes before openTime. Cannot join after closeTime.'
		},
		body: JoinRoomSchema,
		response: {
			200: ApiResponseSchema(JoinRoomResponseSchema),
			201: ApiResponseSchema(JoinRoomResponseSchema),
			400: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Update student profile
	.patch('/student/profile', userService.updateProfile, {
		detail: {
			summary: 'Update student profile',
			description: 'Update student profile information including full name and email.'
		},
		body: UpdateStudentProfileSchema,
		response: {
			200: ApiResponseSchema(UpdateStudentProfileResponseSchema),
			400: ApiResponseSchema(t.Null()),
			401: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get list of available exam rooms for student
	.get('/student/rooms', userService.getStudentRooms, {
		detail: {
			summary: 'Get student rooms',
			description: 'Get list of exam rooms that the student has joined.'
		},
		response: {
			200: ApiResponseSchema(StudentRoomsResponseSchema),
			401: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get list of exams/questions in a room
	.get('/student/rooms/:roomId/exams', userService.getRoomExams, {
		detail: {
			summary: 'Get room exams',
			description: 'Get list of exams/questions in a specific room that the student has joined.'
		},
		params: t.Object({
			roomId: t.String()
		}),
		response: {
			200: ApiResponseSchema(RoomExamsResponseSchema),
			401: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Submit answer for a question
	.post('/student/questions/submission', userService.submitQuestion, {
		detail: {
			summary: 'Submit question answer',
			description: 'Submit code answer for a specific question in a room.'
		},
		body: SubmitQuestionSchema,
		response: {
			201: ApiResponseSchema(SubmitQuestionResponseSchema),
			400: ApiResponseSchema(t.Null()),
			401: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// View my score and solved questions
	.post('/student/rooms/submissiones', userService.viewMyScore, {
		detail: {
			summary: 'View my score',
			description: 'View total score and which questions the student solved correctly in a room.'
		},
		body: ViewMyScoreSchema,
		response: {
			200: ApiResponseSchema(ViewMyScoreResponseSchema),
			401: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
