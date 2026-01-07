import { quizRepository } from './repository'
import { wrapResponse } from '../../common/dtos/response'
import type { CreateQuizDto, SubmitQuizDto, ImportQuizQuestionsDto, ImportQuizQuestionsResponse, CreateEmptyQuizDto, AddQuestionDto, CopyQuestionsDto, CopyQuestionsResponse } from './model'

export const quizService = {
    createQuiz: async ({ body, set }: any) => {
        const data = body as CreateQuizDto

        // Validation: At least one correct answer per question
        for (const q of data.questions) {
            const correctCount = q.answers.filter(a => a.isCorrect).length
            if (correctCount === 0) {
                set.status = 400
                return wrapResponse(null, 400, '', `Question "${q.content}" must have at least one correct answer.`)
            }
        }

        const quizUuid = await quizRepository.createQuiz(data)
        return wrapResponse({ uuid: quizUuid }, 201, 'Quiz created successfully')
    },

    getAllQuizzes: async () => {
        const quizzes = await quizRepository.findAllQuizzes()
        return wrapResponse(quizzes, 200, 'All quizzes retrieved successfully')
    },

    getQuiz: async ({ params, set }: any) => {
        const quiz = await quizRepository.findQuizById(params.id)

        if (!quiz) {
            set.status = 404
            return wrapResponse(null, 404, '', 'Quiz not found')
        }

        // Map to DTO, excluding isCorrect
        const response = {
            uuid: quiz.uuid,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map(q => ({
                uuid: q.uuid,
                content: q.content,
                points: q.points,
                type: q.type,
                answers: q.answers.map(a => ({
                    uuid: a.uuid,
                    content: a.content
                }))
            }))
        }

        return wrapResponse(response, 200, 'Quiz details')
    },

    submitQuiz: async ({ params, body, user, set }: any) => {
        const { id } = params
        const { answers: userAnswers } = body as SubmitQuizDto
        const userId = user.userId

        const quiz = await quizRepository.findQuizById(id)
        if (!quiz) {
            set.status = 404
            return wrapResponse(null, 404, '', 'Quiz not found')
        }

        let totalScore = 0
        let totalPossiblePoints = 0

        // Scoring Logic
        for (const question of quiz.questions) {
            totalPossiblePoints += question.points

            // Find user's answer for this question
            const userAnswer = userAnswers.find(ua => ua.questionUuid === question.uuid)
            const selectedIds = new Set(userAnswer ? userAnswer.selectedAnswerUuids : [])

            const correctAnswers = question.answers.filter(a => a.isCorrect === 1)
            const correctAnswerIds = new Set(correctAnswers.map(a => a.uuid))

            // Anti-Cheat: If ANY incorrect answer is selected, score is 0
            let hasIncorrectSelection = false
            for (const selectedId of selectedIds) {
                if (!correctAnswerIds.has(selectedId)) {
                    hasIncorrectSelection = true
                    break
                }
            }

            if (hasIncorrectSelection) {
                // Score is 0
                continue
            }

            // Partial Credit Logic
            let correctSelectedCount = 0
            for (const selectedId of selectedIds) {
                if (correctAnswerIds.has(selectedId)) {
                    correctSelectedCount++
                }
            }

            if (correctAnswers.length > 0) {
                const questionScore = (correctSelectedCount / correctAnswers.length) * question.points
                totalScore += questionScore
            }
        }

        // Save Submission
        await quizRepository.createSubmission(quiz.uuid, userId, totalScore, totalPossiblePoints)

        const percentage = totalPossiblePoints > 0 ? (totalScore / totalPossiblePoints) * 100 : 0
        let grade = 'F'
        if (percentage >= 80) grade = 'A'
        else if (percentage >= 70) grade = 'B'
        else if (percentage >= 60) grade = 'C'
        else if (percentage >= 50) grade = 'D'

        return wrapResponse({
            score: totalScore,
            totalPoints: totalPossiblePoints,
            percentage: Number(percentage.toFixed(2)),
            grade
        }, 200, 'Quiz submitted successfully')
    },

    importQuizQuestions: async ({ body, set }: any) => {
        const data = body as ImportQuizQuestionsDto
        const errors: { index: number; reason: string }[] = []
        let imported = 0
        let skipped = 0

        // Validate: either quizUuid or title must be provided
        if (!data.quizUuid && !data.title) {
            set.status = 400
            return wrapResponse(null, 400, '', 'Either quizUuid (to add to existing quiz) or title (to create new quiz) is required')
        }

        // Validate each question has at least one correct answer
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i]
            const correctCount = q.answers.filter(a => a.isCorrect).length
            if (correctCount === 0) {
                errors.push({ index: i, reason: 'Must have at least one correct answer' })
                skipped++
            }
        }

        // If all questions are invalid, return error
        if (skipped === data.questions.length) {
            set.status = 400
            return wrapResponse(null, 400, '', 'All questions are invalid. Each question must have at least one correct answer.')
        }

        try {
            const result = await quizRepository.importQuestions(data, errors)
            imported = result.imported

            const response: ImportQuizQuestionsResponse = {
                quizUuid: result.quizUuid,
                imported,
                skipped,
                errors
            }

            return wrapResponse(response, 201, `Successfully imported ${imported} question(s)`)
        } catch (error: any) {
            if (error.message === 'Quiz not found') {
                set.status = 404
                return wrapResponse(null, 404, '', 'Quiz not found')
            }
            throw error
        }
    },

    // Tạo quiz trống (chỉ title, description)
    createEmptyQuiz: async ({ body, set }: any) => {
        const data = body as CreateEmptyQuizDto
        const quizUuid = await quizRepository.createEmptyQuiz(data)
        return wrapResponse({ uuid: quizUuid }, 201, 'Quiz created successfully')
    },

    // Thêm 1 câu hỏi vào quiz
    addQuestion: async ({ params, body, set }: any) => {
        const { id: quizUuid } = params
        const data = body as AddQuestionDto

        // Validate: at least one correct answer
        const correctCount = data.answers.filter(a => a.isCorrect).length
        if (correctCount === 0) {
            set.status = 400
            return wrapResponse(null, 400, '', 'Question must have at least one correct answer')
        }

        try {
            const questionUuid = await quizRepository.addQuestion(quizUuid, data)
            return wrapResponse({ questionUuid }, 201, 'Question added successfully')
        } catch (error: any) {
            if (error.message === 'Quiz not found') {
                set.status = 404
                return wrapResponse(null, 404, '', 'Quiz not found')
            }
            throw error
        }
    },

    // Copy câu hỏi từ quiz khác
    copyQuestions: async ({ params, body, set }: any) => {
        const { id: targetQuizUuid } = params
        const data = body as CopyQuestionsDto

        try {
            const result = await quizRepository.copyQuestionsFromQuiz(targetQuizUuid, data.sourceQuizUuid, data.questionUuids)

            const response: CopyQuestionsResponse = {
                copied: result.copied,
                skipped: result.skipped
            }

            return wrapResponse(response, 201, `Successfully copied ${result.copied} question(s)`)
        } catch (error: any) {
            if (error.message === 'Target quiz not found') {
                set.status = 404
                return wrapResponse(null, 404, '', 'Target quiz not found')
            }
            if (error.message === 'Source quiz not found') {
                set.status = 404
                return wrapResponse(null, 404, '', 'Source quiz not found')
            }
            throw error
        }
    }
}
