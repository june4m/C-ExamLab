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
	.get('/getAllQuestion', questionService.getAllQuestions, {
		response: {
			200: ApiResponseSchema(QuestionListResponseSchema),
			500: ApiResponseSchema(t.Null())
		}
	})
	.post('/create-question', questionService.createQuestion, {
		body: CreateQuestionSchema,
		response: {
			201: ApiResponseSchema(CreateQuestionResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.get('/room/:roomId', questionService.getQuestionsByRoom, {
		params: t.Object({ roomId: t.String() }),
		response: {
			200: ApiResponseSchema(t.Array(QuestionSchema)),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.get('/:questionId', questionService.getQuestionById, {
		params: t.Object({ questionId: t.String() }),
		response: {
			200: ApiResponseSchema(QuestionDetailSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.put('/update-question', questionService.updateQuestion, {
		body: UpdateQuestionSchema,
		response: {
			200: ApiResponseSchema(UpdateQuestionResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
