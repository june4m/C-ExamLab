import Elysia, { t } from 'elysia'
import { authService } from './service'
import {
	LoginSchema,
	RegisterSchema,
	AuthResponseSchema,
	RefreshTokenResponseSchema,
	ForgotPasswordSchema,
	ForgotPasswordResponseSchema,
	ResetPasswordSchema,
	ResetPasswordResponseSchema
} from './model'
import { ApiResponseSchema } from '../../common/dtos/response'
import { COOKIE_OPTIONS } from '../../common/utils/cookie.utils'
import { requireAuth } from '../../middlewares/requireAuth'

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })

	// Login with email and password
	// - Returns JWT token and user info
	// - Banned users cannot login
	.post('/login', authService.login, {
		detail: {
			summary: 'Login',
			description: 'Login with email and password. Returns JWT token. Banned users cannot login.'
		},
		body: LoginSchema,
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			200: ApiResponseSchema(AuthResponseSchema),
			401: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Logout (clear auth cookie)
	.post('/logout', authService.logout, {
		detail: { summary: 'Logout', description: 'Logout and clear authentication cookie.' },
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			200: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Register new account
	// - Email must be @gmail.com
	// - Password min 6 characters
	.post('/register', authService.register, {
		detail: {
			summary: 'Register',
			description: 'Register new account. Email must be @gmail.com. Password minimum 6 characters.'
		},
		body: RegisterSchema,
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			201: ApiResponseSchema(AuthResponseSchema),
			400: ApiResponseSchema(t.Null()),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Request password reset
	// - Sends reset token (in dev mode, token is returned in response)
	// - Token expires in 1 hour
	.post('/forgot-password', authService.forgotPassword, {
		detail: {
			summary: 'Forgot password',
			description: 'Request password reset. In dev mode, reset token is returned. Token expires in 1 hour.'
		},
		body: ForgotPasswordSchema,
		response: {
			200: ApiResponseSchema(ForgotPasswordResponseSchema),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Reset password with token
	.post('/reset-password', authService.resetPassword, {
		detail: {
			summary: 'Reset password',
			description: 'Reset password using token from forgot-password. Token can only be used once.'
		},
		body: ResetPasswordSchema,
		response: {
			200: ApiResponseSchema(ResetPasswordResponseSchema),
			400: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Protected routes (require authentication)
	.use(requireAuth)

	// Refresh JWT token
	// - Requires valid current token
	// - Returns new token
	.post('/refresh-token', authService.refreshToken, {
		detail: {
			summary: 'Refresh token',
			description: 'Get new JWT token. Requires valid current token. Banned users cannot refresh.'
		},
		cookie: t.Cookie({ auth: t.Optional(t.String()) }, COOKIE_OPTIONS),
		response: {
			200: ApiResponseSchema(RefreshTokenResponseSchema),
			401: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
