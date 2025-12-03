import Elysia, { t } from 'elysia'
import { requireAuth } from '../../middlewares/requireAuth'
import { userService } from './service'
import { ApiResponseSchema } from '../../common/dtos/response'
import { UserProfileSchema, JoinRoomSchema, JoinRoomResponseSchema } from './model'

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
