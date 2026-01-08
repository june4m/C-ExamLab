import { eq } from 'drizzle-orm'
import { db } from '../../configurations/database'
import { quizzes, quizQuestions, quizAnswers, quizSubmissions } from '../../common/database/schema'
import type { CreateQuizDto, ImportQuizQuestionsDto, CreateEmptyQuizDto, AddQuestionDto } from './model'

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
    },

    importQuestions: async (data: ImportQuizQuestionsDto, errors: { index: number; reason: string }[]) => {
        return await db.transaction(async tx => {
            let quizUuid: string

            // Create new quiz or use existing
            if (data.quizUuid) {
                // Check if quiz exists
                const existingQuiz = await tx.select().from(quizzes).where(eq(quizzes.uuid, data.quizUuid))
                if (existingQuiz.length === 0) {
                    throw new Error('Quiz not found')
                }
                quizUuid = data.quizUuid
            } else {
                // Create new quiz
                quizUuid = crypto.randomUUID()
                await tx.insert(quizzes).values({
                    uuid: quizUuid,
                    title: data.title!,
                    description: data.description || null,
                    isActive: 1
                })
            }

            // Get current max order for this quiz
            const existingQuestions = await tx.select({ order: quizQuestions.order })
                .from(quizQuestions)
                .where(eq(quizQuestions.quizUuid, quizUuid))

            let currentOrder = existingQuestions.length > 0
                ? Math.max(...existingQuestions.map(q => q.order ?? 0)) + 1
                : 0

            let imported = 0
            const errorIndices = new Set(errors.map(e => e.index))

            for (let i = 0; i < data.questions.length; i++) {
                // Skip invalid questions
                if (errorIndices.has(i)) continue

                const q = data.questions[i]
                const questionUuid = crypto.randomUUID()

                await tx.insert(quizQuestions).values({
                    uuid: questionUuid,
                    quizUuid: quizUuid,
                    content: q.content,
                    points: q.points ?? 1,
                    type: q.type ?? 'MULTIPLE_CHOICE',
                    order: currentOrder++
                })

                for (const a of q.answers) {
                    await tx.insert(quizAnswers).values({
                        questionUuid: questionUuid,
                        content: a.content,
                        // @ts-ignore
                        isCorrect: a.isCorrect ? 1 : 0
                    })
                }

                imported++
            }

            return { quizUuid, imported }
        })
    },

    // Tạo quiz trống
    createEmptyQuiz: async (data: CreateEmptyQuizDto) => {
        const quizUuid = crypto.randomUUID()
        await db.insert(quizzes).values({
            uuid: quizUuid,
            title: data.title,
            description: data.description || null,
            isActive: 1
        })
        return quizUuid
    },

    // Thêm 1 câu hỏi vào quiz
    addQuestion: async (quizUuid: string, data: AddQuestionDto) => {
        // Check quiz exists
        const existingQuiz = await db.select().from(quizzes).where(eq(quizzes.uuid, quizUuid))
        if (existingQuiz.length === 0) {
            throw new Error('Quiz not found')
        }

        return await db.transaction(async tx => {
            // Get current max order
            const existingQuestions = await tx.select({ order: quizQuestions.order })
                .from(quizQuestions)
                .where(eq(quizQuestions.quizUuid, quizUuid))

            const currentOrder = existingQuestions.length > 0
                ? Math.max(...existingQuestions.map(q => q.order ?? 0)) + 1
                : 0

            const questionUuid = crypto.randomUUID()
            await tx.insert(quizQuestions).values({
                uuid: questionUuid,
                quizUuid: quizUuid,
                content: data.content,
                points: data.points ?? 1,
                type: data.type ?? 'MULTIPLE_CHOICE',
                order: currentOrder
            })

            for (const a of data.answers) {
                await tx.insert(quizAnswers).values({
                    questionUuid: questionUuid,
                    content: a.content,
                    // @ts-ignore
                    isCorrect: a.isCorrect ? 1 : 0
                })
            }

            return questionUuid
        })
    },

    // Copy câu hỏi từ quiz khác
    copyQuestionsFromQuiz: async (targetQuizUuid: string, sourceQuizUuid: string, questionUuids?: string[]) => {
        // Check target quiz exists
        const targetQuiz = await db.select().from(quizzes).where(eq(quizzes.uuid, targetQuizUuid))
        if (targetQuiz.length === 0) {
            throw new Error('Target quiz not found')
        }

        // Get source quiz with questions
        const sourceQuiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.uuid, sourceQuizUuid),
            with: {
                questions: {
                    with: {
                        answers: true
                    }
                }
            }
        })

        if (!sourceQuiz) {
            throw new Error('Source quiz not found')
        }

        return await db.transaction(async tx => {
            // Get current max order in target quiz
            const existingQuestions = await tx.select({ order: quizQuestions.order })
                .from(quizQuestions)
                .where(eq(quizQuestions.quizUuid, targetQuizUuid))

            let currentOrder = existingQuestions.length > 0
                ? Math.max(...existingQuestions.map(q => q.order ?? 0)) + 1
                : 0

            let copied = 0
            let skipped = 0

            // Filter questions to copy
            const questionsToCopy = questionUuids && questionUuids.length > 0
                ? sourceQuiz.questions.filter(q => questionUuids.includes(q.uuid))
                : sourceQuiz.questions

            for (const q of questionsToCopy) {
                const newQuestionUuid = crypto.randomUUID()

                await tx.insert(quizQuestions).values({
                    uuid: newQuestionUuid,
                    quizUuid: targetQuizUuid,
                    content: q.content,
                    points: q.points,
                    type: q.type,
                    order: currentOrder++
                })

                for (const a of q.answers) {
                    await tx.insert(quizAnswers).values({
                        questionUuid: newQuestionUuid,
                        content: a.content,
                        isCorrect: a.isCorrect
                    })
                }

                copied++
            }

            // Count skipped (requested but not found)
            if (questionUuids && questionUuids.length > 0) {
                skipped = questionUuids.length - copied
            }

            return { copied, skipped }
        })
    }
}
