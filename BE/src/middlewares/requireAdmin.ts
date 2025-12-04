import Elysia from 'elysia'
import { wrapResponse } from '../common/dtos/response'
import { requireAuth } from './requireAuth'

export const requireAdmin = (app: Elysia) =>
	app.use(requireAuth).onBeforeHandle(({ user, set }) => {
		// Explicitly check if user is admin
		// The isAdmin field should be a boolean from the JWT payload
		if (!user) {
			set.status = 401
			return wrapResponse(
				null,
				401,
				'',
				'Unauthorized - Authentication required'
			)
		}

		if (user.isAdmin !== true) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - Admin access required. Please log out and log back in if you were recently granted admin privileges.'
			)
		}
	})
