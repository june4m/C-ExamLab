'use client'

import { RoomList } from '@/components/student/RoomList'
import { useGetRooms } from '@/service/student/room.service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function StudentRoomsPage() {
	const { data, isLoading, error } = useGetRooms()

	return (
		<div className="container mx-auto p-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Available Exam Rooms</h1>
					<p className="mt-2 text-muted-foreground">
						Browse and join available exam rooms
					</p>
				</div>
				<Button asChild>
					<Link href="/rooms/join">
						<Plus className="mr-2 h-4 w-4" />
						Join Room
					</Link>
				</Button>
			</div>

			<RoomList data={data} isLoading={isLoading} error={error} />
		</div>
	)
}
