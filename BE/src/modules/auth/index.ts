import Elysia from 'elysia'
import { authService } from './service'

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.post('/login', authService.login)
	.post('/logout', authService.logout)
	.post('/register', authService.register)
	.post('/refresh-token', authService.refreshToken)
	.post('/forgot-password', authService.forgotPassword)
	.post('/reset-password', authService.resetPassword)
