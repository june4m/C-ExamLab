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
import type { Room } from '@/interface/student/room.interface'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

interface RoomCardProps {
	room: Room
}

export function RoomCard({ room }: RoomCardProps) {
	const formatDate = (date: Date | string | null | undefined) => {
		if (!date) return 'N/A'
		try {
			const dateObj = typeof date === 'string' ? new Date(date) : date
			return dateObj.toLocaleString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		} catch {
			return 'Invalid date'
		}
	}

	const getRoomStatus = () => {
		const now = new Date()
		const openTime = typeof room.open_time === 'string' 
			? new Date(room.open_time) 
			: room.open_time
		const closeTime = typeof room.close_time === 'string' 
			? new Date(room.close_time) 
			: room.close_time

		if (now < openTime) {
			return { status: 'upcoming', color: 'text-blue-600' }
		} else if (now >= openTime && now <= closeTime) {
			return { status: 'open', color: 'text-green-600' }
		} else {
			return { status: 'closed', color: 'text-gray-500' }
		}
	}

	const roomStatus = getRoomStatus()

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>{room.name}</span>
					<span className={`text-sm font-normal ${roomStatus.color}`}>
						{roomStatus.status === 'upcoming' && 'Upcoming'}
						{roomStatus.status === 'open' && 'Open'}
						{roomStatus.status === 'closed' && 'Closed'}
					</span>
				</CardTitle>
				<CardDescription>Room ID: {room.roomId}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-start gap-2 text-sm">
					<Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
					<div>
						<p className="font-medium text-muted-foreground">Open Time</p>
						<p className="text-foreground">{formatDate(room.open_time)}</p>
					</div>
				</div>
				<div className="flex items-start gap-2 text-sm">
					<Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
					<div>
						<p className="font-medium text-muted-foreground">Close Time</p>
						<p className="text-foreground">{formatDate(room.close_time)}</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button 
					asChild 
					className="w-full" 
					disabled={roomStatus.status === 'closed'}
				>
					<Link href={`/rooms/${room.roomId}`}>
						View Room
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}

