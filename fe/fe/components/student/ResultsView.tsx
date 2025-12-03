'use client'

import { QuestionResultCard } from './QuestionResultCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle, Trophy } from 'lucide-react'
import type { GetSubmissionsResponse } from '@/interface/student/submission.interface'

interface ResultsViewProps {
	data: GetSubmissionsResponse | undefined
	isLoading: boolean
	error: Error | null
	roomId: string
}

export function ResultsView({
	data,
	isLoading,
	error,
	roomId
}: ResultsViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-48" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-12 w-full" />
					</CardContent>
				</Card>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map(i => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-4 w-32 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						<div>
							<p className="font-semibold">Error loading results</p>
							<p className="text-sm text-muted-foreground">
								{error.message || 'Failed to load submission results'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<p className="text-muted-foreground">No submission data available.</p>
				</CardContent>
			</Card>
		)
	}

	const solvedCount = data.questions.filter(q => q.solved).length
	const totalQuestions = data.questions.length
	const solvedPercentage =
		totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0

	return (
		<div className="space-y-6">
			{/* Total Score Card */}
			<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-6 w-6 text-primary" />
						Overall Results
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Total Score
							</p>
							<p className="text-4xl font-bold text-primary">
								{data.totalScore}
							</p>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Questions Solved
							</p>
							<div className="flex items-baseline gap-2">
								<p className="text-4xl font-bold">{solvedCount}</p>
								<p className="text-lg text-muted-foreground">
									/ {totalQuestions}
								</p>
							</div>
							<Badge variant="secondary" className="w-fit">
								{solvedPercentage}% Complete
							</Badge>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Total Attempts
							</p>
							<p className="text-4xl font-bold">
								{data.questions.reduce((sum, q) => sum + q.attempts, 0)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Questions List */}
			<div>
				<h2 className="text-2xl font-semibold mb-4">Question Results</h2>
				{data.questions.length === 0 ? (
					<Card>
						<CardContent className="p-12 text-center">
							<p className="text-muted-foreground">
								No questions found in this room.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{data.questions.map(question => (
							<QuestionResultCard
								key={question.questionId}
								question={question}
								roomId={roomId}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
