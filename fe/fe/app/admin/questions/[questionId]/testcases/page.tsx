"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface TestCase {
  testcaseId: string
  questionId: string
  index: number
  input: string
  expectedOutput: string
  isHidden: boolean
}

// Mock data
const mockQuestion = {
  questionId: "q001",
  title: "Tính tổng hai số nguyên",
  description: "Viết chương trình tính tổng hai số nguyên a và b.",
  score: 10,
}

const mockTestCases: TestCase[] = [
  { testcaseId: "tc001", questionId: "q001", index: 1, input: "1 2", expectedOutput: "3", isHidden: false },
  { testcaseId: "tc002", questionId: "q001", index: 2, input: "10 20", expectedOutput: "30", isHidden: true },
  { testcaseId: "tc003", questionId: "q001", index: 3, input: "-5 5", expectedOutput: "0", isHidden: false },
  { testcaseId: "tc004", questionId: "q001", index: 4, input: "100 200", expectedOutput: "300", isHidden: true },
]

export default function QuestionTestCasesPage() {
  const params = useParams()
  const questionId = params.questionId as string

  const [testCases, setTestCases] = useState<TestCase[]>(mockTestCases)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null)
  const [formData, setFormData] = useState({
    index: 1,
    input: "",
    expectedOutput: "",
    isHidden: false,
  })

  const handleSave = () => {
    if (editingTestCase) {
      setTestCases(testCases.map((tc) => (tc.testcaseId === editingTestCase.testcaseId ? { ...tc, ...formData } : tc)))
    } else {
      const newTestCase: TestCase = {
        testcaseId: `tc${Date.now()}`,
        questionId,
        ...formData,
      }
      setTestCases([...testCases, newTestCase])
    }
    closeDialog()
  }

  const handleDelete = (testcaseId: string) => {
    setTestCases(testCases.filter((tc) => tc.testcaseId !== testcaseId))
  }

  const openCreate = () => {
    setEditingTestCase(null)
    setFormData({ index: testCases.length + 1, input: "", expectedOutput: "", isHidden: false })
    setIsDialogOpen(true)
  }

  const openEdit = (testCase: TestCase) => {
    setEditingTestCase(testCase)
    setFormData({
      index: testCase.index,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isHidden: testCase.isHidden,
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingTestCase(null)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/questions"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách câu hỏi
        </Link>
        <h1 className="text-2xl font-bold">Test Cases: {mockQuestion.title}</h1>
        <p className="text-muted-foreground">
          Mã câu hỏi: {questionId} | Điểm: {mockQuestion.score}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Danh sách Test Cases</CardTitle>
            <CardDescription>{testCases.length} test cases</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm test case
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testCases.map((tc) => (
              <div key={tc.testcaseId} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(tc)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Sửa
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa test case?</AlertDialogTitle>
                          <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(tc.testcaseId)}>Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Input:</p>
                    <pre className="p-3 bg-muted rounded-md text-sm overflow-x-auto">{tc.input}</pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Expected Output:</p>
                    <pre className="p-3 bg-muted rounded-md text-sm overflow-x-auto">{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}

            {testCases.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Chưa có test case nào. Nhấn "Thêm test case" để tạo mới.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTestCase ? "Sửa test case" : "Thêm test case mới"}</DialogTitle>
            <DialogDescription>Điền thông tin test case cho câu hỏi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="index">Index</Label>
              <Input
                id="index"
                type="number"
                value={formData.index}
                onChange={(e) => setFormData({ ...formData, index: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input">Input</Label>
              <Textarea
                id="input"
                value={formData.input}
                onChange={(e) => setFormData({ ...formData, input: e.target.value })}
                placeholder="Nhập dữ liệu input"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedOutput">Expected Output</Label>
              <Textarea
                id="expectedOutput"
                value={formData.expectedOutput}
                onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                placeholder="Nhập kết quả mong đợi"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isHidden"
                checked={formData.isHidden}
                onCheckedChange={(checked) => setFormData({ ...formData, isHidden: checked })}
              />
              <Label htmlFor="isHidden">Ẩn test case (không hiển thị cho học sinh)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button onClick={handleSave}>{editingTestCase ? "Cập nhật" : "Tạo test case"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
