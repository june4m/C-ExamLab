'use client'

import Link from 'next/link'
import { Filter, Plus, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { RoomCard } from '@/components/ui/room-card'
import { axiosGeneral } from '@/common/axios'

interface RoomData {
	uuid: string
	code: string
	name: string
	openTime: string
	closeTime: string
	createdBy: string
	createdAt: string
	updatedAt: string
}

interface RoomsResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: RoomData[]
}

function useGetRooms() {
	return useQuery({
		queryKey: ['admin-rooms'],
		queryFn: async () => {
			const res = await axiosGeneral.get<RoomsResponse>('/admin/rooms/getAll')
			if (!res.data.success) {
				throw new Error(res.data.message || 'Failed to fetch rooms')
			}
			return res.data.data
		}
	})
}

// Helper to format datetime
function formatDateTime(isoString: string) {
	const date = new Date(isoString)
	return {
		time: date.toLocaleTimeString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit'
		}),
		date: date.toLocaleDateString('vi-VN')
	}
}

export default function AdminRoomsPage() {
	const { data: rooms, isLoading, error } = useGetRooms()

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Rooms | {rooms?.length || 0}</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon">
						<Filter className="h-5 w-5" />
					</Button>
					<Link href="/admin/rooms/create">
						<Button className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white shadow-sm">
							<Plus className="h-4 w-4" />
							Add New Room
						</Button>
					</Link>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
					{error.message || 'Failed to load rooms'}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && rooms?.length === 0 && (
				<div className="rounded-md border border-dashed p-12 text-center">
					<p className="text-muted-foreground">No exam rooms yet</p>
					<Link href="/admin/rooms/create">
						<Button className="mt-4">
							<Plus className="mr-2 h-4 w-4" />
							Create the first exam room
						</Button>
					</Link>
				</div>
			)}

			{/* Rooms Grid */}
			{!isLoading && !error && rooms && rooms.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{rooms.map(room => {
						const openDateTime = formatDateTime(room.openTime)
						const closeDateTime = formatDateTime(room.closeTime)

						return (
							<RoomCard
								key={room.uuid}
								roomId={room.code}
								roomUuid={room.uuid}
								roomName={room.name}
								creatorName= {room.createdBy}
								creatorEmail= ""
								openTime={openDateTime.time}
								openDate={openDateTime.date}
								closeTime={closeDateTime.time}
								closeDate={closeDateTime.date}
							/>
						)
					})}
				</div>
			)}
		</div>
	)
}
