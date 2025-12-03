'use client'

import { ExamList } from '@/components/student/ExamList'
import { useGetExams } from '@/service/student/exam.service'

export default function RoomExamsPage({
	params
}: {
	params: { roomId: string }
}) {
	const { data, isLoading, error } = useGetExams(params.roomId)

	return (
		<div className="container mx-auto p-4 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Exams in Room</h1>
				<p className="mt-2 text-muted-foreground">
					View and start exams (questions) in this room
				</p>
			</div>

			<ExamList
				data={data}
				isLoading={isLoading}
				error={error}
				roomId={params.roomId}
			/>
		</div>
	)
}
