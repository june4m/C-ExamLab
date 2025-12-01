import Elysia from 'elysia'
import { requireAdmin } from '../../middlewares/requireAdmin'

// Admin module - placeholder for future admin-specific routes
// Room routes have been moved to BE/src/modules/room/index.ts
export const admin = new Elysia({ prefix: '/admin', tags: ['Admin'] })
	.use(requireAdmin)
