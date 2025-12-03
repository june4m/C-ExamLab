'use client'

import { RoomCard } from './RoomCard'
import {
	Card,
	CardContent
} from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import type { RoomListResponse } from '@/interface/student/room.interface'

interface RoomListProps {
	data: RoomListResponse | undefined
	isLoading: boolean
	error: Error | null
}

export function RoomList({ data, isLoading, error }: RoomListProps) {
	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-12">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					<span className="ml-2 text-muted-foreground">Loading rooms...</span>
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
							<p className="font-semibold">Error loading rooms</p>
							<p className="text-sm text-muted-foreground">
								{error.message || 'Failed to load exam rooms'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data || !data.roomList || data.roomList.length === 0) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<p className="text-muted-foreground">No exam rooms available at the moment.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{data.roomList.map((room) => (
				<RoomCard key={room.roomId} room={room} />
			))}
		</div>
	)
}

