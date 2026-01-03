'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Save, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateQuiz } from '@/service/admin/quiz.service'
import type { CreateQuizBody, Question, Answer } from '@/interface/admin/quiz.interface'

export default function CreateQuizPage() {
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		title: '',
		description: ''
	})
	const [questions, setQuestions] = useState<Array<Question & { tempId: string }>>([])

	const { mutate: createQuiz, isPending } = useCreateQuiz()

	const addQuestion = () => {
		const tempId = `temp-${Date.now()}-${Math.random()}`
		setQuestions([
			...questions,
			{
				tempId,
				content: '',
				points: 1,
				type: 'MULTIPLE_CHOICE',
				answers: []
			}
		])
	}

	const removeQuestion = (index: number) => {
		setQuestions(questions.filter((_, i) => i !== index))
	}

	const updateQuestion = (index: number, field: keyof Question, value: any) => {
		const updated = [...questions]
		updated[index] = { ...updated[index], [field]: value }
		setQuestions(updated)
	}

	const addAnswer = (questionIndex: number) => {
		const updated = [...questions]
		updated[questionIndex].answers = [
			...updated[questionIndex].answers,
			{ content: '', isCorrect: false }
		]
		setQuestions(updated)
	}

	const removeAnswer = (questionIndex: number, answerIndex: number) => {
		const updated = [...questions]
		updated[questionIndex].answers = updated[questionIndex].answers.filter(
			(_, i) => i !== answerIndex
		)
		setQuestions(updated)
	}

	const updateAnswer = (
		questionIndex: number,
		answerIndex: number,
		field: keyof Answer,
		value: any
	) => {
		const updated = [...questions]
		updated[questionIndex].answers[answerIndex] = {
			...updated[questionIndex].answers[answerIndex],
			[field]: value
		}
		setQuestions(updated)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Validation
		if (!formData.title.trim()) {
			setError('Title is required')
			return
		}

		if (questions.length === 0) {
			setError('At least one question is required')
			return
		}

		for (let i = 0; i < questions.length; i++) {
			const q = questions[i]
			if (!q.content.trim()) {
				setError(`Question ${i + 1}: Content is required`)
				return
			}
			if (q.answers.length < 2) {
				setError(`Question ${i + 1}: At least 2 answers are required`)
				return
			}
			const hasCorrect = q.answers.some(a => a.isCorrect)
			if (!hasCorrect) {
				setError(`Question ${i + 1}: At least one correct answer is required`)
				return
			}
		}

		const payload: CreateQuizBody = {
			title: formData.title,
			description: formData.description || undefined,
			questions: questions.map(q => ({
				content: q.content,
				points: q.points,
				type: q.type,
				answers: q.answers
			}))
		}

		createQuiz(payload, {
			onSuccess: (data) => {
				// Backend returns { uuid: string }
				router.push('/admin/quizzes')
			},
			onError: (err: Error) => {
				setError(err.message || 'Failed to create quiz')
			}
		})
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
				<h1 className="text-2xl font-bold">Create New Quiz</h1>
				<p className="text-muted-foreground">
					Enter quiz information and add questions
				</p>
			</div>

			{error && (
				<div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					<AlertCircle className="h-4 w-4" />
					<span>{error}</span>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Quiz Info */}
				<Card>
					<CardHeader>
						<CardTitle>Quiz Information</CardTitle>
						<CardDescription>
							Enter the basic information for your quiz
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								placeholder="Enter quiz title"
								value={formData.title}
								onChange={e =>
									setFormData({ ...formData, title: e.target.value })
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Enter quiz description (optional)"
								value={formData.description}
								onChange={e =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={3}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Questions */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Questions</CardTitle>
								<CardDescription>
									Add questions to your quiz ({questions.length} question
									{questions.length !== 1 ? 's' : ''})
								</CardDescription>
							</div>
							<Button type="button" onClick={addQuestion} variant="outline">
								<Plus className="h-4 w-4 mr-2" />
								Add Question
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{questions.map((question, qIndex) => (
							<Card key={question.tempId} className="border-2">
								<CardHeader>
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg">
											Question {qIndex + 1}
										</CardTitle>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeQuestion(qIndex)}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
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
										<div className="flex items-center justify-between">
											<Label>Answers *</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => addAnswer(qIndex)}
											>
												<Plus className="h-3 w-3 mr-1" />
												Add Answer
											</Button>
										</div>
										{question.answers.map((answer, aIndex) => (
											<div
												key={aIndex}
												className="flex items-start gap-3 rounded-md border p-3"
											>
												<Checkbox
													checked={answer.isCorrect}
													onCheckedChange={checked =>
														updateAnswer(
															qIndex,
															aIndex,
															'isCorrect',
															checked
														)
													}
													className="mt-1"
												/>
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
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeAnswer(qIndex, aIndex)}
													className="text-destructive hover:text-destructive"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}
										{question.answers.length < 2 && (
											<p className="text-sm text-muted-foreground">
												At least 2 answers are required
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						))}

						{questions.length === 0 && (
							<div className="rounded-md border border-dashed p-8 text-center">
								<p className="text-muted-foreground mb-4">
									No questions yet. Click &quot;Add Question&quot; to get started.
								</p>
								<Button type="button" onClick={addQuestion} variant="outline">
									<Plus className="h-4 w-4 mr-2" />
									Add First Question
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Submit */}
				<div className="flex gap-4">
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={() => router.push('/admin/quizzes')}
					>
						Cancel
					</Button>
					<Button type="submit" className="flex-1" disabled={isPending}>
						{isPending ? (
							'Creating...'
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Create Quiz
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	)
}

