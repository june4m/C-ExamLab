'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, Loader2, FileCode } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
	useGetAdminQuestions,
	useCreateQuestion,
	useUpdateQuestion,
	type Question
} from '@/service/admin/question.service'
import {
	useGetTestCases,
	useCreateTestCase
} from '@/service/admin/testcase.service'
import { useAuthStore } from '@/store/auth.store'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface RoomData {
	uuid: string
	code: string
	name: string
}

interface RoomsResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: RoomData[]
}

function useGetRooms() {
	const token = useAuthStore(state => state.token)

	return useQuery({
		queryKey: ['admin-rooms'],
		queryFn: async () => {
			const res = await fetch(`${API_BASE_URL}/admin/rooms/`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			const json = (await res.json()) as RoomsResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to fetch rooms')
			}
			return json.data
		}
	})
}

interface QuestionFormData {
	title: string
	descriptionPath: string
	score: number
	timeLimit: number
	memoryLimit: number
	order: number
	roomId: string
}

export default function AdminQuestionsPage() {
	const { toast } = useToast()
	const {
		data: questionsData,
		isLoading: questionsLoading,
		error: questionsError
	} = useGetAdminQuestions()
	const { data: rooms, isLoading: roomsLoading } = useGetRooms()
	const createQuestion = useCreateQuestion()
	const updateQuestion = useUpdateQuestion()
	const createTestCase = useCreateTestCase()

	const [searchQuery, setSearchQuery] = useState('')
	const [filterRoom, setFilterRoom] = useState<string>('all')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isTestCaseDialogOpen, setIsTestCaseDialogOpen] = useState(false)
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
	const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
		null
	)

	// Get test cases for selected question
	const { data: testCasesData, isLoading: testCasesLoading } = useGetTestCases(
		selectedQuestion?.roomId || '',
		selectedQuestion?.uuid || ''
	)
	const [testCaseFormData, setTestCaseFormData] = useState({
		testCaseNumber: 1,
		input: '',
		expectedOutput: '',
		isPublic: true,
		points: 0,
		description: ''
	})
	const [formData, setFormData] = useState<QuestionFormData>({
		title: '',
		descriptionPath: '',
		score: 10,
		timeLimit: 1000,
		memoryLimit: 256,
		order: 1,
		roomId: ''
	})

	const questions = useMemo(
		() => questionsData?.data?.listQuestion || [],
		[questionsData]
	)

	// Map roomId to room name
	const roomMap = useMemo(() => {
		const map: Record<string, string> = {}
		rooms?.forEach(room => {
			map[room.uuid] = room.name
		})
		return map
	}, [rooms])

	// Filter questions
	const filteredQuestions = useMemo(() => {
		return questions.filter(q => {
			const matchesSearch =
				q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				q.code.toLowerCase().includes(searchQuery.toLowerCase())
			const matchesRoom = filterRoom === 'all' || q.roomId === filterRoom
			return matchesSearch && matchesRoom
		})
	}, [questions, searchQuery, filterRoom])

	const handleCreate = () => {
		if (!formData.title || !formData.roomId) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
				variant: 'destructive'
			})
			return
		}

		createQuestion.mutate(formData, {
			onSuccess: () => {
				toast({ title: 'Thành công', description: 'Đã tạo câu hỏi mới' })
				setIsDialogOpen(false)
				resetForm()
			},
			onError: () => {
				toast({
					title: 'Lỗi',
					description: 'Không thể tạo câu hỏi',
					variant: 'destructive'
				})
			}
		})
	}

	const handleEdit = (question: Question) => {
		setEditingQuestion(question)
		setFormData({
			title: question.title,
			descriptionPath: question.descriptionPath || '',
			score: question.score,
			timeLimit: question.timeLimit,
			memoryLimit: question.memoryLimit,
			order: question.order,
			roomId: question.roomId
		})
		setIsEditDialogOpen(true)
	}

	const handleUpdate = () => {
		if (!editingQuestion || !formData.title || !formData.roomId) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
				variant: 'destructive'
			})
			return
		}

		updateQuestion.mutate(
			{
				questionId: editingQuestion.uuid,
				...formData
			},
			{
				onSuccess: () => {
					toast({ title: 'Thành công', description: 'Đã cập nhật câu hỏi' })
					setIsEditDialogOpen(false)
					setEditingQuestion(null)
					resetForm()
				},
				onError: () => {
					toast({
						title: 'Lỗi',
						description: 'Không thể cập nhật câu hỏi',
						variant: 'destructive'
					})
				}
			}
		)
	}

	const handleDelete = (questionId: string) => {
		// TODO: Implement delete API
		console.log('Delete question:', questionId)
	}

	const handleOpenTestCases = (question: Question) => {
		setSelectedQuestion(question)
		setIsTestCaseDialogOpen(true)
	}

	const handleCreateTestCase = () => {
		if (!selectedQuestion) return

		createTestCase.mutate(
			{
				roomId: selectedQuestion.roomId,
				questionId: selectedQuestion.uuid,
				...testCaseFormData
			},
			{
				onSuccess: () => {
					toast({ title: 'Thành công', description: 'Đã tạo test case mới' })
					resetTestCaseForm()
				},
				onError: () => {
					toast({
						title: 'Lỗi',
						description: 'Không thể tạo test case',
						variant: 'destructive'
					})
				}
			}
		)
	}

	const resetTestCaseForm = () => {
		setTestCaseFormData({
			testCaseNumber: (testCasesData?.data?.length || 0) + 1,
			input: '',
			expectedOutput: '',
			isPublic: true,
			points: 0,
			description: ''
		})
	}

	const resetForm = () => {
		setFormData({
			title: '',
			descriptionPath: '',
			score: 10,
			timeLimit: 1000,
			memoryLimit: 256,
			order: 1,
			roomId: ''
		})
	}

	if (questionsLoading || roomsLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (questionsError) {
		return (
			<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
				Không thể tải danh sách câu hỏi
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Quản lý câu hỏi</h1>
					<p className="text-muted-foreground">
						Tổng cộng {questions.length} câu hỏi
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={open => {
						setIsDialogOpen(open)
						if (!open) resetForm()
					}}
				>
					<DialogTrigger asChild>
						<Button className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white">
							<Plus className="mr-2 h-4 w-4" />
							Thêm câu hỏi
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Thêm câu hỏi mới</DialogTitle>
							<DialogDescription>
								Điền thông tin cho câu hỏi mới
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label>Phòng thi *</Label>
								<Select
									value={formData.roomId}
									onValueChange={value =>
										setFormData({ ...formData, roomId: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn phòng thi" />
									</SelectTrigger>
									<SelectContent>
										{rooms?.map(room => (
											<SelectItem key={room.uuid} value={room.uuid}>
												{room.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label>Tiêu đề *</Label>
								<Input
									value={formData.title}
									onChange={e =>
										setFormData({ ...formData, title: e.target.value })
									}
									placeholder="Nhập tiêu đề câu hỏi"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Đường dẫn mô tả</Label>
								<Input
									value={formData.descriptionPath}
									onChange={e =>
										setFormData({
											...formData,
											descriptionPath: e.target.value
										})
									}
									placeholder="/questions/description.md"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Điểm</Label>
									<Input
										type="number"
										value={formData.score}
										onChange={e =>
											setFormData({
												...formData,
												score: Number.parseInt(e.target.value) || 0
											})
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Thứ tự</Label>
									<Input
										type="number"
										value={formData.order}
										onChange={e =>
											setFormData({
												...formData,
												order: Number.parseInt(e.target.value) || 1
											})
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Time Limit (ms)</Label>
									<Input
										type="number"
										value={formData.timeLimit}
										onChange={e =>
											setFormData({
												...formData,
												timeLimit: Number.parseInt(e.target.value) || 1000
											})
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Memory Limit (MB)</Label>
									<Input
										type="number"
										value={formData.memoryLimit}
										onChange={e =>
											setFormData({
												...formData,
												memoryLimit: Number.parseInt(e.target.value) || 256
											})
										}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Hủy
							</Button>
							<Button
								onClick={handleCreate}
								disabled={createQuestion.isPending}
								className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
							>
								{createQuestion.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : null}
								Tạo câu hỏi
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Filters */}
			<Card className="mb-6">
				<CardContent className="pt-6">
					<div className="flex gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Tìm kiếm theo tiêu đề hoặc mã..."
								className="pl-10"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						<Select value={filterRoom} onValueChange={setFilterRoom}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Lọc theo phòng" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả phòng</SelectItem>
								{rooms?.map(room => (
									<SelectItem key={room.uuid} value={room.uuid}>
										{room.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Questions Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách câu hỏi</CardTitle>
					<CardDescription>
						Hiển thị {filteredQuestions.length} / {questions.length} câu hỏi
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">Mã</TableHead>
								<TableHead>Tiêu đề</TableHead>
								<TableHead>Phòng thi</TableHead>
								<TableHead className="w-20">Điểm</TableHead>
								<TableHead className="w-[100px]">Time Limit</TableHead>
								<TableHead className="w-[100px]">Test Cases</TableHead>
								<TableHead className="w-[120px]">Hành động</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredQuestions.map(question => (
								<TableRow key={question.uuid}>
									<TableCell className="font-mono text-sm">
										{question.code}
									</TableCell>
									<TableCell className="font-medium">
										{question.title}
									</TableCell>
									<TableCell>
										<Link
											href={`/admin/rooms/${question.roomId}`}
											className="text-[#40E0D0] hover:underline"
										>
											{roomMap[question.roomId] || question.roomId}
										</Link>
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{question.score}</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{question.timeLimit}ms
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											className="text-[#40E0D0] hover:text-[#40E0D0]/80"
											onClick={() => handleOpenTestCases(question)}
										>
											<FileCode className="h-4 w-4 mr-1" />
											Xem
										</Button>
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => handleEdit(question)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-destructive hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
														<AlertDialogDescription>
															Hành động này không thể hoàn tác. Tất cả test case
															của câu hỏi này cũng sẽ bị xóa.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Hủy</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(question.uuid)}
															className="bg-destructive hover:bg-destructive/90"
														>
															Xóa
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</TableCell>
								</TableRow>
							))}
							{filteredQuestions.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={7}
										className="text-center text-muted-foreground py-8"
									>
										Không tìm thấy câu hỏi nào
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Test Cases Dialog */}
			<Dialog
				open={isTestCaseDialogOpen}
				onOpenChange={open => {
					setIsTestCaseDialogOpen(open)
					if (!open) {
						setSelectedQuestion(null)
						resetTestCaseForm()
					}
				}}
			>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Test Cases - {selectedQuestion?.title}</DialogTitle>
						<DialogDescription>
							Quản lý test cases cho câu hỏi này
						</DialogDescription>
					</DialogHeader>

					{/* Existing Test Cases */}
					<div className="space-y-4">
						<h4 className="font-medium">Danh sách Test Cases</h4>
						{testCasesLoading ? (
							<div className="flex justify-center py-4">
								<Loader2 className="h-6 w-6 animate-spin" />
							</div>
						) : testCasesData?.data && testCasesData.data.length > 0 ? (
							<div className="space-y-2">
								{testCasesData.data.map((tc, idx) => (
									<div
										key={tc.id || idx}
										className="border rounded-lg p-3 space-y-2"
									>
										<div className="flex items-center justify-between">
											<span className="font-medium">
												Test Case #{tc.testCaseNumber}
											</span>
											<div className="flex items-center gap-2">
												<Badge variant={tc.isPublic ? 'default' : 'secondary'}>
													{tc.isPublic ? 'Public' : 'Hidden'}
												</Badge>
												<Badge variant="outline">{tc.points} điểm</Badge>
											</div>
										</div>
										{tc.description && (
											<p className="text-sm text-muted-foreground">
												{tc.description}
											</p>
										)}
										<div className="grid grid-cols-2 gap-2 text-sm">
											<div>
												<span className="text-muted-foreground">Input:</span>
												<pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
													{tc.input || '(empty)'}
												</pre>
											</div>
											<div>
												<span className="text-muted-foreground">
													Expected Output:
												</span>
												<pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
													{tc.expectedOutput || '(empty)'}
												</pre>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-center py-4">
								Chưa có test case nào
							</p>
						)}
					</div>

					{/* Add New Test Case Form */}
					<div className="border-t pt-4 mt-4">
						<h4 className="font-medium mb-4">Thêm Test Case mới</h4>
						<div className="grid gap-4">
							<div className="grid grid-cols-3 gap-4">
								<div className="grid gap-2">
									<Label>Số thứ tự</Label>
									<Input
										type="number"
										value={testCaseFormData.testCaseNumber}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												testCaseNumber: Number.parseInt(e.target.value) || 1
											})
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Điểm</Label>
									<Input
										type="number"
										value={testCaseFormData.points}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												points: Number.parseInt(e.target.value) || 0
											})
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Public</Label>
									<div className="flex items-center h-10">
										<Switch
											checked={testCaseFormData.isPublic}
											onCheckedChange={checked =>
												setTestCaseFormData({
													...testCaseFormData,
													isPublic: checked
												})
											}
										/>
									</div>
								</div>
							</div>
							<div className="grid gap-2">
								<Label>Mô tả</Label>
								<Input
									value={testCaseFormData.description}
									onChange={e =>
										setTestCaseFormData({
											...testCaseFormData,
											description: e.target.value
										})
									}
									placeholder="Mô tả test case (tùy chọn)"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Input</Label>
									<Textarea
										value={testCaseFormData.input}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												input: e.target.value
											})
										}
										placeholder="Nhập input..."
										rows={4}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Expected Output</Label>
									<Textarea
										value={testCaseFormData.expectedOutput}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												expectedOutput: e.target.value
											})
										}
										placeholder="Nhập expected output..."
										rows={4}
									/>
								</div>
							</div>
							<Button
								onClick={handleCreateTestCase}
								disabled={createTestCase.isPending}
								className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
							>
								{createTestCase.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									<Plus className="h-4 w-4 mr-2" />
								)}
								Thêm Test Case
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				open={isEditDialogOpen}
				onOpenChange={open => {
					setIsEditDialogOpen(open)
					if (!open) {
						setEditingQuestion(null)
						resetForm()
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
						<DialogDescription>Cập nhật thông tin câu hỏi</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>Phòng thi *</Label>
							<Select
								value={formData.roomId}
								onValueChange={value =>
									setFormData({ ...formData, roomId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn phòng thi" />
								</SelectTrigger>
								<SelectContent>
									{rooms?.map(room => (
										<SelectItem key={room.uuid} value={room.uuid}>
											{room.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>Tiêu đề *</Label>
							<Input
								value={formData.title}
								onChange={e =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Nhập tiêu đề câu hỏi"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Đường dẫn mô tả</Label>
							<Input
								value={formData.descriptionPath}
								onChange={e =>
									setFormData({ ...formData, descriptionPath: e.target.value })
								}
								placeholder="/questions/description.md"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Điểm</Label>
								<Input
									type="number"
									value={formData.score}
									onChange={e =>
										setFormData({
											...formData,
											score: Number.parseInt(e.target.value) || 0
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Thứ tự</Label>
								<Input
									type="number"
									value={formData.order}
									onChange={e =>
										setFormData({
											...formData,
											order: Number.parseInt(e.target.value) || 1
										})
									}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Time Limit (ms)</Label>
								<Input
									type="number"
									value={formData.timeLimit}
									onChange={e =>
										setFormData({
											...formData,
											timeLimit: Number.parseInt(e.target.value) || 1000
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Memory Limit (MB)</Label>
								<Input
									type="number"
									value={formData.memoryLimit}
									onChange={e =>
										setFormData({
											...formData,
											memoryLimit: Number.parseInt(e.target.value) || 256
										})
									}
								/>
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
						<Button
							onClick={handleUpdate}
							disabled={updateQuestion.isPending}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							{updateQuestion.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : null}
							Cập nhật
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
