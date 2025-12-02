'use client'

import { ExamCard } from './ExamCard'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import type { ExamListResponse } from '@/interface/student/exam.interface'

interface ExamListProps {
	data: ExamListResponse | undefined
	isLoading: boolean
	error: Error | null
	roomId?: string
}

export function ExamList({ data, isLoading, error, roomId }: ExamListProps) {
	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-12">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					<span className="ml-2 text-muted-foreground">Loading exams...</span>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						<div>
							<p className="font-semibold">Error loading exams</p>
							<p className="text-sm text-muted-foreground">
								{error.message || 'Failed to load exams'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data || !data.exams || data.exams.length === 0) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<p className="text-muted-foreground">
						No exams available in this room.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{data.exams.map(exam => (
				<ExamCard key={exam.questionId} exam={exam} roomId={roomId} />
			))}
		</div>
	)
}
