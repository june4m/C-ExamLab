"use client"

import type React from "react"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const router = useRouter()
  const { userId } = use(params)

  // In real app, fetch user detail by userId
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    studentId: userId,
    fullName: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // TODO: Replace with actual API call to update student
    console.log("[admin] Updating student:", formData)

    setIsSubmitting(false)
    router.push("/admin/users")
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách sinh viên
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa sinh viên</h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin cho sinh viên có mã {userId}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sinh viên</CardTitle>
          <CardDescription>
            Chỉnh sửa các thông tin cơ bản của sinh viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student ID (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Mã sinh viên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="studentId"
                  className="pl-10"
                  value={formData.studentId}
                  disabled
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                placeholder="Nhập họ và tên sinh viên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="email@student.edu"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.push("/admin/users")}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

