import { Elysia, t } from 'elysia'
import { quizService } from './service'
import { CreateQuizDto, SubmitQuizDto, ImportQuizQuestionsDto, ImportQuizQuestionsResponseDto, CreateEmptyQuizDto, AddQuestionDto, CopyQuestionsDto, CopyQuestionsResponseDto } from './model'
import { ApiResponseSchema } from '../../common/dtos/response'
import { requireAuth } from '../../middlewares/requireAuth'
import { wrapResponse } from '../../common/dtos/response'

export const quiz = new Elysia({ prefix: '/quiz', tags: ['Quiz'] })
	.use(requireAuth)

	// Get All Quizzes (User)
	.get('/', quizService.getAllQuizzes, {
		detail: { summary: 'Get All Quizzes', description: 'Get list of all active quizzes' },
		response: {
			200: ApiResponseSchema(t.Array(t.Object({
				uuid: t.String(),
				title: t.String(),
				description: t.Union([t.String(), t.Null()]),
				isActive: t.Number(),
				createdAt: t.Union([t.String(), t.Date(), t.Null()])
			}))),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Create Quiz (Admin Only)
	.post('/', quizService.createQuiz, {
		detail: { summary: 'Create Quiz', description: 'Create a new quiz with questions and answers' },
		body: CreateQuizDto,
		beforeHandle: ({ user, set }: any) => {
			if (!user.isAdmin) {
				set.status = 403
				return wrapResponse(null, 403, '', 'Forbidden - Admin access required')
			}
		},
		response: {
			201: ApiResponseSchema(t.Object({ uuid: t.String() })),
			400: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get Quiz (User)
	.get('/:id', quizService.getQuiz, {
		detail: { summary: 'Get Quiz', description: 'Get quiz details by ID' },
		params: t.Object({ id: t.String() }),
		response: {
			200: ApiResponseSchema(t.Any()), // Using Any for flexibility with response mapping, or use specific refined DTO
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Submit Quiz (User)
	.post('/:id/submit', quizService.submitQuiz, {
		detail: { summary: 'Submit Quiz', description: 'Submit quiz answers and get score' },
		params: t.Object({ id: t.String() }),
		body: SubmitQuizDto,
		response: {
			200: ApiResponseSchema(t.Object({
				score: t.Number(),
				totalPoints: t.Number(),
				percentage: t.Number(),
				grade: t.String()
			})),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Import Quiz Questions (just Admin)
	.post('/import', quizService.importQuizQuestions, {
		detail: {
			summary: 'Import Quiz Questions',
			description: 'Import multiple questions to an existing quiz or create a new quiz. Provide quizUuid to add to existing quiz, or title to create new quiz.'
		},
		body: ImportQuizQuestionsDto,
		beforeHandle: ({ user, set }: any) => {
			if (!user.isAdmin) {
				set.status = 403
				return wrapResponse(null, 403, '', 'Forbidden - Admin access required')
			}
		},
		response: {
			201: ApiResponseSchema(ImportQuizQuestionsResponseDto),
			400: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Create Empty Quiz (just Admin)
	.post('/create', quizService.createEmptyQuiz, {
		detail: {
			summary: 'Create Empty Quiz',
			description: 'Create a new quiz without questions. Add questions later using add-question or copy endpoints.'
		},
		body: CreateEmptyQuizDto,
		beforeHandle: ({ user, set }: any) => {
			if (!user.isAdmin) {
				set.status = 403
				return wrapResponse(null, 403, '', 'Forbidden - Admin access required')
			}
		},
		response: {
			201: ApiResponseSchema(t.Object({ uuid: t.String() })),
			403: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Add Single Question to Quiz (just Admin)
	.post('/:id/questions', quizService.addQuestion, {
		detail: {
			summary: 'Add Question to Quiz',
			description: 'Add a single question with answers to an existing quiz.'
		},
		params: t.Object({ id: t.String() }),
		body: AddQuestionDto,
		beforeHandle: ({ user, set }: any) => {
			if (!user.isAdmin) {
				set.status = 403
				return wrapResponse(null, 403, '', 'Forbidden - Admin access required')
			}
		},
		response: {
			201: ApiResponseSchema(t.Object({ questionUuid: t.String() })),
			400: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Copy Questions from Another Quiz ( admin only)
	.post('/:id/copy-questions', quizService.copyQuestions, {
		detail: {
			summary: 'Copy Questions from Another Quiz',
			description: 'Copy questions from a source quiz to target quiz. If questionUuids is empty/null, copy all questions.'
		},
		params: t.Object({ id: t.String() }),
		body: CopyQuestionsDto,
		beforeHandle: ({ user, set }: any) => {
			if (!user.isAdmin) {
				set.status = 403
				return wrapResponse(null, 403, '', 'Forbidden - Admin access required')
			}
		},
		response: {
			201: ApiResponseSchema(CopyQuestionsResponseDto),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
