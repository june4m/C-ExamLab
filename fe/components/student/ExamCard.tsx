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
import { Button } from '@/components/ui/button'
import type { Exam } from '@/interface/student/exam.interface'
import { Clock, Award, ArrowRight } from 'lucide-react'

interface ExamCardProps {
	exam: Exam
	roomId?: string
}

export function ExamCard({ exam, roomId }: ExamCardProps) {
	// Format time limit - assuming it's in minutes, but could be seconds
	const formatTimeLimit = (timeLimit: number) => {
		if (timeLimit >= 60) {
			const hours = Math.floor(timeLimit / 60)
			const minutes = timeLimit % 60
			if (minutes === 0) {
				return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
			}
			return `${hours}h ${minutes}m`
		}
		return `${timeLimit} ${timeLimit === 1 ? 'minute' : 'minutes'}`
	}

	// Build the link - if roomId is provided, use it, otherwise try to get from context
	const questionLink = roomId
		? `/rooms/${roomId}/exams/${exam.questionId}`
		: `#` // Fallback if roomId not provided

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<CardTitle className="line-clamp-2">{exam.title}</CardTitle>
				<CardDescription>Question ID: {exam.questionId}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center gap-2 text-sm">
					<Award className="h-4 w-4 text-muted-foreground" />
					<div>
						<p className="font-medium text-muted-foreground">Score</p>
						<p className="text-foreground font-semibold">{exam.score} points</p>
					</div>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<div>
						<p className="font-medium text-muted-foreground">Time Limit</p>
						<p className="text-foreground">
							{formatTimeLimit(exam.time_limit)}
						</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button asChild className="w-full">
					<Link href={questionLink}>
						Start Exam
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
