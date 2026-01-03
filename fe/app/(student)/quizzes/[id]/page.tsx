'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle2, Trophy } from 'lucide-react'
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
import { useGetQuiz, useSubmitQuiz } from '@/service/student/quiz.service'
import type { SubmitBody } from '@/interface/admin/quiz.interface'

export default function TakeQuizPage() {
	const router = useRouter()
	const params = useParams()
	const quizId = params.id as string

	const { data: quiz, isLoading, error } = useGetQuiz(quizId)
	const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz()

	const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({})
	const [submitted, setSubmitted] = useState(false)
	const [result, setResult] = useState<{
		score: number
		totalPoints: number
		percentage: number
		grade: string
	} | null>(null)

	const handleAnswerChange = (questionUuid: string, answerUuid: string, checked: boolean) => {
		if (submitted) return // Prevent changes after submission

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
					setSubmitted(true)
					setResult(data)
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
				<Button variant="outline" className="mt-4" onClick={() => router.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Go Back
				</Button>
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
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{quiz.title}</h1>
					{quiz.description && (
						<p className="text-muted-foreground mt-2">{quiz.description}</p>
					)}
				</div>
			</div>

			{/* Result Card (shown after submission) */}
			{submitted && result && (
				<Card className="mb-6 border-2 border-primary">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="h-5 w-5 text-yellow-500" />
							Quiz Results
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Score</p>
								<p className="text-2xl font-bold">
									{result.score} / {result.totalPoints}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Percentage</p>
								<p className="text-2xl font-bold">{result.percentage.toFixed(1)}%</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Grade</p>
								<Badge variant="default" className="text-lg px-3 py-1">
									{result.grade}
								</Badge>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Status</p>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-5 w-5 text-green-500" />
									<span className="font-medium">Completed</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

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
								question.answers.map((answer) => {
									const isSelected =
										selectedAnswers[question.uuid]?.includes(answer.uuid) || false
									return (
										<div
											key={answer.uuid}
											className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
												submitted
													? 'opacity-60 cursor-not-allowed'
													: 'hover:bg-accent cursor-pointer'
											}`}
											onClick={() => {
												if (!submitted) {
													handleAnswerChange(
														question.uuid,
														answer.uuid,
														!isSelected
													)
												}
											}}
										>
											<Checkbox
												checked={isSelected}
												onCheckedChange={checked =>
													!submitted &&
													handleAnswerChange(
														question.uuid,
														answer.uuid,
														!!checked
													)
												}
												disabled={submitted}
												className="mt-1"
											/>
											<label className="flex-1 cursor-pointer">
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
			{!submitted && (
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
			)}
		</div>
	)
}

