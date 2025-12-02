import { eq, and, like } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { accounts } from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type { Student } from './model'

// Helper to format student data
const formatStudent = (account: any): Student => ({
	studentId: account.uuid,
	studentFullName: account.fullName ?? null,
	studentEmail: account.email,
	isBanned: account.isBanned === 1,
	lastLogin: account.lastLogin?.toISOString() ?? null,
	createdAt: account.createdAt?.toISOString() ?? null,
	updatedAt: account.updatedAt?.toISOString() ?? null
})

export const adminService = {
	getStudents: async () => {
		// Get all users with role = 'USER' (students)
		const students = await db
			.select()
			.from(accounts)
			.where(eq(accounts.role, 'USER'))

		return wrapResponse(
			students.map(formatStudent),
			200,
			'Students retrieved successfully'
		)
	},

	getStudentsByName: async ({ params }: any) => {
		const { userName } = params

		// Search students by name (partial match)
		const students = await db
			.select()
			.from(accounts)
			.where(
				and(eq(accounts.role, 'USER'), like(accounts.fullName, `%${userName}%`))
			)

		return wrapResponse(
			students.map(formatStudent),
			200,
			'Students retrieved successfully'
		)
	},

	updateUser: async ({ params, body, set }: any) => {
		const { userId } = params
		const { studentFullName, studentEmail } = body

		// Check if user exists
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Check if email already exists (if updating email)
		if (studentEmail && studentEmail !== user.email) {
			const [existingUser] = await db
				.select()
				.from(accounts)
				.where(eq(accounts.email, studentEmail))

			if (existingUser) {
				set.status = 409
				return wrapResponse(null, 409, '', 'Email already exists')
			}
		}

		const updateValues: any = { updatedAt: new Date() }
		if (studentFullName !== undefined) updateValues.fullName = studentFullName
		if (studentEmail !== undefined) updateValues.email = studentEmail

		await db.update(accounts).set(updateValues).where(eq(accounts.uuid, userId))

		// Get updated user
		const [updatedUser] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		return wrapResponse(
			formatStudent(updatedUser),
			200,
			'User updated successfully'
		)
	},

	banUser: async ({ params, set }: any) => {
		const { userId } = params

		// Check if user exists
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Cannot ban admin
		if (user.role === 'ADMIN') {
			set.status = 400
			return wrapResponse(null, 400, '', 'Cannot ban admin user')
		}

		// Check if already banned
		if (user.isBanned === 1) {
			set.status = 400
			return wrapResponse(null, 400, '', 'User is already banned')
		}

		await db
			.update(accounts)
			.set({ isBanned: 1, updatedAt: new Date() })
			.where(eq(accounts.uuid, userId))

		return wrapResponse({ message: 'success' }, 200, 'User banned successfully')
	},

	unbanUser: async ({ params, set }: any) => {
		const { userId } = params

		// Check if user exists
		const [user] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.uuid, userId))

		if (!user) {
			set.status = 404
			return wrapResponse(null, 404, '', 'User not found')
		}

		// Check if not banned
		if (user.isBanned === 0) {
			set.status = 400
			return wrapResponse(null, 400, '', 'User is not banned')
		}

		await db
			.update(accounts)
			.set({ isBanned: 0, updatedAt: new Date() })
			.where(eq(accounts.uuid, userId))

		return wrapResponse({ message: 'success' }, 200, 'User unbanned successfully')
	}
}
