import { eq, and, gt } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { accounts, passwordResetTokens } from '../../common/database/schema'
import { passwordUtils } from '../../common/utils/password.utils'
import { jwtUtils } from '../../common/utils/jwt.utils'
import { setAuthCookie, unsetAuthCookie } from '../../common/utils/cookie.utils'
import { wrapResponse } from '../../common/dtos/response'
import { NODE_ENV } from '../../configurations/env'
import type { LoginDto, RegisterDto, AuthResponse, ForgotPasswordDto, ResetPasswordDto } from './model'

export const authService = {
	login: async ({ body, cookie, set }: any) => {
		const { email, password } = body as LoginDto

		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.email, email))

		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Email or password invalid')
		}

		let isValidPassword = false
		if (user.password.startsWith('$argon2')) {
			isValidPassword = await passwordUtils.verify(user.password, password)
		} else {
			isValidPassword = user.password === password
		}
		if (!isValidPassword) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Email or password invalid')
		}

		if (user.isBanned === 1) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Your account has been banned')
		}

		await db
			.update(accounts)
			.set({ lastLogin: new Date() })
			.where(eq(accounts.uuid, user.uuid))

		const isAdmin = user.role === 'ADMIN'
		const token = await jwtUtils.signAccessToken({
			userId: user.uuid,
			email: user.email,
			isAdmin
		})

		setAuthCookie(cookie, token)

		const response: AuthResponse = {
			user: {
				uuid: user.uuid,
				email: user.email,
				fullName: user.fullName,
				role: user.role
			},
			token
		}

		return wrapResponse(response, 200, 'Login successfully')
	},

	logout: async ({ cookie }: any) => {
		unsetAuthCookie(cookie)
		return wrapResponse(null, 200, 'Logout successfully')
	},

	register: async ({ body, cookie, set }: any) => {
		const { email, password, fullName } = body as RegisterDto

		if (!email.endsWith('@gmail.com')) {
			set.status = 400
			return wrapResponse(null, 400, '', 'Email must be a Gmail address (@gmail.com)')
		}

		const [existingUser] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.email, email))

		if (existingUser) {
			set.status = 409
			return wrapResponse(null, 409, '', 'Email has been used')
		}

		const hashedPassword = await passwordUtils.hash(password)
		const newUuid = crypto.randomUUID()
		await db.insert(accounts).values({
			uuid: newUuid,
			email,
			password: hashedPassword,
			fullName: fullName || null
		})

		const token = await jwtUtils.signAccessToken({
			userId: newUuid,
			email: email,
			isAdmin: false
		})

		setAuthCookie(cookie, token)

		const response: AuthResponse = {
			user: {
				uuid: newUuid,
				email: email,
				fullName: fullName || null,
				role: 'USER'
			},
			token
		}

		return wrapResponse(response, 201, 'Register successful')
	},

	refreshToken: async ({ user, cookie, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		// Get fresh user data
		const [freshUser] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, user.userId))

		if (!freshUser) {
			set.status = 401
			return wrapResponse(null, 401, '', 'User not found')
		}

		if (freshUser.isBanned === 1) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Your account has been banned')
		}

		// Generate new token
		const isAdmin = freshUser.role === 'ADMIN'
		const newToken = await jwtUtils.signAccessToken({
			userId: freshUser.uuid,
			email: freshUser.email,
			isAdmin
		})

		setAuthCookie(cookie, newToken)

		return wrapResponse({ token: newToken }, 200, 'Token refreshed successfully')
	},

	forgotPassword: async ({ body, set }: any) => {
		const { email } = body as ForgotPasswordDto

		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.email, email))

		// Always return success to prevent email enumeration
		if (!user) {
			return wrapResponse(
				{ message: 'If email exists, reset instructions will be sent' },
				200,
				'Password reset requested'
			)
		}

		// Generate reset token (random 32 char string)
		const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').substring(0, 8)
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

		// Save token to database
		await db.insert(passwordResetTokens).values({
			accountUuid: user.uuid,
			token: resetToken,
			expiresAt
		})

		// In production, send email here
		// For now, return token in dev mode
		const response: any = {
			message: 'If email exists, reset instructions will be sent'
		}

		if (NODE_ENV === 'development') {
			response.resetToken = resetToken
		}

		return wrapResponse(response, 200, 'Password reset requested')
	},

	resetPassword: async ({ body, set }: any) => {
		const { token, newPassword } = body as ResetPasswordDto

		// Find valid token
		const [resetToken] = await db
			.select()
			.from(passwordResetTokens)
			.where(
				and(
					eq(passwordResetTokens.token, token),
					gt(passwordResetTokens.expiresAt, new Date())
				)
			)

		if (!resetToken) {
			set.status = 400
			return wrapResponse(null, 400, '', 'Invalid or expired reset token')
		}

		// Check if token already used
		if (resetToken.usedAt) {
			set.status = 400
			return wrapResponse(null, 400, '', 'Reset token has already been used')
		}

		// Hash new password
		const hashedPassword = await passwordUtils.hash(newPassword)

		// Update password
		await db
			.update(accounts)
			.set({ password: hashedPassword, updatedAt: new Date() })
			.where(eq(accounts.uuid, resetToken.accountUuid))

		// Mark token as used
		await db
			.update(passwordResetTokens)
			.set({ usedAt: new Date() })
			.where(eq(passwordResetTokens.uuid, resetToken.uuid))

		return wrapResponse({ message: 'success' }, 200, 'Password reset successfully')
	}
}
