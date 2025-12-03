'use client'

import Link from 'next/link'
import { Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomCard } from '@/components/ui/room-card'
import type { Room } from '@/interface'

// Mock data - sẽ được thay thế bằng API call sau
const mockRooms: Room[] = [
	{
		roomId: '001',
		roomName: 'Lò Luyện Ngục',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '18:00',
		openDate: '12-2-2025',
		closeTime: '20:00',
		closeDate: '12-2-2025',
	},
	{
		roomId: '002',
		roomName: 'Phòng Thi Số 2',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '19:00',
		openDate: '13-2-2025',
		closeTime: '21:00',
		closeDate: '13-2-2025',
	},
	{
		roomId: '003',
		roomName: 'Phòng Thi Số 3',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '20:00',
		openDate: '14-2-2025',
		closeTime: '22:00',
		closeDate: '14-2-2025',
	},
	{
		roomId: '004',
		roomName: 'Phòng Thi Số 4',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '18:00',
		openDate: '15-2-2025',
		closeTime: '20:00',
		closeDate: '15-2-2025',
	},
	{
		roomId: '005',
		roomName: 'Phòng Thi Số 5',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '19:00',
		openDate: '16-2-2025',
		closeTime: '21:00',
		closeDate: '16-2-2025',
	},
	{
		roomId: '006',
		roomName: 'Phòng Thi Số 6',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '20:00',
		openDate: '17-2-2025',
		closeTime: '22:00',
		closeDate: '17-2-2025',
	},
	{
		roomId: '007',
		roomName: 'Phòng Thi Số 7',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '18:00',
		openDate: '18-2-2025',
		closeTime: '20:00',
		closeDate: '18-2-2025',
	},
	{
		roomId: '008',
		roomName: 'Phòng Thi Số 8',
		creatorName: 'Nguyễn Đức Bình',
		creatorEmail: 'nguyenducbinh@gmail.com',
		openTime: '19:00',
		openDate: '19-2-2025',
		closeTime: '21:00',
		closeDate: '19-2-2025',
	},
]

export default function AdminRoomsPage() {
	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Rooms | {mockRooms.length}</h1>
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

			{/* Rooms Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{mockRooms.map((room) => (
					<RoomCard key={room.roomId} {...room} />
				))}
			</div>
		</div>
	)
}
