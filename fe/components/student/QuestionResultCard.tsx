'use client'

import Link from 'next/link'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { QuestionResult } from '@/interface/student/submission.interface'
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react'

interface QuestionResultCardProps {
	question: QuestionResult
	roomId: string
}

export function QuestionResultCard({
	question,
	roomId
}: QuestionResultCardProps) {
	const scorePercentage = question.score > 0 
		? Math.round((question.myScore / question.score) * 100) 
		: 0

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="line-clamp-2">{question.title}</CardTitle>
						<CardDescription>Question ID: {question.questionId}</CardDescription>
					</div>
					{question.solved ? (
						<Badge variant="success" className="ml-2">
							<CheckCircle2 className="h-3 w-3 mr-1" />
							Solved
						</Badge>
					) : (
						<Badge variant="warning" className="ml-2">
							<XCircle className="h-3 w-3 mr-1" />
							Not Solved
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Score</p>
						<div className="flex items-center gap-2">
							<Award className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-lg font-semibold">
									{question.myScore} / {question.score}
								</p>
								<p className="text-xs text-muted-foreground">
									{scorePercentage}% achieved
								</p>
							</div>
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Attempts</p>
						<div className="flex items-center gap-2">
							<RotateCcw className="h-4 w-4 text-muted-foreground" />
							<p className="text-lg font-semibold">{question.attempts}</p>
						</div>
					</div>
				</div>
				{question.myScore < question.score && question.attempts > 0 && (
					<div className="pt-2 border-t">
						<p className="text-xs text-muted-foreground">
							You can try again to improve your score
						</p>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button asChild variant="outline" className="flex-1">
					<Link href={`/rooms/${roomId}/exams/${question.questionId}`}>
						{question.solved ? 'Review' : 'Try Again'}
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
				{question.bestSubmissionId && (
					<Button asChild variant="secondary" className="flex-1">
						<Link href={`/rooms/${roomId}/submissions/${question.bestSubmissionId}`}>
							View Best
						</Link>
					</Button>
				)}
			</CardFooter>
		</Card>
	)
}

