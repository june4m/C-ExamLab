import { eq } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { accounts } from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'

export const userService = {
	getProfile: async ({ user, set }: any) => {
		if (!user) {
			set.status = 401
			return wrapResponse(null, 401, '', 'Unauthorized')
		}

		const [userProfile] = await db
			.select({
				uuid: accounts.uuid,
				email: accounts.email,
				fullName: accounts.fullName,
				createdAt: accounts.createdAt,
				lastLogin: accounts.lastLogin,
				role: accounts.role
			})
			.from(accounts)
			.where(eq(accounts.uuid, user.userId))

		if (!userProfile) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		return wrapResponse(
			{
				...userProfile,
				createdAt: userProfile.createdAt?.toISOString() || null,
				lastLogin: userProfile.lastLogin?.toISOString() || null
			},
			200,
			'Profile retrieved successfully'
		)
	}
}
