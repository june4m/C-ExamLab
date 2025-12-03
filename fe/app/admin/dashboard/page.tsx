'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { BookOpen, Users, FileQuestion, TrendingUp } from 'lucide-react'

// Mock data for dashboard stats
const dashboardStats = {
	totalRooms: 8,
	totalQuestions: 24,
	totalStudents: 150,
	activeExams: 2
}

export default function AdminDashboardPage() {
	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">
					Tổng quan hệ thống quản lý phòng thi
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Total Rooms */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng số phòng thi
						</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalRooms}
						</div>
						<p className="text-xs text-muted-foreground">
							{dashboardStats.activeExams} phòng đang hoạt động
						</p>
					</CardContent>
				</Card>

				{/* Total Questions */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng số câu hỏi
						</CardTitle>
						<FileQuestion className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalQuestions}
						</div>
						<p className="text-xs text-muted-foreground">
							Trung bình{' '}
							{Math.round(
								dashboardStats.totalQuestions / dashboardStats.totalRooms
							)}{' '}
							câu/phòng
						</p>
					</CardContent>
				</Card>

				{/* Total Students */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng số thí sinh
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalStudents}
						</div>
						<p className="text-xs text-muted-foreground">
							Đã đăng ký tham gia thi
						</p>
					</CardContent>
				</Card>

				{/* Active Exams */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Phòng thi đang diễn ra
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{dashboardStats.activeExams}
						</div>
						<p className="text-xs text-muted-foreground">
							Đang có thí sinh làm bài
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Hoạt động gần đây</CardTitle>
						<CardDescription>
							Các hoạt động mới nhất trong hệ thống
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">
										Phòng thi "Lò Luyện Ngục" đã bắt đầu
									</p>
									<p className="text-xs text-muted-foreground">2 phút trước</p>
								</div>
							</div>
							<div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-blue-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">
										Thêm 5 câu hỏi mới vào "Phòng Thi Số 2"
									</p>
									<p className="text-xs text-muted-foreground">15 phút trước</p>
								</div>
							</div>
							<div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-yellow-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">
										Sinh viên SV003 bị cấm thi do vi phạm
									</p>
									<p className="text-xs text-muted-foreground">30 phút trước</p>
								</div>
							</div>
							<div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
								<div className="h-2 w-2 rounded-full bg-purple-500" />
								<div className="flex-1">
									<p className="text-sm font-medium">
										Tạo phòng thi mới "Kỳ thi Cuối kỳ"
									</p>
									<p className="text-xs text-muted-foreground">1 giờ trước</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
