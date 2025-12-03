"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Ban,
  UserCheck,
  Search,
  Settings,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Local interfaces
interface Question {
  questionId: string
  title: string
  description: string
  score: number
  timeLimit: number
  memoryLimit: number
  order: number
  createdAt: string
  roomId: string
  code: string
}

interface TestCase {
  testcaseId: string
  questionId: string
  index: number
  input: string
  expectedOutput: string
  isHidden: boolean
}

interface Student {
  id: string
  studentCode: string
  name: string
  email: string
  score: number
  correctAnswers: number
  totalQuestions: number
  isBanned: boolean
  joinedAt: string
}

// Mock data
const mockRoom = {
  roomId: "de964",
  roomName: "Kỳ thi Lập trình Web - Giữa kỳ",
  description: "Kỳ thi giữa kỳ môn Lập trình Web dành cho sinh viên năm 3",
  creatorName: "Nguyễn Văn Admin",
  openTime: "08:00",
  openDate: "2025-03-15",
  closeTime: "10:00",
  closeDate: "2025-03-15",
}

const mockQuestions: Question[] = [
  {
    questionId: "q001",
    title: "Tính tổng hai số nguyên",
    description: "Viết chương trình tính tổng hai số nguyên a và b.",
    score: 10,
    timeLimit: 1000,
    memoryLimit: 256,
    order: 1,
    createdAt: "2025-02-10",
    roomId: "de964",
    code: "Q001",
  },
  {
    questionId: "q002",
    title: "Kiểm tra số nguyên tố",
    description: "Kiểm tra xem số n có phải là số nguyên tố hay không.",
    score: 20,
    timeLimit: 2000,
    memoryLimit: 512,
    order: 2,
    createdAt: "2025-02-10",
    roomId: "de964",
    code: "Q002",
  },
  {
    questionId: "q003",
    title: "Sắp xếp mảng",
    description: "Sắp xếp mảng số nguyên theo thứ tự tăng dần.",
    score: 30,
    timeLimit: 3000,
    memoryLimit: 1024,
    order: 3,
    createdAt: "2025-02-10",
    roomId: "de964",
    code: "Q003",
  },
]

const mockTestCases: Record<string, TestCase[]> = {
  q001: [
    { testcaseId: "tc001", questionId: "q001", index: 1, input: "1 2", expectedOutput: "3", isHidden: false },
    { testcaseId: "tc002", questionId: "q001", index: 2, input: "10 20", expectedOutput: "30", isHidden: true },
  ],
  q002: [
    { testcaseId: "tc003", questionId: "q002", index: 1, input: "7", expectedOutput: "true", isHidden: false },
    { testcaseId: "tc004", questionId: "q002", index: 2, input: "4", expectedOutput: "false", isHidden: true },
  ],
  q003: [],
}

const mockStudents: Student[] = [
  {
    id: "s1",
    studentCode: "SV001",
    name: "Nguyễn Văn A",
    email: "a@student.edu",
    score: 60,
    correctAnswers: 3,
    totalQuestions: 3,
    isBanned: false,
    joinedAt: "08:05",
  },
  {
    id: "s2",
    studentCode: "SV002",
    name: "Trần Thị B",
    email: "b@student.edu",
    score: 50,
    correctAnswers: 2,
    totalQuestions: 3,
    isBanned: false,
    joinedAt: "08:03",
  },
  {
    id: "s3",
    studentCode: "SV003",
    name: "Lê Văn C",
    email: "c@student.edu",
    score: 40,
    correctAnswers: 2,
    totalQuestions: 3,
    isBanned: true,
    joinedAt: "08:10",
  },
  {
    id: "s4",
    studentCode: "SV004",
    name: "Phạm Thị D",
    email: "d@student.edu",
    score: 30,
    correctAnswers: 1,
    totalQuestions: 3,
    isBanned: false,
    joinedAt: "08:08",
  },
  {
    id: "s5",
    studentCode: "SV005",
    name: "Hoàng Văn E",
    email: "e@student.edu",
    score: 20,
    correctAnswers: 1,
    totalQuestions: 3,
    isBanned: false,
    joinedAt: "08:12",
  },
]

export default function AdminRoomDetailPage() {
  const params = useParams()
  const roomId = params.roomId as string

  const [room, setRoom] = useState(mockRoom)
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [testCases, setTestCases] = useState<Record<string, TestCase[]>>(mockTestCases)
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [participantSearchTerm, setParticipantSearchTerm] = useState("")

  // Dialog states
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [isTestCaseDialogOpen, setIsTestCaseDialogOpen] = useState(false)
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false)
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null)

  // Form states
  const [questionForm, setQuestionForm] = useState({
    title: "",
    description: "",
    score: 10,
    timeLimit: 1000,
    memoryLimit: 256,
    order: 1,
  })

  const [testCaseForm, setTestCaseForm] = useState({
    index: 1,
    input: "",
    expectedOutput: "",
    isHidden: false,
  })

  const [roomForm, setRoomForm] = useState({
    roomName: room.roomName,
    description: room.description,
    openDate: room.openDate,
    openTime: room.openTime,
    closeDate: room.closeDate,
    closeTime: room.closeTime,
  })

  const [studentForm, setStudentForm] = useState({
    studentCode: "",
    name: "",
    email: "",
  })

  // Question handlers
  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.questionId === editingQuestion.questionId ? { ...q, ...questionForm } : q)))
    } else {
      const newQuestion: Question = {
        questionId: `q${Date.now()}`,
        ...questionForm,
        createdAt: new Date().toISOString().split("T")[0],
        roomId,
        code: `Q${String(questions.length + 1).padStart(3, "0")}`,
      }
      setQuestions([...questions, newQuestion])
      setTestCases({ ...testCases, [newQuestion.questionId]: [] })
    }
    closeQuestionDialog()
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.questionId !== questionId))
    const newTestCases = { ...testCases }
    delete newTestCases[questionId]
    setTestCases(newTestCases)
    if (selectedQuestion?.questionId === questionId) {
      setSelectedQuestion(null)
    }
  }

  const openCreateQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm({
      title: "",
      description: "",
      score: 10,
      timeLimit: 1000,
      memoryLimit: 256,
      order: questions.length + 1,
    })
    setIsQuestionDialogOpen(true)
  }

  const openEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setQuestionForm({
      title: question.title,
      description: question.description,
      score: question.score,
      timeLimit: question.timeLimit,
      memoryLimit: question.memoryLimit,
      order: question.order,
    })
    setIsQuestionDialogOpen(true)
  }

  const closeQuestionDialog = () => {
    setIsQuestionDialogOpen(false)
    setEditingQuestion(null)
  }

  // TestCase handlers
  const handleSaveTestCase = () => {
    if (!selectedQuestion) return

    if (editingTestCase) {
      setTestCases({
        ...testCases,
        [selectedQuestion.questionId]: testCases[selectedQuestion.questionId].map((tc) =>
          tc.testcaseId === editingTestCase.testcaseId ? { ...tc, ...testCaseForm } : tc,
        ),
      })
    } else {
      const newTestCase: TestCase = {
        testcaseId: `tc${Date.now()}`,
        questionId: selectedQuestion.questionId,
        ...testCaseForm,
      }
      setTestCases({
        ...testCases,
        [selectedQuestion.questionId]: [...(testCases[selectedQuestion.questionId] || []), newTestCase],
      })
    }
    closeTestCaseDialog()
  }

  const handleDeleteTestCase = (testcaseId: string) => {
    if (!selectedQuestion) return
    setTestCases({
      ...testCases,
      [selectedQuestion.questionId]: testCases[selectedQuestion.questionId].filter(
        (tc) => tc.testcaseId !== testcaseId,
      ),
    })
  }

  const openCreateTestCase = () => {
    const currentTestCases = testCases[selectedQuestion?.questionId || ""] || []
    setEditingTestCase(null)
    setTestCaseForm({ index: currentTestCases.length + 1, input: "", expectedOutput: "", isHidden: false })
    setIsTestCaseDialogOpen(true)
  }

  const openEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase)
    setTestCaseForm({
      index: testCase.index,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isHidden: testCase.isHidden,
    })
    setIsTestCaseDialogOpen(true)
  }

  const closeTestCaseDialog = () => {
    setIsTestCaseDialogOpen(false)
    setEditingTestCase(null)
  }

  const openEditRoom = () => {
    setRoomForm({
      roomName: room.roomName,
      description: room.description,
      openDate: room.openDate,
      openTime: room.openTime,
      closeDate: room.closeDate,
      closeTime: room.closeTime,
    })
    setIsEditRoomDialogOpen(true)
  }

  const handleSaveRoom = () => {
    setRoom({ ...room, ...roomForm })
    setIsEditRoomDialogOpen(false)
  }

  const openAddStudent = () => {
    setStudentForm({ studentCode: "", name: "", email: "" })
    setIsAddStudentDialogOpen(true)
  }

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: `s${Date.now()}`,
      studentCode: studentForm.studentCode,
      name: studentForm.name,
      email: studentForm.email,
      score: 0,
      correctAnswers: 0,
      totalQuestions: questions.length,
      isBanned: false,
      joinedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    }
    setStudents([...students, newStudent])
    setIsAddStudentDialogOpen(false)
  }

  // Ban/Unban handler
  const handleToggleBan = (studentId: string) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, isBanned: !s.isBanned } : s)))
  }

  // Filter students for leaderboard (sorted by score)
  const leaderboardStudents = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => b.score - a.score)

  const filteredParticipants = students.filter(
    (s) =>
      s.name.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(participantSearchTerm.toLowerCase()),
  )

  const selectedTestCases = selectedQuestion ? testCases[selectedQuestion.questionId] || [] : []

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
            <h1 className="text-2xl font-bold">{room.roomName}</h1>
            <p className="text-muted-foreground">Mã phòng: {roomId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {room.openDate} {room.openTime} - {room.closeTime}
            </Badge>
            <Button variant="outline" size="sm" onClick={openEditRoom}>
              <Settings className="mr-2 h-4 w-4" />
              Chỉnh sửa phòng
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs - Added participants tab */}
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

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Questions List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Danh sách câu hỏi</CardTitle>
                  <CardDescription>{questions.length} câu hỏi</CardDescription>
                </div>
                <Button onClick={openCreateQuestion} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question) => (
                    <div
                      key={question.questionId}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedQuestion?.questionId === question.questionId
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{question.code}</Badge>
                            <span className="font-medium">{question.title}</span>
                          </div>
                          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                            <span>Điểm: {question.score}</span>
                            <span>Time: {question.timeLimit}ms</span>
                            <span>Memory: {question.memoryLimit}MB</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditQuestion(question)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Tất cả test cases của câu hỏi cũng sẽ bị xóa.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteQuestion(question.questionId)}>
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để tạo mới.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Cases List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Test Cases</CardTitle>
                  <CardDescription>
                    {selectedQuestion ? `${selectedQuestion.title}` : "Chọn câu hỏi để xem test cases"}
                  </CardDescription>
                </div>
                {selectedQuestion && (
                  <Button onClick={openCreateTestCase} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm test case
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedQuestion ? (
                  <div className="space-y-2">
                    {selectedTestCases.map((tc) => (
                      <div key={tc.testcaseId} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Test {tc.index}</Badge>
                            {tc.isHidden ? (
                              <Badge variant="outline" className="gap-1">
                                <EyeOff className="h-3 w-3" /> Ẩn
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <Eye className="h-3 w-3" /> Hiện
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditTestCase(tc)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa test case?</AlertDialogTitle>
                                  <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTestCase(tc.testcaseId)}>
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Input:</p>
                            <code className="block p-2 bg-muted rounded text-xs">{tc.input}</code>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Expected Output:</p>
                            <code className="block p-2 bg-muted rounded text-xs">{tc.expectedOutput}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedTestCases.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Chưa có test case. Nhấn "Thêm test case" để tạo mới.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chọn một câu hỏi từ danh sách bên trái để xem và quản lý test cases.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách thí sinh tham gia</CardTitle>
                  <CardDescription>{students.length} thí sinh đã tham gia phòng thi</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên hoặc mã SV..."
                      className="pl-9"
                      value={participantSearchTerm}
                      onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={openAddStudent} size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Thêm thí sinh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thí sinh</TableHead>
                    <TableHead>Mã sinh viên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Giờ vào thi</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((student) => (
                    <TableRow key={student.id} className={student.isBanned ? "opacity-60 bg-destructive/5" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.studentCode}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell>{student.joinedAt}</TableCell>
                      <TableCell className="text-center">
                        {student.isBanned ? (
                          <Badge variant="destructive">Đã bị cấm</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Đang thi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={student.isBanned ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => handleToggleBan(student.id)}
                          className="min-w-[120px]"
                        >
                          {student.isBanned ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Bỏ cấm thi
                            </>
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Cấm thi
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredParticipants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Không tìm thấy thí sinh nào.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bảng xếp hạng</CardTitle>
                  <CardDescription>Xếp hạng theo điểm số từ cao đến thấp</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên hoặc mã SV..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Hạng</TableHead>
                    <TableHead>Thí sinh</TableHead>
                    <TableHead>Mã sinh viên</TableHead>
                    <TableHead className="text-center">Số câu đúng</TableHead>
                    <TableHead className="text-center">Tổng điểm</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardStudents.map((student, index) => (
                    <TableRow key={student.id} className={student.isBanned ? "opacity-50" : ""}>
                      <TableCell>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                  ? "bg-orange-600 text-white"
                                  : "bg-muted"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.studentCode}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.correctAnswers}/{student.totalQuestions}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-bold">{student.score}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.isBanned ? (
                          <Badge variant="destructive">Đã bị cấm</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Hoạt động
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</DialogTitle>
            <DialogDescription>Điền thông tin câu hỏi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={questionForm.title}
                onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                placeholder="Nhập tiêu đề câu hỏi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={questionForm.description}
                onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
                placeholder="Mô tả yêu cầu bài toán"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Điểm</Label>
                <Input
                  id="score"
                  type="number"
                  value={questionForm.score}
                  onChange={(e) => setQuestionForm({ ...questionForm, score: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự</Label>
                <Input
                  id="order"
                  type="number"
                  value={questionForm.order}
                  onChange={(e) => setQuestionForm({ ...questionForm, order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (ms)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={questionForm.timeLimit}
                  onChange={(e) => setQuestionForm({ ...questionForm, timeLimit: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                <Input
                  id="memoryLimit"
                  type="number"
                  value={questionForm.memoryLimit}
                  onChange={(e) => setQuestionForm({ ...questionForm, memoryLimit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeQuestionDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveQuestion}>{editingQuestion ? "Cập nhật" : "Tạo câu hỏi"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TestCase Dialog */}
      <Dialog open={isTestCaseDialogOpen} onOpenChange={setIsTestCaseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTestCase ? "Sửa test case" : "Thêm test case mới"}</DialogTitle>
            <DialogDescription>Điền thông tin test case</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tcIndex">Index</Label>
              <Input
                id="tcIndex"
                type="number"
                value={testCaseForm.index}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, index: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input">Input</Label>
              <Textarea
                id="input"
                value={testCaseForm.input}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, input: e.target.value })}
                placeholder="Nhập input"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedOutput">Expected Output</Label>
              <Textarea
                id="expectedOutput"
                value={testCaseForm.expectedOutput}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, expectedOutput: e.target.value })}
                placeholder="Nhập output mong đợi"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isHidden"
                checked={testCaseForm.isHidden}
                onCheckedChange={(checked) => setTestCaseForm({ ...testCaseForm, isHidden: checked })}
              />
              <Label htmlFor="isHidden">Ẩn test case (không hiển thị cho học sinh)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeTestCaseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveTestCase}>{editingTestCase ? "Cập nhật" : "Tạo test case"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng thi</DialogTitle>
            <DialogDescription>Cập nhật thông tin phòng thi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Tên phòng thi *</Label>
              <Input
                id="roomName"
                value={roomForm.roomName}
                onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                placeholder="Nhập tên phòng thi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomDescription">Mô tả</Label>
              <Textarea
                id="roomDescription"
                value={roomForm.description}
                onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                placeholder="Mô tả về phòng thi"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày mở</Label>
                <Input
                  type="date"
                  value={roomForm.openDate}
                  onChange={(e) => setRoomForm({ ...roomForm, openDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Giờ mở</Label>
                <Input
                  type="time"
                  value={roomForm.openTime}
                  onChange={(e) => setRoomForm({ ...roomForm, openTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày đóng</Label>
                <Input
                  type="date"
                  value={roomForm.closeDate}
                  onChange={(e) => setRoomForm({ ...roomForm, closeDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Giờ đóng</Label>
                <Input
                  type="time"
                  value={roomForm.closeTime}
                  onChange={(e) => setRoomForm({ ...roomForm, closeTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoomDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveRoom}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm thí sinh</DialogTitle>
            <DialogDescription>Nhập thông tin thí sinh để thêm vào phòng thi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentCode">Mã sinh viên *</Label>
              <Input
                id="studentCode"
                value={studentForm.studentCode}
                onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })}
                placeholder="VD: SV001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentName">Họ và tên *</Label>
              <Input
                id="studentName"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Email</Label>
              <Input
                id="studentEmail"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                placeholder="email@student.edu"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStudent} disabled={!studentForm.studentCode || !studentForm.name}>
              Thêm thí sinh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
