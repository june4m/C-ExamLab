import { eq } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { quizzes, quizQuestions, quizAnswers, quizSubmissions } from '../../common/database/schema'
import type { CreateQuizDto } from './model'

export const quizRepository = {
    createQuiz: async (data: CreateQuizDto) => {
        return await db.transaction(async tx => {
            const quizUuid = crypto.randomUUID()
            await tx.insert(quizzes).values({
                uuid: quizUuid,
                title: data.title,
                description: data.description || null,
                isActive: 1
            })

            for (const q of data.questions) {
                const questionUuid = crypto.randomUUID()
                await tx.insert(quizQuestions).values({
                    uuid: questionUuid,

                    quizUuid: quizUuid,
                    content: q.content,
                    points: q.points,
                    type: q.type,
                    order: 0 // You might want to add index logic
                })

                for (const a of q.answers) {
                    await tx.insert(quizAnswers).values({
                        questionUuid: questionUuid,
                        content: a.content,
                        // @ts-ignore
                        isCorrect: a.isCorrect ? 1 : 0
                    })
                }
            }
            return quizUuid
        })
    },

    findQuizById: async (uuid: string) => {
        return await db.query.quizzes.findFirst({
            where: eq(quizzes.uuid, uuid),
            with: {
                questions: {
                    with: {
                        answers: true
                    }
                }
            }
        })
    },

    createSubmission: async (quizUuid: string, accountUuid: string, score: number, totalPoints: number) => {
        const uuid = crypto.randomUUID()
        await db.insert(quizSubmissions).values({
            uuid,
            quizUuid,
            accountUuid,
            score,
            totalPoints,
            submittedAt: new Date()
        })
        return uuid
    },

    findAllQuizzes: async () => {
        return await db.select({
            uuid: quizzes.uuid,
            title: quizzes.title,
            description: quizzes.description,
            isActive: quizzes.isActive,
            createdAt: quizzes.createdAt
        })
            .from(quizzes)
            .where(eq(quizzes.isActive, 1))
    }
}
