"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "Tổng sinh viên",
    value: "0",
    icon: Users,
    description: "Số lượng sinh viên trong hệ thống",
  },
  {
    name: "Tổng bài thi",
    value: "0",
    icon: BookOpen,
    description: "Số lượng bài thi đã tạo",
  },
  {
    name: "Bài nộp",
    value: "0",
    icon: FileText,
    description: "Tổng số bài nộp",
  },
  {
    name: "Tỷ lệ hoàn thành",
    value: "0%",
    icon: TrendingUp,
    description: "Tỷ lệ sinh viên hoàn thành bài thi",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan về hệ thống quản lý thi cử
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chưa có hoạt động nào gần đây
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

