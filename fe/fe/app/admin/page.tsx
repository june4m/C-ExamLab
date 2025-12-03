"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileQuestion, TrendingUp } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

// Mock data for dashboard stats
const dashboardStats = {
  totalRooms: 8,
  totalQuestions: 24,
  totalStudents: 150,
  activeExams: 2,
}

// Chart data
const chartData = [
  { month: "Tháng 1", phongThi: 2, sinhVien: 30, cauHoi: 8 },
  { month: "Tháng 2", phongThi: 3, sinhVien: 45, cauHoi: 12 },
  { month: "Tháng 3", phongThi: 5, sinhVien: 60, cauHoi: 15 },
  { month: "Tháng 4", phongThi: 4, sinhVien: 50, cauHoi: 18 },
  { month: "Tháng 5", phongThi: 6, sinhVien: 75, cauHoi: 20 },
  { month: "Tháng 6", phongThi: 8, sinhVien: 90, cauHoi: 24 },
]

const chartConfig = {
  phongThi: {
    label: "Phòng thi",
    color: "hsl(var(--chart-1))",
  },
  sinhVien: {
    label: "Sinh viên",
    color: "hsl(var(--chart-2))",
  },
  cauHoi: {
    label: "Câu hỏi",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý phòng thi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng thi</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.activeExams} phòng đang hoạt động</p>
          </CardContent>
        </Card>

        {/* Total Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số câu hỏi</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {Math.round(dashboardStats.totalQuestions / dashboardStats.totalRooms)} câu/phòng
            </p>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số thí sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Đã đăng ký tham gia thi</p>
          </CardContent>
        </Card>

        {/* Active Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng thi đang diễn ra</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardStats.activeExams}</div>
            <p className="text-xs text-muted-foreground">Đang có thí sinh làm bài</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Area Chart - Xu hướng theo thời gian */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng 6 tháng gần đây</CardTitle>
            <CardDescription>Thống kê phòng thi, sinh viên và câu hỏi</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="phongThi"
                  type="monotone"
                  fill="var(--color-phongThi)"
                  fillOpacity={0.4}
                  stroke="var(--color-phongThi)"
                  stackId="1"
                />
                <Area
                  dataKey="sinhVien"
                  type="monotone"
                  fill="var(--color-sinhVien)"
                  fillOpacity={0.4}
                  stroke="var(--color-sinhVien)"
                  stackId="1"
                />
                <Area
                  dataKey="cauHoi"
                  type="monotone"
                  fill="var(--color-cauHoi)"
                  fillOpacity={0.4}
                  stroke="var(--color-cauHoi)"
                  stackId="1"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - So sánh */}
        <Card>
          <CardHeader>
            <CardTitle>So sánh tháng hiện tại</CardTitle>
            <CardDescription>Thống kê chi tiết theo từng chỉ số</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                data={chartData.slice(-3)}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="phongThi"
                  fill="var(--color-phongThi)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="sinhVien"
                  fill="var(--color-sinhVien)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cauHoi"
                  fill="var(--color-cauHoi)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phòng thi &quot;Lò Luyện Ngục&quot; đã bắt đầu</p>
                  <p className="text-xs text-muted-foreground">2 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Thêm 5 câu hỏi mới vào &quot;Phòng Thi Số 2&quot;</p>
                  <p className="text-xs text-muted-foreground">15 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sinh viên SV003 bị cấm thi do vi phạm</p>
                  <p className="text-xs text-muted-foreground">30 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Tạo phòng thi mới &quot;Kỳ thi Cuối kỳ&quot;</p>
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
