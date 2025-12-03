import Elysia from 'elysia'
import { wrapResponse } from '../common/dtos/response'
import { requireAuth } from './requireAuth'

export const requireAdmin = (app: Elysia) =>
	app
		.use(requireAuth)
		.onBeforeHandle(({ user, set }) => {
			if (!user?.isAdmin) {
				set.status = 403
				return wrapResponse(
					null,
					403,
					'',
					'Forbidden - Admin access required'
				)
			}
		})
