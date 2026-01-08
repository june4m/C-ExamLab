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

// Import Quiz Questions DTOs
export const ImportAnswerDto = t.Object({
    content: t.String({ minLength: 1 }),
    isCorrect: t.Boolean()
})

export const ImportQuestionDto = t.Object({
    content: t.String({ minLength: 1 }),
    points: t.Optional(t.Number({ default: 1, minimum: 0 })),
    type: t.Optional(t.String({ default: 'MULTIPLE_CHOICE' })),
    answers: t.Array(ImportAnswerDto, { minItems: 2 })
})

export const ImportQuizQuestionsDto = t.Object({
    quizUuid: t.Optional(t.String()), // If provided, add to existing quiz
    title: t.Optional(t.String()), // Required if creating new quiz
    description: t.Optional(t.String()),
    questions: t.Array(ImportQuestionDto, { minItems: 1 })
})

export const ImportQuizQuestionsResponseDto = t.Object({
    quizUuid: t.String(),
    imported: t.Number(),
    skipped: t.Number(),
    errors: t.Array(t.Object({
        index: t.Number(),
        reason: t.String()
    }))
})

export type ImportQuizQuestionsDto = typeof ImportQuizQuestionsDto.static
export type ImportQuizQuestionsResponse = typeof ImportQuizQuestionsResponseDto.static

// Create Empty Quiz DTO
export const CreateEmptyQuizDto = t.Object({
    title: t.String({ minLength: 1 }),
    description: t.Optional(t.String())
})

export type CreateEmptyQuizDto = typeof CreateEmptyQuizDto.static

// Add Single Question DTO
export const AddQuestionDto = t.Object({
    content: t.String({ minLength: 1 }),
    points: t.Optional(t.Number({ default: 1, minimum: 0 })),
    type: t.Optional(t.String({ default: 'MULTIPLE_CHOICE' })),
    answers: t.Array(t.Object({
        content: t.String({ minLength: 1 }),
        isCorrect: t.Boolean()
    }), { minItems: 2 })
})

export type AddQuestionDto = typeof AddQuestionDto.static

// Copy Questions from Another Quiz DTO
export const CopyQuestionsDto = t.Object({
    sourceQuizUuid: t.String(),
    questionUuids: t.Optional(t.Array(t.String())) // If empty/null, copy all questions
})

export const CopyQuestionsResponseDto = t.Object({
    copied: t.Number(),
    skipped: t.Number()
})

export type CopyQuestionsDto = typeof CopyQuestionsDto.static
export type CopyQuestionsResponse = typeof CopyQuestionsResponseDto.static
