import Elysia, { t } from 'elysia'
import { requireAdmin } from '../../middlewares/requireAdmin'
import { adminService } from './services'
import { StudentSchema, UpdateUserSchema, BanResponseSchema } from './model'
import { ApiResponseSchema } from '../../common/dtos/response'

export const admin = new Elysia({ prefix: '/admin', tags: ['Admin'] })
	.use(requireAdmin)
	.get('/users', adminService.getStudents, {
		response: {
			200: ApiResponseSchema(t.Array(StudentSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})
	.get('/users/:userName', adminService.getStudentsByName, {
		params: t.Object({ userName: t.String() }),
		response: {
			200: ApiResponseSchema(t.Array(StudentSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})
	.patch('/users/:userId', adminService.updateUser, {
		params: t.Object({ userId: t.String() }),
		body: UpdateUserSchema,
		response: {
			200: ApiResponseSchema(StudentSchema),
			404: ApiResponseSchema(t.Null()),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.post('/users/:userId/ban', adminService.banUser, {
		params: t.Object({ userId: t.String() }),
		response: {
			200: ApiResponseSchema(BanResponseSchema),
			400: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.post('/users/:userId/unban', adminService.unbanUser, {
		params: t.Object({ userId: t.String() }),
		response: {
			200: ApiResponseSchema(BanResponseSchema),
			400: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
