import { quizRepository } from './repository'
import { wrapResponse } from '../../common/dtos/response'
import type { CreateQuizDto, SubmitQuizDto } from './model'

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
            const userAnswer = userAnswers.find(ua => ua.questionUiid === question.uuid)
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
    }
}
