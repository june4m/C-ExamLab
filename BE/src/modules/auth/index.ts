import Elysia, { t } from 'elysia'
import { authService } from './service'
import { LoginSchema, RegisterSchema, AuthResponseSchema } from './model'
import { ApiResponseSchema } from '../../common/dtos/response'
import { COOKIE_OPTIONS } from '../../common/utils/cookie.utils'

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.post('/login', authService.login, {
		body: LoginSchema,
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			200: ApiResponseSchema(AuthResponseSchema),
			401: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null()),
		},
	})
	.post('/logout', authService.logout, {
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			200: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null()),
		},
	})
	.post('/register', authService.register, {
		body: RegisterSchema,
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			201: ApiResponseSchema(AuthResponseSchema),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null()),
		},
	})
	.post('/refresh-token', authService.refreshToken)
	.post('/forgot-password', authService.forgotPassword)
	.post('/reset-password', authService.resetPassword)
