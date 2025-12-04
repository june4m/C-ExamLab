'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	BookOpen,
	Clock,
	Loader2,
	Plus,
	ArrowRight,
	User,
	Calendar
} from 'lucide-react'
import { useGetRooms } from '@/service/student/room.service'
import { useGetProfile } from '@/service/student/profile.service'
import { useAuthStore } from '@/store/auth.store'
import { RoomCard } from '@/components/student/RoomCard'

export default function StudentDashboardPage() {
	const { data: roomsData, isLoading: isLoadingRooms } = useGetRooms()
	const { data: profile, isLoading: isLoadingProfile } = useGetProfile()
	const user = useAuthStore(state => state.user)

	// Calculate dashboard stats
	const dashboardStats = useMemo(() => {
		const rooms = roomsData?.roomList || []
		const now = new Date()

		const totalRooms = rooms.length
		const activeExams = rooms.filter(room => {
			const openTime =
				typeof room.open_time === 'string'
					? new Date(room.open_time)
					: room.open_time
			const closeTime =
				typeof room.close_time === 'string'
					? new Date(room.close_time)
					: room.close_time
			return now >= openTime && now <= closeTime
		}).length

		const upcomingExams = rooms.filter(room => {
			const openTime =
				typeof room.open_time === 'string'
					? new Date(room.open_time)
					: room.open_time
			return now < openTime
		}).length

		return {
			totalRooms,
			activeExams,
			upcomingExams
		}
	}, [roomsData])

	// Get recent rooms (last 3)
	const recentRooms = useMemo(() => {
		if (!roomsData?.roomList) return []
		return roomsData.roomList.slice(0, 3)
	}, [roomsData])

	// Get upcoming rooms
	const upcomingRooms = useMemo(() => {
		if (!roomsData?.roomList) return []
		const now = new Date()
		return roomsData.roomList
			.filter(room => {
				const openTime =
					typeof room.open_time === 'string'
						? new Date(room.open_time)
						: room.open_time
				return now < openTime
			})
			.sort((a, b) => {
				const aTime =
					typeof a.open_time === 'string'
						? new Date(a.open_time).getTime()
						: a.open_time.getTime()
				const bTime =
					typeof b.open_time === 'string'
						? new Date(b.open_time).getTime()
						: b.open_time.getTime()
				return aTime - bTime
			})
			.slice(0, 3)
	}, [roomsData])

	const isLoading = isLoadingRooms || isLoadingProfile

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Student Dashboard</h1>
				<p className="mt-2 text-muted-foreground">
					Welcome back, {profile?.full_name || user?.fullName || 'Student'}!
					Here&apos;s an overview of your exam activities.
				</p>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			)}

			{/* Stats Cards */}
			{!isLoading && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Rooms Joined
							</CardTitle>
							<BookOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.totalRooms}
							</div>
							<p className="text-xs text-muted-foreground">
								Rooms you&apos;ve joined
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Exams
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{dashboardStats.activeExams}
							</div>
							<p className="text-xs text-muted-foreground">
								Currently open exams
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Upcoming Exams
							</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-600">
								{dashboardStats.upcomingExams}
							</div>
							<p className="text-xs text-muted-foreground">
								Exams starting soon
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Quick Actions */}
			{!isLoading && (
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Quick access to common tasks</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<Button
								asChild
								variant="outline"
								className="h-auto flex-col py-4"
							>
								<Link href="/rooms/join">
									<Plus className="mb-2 h-6 w-6" />
									<span>Join Room</span>
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-auto flex-col py-4"
							>
								<Link href="/rooms">
									<BookOpen className="mb-2 h-6 w-6" />
									<span>View All Rooms</span>
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-auto flex-col py-4"
							>
								<Link href="/profile">
									<User className="mb-2 h-6 w-6" />
									<span>View Profile</span>
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recent Rooms */}
			{!isLoading && recentRooms.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-semibold">Recent Rooms</h2>
						<Button asChild variant="ghost">
							<Link href="/rooms">
								View All
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{recentRooms.map(room => (
							<RoomCard key={room.roomId} room={room} />
						))}
					</div>
				</div>
			)}

			{/* Upcoming Exams */}
			{!isLoading && upcomingRooms.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-semibold">Upcoming Exams</h2>
						<Button asChild variant="ghost">
							<Link href="/rooms">
								View All
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{upcomingRooms.map(room => (
							<RoomCard key={room.roomId} room={room} />
						))}
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && dashboardStats.totalRooms === 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Get Started</CardTitle>
						<CardDescription>
							You haven&apos;t joined any exam rooms yet. Join a room to start
							taking exams!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href="/rooms/join">
								<Plus className="mr-2 h-4 w-4" />
								Join Your First Room
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Footer */}
			<p className="mt-8 text-center text-sm text-muted-foreground">
				coded with love and coffee by hội bàn đầu
			</p>
		</div>
	)
}
