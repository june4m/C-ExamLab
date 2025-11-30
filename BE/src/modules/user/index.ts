import Elysia, { t } from 'elysia'
import { requireAuth } from '../../middlewares/requireAuth'
import { userService } from './service'
import { ApiResponseSchema } from '../../common/dtos/response'
import { UserProfileSchema } from './model'

export const user = new Elysia({ prefix: '/user', tags: ['User'] })
	.use(requireAuth)
	.get('/profile', userService.getProfile, {
		response: {
			200: ApiResponseSchema(UserProfileSchema),
			401: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null()),
		},
	})
