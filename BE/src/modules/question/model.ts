import { t } from 'elysia'

// Schema for create question request
export const CreateQuestionSchema = t.Object({
	title: t.String({ minLength: 1, maxLength: 200 }),
	descriptionPath: t.Optional(t.String()),
	score: t.Optional(t.Number({ default: 100 })),
	timeLimit: t.Optional(t.Number({ default: 1000 })),
	memoryLimit: t.Optional(t.Number({ default: 262144 })),
	order: t.Optional(t.Number({ default: 0 })),
	roomId: t.String()
})

export type CreateQuestionDto = typeof CreateQuestionSchema.static

// Schema for create question response
export const CreateQuestionResponseSchema = t.Object({
	message: t.String(),
	questionUuid: t.String()
})

export type CreateQuestionResponse = typeof CreateQuestionResponseSchema.static

// Schema for question response
export const QuestionSchema = t.Object({
	uuid: t.String(),
	roomUuid: t.String(),
	title: t.String(),
	descriptionPath: t.Union([t.String(), t.Null()]),
	score: t.Union([t.Number(), t.Null()]),
	timeLimit: t.Union([t.Number(), t.Null()]),
	memoryLimit: t.Union([t.Number(), t.Null()]),
	order: t.Union([t.Number(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()])
})

export type Question = typeof QuestionSchema.static

// Schema for question detail response (includes room code)
export const QuestionDetailSchema = t.Object({
	uuid: t.String(),
	roomId: t.String(),
	code: t.String(),
	title: t.String(),
	descriptionPath: t.Union([t.String(), t.Null()]),
	score: t.Union([t.Number(), t.Null()]),
	timeLimit: t.Union([t.Number(), t.Null()]),
	memoryLimit: t.Union([t.Number(), t.Null()]),
	order: t.Union([t.Number(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()])
})

export type QuestionDetail = typeof QuestionDetailSchema.static

// Schema for list questions response
export const QuestionListResponseSchema = t.Object({
	listQuestion: t.Array(QuestionDetailSchema)
})

export type QuestionListResponse = typeof QuestionListResponseSchema.static

// Schema for update question request
export const UpdateQuestionSchema = t.Object({
	questionId: t.String(),
	title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
	descriptionPath: t.Optional(t.String()),
	score: t.Optional(t.Number()),
	timeLimit: t.Optional(t.Number()),
	memoryLimit: t.Optional(t.Number()),
	order: t.Optional(t.Number()),
	roomId: t.Optional(t.String())
})

export type UpdateQuestionDto = typeof UpdateQuestionSchema.static

// Schema for update question response
export const UpdateQuestionResponseSchema = t.Object({
	message: t.String()
})

export type UpdateQuestionResponse = typeof UpdateQuestionResponseSchema.static
