import Elysia from 'elysia'
import { jwtUtils } from '../common/utils/jwt.utils'
import { wrapResponse } from '../common/dtos/response'

export const requireAuth = (app: Elysia) =>
	app
		.derive(async ({ cookie }) => {
			const token =
				typeof cookie?.auth?.value === 'string' ? cookie.auth.value : ''

			if (!token) {
				return { user: null }
			}

			const payload = await jwtUtils.verifyToken(token)

			if (!payload) {
				return { user: null }
			}

			return { user: payload }
		})
		.onBeforeHandle(({ user, set }) => {
			if (!user) {
				set.status = 401
				return wrapResponse(
					null,
					401,
					'',
					'Unauthorized - Authentication required'
				)
			}
		})
