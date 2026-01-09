'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
	ArrowLeft,
	Loader2,
	Plus,
	CheckCircle2,
	ChevronDown,
	ChevronRight
} from 'lucide-react'
import { useGetQuiz } from '@/service/admin/quiz.service'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible'

export default function QuizDetailPage() {
	const params = useParams()
	const quizId = params.id as string
	const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
		new Set()
	)

	const { data: quiz, isLoading, error } = useGetQuiz(quizId)

	const toggleQuestion = (uuid: string) => {
		setExpandedQuestions(prev => {
			const next = new Set(prev)
			if (next.has(uuid)) {
				next.delete(uuid)
			} else {
				next.add(uuid)
			}
			return next
		})
	}

	const expandAll = () => {
		if (quiz?.questions) {
			setExpandedQuestions(new Set(quiz.questions.map(q => q.uuid)))
		}
	}

	const collapseAll = () => {
		setExpandedQuestions(new Set())
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
					{error?.message || 'Quiz not found'}
				</div>
				<Link href="/admin/quizzes">
					<Button variant="outline" className="mt-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to list
					</Button>
				</Link>
			</div>
		)
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		if (isNaN(date.getTime())) return 'N/A'
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
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
					Back to quiz list
				</Link>
				<h1 className="text-2xl font-bold">{quiz.title}</h1>
				{quiz.description && (
					<p className="text-muted-foreground mt-2">{quiz.description}</p>
				)}
			</div>

			{/* Quiz Info - Compact */}
			<div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
				<span>Created: {formatDate(quiz.createdAt)}</span>
				<span>•</span>
				<span>{quiz.questions?.length || 0} questions</span>
				<span>•</span>
				<span>
					{quiz.questions?.reduce((sum, q) => sum + q.points, 0) || 0} total
					points
				</span>
			</div>

			{/* Questions List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Questions</CardTitle>
							<CardDescription>
								{quiz.questions?.length || 0} questions in this quiz
							</CardDescription>
						</div>
						<div className="flex gap-2">
							{quiz.questions && quiz.questions.length > 0 && (
								<>
									<Button variant="ghost" size="sm" onClick={expandAll}>
										Expand All
									</Button>
									<Button variant="ghost" size="sm" onClick={collapseAll}>
										Collapse All
									</Button>
								</>
							)}
							<Link href={`/admin/quizzes/add-questions?quizId=${quizId}`}>
								<Button variant="outline" size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add Questions
								</Button>
							</Link>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					{quiz.questions && quiz.questions.length > 0 ? (
						quiz.questions.map((question, index) => {
							const isExpanded = expandedQuestions.has(question.uuid)
							const correctCount = question.answers.filter(a =>
								Boolean(a.isCorrect)
							).length

							return (
								<Collapsible
									key={question.uuid}
									open={isExpanded}
									onOpenChange={() => toggleQuestion(question.uuid)}
								>
									<div className="border rounded-lg">
										<CollapsibleTrigger asChild>
											<button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
												<div className="flex items-center gap-3 flex-1 min-w-0">
													{isExpanded ? (
														<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
													) : (
														<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
													)}
													<span className="font-medium shrink-0">
														Q{index + 1}.
													</span>
													<span className="truncate">{question.content}</span>
												</div>
												<div className="flex items-center gap-2 shrink-0 ml-4">
													<span className="text-xs text-muted-foreground">
														{question.answers.length} answers • {correctCount}{' '}
														correct
													</span>
													<Badge variant="outline">{question.points} pts</Badge>
												</div>
											</button>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<div className="px-4 pb-4 pt-0 border-t bg-muted/20">
												<div className="space-y-2 pt-3">
													{question.answers.map((answer, aIndex) => {
														const isCorrect = Boolean(answer.isCorrect)
														return (
															<div
																key={answer.uuid}
																className={`flex items-center gap-2 text-sm p-2 rounded-md ${
																	isCorrect
																		? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
																		: 'bg-background border'
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
																	<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
																)}
															</div>
														)
													})}
												</div>
											</div>
										</CollapsibleContent>
									</div>
								</Collapsible>
							)
						})
					) : (
						<div className="rounded-md border border-dashed p-8 text-center">
							<p className="text-muted-foreground mb-4">
								No questions in this quiz yet
							</p>
							<Link href={`/admin/quizzes/add-questions?quizId=${quizId}`}>
								<Button variant="outline">
									<Plus className="h-4 w-4 mr-2" />
									Add first question
								</Button>
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
