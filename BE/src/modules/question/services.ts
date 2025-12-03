import { eq } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { questions, rooms } from '../../common/database/schema'
import { wrapResponse } from '../../common/dtos/response'
import type {
	CreateQuestionDto,
	CreateQuestionResponse,
	Question,
	QuestionDetail,
	QuestionListResponse,
	UpdateQuestionDto,
	UpdateQuestionResponse
} from './model'

// Helper to format question data
const formatQuestion = (question: any): Question => ({
	uuid: question.uuid,
	roomUuid: question.roomUuid,
	title: question.title,
	descriptionPath: question.descriptionPath ?? null,
	score: question.score ?? null,
	timeLimit: question.timeLimit ?? null,
	memoryLimit: question.memoryLimit ?? null,
	order: question.order ?? null,
	createdAt: question.createdAt?.toISOString() ?? null
})

export const questionService = {
	createQuestion: async ({ body, user, set }: any) => {
		const {
			title,
			descriptionPath,
			score,
			timeLimit,
			memoryLimit,
			order,
			roomId
		} = body as CreateQuestionDto

		// Check if room exists
		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const newUuid = crypto.randomUUID()
		await db.insert(questions).values({
			uuid: newUuid,
			roomUuid: roomId,
			title,
			descriptionPath: descriptionPath || null,
			score: score ?? 100,
			timeLimit: timeLimit ?? 1000,
			memoryLimit: memoryLimit ?? 262144,
			order: order ?? 0
		})

		const response: CreateQuestionResponse = {
			message: 'success',
			questionUuid: newUuid
		}

		return wrapResponse(response, 201, 'Question created successfully')
	},

	getQuestionsByRoom: async ({ params, user, set }: any) => {
		const { roomId } = params

		// Check if room exists
		const [room] = await db
			.select({
				uuid: rooms.uuid,
				code: rooms.code,
				name: rooms.name,
				openTime: rooms.openTime,
				closeTime: rooms.closeTime,
				createdBy: rooms.createdBy,
				createdAt: rooms.createdAt,
				updatedAt: rooms.updatedAt
			})
			.from(rooms)
			.where(eq(rooms.uuid, roomId))

		if (!room) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Room not found')
		}

		// Check if user is owner of the room
		if (room.createdBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const questionList = await db
			.select()
			.from(questions)
			.where(eq(questions.roomUuid, roomId))

		return wrapResponse(
			questionList.map(formatQuestion),
			200,
			'Questions retrieved successfully'
		)
	},

	getQuestionById: async ({ params, user, set }: any) => {
		const { questionId } = params

		// Get question with room info
		const [questionData] = await db
			.select({
				uuid: questions.uuid,
				roomUuid: questions.roomUuid,
				title: questions.title,
				descriptionPath: questions.descriptionPath,
				score: questions.score,
				timeLimit: questions.timeLimit,
				memoryLimit: questions.memoryLimit,
				order: questions.order,
				createdAt: questions.createdAt,
				roomCode: rooms.code,
				roomCreatedBy: rooms.createdBy
			})
			.from(questions)
			.innerJoin(rooms, eq(questions.roomUuid, rooms.uuid))
			.where(eq(questions.uuid, questionId))

		if (!questionData) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		// Check if user is owner of the room
		if (questionData.roomCreatedBy !== user.userId) {
			set.status = 403
			return wrapResponse(
				null,
				403,
				'',
				'Forbidden - You are not the owner of this room'
			)
		}

		const response: QuestionDetail = {
			uuid: questionData.uuid,
			roomId: questionData.roomUuid,
			code: questionData.roomCode,
			title: questionData.title,
			descriptionPath: questionData.descriptionPath ?? null,
			score: questionData.score ?? null,
			timeLimit: questionData.timeLimit ?? null,
			memoryLimit: questionData.memoryLimit ?? null,
			order: questionData.order ?? null,
			createdAt: questionData.createdAt?.toISOString() ?? null
		}

		return wrapResponse(response, 200, 'Question retrieved successfully')
	},

	getAllQuestions: async ({ user }: any) => {
		// Get all questions from rooms owned by the user
		const questionList = await db
			.select({
				uuid: questions.uuid,
				roomUuid: questions.roomUuid,
				title: questions.title,
				descriptionPath: questions.descriptionPath,
				score: questions.score,
				timeLimit: questions.timeLimit,
				memoryLimit: questions.memoryLimit,
				order: questions.order,
				createdAt: questions.createdAt,
				roomCode: rooms.code
			})
			.from(questions)
			.innerJoin(rooms, eq(questions.roomUuid, rooms.uuid))
			.where(eq(rooms.createdBy, user.userId))

		const formattedList: QuestionDetail[] = questionList.map(q => ({
			uuid: q.uuid,
			roomId: q.roomUuid,
			code: q.roomCode,
			title: q.title,
			descriptionPath: q.descriptionPath ?? null,
			score: q.score ?? null,
			timeLimit: q.timeLimit ?? null,
			memoryLimit: q.memoryLimit ?? null,
			order: q.order ?? null,
			createdAt: q.createdAt?.toISOString() ?? null
		}))

		const response: QuestionListResponse = {
			listQuestion: formattedList
		}

		return wrapResponse(response, 200, 'Questions retrieved successfully')
	},

	updateQuestion: async ({ body, user, set }: any) => {
		const { questionId, title, descriptionPath, score, timeLimit, memoryLimit, order, roomId } = body as UpdateQuestionDto

		// Get question with room info
		const [questionData] = await db
			.select({
				uuid: questions.uuid,
				roomUuid: questions.roomUuid,
				roomCreatedBy: rooms.createdBy
			})
			.from(questions)
			.innerJoin(rooms, eq(questions.roomUuid, rooms.uuid))
			.where(eq(questions.uuid, questionId))

		if (!questionData) {
			set.status = 404
			return wrapResponse(null, 404, '', 'Question not found')
		}

		// Check if user is owner of the room
		if (questionData.roomCreatedBy !== user.userId) {
			set.status = 403
			return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of this room')
		}

		// If roomId is provided, check if new room exists and user owns it
		if (roomId && roomId !== questionData.roomUuid) {
			const [newRoom] = await db.select().from(rooms).where(eq(rooms.uuid, roomId))
			if (!newRoom) {
				set.status = 404
				return wrapResponse(null, 404, '', 'New room not found')
			}
			if (newRoom.createdBy !== user.userId) {
				set.status = 403
				return wrapResponse(null, 403, '', 'Forbidden - You are not the owner of the new room')
			}
		}

		const updateValues: any = {}
		if (title !== undefined) updateValues.title = title
		if (descriptionPath !== undefined) updateValues.descriptionPath = descriptionPath
		if (score !== undefined) updateValues.score = score
		if (timeLimit !== undefined) updateValues.timeLimit = timeLimit
		if (memoryLimit !== undefined) updateValues.memoryLimit = memoryLimit
		if (order !== undefined) updateValues.order = order
		if (roomId !== undefined) updateValues.roomUuid = roomId

		await db.update(questions).set(updateValues).where(eq(questions.uuid, questionId))

		const response: UpdateQuestionResponse = {
			message: 'updated successfully'
		}

		return wrapResponse(response, 200, 'Question updated successfully')
	}
}
