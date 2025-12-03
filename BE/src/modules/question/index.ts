import Elysia, { t } from 'elysia'
import { requireAdmin } from '../../middlewares/requireAdmin'
import { questionService } from './services'
import {
	CreateQuestionSchema,
	CreateQuestionResponseSchema,
	QuestionSchema,
	QuestionDetailSchema,
	QuestionListResponseSchema,
	UpdateQuestionSchema,
	UpdateQuestionResponseSchema
} from './model'
import { ApiResponseSchema } from '../../common/dtos/response'

export const question = new Elysia({
	prefix: '/admin/questions',
	tags: ['Admin - Questions']
})
	.use(requireAdmin)

	// Get all questions from rooms owned by current admin
	.get('/getAllQuestion', questionService.getAllQuestions, {
		detail: { summary: 'Get all questions', description: 'Get all questions from rooms owned by current admin.' },
		response: {
			200: ApiResponseSchema(QuestionListResponseSchema),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Create new question in a room
	.post('/create-question', questionService.createQuestion, {
		detail: {
			summary: 'Create question',
			description: 'Create a new question in a room. Admin must own the room.'
		},
		body: CreateQuestionSchema,
		response: {
			201: ApiResponseSchema(CreateQuestionResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get all questions in a room
	.get('/room/:roomId', questionService.getQuestionsByRoom, {
		detail: { summary: 'Get questions by room', description: 'Get all questions in a specific room. Admin must own the room.' },
		params: t.Object({ roomId: t.String() }),
		response: {
			200: ApiResponseSchema(t.Array(QuestionSchema)),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get question by ID (includes room code)
	.get('/:questionId', questionService.getQuestionById, {
		detail: { summary: 'Get question by ID', description: 'Get question details including room code. Admin must own the room.' },
		params: t.Object({ questionId: t.String() }),
		response: {
			200: ApiResponseSchema(QuestionDetailSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Update question (all fields optional except questionId)
	.put('/update-question', questionService.updateQuestion, {
		detail: {
			summary: 'Update question',
			description: 'Update question details. All fields are optional except questionId. Can move question to another room.'
		},
		body: UpdateQuestionSchema,
		response: {
			200: ApiResponseSchema(UpdateQuestionResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
