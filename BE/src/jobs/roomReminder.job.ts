import { Cron } from 'croner'
import { eq, and, isNull, lte, gte } from 'drizzle-orm'
import { db } from '../configurations/database'
import { rooms, roomParticipants, accounts } from '../common/database/schema'
import { emailService } from '../services/email.service'

// Run every minute to check for rooms that need reminders
export const roomReminderJob = new Cron('* * * * *', async () => {
	try {
		const now = new Date()
		// Find rooms opening in the next 15-16 minutes that haven't sent reminders yet
		const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000)
		const sixteenMinutesFromNow = new Date(now.getTime() + 16 * 60 * 1000)

		// Get rooms that:
		// 1. Have openTime between 15-16 minutes from now
		// 2. Haven't sent reminder yet (reminderSentAt is null)
		const roomsToNotify = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime
			})
			.from(rooms)
			.where(
				and(
					isNull(rooms.reminderSentAt),
					gte(rooms.openTime, fifteenMinutesFromNow),
					lte(rooms.openTime, sixteenMinutesFromNow)
				)
			)

		if (roomsToNotify.length === 0) {
			return
		}

		console.log(`[RoomReminder] Found ${roomsToNotify.length} rooms to notify`)

		for (const room of roomsToNotify) {
			if (!room.openTime) continue

			// Get all participants in this room
			const participants = await db
				.select({
					email: accounts.email,
					fullName: accounts.fullName
				})
				.from(roomParticipants)
				.innerJoin(accounts, eq(roomParticipants.accountUuid, accounts.uuid))
				.where(eq(roomParticipants.roomUuid, room.uuid))

			console.log(
				`[RoomReminder] Sending ${participants.length} emails for room: ${room.name}`
			)

			// Send emails to all participants
			const emailPromises = participants.map(p =>
				emailService.sendRoomCodeEmail(
					p.email,
					p.fullName,
					room.name,
					room.code,
					room.openTime!
				)
			)

			await Promise.allSettled(emailPromises)

			// Mark room as reminder sent
			await db
				.update(rooms)
				.set({ reminderSentAt: now })
				.where(eq(rooms.uuid, room.uuid))

			console.log(`[RoomReminder] Completed for room: ${room.name}`)
		}
	} catch (error) {
		console.error('[RoomReminder] Error:', error)
	}
})

export const startRoomReminderJob = () => {
	console.log('📧 Room reminder job started (runs every minute)')
}
