'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	ArrowLeft,
	BookOpen,
	Trophy,
	Users,
	Settings,
	Loader2,
	Calendar,
	Clock,
	Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth.store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

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

interface RoomResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: RoomData
}

interface UpdateRoomRequest {
	name: string
	openTime: string
	closeTime: string
}

function useGetRoom(roomId: string) {
	const token = useAuthStore(state => state.token)

	return useQuery({
		queryKey: ['admin-room', roomId],
		queryFn: async () => {
			const res = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const json = (await res.json()) as RoomResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to fetch room')
			}
			return json.data
		},
		enabled: !!roomId
	})
}

function useUpdateRoom(roomId: string) {
	const token = useAuthStore(state => state.token)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: UpdateRoomRequest) => {
			const res = await fetch(
				`${API_BASE_URL}/admin/rooms/update-room/${roomId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(payload)
				}
			)
			const json = await res.json()
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to update room')
			}
			return json
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-room', roomId] })
			queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
		}
	})
}

// Helper functions
const formatDateTime = (isoString: string) => {
	const date = new Date(isoString)
	return {
		date: date.toLocaleDateString('vi-VN'),
		time: date.toLocaleTimeString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit'
		}),
		dateInput: date.toISOString().split('T')[0],
		timeInput: date.toTimeString().slice(0, 5)
	}
}

const getAmPm = (time: string) => {
	if (!time) return ''
	const hour = parseInt(time.split(':')[0])
	return hour >= 12 ? 'PM' : 'AM'
}

export default function AdminRoomDetailPage() {
	const params = useParams()
	const router = useRouter()
	const roomId = params.roomId as string

	const { data: room, isLoading, error } = useGetRoom(roomId)
	const { mutate: updateRoom, isPending: isUpdating } = useUpdateRoom(roomId)

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [editForm, setEditForm] = useState({
		name: '',
		openDate: '',
		openTime: '',
		closeDate: '',
		closeTime: ''
	})

	const openEditDialog = () => {
		if (room) {
			const openDT = formatDateTime(room.openTime)
			const closeDT = formatDateTime(room.closeTime)
			setEditForm({
				name: room.name,
				openDate: openDT.dateInput,
				openTime: openDT.timeInput,
				closeDate: closeDT.dateInput,
				closeTime: closeDT.timeInput
			})
		}
		setIsEditDialogOpen(true)
	}

	const handleUpdateRoom = () => {
		const openTime = new Date(
			`${editForm.openDate}T${editForm.openTime}`
		).toISOString()
		const closeTime = new Date(
			`${editForm.closeDate}T${editForm.closeTime}`
		).toISOString()

		updateRoom(
			{ name: editForm.name, openTime, closeTime },
			{
				onSuccess: () => setIsEditDialogOpen(false)
			}
		)
	}

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (error || !room) {
		return (
			<div className="container mx-auto p-6">
				<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
					{error?.message || 'Không tìm thấy phòng thi'}
				</div>
				<div className="mt-4 text-center">
					<Button variant="outline" onClick={() => router.push('/admin/rooms')}>
						Quay lại danh sách
					</Button>
				</div>
			</div>
		)
	}

	const openDT = formatDateTime(room.openTime)
	const closeDT = formatDateTime(room.closeTime)

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6">
				<Link
					href="/admin/rooms"
					className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại danh sách phòng
				</Link>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">{room.name}</h1>
						<p className="text-muted-foreground">Mã phòng: {room.code}</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-sm">
							{openDT.date} {openDT.time} - {closeDT.time}
						</Badge>
						<Button variant="outline" size="sm" onClick={openEditDialog}>
							<Settings className="mr-2 h-4 w-4" />
							Chỉnh sửa phòng
						</Button>
					</div>
				</div>
			</div>

			{/* Room Info Card */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Thông tin phòng thi</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<p className="text-xs text-muted-foreground">Mã phòng</p>
							<p className="font-mono font-bold text-primary">{room.code}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Tên phòng</p>
							<p className="font-medium">{room.name}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Thời gian mở</p>
							<p className="font-medium text-emerald-600">
								{openDT.time} - {openDT.date}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Thời gian đóng</p>
							<p className="font-medium text-rose-600">
								{closeDT.time} - {closeDT.date}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="questions" className="space-y-4">
				<TabsList>
					<TabsTrigger value="questions" className="gap-2">
						<BookOpen className="h-4 w-4" />
						Câu hỏi & Test Cases
					</TabsTrigger>
					<TabsTrigger value="participants" className="gap-2">
						<Users className="h-4 w-4" />
						Thí sinh tham gia
					</TabsTrigger>
					<TabsTrigger value="leaderboard" className="gap-2">
						<Trophy className="h-4 w-4" />
						Bảng xếp hạng
					</TabsTrigger>
				</TabsList>

				<TabsContent value="questions">
					<Card>
						<CardHeader>
							<CardTitle>Danh sách câu hỏi</CardTitle>
							<CardDescription>
								Quản lý câu hỏi và test cases của phòng thi
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								Chức năng đang được phát triển...
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="participants">
					<Card>
						<CardHeader>
							<CardTitle>Danh sách thí sinh</CardTitle>
							<CardDescription>
								Quản lý thí sinh tham gia phòng thi
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								Chức năng đang được phát triển...
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="leaderboard">
					<Card>
						<CardHeader>
							<CardTitle>Bảng xếp hạng</CardTitle>
							<CardDescription>
								Xếp hạng theo điểm số từ cao đến thấp
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								Chức năng đang được phát triển...
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit Room Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Chỉnh sửa phòng thi</DialogTitle>
						<DialogDescription>Cập nhật thông tin phòng thi</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Tên phòng thi</Label>
							<Input
								value={editForm.name}
								onChange={e =>
									setEditForm({ ...editForm, name: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Thời gian mở</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="date"
										className="pl-10"
										value={editForm.openDate}
										onChange={e =>
											setEditForm({ ...editForm, openDate: e.target.value })
										}
									/>
								</div>
								<div className="relative flex items-center">
									<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="time"
										className="pl-10"
										value={editForm.openTime}
										onChange={e =>
											setEditForm({ ...editForm, openTime: e.target.value })
										}
									/>
									{editForm.openTime && (
										<span className="ml-2 text-sm font-medium text-primary">
											{getAmPm(editForm.openTime)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Thời gian đóng</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="date"
										className="pl-10"
										value={editForm.closeDate}
										min={editForm.openDate}
										onChange={e =>
											setEditForm({ ...editForm, closeDate: e.target.value })
										}
									/>
								</div>
								<div className="relative flex items-center">
									<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="time"
										className="pl-10"
										value={editForm.closeTime}
										onChange={e =>
											setEditForm({ ...editForm, closeTime: e.target.value })
										}
									/>
									{editForm.closeTime && (
										<span className="ml-2 text-sm font-medium text-primary">
											{getAmPm(editForm.closeTime)}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
						>
							Hủy
						</Button>
						<Button onClick={handleUpdateRoom} disabled={isUpdating}>
							{isUpdating ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Lưu thay đổi
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
