'use client'

import { use } from 'react'
import { ExamTimer } from '@/components/student/ExamTimer'
import { useGetRoomDetails } from '@/service/student/room.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, BookOpen, Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RoomDashboardPage({
	params
	params
}: {
	params: Promise<{ roomId: string }>
}) {
	const router = useRouter()
	const { roomId } = use(params)
	const { data: room, isLoading, error } = useGetRoomDetails(roomId)

	if (isLoading) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardContent className="flex items-center justify-center p-12">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-muted-foreground">Loading room details...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (error || !room) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardContent className="flex items-center justify-center p-12">
						<div className="flex flex-col items-center gap-4">
							<AlertCircle className="h-8 w-8 text-destructive" />
							<p className="text-destructive">
								{error instanceof Error
									? error.message
									: 'Failed to load room details'}
							</p>
							<Button variant="outline" onClick={() => router.back()}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Go Back
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{room.name}</h1>
					<p className="mt-2 text-muted-foreground">Room ID: {room.roomId}</p>
				</div>
				<Button variant="outline" onClick={() => router.push('/rooms')}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Rooms
				</Button>
			</div>

			{/* Timer Card */}
			{room.close_time && (
				<div className="max-w-md">
					<ExamTimer closeTime={room.close_time} />
				</div>
			)}

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Exams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							View and start exams (questions) in this room
						</p>
						<Button asChild className="w-full">
							<Link href={`/rooms/${roomId}/exams`}>
								<BookOpen className="mr-2 h-4 w-4" />
								View Exams
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="h-5 w-5" />
							Results
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							View your scores and submission results
						</p>
						<Button asChild variant="outline" className="w-full">
							<Link href={`/rooms/${roomId}/results`}>
								<Trophy className="mr-2 h-4 w-4" />
								View Results
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Room Info */}
			<Card>
				<CardHeader>
					<CardTitle>Room Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex justify-between">
						<span className="text-sm text-muted-foreground">Room Name:</span>
						<span className="text-sm font-medium">{room.name}</span>
					</div>
					{room.open_time && (
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Open Time:</span>
							<span className="text-sm font-medium">
								{new Date(room.open_time).toLocaleString()}
							</span>
						</div>
					)}
					{room.close_time && (
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Close Time:</span>
							<span className="text-sm font-medium">
								{new Date(room.close_time).toLocaleString()}
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
