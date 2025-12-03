'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search, FileCode } from 'lucide-react'
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

// Mock data
const mockRooms = [
	{ roomId: '001', roomName: 'Lò Luyện Ngục' },
	{ roomId: '002', roomName: 'Phòng Thi Số 2' },
	{ roomId: '003', roomName: 'Phòng Thi Số 3' }
]

const mockQuestions = [
	{
		questionId: 'q001',
		title: 'Tính tổng hai số nguyên',
		code: 'Q001',
		score: 10,
		timeLimit: 1000,
		memoryLimit: 256,
		order: 1,
		roomId: '001',
		roomName: 'Lò Luyện Ngục',
		testCaseCount: 5
	},
	{
		questionId: 'q002',
		title: 'Kiểm tra số nguyên tố',
		code: 'Q002',
		score: 20,
		timeLimit: 2000,
		memoryLimit: 512,
		order: 2,
		roomId: '001',
		roomName: 'Lò Luyện Ngục',
		testCaseCount: 8
	},
	{
		questionId: 'q003',
		title: 'Sắp xếp mảng tăng dần',
		code: 'Q003',
		score: 30,
		timeLimit: 3000,
		memoryLimit: 1024,
		order: 3,
		roomId: '002',
		roomName: 'Phòng Thi Số 2',
		testCaseCount: 10
	},
	{
		questionId: 'q004',
		title: 'Tìm số Fibonacci thứ N',
		code: 'Q004',
		score: 25,
		timeLimit: 1500,
		memoryLimit: 256,
		order: 1,
		roomId: '002',
		roomName: 'Phòng Thi Số 2',
		testCaseCount: 6
	}
]

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
	const [questions, setQuestions] = useState(mockQuestions)
	const [searchQuery, setSearchQuery] = useState('')
	const [filterRoom, setFilterRoom] = useState<string>('all')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingQuestion, setEditingQuestion] = useState<
		(typeof mockQuestions)[0] | null
	>(null)
	const [formData, setFormData] = useState<QuestionFormData>({
		title: '',
		descriptionPath: '',
		score: 10,
		timeLimit: 1000,
		memoryLimit: 256,
		order: 1,
		roomId: ''
	})

	// Filter questions
	const filteredQuestions = questions.filter(q => {
		const matchesSearch =
			q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			q.code.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesRoom = filterRoom === 'all' || q.roomId === filterRoom
		return matchesSearch && matchesRoom
	})

	const handleCreate = () => {
		const room = mockRooms.find(r => r.roomId === formData.roomId)
		const newQuestion = {
			questionId: `q${Date.now()}`,
			...formData,
			code: `Q${String(questions.length + 1).padStart(3, '0')}`,
			roomName: room?.roomName || '',
			testCaseCount: 0
		}
		setQuestions([...questions, newQuestion])
		setIsDialogOpen(false)
		resetForm()
	}

	const handleUpdate = () => {
		if (!editingQuestion) return
		const room = mockRooms.find(r => r.roomId === formData.roomId)
		setQuestions(
			questions.map(q =>
				q.questionId === editingQuestion.questionId
					? { ...q, ...formData, roomName: room?.roomName || '' }
					: q
			)
		)
		setIsDialogOpen(false)
		setEditingQuestion(null)
		resetForm()
	}

	const handleDelete = (questionId: string) => {
		setQuestions(questions.filter(q => q.questionId !== questionId))
	}

	const openEdit = (question: (typeof mockQuestions)[0]) => {
		setEditingQuestion(question)
		setFormData({
			title: question.title,
			descriptionPath: '',
			score: question.score,
			timeLimit: question.timeLimit,
			memoryLimit: question.memoryLimit,
			order: question.order,
			roomId: question.roomId
		})
		setIsDialogOpen(true)
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
					open={isDialogOpen && !editingQuestion}
					onOpenChange={open => {
						setIsDialogOpen(open)
						if (!open) {
							setEditingQuestion(null)
							resetForm()
						}
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
										{mockRooms.map(room => (
											<SelectItem key={room.roomId} value={room.roomId}>
												{room.roomName}
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
								className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
							>
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
								{mockRooms.map(room => (
									<SelectItem key={room.roomId} value={room.roomId}>
										{room.roomName}
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
								<TableHead className="w-[80px]">Mã</TableHead>
								<TableHead>Tiêu đề</TableHead>
								<TableHead>Phòng thi</TableHead>
								<TableHead className="w-[80px]">Điểm</TableHead>
								<TableHead className="w-[100px]">Time Limit</TableHead>
								<TableHead className="w-[100px]">Test Cases</TableHead>
								<TableHead className="w-[120px]">Hành động</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredQuestions.map(question => (
								<TableRow key={question.questionId}>
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
											{question.roomName}
										</Link>
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{question.score}</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{question.timeLimit}ms
									</TableCell>
									<TableCell>
										<Link
											href={`/admin/rooms/${question.roomId}?tab=questions&q=${question.questionId}`}
											className="inline-flex items-center gap-1 text-[#40E0D0] hover:underline"
										>
											<FileCode className="h-4 w-4" />
											{question.testCaseCount}
										</Link>
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => openEdit(question)}
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
															onClick={() => handleDelete(question.questionId)}
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

			{/* Edit Dialog */}
			<Dialog
				open={isDialogOpen && !!editingQuestion}
				onOpenChange={open => {
					setIsDialogOpen(open)
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
									{mockRooms.map(room => (
										<SelectItem key={room.roomId} value={room.roomId}>
											{room.roomName}
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
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							Hủy
						</Button>
						<Button
							onClick={handleUpdate}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							Cập nhật
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
