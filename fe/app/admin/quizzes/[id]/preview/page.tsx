'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useGetQuiz, useSubmitQuiz } from '@/service/admin/quiz.service'
import type { SubmitBody, QuestionWithUuid, AnswerWithUuid } from '@/interface/admin/quiz.interface'

export default function QuizPreviewPage() {
	const router = useRouter()
	const params = useParams()
	const quizId = params.id as string

	const { data: quiz, isLoading, error } = useGetQuiz(quizId)
	const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz()

	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<string, string[]>
	>({})

	const handleAnswerChange = (questionUuid: string, answerUuid: string, checked: boolean) => {
		setSelectedAnswers(prev => {
			const current = prev[questionUuid] || []
			if (checked) {
				return {
					...prev,
					[questionUuid]: [...current, answerUuid]
				}
			} else {
				return {
					...prev,
					[questionUuid]: current.filter(id => id !== answerUuid)
				}
			}
		})
	}

	const handleSubmit = () => {
		if (!quiz || !quiz.questions) return

		const payload: SubmitBody = {
			answers: quiz.questions.map(question => ({
				questionUuid: question.uuid,
				selectedAnswerUuids: selectedAnswers[question.uuid] || []
			}))
		}

		submitQuiz(
			{ id: quizId, payload },
			{
				onSuccess: data => {
					// Show success message or redirect
					alert(
						`Quiz submitted successfully!\nScore: ${data.score}/${data.totalPoints}`
					)
					router.push('/admin/quizzes')
				},
				onError: (err: Error) => {
					alert(`Failed to submit quiz: ${err.message}`)
				}
			}
		)
	}

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl p-6">
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		)
	}

	if (error || !quiz) {
		return (
			<div className="container mx-auto max-w-4xl p-6">
				<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
					{error?.message || 'Failed to load quiz'}
				</div>
				<Link href="/admin/quizzes">
					<Button variant="outline" className="mt-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to quizzes
					</Button>
				</Link>
			</div>
		)
	}

	const questions = quiz.questions || []
	const allQuestionsAnswered = questions.every(
		q => selectedAnswers[q.uuid] && selectedAnswers[q.uuid].length > 0
	)

	return (
		<div className="container mx-auto max-w-4xl p-6">
			{/* Header */}
			<div className="mb-6">
				<Link
					href="/admin/quizzes"
					className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to quizzes list
				</Link>
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-bold">{quiz.title}</h1>
						{quiz.description && (
							<p className="text-muted-foreground mt-2">{quiz.description}</p>
						)}
						<div className="flex items-center gap-2 mt-2">
							<Badge variant={quiz.isActive ? 'default' : 'secondary'}>
								{quiz.isActive ? 'Active' : 'Inactive'}
							</Badge>
							<span className="text-sm text-muted-foreground">
								Created:{' '}
								{new Date(quiz.createdAt).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Questions */}
			<div className="space-y-6 mb-6">
				{questions.map((question, index) => (
					<Card key={question.uuid}>
						<CardHeader>
							<CardTitle className="text-lg">
								Question {index + 1}
								{question.points && (
									<span className="ml-2 text-sm font-normal text-muted-foreground">
										({question.points} point{question.points !== 1 ? 's' : ''})
									</span>
								)}
							</CardTitle>
							<CardDescription className="text-base text-foreground">
								{question.content}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{question.answers && question.answers.length > 0 ? (
								question.answers.map((answer: AnswerWithUuid) => {
									const isSelected =
										selectedAnswers[question.uuid]?.includes(answer.uuid) ||
										false
									return (
										<div
											key={answer.uuid}
											className="flex items-start gap-3 rounded-md border p-3 hover:bg-accent transition-colors"
										>
											<Checkbox
												checked={isSelected}
												onCheckedChange={checked =>
													handleAnswerChange(
														question.uuid,
														answer.uuid,
														!!checked
													)
												}
												className="mt-1"
											/>
											<label
												className="flex-1 cursor-pointer"
												onClick={() =>
													handleAnswerChange(
														question.uuid,
														answer.uuid,
														!isSelected
													)
												}
											>
												{answer.content}
											</label>
										</div>
									)
								})
							) : (
								<p className="text-sm text-muted-foreground">
									No answers available
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Submit Section */}
			<Card className="sticky bottom-0 bg-background border-t-2">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div>
							{!allQuestionsAnswered && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<AlertCircle className="h-4 w-4" />
									<span>
										Please answer all questions before submitting
									</span>
								</div>
							)}
							{allQuestionsAnswered && (
								<div className="flex items-center gap-2 text-sm text-green-600">
									<CheckCircle2 className="h-4 w-4" />
									<span>All questions answered</span>
								</div>
							)}
						</div>
						<Button
							onClick={handleSubmit}
							disabled={!allQuestionsAnswered || isSubmitting}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								<>
									<Send className="mr-2 h-4 w-4" />
									Submit Quiz
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

