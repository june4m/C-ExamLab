'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useGetQuiz } from '@/service/admin/quiz.service'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { QuestionWithUuid, AnswerWithUuid } from '@/interface/admin/quiz.interface'

export default function EditQuizPage() {
	const router = useRouter()
	const params = useParams()
	const quizId = params.id as string

	const { data: quiz, isLoading, error } = useGetQuiz(quizId)

	// Form state
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	type QuestionWithAnswers = QuestionWithUuid & {
		answers: Array<AnswerWithUuid & { isCorrect?: boolean }>
	}
	const [questions, setQuestions] = useState<QuestionWithAnswers[]>([])

	useEffect(() => {
		if (quiz) {
			setTitle(quiz.title || '')
			setDescription(quiz.description ?? '')
			// Load questions and answers
			if (quiz.questions) {
				// Note: Backend doesn't return isCorrect, so we'll show answers but can't edit correctness
				setQuestions(
					quiz.questions.map(q => ({
						...q,
						answers: q.answers.map(a => ({
							...a,
							isCorrect: undefined // Backend doesn't return this
						}))
					}))
				)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quiz])

	const updateQuestion = (
		index: number,
		field: keyof QuestionWithUuid,
		value: string | number
	) => {
		const updated = [...questions]
		updated[index] = { ...updated[index], [field]: value }
		setQuestions(updated)
	}

	const updateAnswer = (
		questionIndex: number,
		answerIndex: number,
		field: 'content' | 'isCorrect',
		value: string | boolean
	) => {
		const updated = [...questions]
		updated[questionIndex].answers[answerIndex] = {
			...updated[questionIndex].answers[answerIndex],
			[field]: value
		}
		setQuestions(updated)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		alert(
			'Update quiz API not implemented yet!\n\n' +
				JSON.stringify(
					{
						title,
						description,
						questions: questions.map(q => ({
							uuid: q.uuid,
							content: q.content,
							points: q.points,
							answers: q.answers.map(a => ({
								uuid: a.uuid,
								content: a.content
							}))
						}))
					},
					null,
					2
				)
		)
		// TODO: Call updateQuiz API when available
	}

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-2xl p-6">
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		)
	}

	if (error || !quiz) {
		return (
			<div className="container mx-auto max-w-2xl p-6">
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
				<h1 className="text-2xl font-bold">Edit Quiz</h1>
				<p className="text-muted-foreground mt-2">
					Update quiz information, questions and answers
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Quiz Info */}
				<Card>
					<CardHeader>
						<CardTitle>Quiz Information</CardTitle>
						<CardDescription>
							Edit the title and description of the quiz
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								placeholder="Enter quiz title"
								value={title}
								onChange={e => setTitle(e.target.value)}
								required
							/>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Enter quiz description (optional)"
								value={description}
								onChange={e => setDescription(e.target.value)}
								rows={4}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Questions */}
				<Card>
					<CardHeader>
						<CardTitle>Questions ({questions.length})</CardTitle>
						<CardDescription>
							View and edit questions and their answers
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{questions.map((question, qIndex) => (
							<Card key={question.uuid} className="border-2">
								<CardHeader>
									<CardTitle className="text-lg">
										Question {qIndex + 1}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Question Content */}
									<div className="space-y-2">
										<Label>Question Content *</Label>
										<Textarea
											placeholder="Enter question content"
											value={question.content}
											onChange={e =>
												updateQuestion(qIndex, 'content', e.target.value)
											}
											required
											rows={3}
										/>
									</div>

									{/* Points */}
									<div className="space-y-2">
										<Label>Points</Label>
										<Input
											type="number"
											min="0"
											step="0.1"
											value={question.points}
											onChange={e =>
												updateQuestion(
													qIndex,
													'points',
													parseFloat(e.target.value) || 0
												)
											}
										/>
									</div>

									{/* Answers */}
									<div className="space-y-2">
										<Label>Answers *</Label>
										{question.answers.map((answer, aIndex) => (
											<div
												key={answer.uuid}
												className="flex items-start gap-3 rounded-md border p-3"
											>
												<div className="flex items-center gap-2 mt-1">
													<Checkbox
														checked={(answer as AnswerWithUuid & { isCorrect?: boolean }).isCorrect || false}
														disabled={(answer as AnswerWithUuid & { isCorrect?: boolean }).isCorrect === undefined}
														className="mt-1"
													/>
													{(answer as AnswerWithUuid & { isCorrect?: boolean }).isCorrect !== undefined && (
														<label className="text-sm text-muted-foreground cursor-pointer whitespace-nowrap">
															Correct
														</label>
													)}
													{(answer as AnswerWithUuid & { isCorrect?: boolean }).isCorrect === undefined && (
														<span className="text-xs text-muted-foreground italic">
															(Correct answer info not available)
														</span>
													)}
												</div>
												<Input
													placeholder="Enter answer content"
													value={answer.content}
													onChange={e =>
														updateAnswer(
															qIndex,
															aIndex,
															'content',
															e.target.value
														)
													}
													className="flex-1"
												/>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}

						{questions.length === 0 && (
							<div className="rounded-md border border-dashed p-8 text-center">
								<p className="text-muted-foreground">
									No questions in this quiz
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Submit Buttons */}
				<div className="flex gap-4">
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={() => router.back()}
					>
						Cancel
					</Button>
					<Button type="submit" className="flex-1">
						Save Changes
					</Button>
				</div>
			</form>
		</div>
	)
}

