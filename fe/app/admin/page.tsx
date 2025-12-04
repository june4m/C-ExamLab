"use client"

import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileQuestion, TrendingUp, Loader2 } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useGetAdminRooms } from "@/service/admin/room.service"
import { useGetAdminQuestions } from "@/service/admin/question.service"
import { useGetAdminUsers } from "@/service/admin/user.service"
import { axiosGeneral as axios } from "@/common/axios"

// Helper function to get month name in English
const getMonthName = (monthIndex: number) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return months[monthIndex]
}

// Helper function to format date to relative time in English
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

const chartConfig = {
  phongThi: {
    label: "Exam rooms",
    color: "hsl(var(--chart-1))",
  },
  sinhVien: {
    label: "Students",
    color: "hsl(var(--chart-2))",
  },
  cauHoi: {
    label: "Questions",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function AdminDashboardPage() {
  // Fetch data from APIs
  const { data: roomsData, isLoading: isLoadingRooms } = useGetAdminRooms()
  const { data: questionsData, isLoading: isLoadingQuestions } = useGetAdminQuestions()
  const { data: usersData, isLoading: isLoadingUsers } = useGetAdminUsers()

  // Get all room UUIDs
  const roomUuids = useMemo(() => {
    return roomsData?.data?.map((room) => room.uuid) || []
  }, [roomsData])

  // Fetch participants for all rooms
  const participantsQueries = useQueries({
    queries: roomUuids.map((roomId) => ({
      queryKey: ["admin", "room", roomId, "participants"],
      queryFn: async () => {
        const { data } = await axios.get(`/admin/room/${roomId}/participants`)
        return data
      },
      enabled: roomUuids.length > 0,
      staleTime: 1 * 60 * 1000, // 1 minute
    })),
  })

  // Calculate stats
  const dashboardStats = useMemo(() => {
    const totalRooms = roomsData?.data?.length || 0
    const totalQuestions = questionsData?.data?.listQuestion?.length || 0
    const totalStudents = usersData?.data?.length || 0

    // Count active exams (rooms with non-empty participants)
    const activeExams = participantsQueries.reduce((count, query) => {
      if (query.data?.data?.participants && query.data.data.participants.length > 0) {
        return count + 1
      }
      return count
    }, 0)

    return {
      totalRooms,
      totalQuestions,
      totalStudents,
      activeExams,
    }
  }, [roomsData, questionsData, usersData, participantsQueries])

  // Calculate chart data from API data (last 6 months)
  const chartData = useMemo(() => {
    const now = new Date()
    const months: { month: string; phongThi: number; sinhVien: number; cauHoi: number }[] = []

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: getMonthName(date.getMonth()),
        phongThi: 0,
        sinhVien: 0,
        cauHoi: 0,
      })
    }

    // Count rooms by month
    roomsData?.data?.forEach((room) => {
      if (room.createdAt) {
        const roomDate = new Date(room.createdAt)
        const monthsDiff = (now.getFullYear() - roomDate.getFullYear()) * 12 + (now.getMonth() - roomDate.getMonth())

        if (monthsDiff >= 0 && monthsDiff < 6) {
          const index = 5 - monthsDiff
          if (index >= 0 && index < months.length) {
            months[index].phongThi++
          }
        }
      }
    })

    // Count questions by month
    questionsData?.data?.listQuestion?.forEach((question) => {
      if (question.createdAt) {
        const questionDate = new Date(question.createdAt)
        const monthsDiff = (now.getFullYear() - questionDate.getFullYear()) * 12 + (now.getMonth() - questionDate.getMonth())

        if (monthsDiff >= 0 && monthsDiff < 6) {
          const index = 5 - monthsDiff
          if (index >= 0 && index < months.length) {
            months[index].cauHoi++
          }
        }
      }
    })

    // Count students by month (based on createdAt)
    usersData?.data?.forEach((user) => {
      if (user.createdAt) {
        const userDate = new Date(user.createdAt)
        const monthsDiff = (now.getFullYear() - userDate.getFullYear()) * 12 + (now.getMonth() - userDate.getMonth())

        if (monthsDiff >= 0 && monthsDiff < 6) {
          const index = 5 - monthsDiff
          if (index >= 0 && index < months.length) {
            months[index].sinhVien++
          }
        }
      }
    })

    return months
  }, [roomsData, questionsData, usersData])

  // Calculate recent activities
  const recentActivities = useMemo(() => {
    const activities: Array<{
      type: "room" | "question" | "user" | "exam"
      message: string
      time: string
      color: string
    }> = []

    // Recent rooms
    roomsData?.data
      ?.slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .forEach((room) => {
        activities.push({
          type: "room",
          message: `Tạo phòng thi mới "${room.name}"`,
          time: formatRelativeTime(room.createdAt),
          color: "bg-purple-500",
        })
      })

    // Recent questions
    questionsData?.data?.listQuestion
      ?.slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 1)
      .forEach((question) => {
        const roomName = roomsData?.data?.find((r) => r.uuid === question.roomId)?.name || "phòng thi"
        activities.push({
          type: "question",
          message: `Thêm câu hỏi mới vào "${roomName}"`,
          time: formatRelativeTime(question.createdAt),
          color: "bg-blue-500",
        })
      })

    // Active exams (rooms with participants)
    participantsQueries.forEach((query) => {
      if (query.data?.data?.participants && query.data.data.participants.length > 0) {
        const roomName = query.data.data.roomName
        activities.push({
          type: "exam",
          message: `Phòng thi "${roomName}" đã bắt đầu`,
          time: "Đang diễn ra",
          color: "bg-green-500",
        })
      }
    })

    // Sort by time (most recent first) and limit to 4
    return activities
      .sort((a, b) => {
        if (a.time === "Đang diễn ra") return -1
        if (b.time === "Đang diễn ra") return 1
        return 0
      })
      .slice(0, 4)
  }, [roomsData, questionsData, participantsQueries])

  const isLoadingParticipants = participantsQueries.some((query) => query.isLoading)
  const isLoading =
    isLoadingRooms || isLoadingQuestions || isLoadingUsers || isLoadingParticipants

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overall overview of the exam management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total exam rooms</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats.totalRooms}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.activeExams} phòng đang hoạt động
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.totalRooms > 0
                    ? `Average ${Math.round(
                        dashboardStats.totalQuestions / dashboardStats.totalRooms
                      )} questions/room`
                    : "No rooms yet"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Đã đăng ký tham gia thi</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing exam rooms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats.activeExams}
                </div>
                <p className="text-xs text-muted-foreground">Đang có thí sinh làm bài</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Area Chart - Xu hướng theo thời gian */}
        <Card>
          <CardHeader>
            <CardTitle>Last 6 months trend</CardTitle>
            <CardDescription>Statistics of exam rooms, students and questions</CardDescription>
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
            <CardTitle>Current month comparison</CardTitle>
            <CardDescription>Detailed statistics by metric</CardDescription>
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
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className={`h-2 w-2 rounded-full ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
