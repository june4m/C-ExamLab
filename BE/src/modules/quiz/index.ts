import { Elysia, t } from 'elysia'
import { quizService } from './service'
import { CreateQuizDto, SubmitQuizDto } from './model'
import { ApiResponseSchema } from '../../common/dtos/response'
import { requireAuth } from '../../middlewares/requireAuth'
import { wrapResponse } from '../../common/dtos/response'

export const quiz = new Elysia({ prefix: '/quiz', tags: ['Quiz'] })
    .use(requireAuth)

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
