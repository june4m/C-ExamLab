'use client'

import { useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Copy, Loader2 } from 'lucide-react'
import {
	useGetQuiz,
	useGetQuizzes,
	useCopyQuestionsFromQuiz
} from '@/service/admin/quiz.service'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription
} from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { useState } from 'react'

export default function EditQuizPage() {
	const router = useRouter()
	const params = useParams()
	const quizId = params.id as string

	const { data: quiz, isLoading, error, refetch } = useGetQuiz(quizId)
	const { data: allQuizzes } = useGetQuizzes()
	const { mutate: copyQuestions, isPending: isCopyingQuestions } =
		useCopyQuestionsFromQuiz()

	// Dialog states
	const [showCopyQuestionsDialog, setShowCopyQuestionsDialog] = useState(false)
	const [sourceQuizUuid, setSourceQuizUuid] = useState('')

	// Derived state from quiz data
	const title = quiz?.title || ''
	const description = quiz?.description || ''
	const questions = useMemo(() => quiz?.questions || [], [quiz?.questions])

	const handleCopyQuestions = () => {
		if (!sourceQuizUuid) {
			toast.error('Please select a source quiz')
			return
		}

		copyQuestions(
			{
				targetQuizId: quizId,
				payload: {
					sourceQuizUuid,
					questionUuids: undefined
				}
			},
			{
				onSuccess: data => {
					toast.success(`Copied ${data.copied} question(s) successfully`)
					setShowCopyQuestionsDialog(false)
					setSourceQuizUuid('')
					refetch()
				},
				onError: (err: Error) => {
					toast.error(err.message || 'Failed to copy questions')
				}
			}
		)
	}

	// Filter out current quiz from source options
	const availableSourceQuizzes =
		allQuizzes?.filter(q => q.uuid !== quizId) || []

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
					href={`/admin/quizzes/${quizId}`}
					className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to quiz detail
				</Link>
				<h1 className="text-2xl font-bold">{title}</h1>
				{description && (
					<p className="text-muted-foreground mt-2">{description}</p>
				)}
			</div>

			{/* Questions */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Questions ({questions.length})</CardTitle>
							<CardDescription>Manage questions in this quiz</CardDescription>
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowCopyQuestionsDialog(true)}
							>
								<Copy className="h-4 w-4 mr-2" />
								Copy from Quiz
							</Button>
							<Link href={`/admin/quizzes/add-questions?quizId=${quizId}`}>
								<Button variant="outline">
									<Plus className="h-4 w-4 mr-2" />
									Add Questions
								</Button>
							</Link>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{questions.length > 0 ? (
						questions.map((question, qIndex) => (
							<Card key={question.uuid} className="border">
								<CardHeader className="pb-2">
									<CardTitle className="text-base">
										Q{qIndex + 1}: {question.content}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{question.answers.map((answer, aIndex) => {
											const isCorrect = Boolean(answer.isCorrect)
											return (
												<div
													key={answer.uuid}
													className={`flex items-center gap-2 text-sm p-2 rounded-md ${
														isCorrect
															? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
															: 'bg-muted/50'
													}`}
												>
													<span
														className={`font-medium ${
															isCorrect
																? 'text-green-700 dark:text-green-400'
																: 'text-muted-foreground'
														}`}
													>
														{String.fromCharCode(65 + aIndex)}.
													</span>
													<span className="flex-1">{answer.content}</span>
													{isCorrect && (
														<span className="text-xs text-green-600 dark:text-green-400 font-medium">
															✓ Correct
														</span>
													)}
												</div>
											)
										})}
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<div className="rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground mb-4">
								No questions in this quiz
							</p>
							<div className="flex justify-center gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCopyQuestionsDialog(true)}
								>
									<Copy className="h-4 w-4 mr-2" />
									Copy from Quiz
								</Button>
								<Link href={`/admin/quizzes/add-questions?quizId=${quizId}`}>
									<Button variant="outline">
										<Plus className="h-4 w-4 mr-2" />
										Add Questions
									</Button>
								</Link>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Back Button */}
			<div className="mt-6">
				<Button
					variant="outline"
					onClick={() => router.push(`/admin/quizzes/${quizId}`)}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Quiz
				</Button>
			</div>

			{/* Copy Questions Dialog */}
			<Dialog
				open={showCopyQuestionsDialog}
				onOpenChange={setShowCopyQuestionsDialog}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Copy Questions</DialogTitle>
						<DialogDescription>
							Copy all questions from another quiz
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Source Quiz *</Label>
							<Select value={sourceQuizUuid} onValueChange={setSourceQuizUuid}>
								<SelectTrigger>
									<SelectValue placeholder="Select a quiz" />
								</SelectTrigger>
								<SelectContent>
									{availableSourceQuizzes.map(q => (
										<SelectItem key={q.uuid} value={q.uuid}>
											{q.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowCopyQuestionsDialog(false)
								setSourceQuizUuid('')
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCopyQuestions}
							disabled={isCopyingQuestions || !sourceQuizUuid}
						>
							{isCopyingQuestions ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Copying...
								</>
							) : (
								<>
									<Copy className="h-4 w-4 mr-2" />
									Copy All
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
