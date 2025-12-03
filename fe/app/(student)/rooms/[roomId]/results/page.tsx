'use client'

import { ResultsView } from '@/components/student/ResultsView'
import { useGetSubmissions } from '@/service/student/submission.service'
import { useAuthStore } from '@/store/auth.store'

export default function RoomResultsPage({
	params
}: {
	params: { roomId: string }
}) {
	const { user } = useAuthStore()
	const studentId = user?.uuid || ''

	const { data, isLoading, error } = useGetSubmissions(params.roomId, studentId)

	return (
		<div className="container mx-auto p-4 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">My Results</h1>
				<p className="mt-2 text-muted-foreground">
					View your scores and submission results for this room
				</p>
			</div>

			<ResultsView
				data={data}
				isLoading={isLoading}
				error={error}
				roomId={params.roomId}
			/>
		</div>
	)
}
