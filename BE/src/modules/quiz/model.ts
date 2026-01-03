import { t } from 'elysia'

export const CreateAnswerDto = t.Object({
    content: t.String({ minLength: 1 }),
    isCorrect: t.Boolean()
})

export const CreateQuestionDto = t.Object({
    content: t.String({ minLength: 1 }),
    points: t.Number({ default: 1, minimum: 0 }),
    type: t.String({ default: 'MULTIPLE_CHOICE' }), // Can enforce enum if needed
    answers: t.Array(CreateAnswerDto, { minItems: 2 })
})

export const CreateQuizDto = t.Object({
    title: t.String({ minLength: 1 }),
    description: t.Optional(t.String()),
    questions: t.Array(CreateQuestionDto, { minItems: 1 })
})

export const SubmitQuestionAnswerDto = t.Object({
    questionUuid: t.String(),
    selectedAnswerUuids: t.Array(t.String())
})

export const SubmitQuizDto = t.Object({
    answers: t.Array(SubmitQuestionAnswerDto)
})

// Response DTOs
export const AnswerResponseDto = t.Object({
    uuid: t.String(),
    content: t.String()
    // isCorrect is EXCLUDED for users
})

export const QuestionResponseDto = t.Object({
    uuid: t.String(),
    content: t.String(),
    points: t.Number(),
    type: t.String(),
    answers: t.Array(AnswerResponseDto)
})

export const QuizResponseDto = t.Object({
    uuid: t.String(),
    title: t.String(),
    description: t.Union([t.String(), t.Null()]),
    questions: t.Array(QuestionResponseDto)
})

export const QuizResultDto = t.Object({
    score: t.Number(),
    totalPoints: t.Number(),
    percentage: t.Number(),
    grade: t.String()
})

export type CreateQuizDto = typeof CreateQuizDto.static
export type SubmitQuizDto = typeof SubmitQuizDto.static
