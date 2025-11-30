import { eq } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { accounts } from '../../common/database/schema'
import { passwordUtils } from '../../common/utils/password.utils'
import { jwtUtils } from '../../common/utils/jwt.utils'
import { setAuthCookie, unsetAuthCookie } from '../../common/utils/cookie.utils'
import { wrapResponse } from '../../common/dtos/response'
import type { LoginDto, RegisterDto, AuthResponse } from './model'

export const authService = {
	login: async ({ body, cookie, set }: any) => {
		const { email, password } = body as LoginDto

		// Find user by email
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.email, email))

		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Email or password invalid')
		}

		// Verify password (support both hashed and plaintext for dev)
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

		// Update last login
		await db
			.update(accounts)
			.set({ lastLogin: new Date() })
			.where(eq(accounts.uuid, user.uuid))

		// Generate JWT token
		const token = await jwtUtils.signAccessToken({
			userId: user.uuid,
			email: user.email,
			isAdmin: false,
		})

		// Set cookie
		setAuthCookie(cookie, token)

		const response: AuthResponse = {
			user: {
				uuid: user.uuid,
				email: user.email,
				fullName: user.fullName,
			},
			token,
		}

		return wrapResponse(response, 200, 'Login successfully')
	},

	logout: async ({ cookie }: any) => {
		// Clear cookie
		unsetAuthCookie(cookie)
		return wrapResponse(null, 200, 'Logout successfully')
	},

	register: async ({ body, cookie, set }: any) => {
		const { email, password, fullName } = body as RegisterDto

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
			fullName: fullName || null,
		})

		const token = await jwtUtils.signAccessToken({
			userId: newUuid,
			email: email,
			isAdmin: false,
		})

		// Set cookie
		setAuthCookie(cookie, token)

		const response: AuthResponse = {
			user: {
				uuid: newUuid,
				email: email,
				fullName: fullName || null,
			},
			token,
		}

		return wrapResponse(response, 201, 'Register successful')
	},

	refreshToken: async () => {
		return wrapResponse(null, 501, '', 'Chưa được triển khai')
	},

	forgotPassword: async () => {
		return wrapResponse(null, 501, '', 'Chưa được triển khai')
	},

	resetPassword: async () => {
		return wrapResponse(null, 501, '', 'Chưa được triển khai')
	}
}
