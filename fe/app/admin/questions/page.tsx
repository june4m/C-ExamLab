'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
	Plus,
	Pencil,
	Trash2,
	Search,
	Loader2,
	FileCode,
	Info
} from 'lucide-react'
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
	useCreateTestCase,
	useUpdateTestCase,
	useDeleteTestCase
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
	const updateTestCase = useUpdateTestCase()
	const deleteTestCase = useDeleteTestCase()

	const [searchQuery, setSearchQuery] = useState('')
	const [editingTestCase, setEditingTestCase] = useState<{
		testcaseId: string
		index: number
		input: string
		output: string
		is_hidden: boolean
	} | null>(null)
	const [filterRoom, setFilterRoom] = useState<string>('all')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isTestCaseDialogOpen, setIsTestCaseDialogOpen] = useState(false)
	const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
	const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
		null
	)
	const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null)

	// Get test cases for selected question
	const { data: testCasesData, isLoading: testCasesLoading } = useGetTestCases(
		selectedQuestion?.uuid || ''
	)
	const testCases = testCasesData?.data?.testcaseList || []

	const [testCaseFormData, setTestCaseFormData] = useState({
		index: 1,
		input_path: '',
		output_path: '',
		is_hidden: false
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
		if (!selectedQuestion) {
			console.error('selectedQuestion is null')
			toast({
				title: 'Lỗi',
				description: 'Không tìm thấy câu hỏi được chọn',
				variant: 'destructive'
			})
			return
		}

		// Check if index already exists
		const existingIndexes = testCases.map(tc => tc.index)
		if (existingIndexes.includes(testCaseFormData.index)) {
			toast({
				title: 'Lỗi',
				description: `Số thứ tự ${testCaseFormData.index} đã tồn tại`,
				variant: 'destructive'
			})
			return
		}

		const payload = {
			questionId: selectedQuestion.uuid,
			...testCaseFormData
		}
		console.log('Creating testcase with payload:', payload)

		createTestCase.mutate(payload, {
			onSuccess: () => {
				toast({ title: 'Thành công', description: 'Đã tạo test case mới' })
				resetTestCaseForm()
			},
			onError: (error: any) => {
				console.error('Create testcase error:', error)
				const errorMessage =
					error?.response?.data?.message ||
					error?.message ||
					'Không thể tạo test case'
				toast({
					title: 'Lỗi',
					description: errorMessage,
					variant: 'destructive'
				})
			}
		})
	}

	const handleUpdateTestCase = () => {
		if (!selectedQuestion || !editingTestCase) return

		updateTestCase.mutate(
			{
				questionId: selectedQuestion.uuid,
				testcaseId: editingTestCase.testcaseId,
				index: editingTestCase.index,
				input_path: editingTestCase.input,
				output_path: editingTestCase.output,
				is_hidden: editingTestCase.is_hidden
			},
			{
				onSuccess: () => {
					toast({ title: 'Thành công', description: 'Đã cập nhật test case' })
					setEditingTestCase(null)
				},
				onError: () => {
					toast({
						title: 'Lỗi',
						description: 'Không thể cập nhật test case',
						variant: 'destructive'
					})
				}
			}
		)
	}

	const handleDeleteTestCase = (testcaseId: string) => {
		if (!selectedQuestion) return

		deleteTestCase.mutate(
			{
				questionId: selectedQuestion.uuid,
				testcaseId
			},
			{
				onSuccess: () => {
					toast({ title: 'Thành công', description: 'Đã xóa test case' })
				},
				onError: () => {
					toast({
						title: 'Lỗi',
						description: 'Không thể xóa test case',
						variant: 'destructive'
					})
				}
			}
		)
	}

	const resetTestCaseForm = () => {
		// Auto increment index
		const maxIndex =
			testCases.length > 0 ? Math.max(...testCases.map(tc => tc.index)) : 0
		setTestCaseFormData({
			index: maxIndex + 1,
			input_path: '',
			output_path: '',
			is_hidden: false
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
				Failed to load questions
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Question management</h1>
					<p className="text-muted-foreground">
						Total {questions.length} questions
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
							Add question
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add new question</DialogTitle>
							<DialogDescription>
								Fill in information for the new question
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label>Room *</Label>
								<Select
									value={formData.roomId}
									onValueChange={value =>
										setFormData({ ...formData, roomId: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select room" />
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
								<Label>Title *</Label>
								<Input
									value={formData.title}
									onChange={e =>
										setFormData({ ...formData, title: e.target.value })
									}
									placeholder="Enter question title"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Description path</Label>
								<Input
									value={formData.descriptionPath}
									onChange={e =>
										setFormData({
											...formData,
											descriptionPath: e.target.value
										})
									}
									placeholder="/path/to/description.md"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Score</Label>
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
									<Label>Order</Label>
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
									<Label>Time limit (ms)</Label>
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
									<Label>Memory limit (MB)</Label>
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
								Cancel
							</Button>
							<Button
								onClick={handleCreate}
								disabled={createQuestion.isPending}
								className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
							>
								{createQuestion.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : null}
								Create question
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
								placeholder="Search by title or code..."
								className="pl-10"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						<Select value={filterRoom} onValueChange={setFilterRoom}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Filter by room" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All rooms</SelectItem>
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
					<CardTitle>Question list</CardTitle>
					<CardDescription>
						Showing {filteredQuestions.length} / {questions.length} questions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[80px]">Code</TableHead>
								<TableHead className="min-w-[150px]">Title</TableHead>
								<TableHead className="min-w-[120px]">Room</TableHead>
								<TableHead className="w-[70px] text-center">Score</TableHead>
								<TableHead className="w-[100px] text-center">
									Time limit
								</TableHead>
								<TableHead className="w-[100px] text-center">
									Test cases
								</TableHead>
								<TableHead className="w-[130px] text-center">Actions</TableHead>
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
									<TableCell className="text-center">
										<Badge variant="secondary">{question.score}</Badge>
									</TableCell>
									<TableCell className="text-center text-muted-foreground">
										{question.timeLimit}ms
									</TableCell>
									<TableCell className="text-center">
										<Button
											variant="ghost"
											size="sm"
											className="text-[#40E0D0] hover:text-[#40E0D0]/80"
											onClick={() => handleOpenTestCases(question)}
										>
											<FileCode className="h-4 w-4 mr-1" />
											View
										</Button>
									</TableCell>
									<TableCell>
										<div className="flex gap-1 justify-center">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => {
													setViewingQuestion(question)
													setIsInfoDialogOpen(true)
												}}
												title="View details"
											>
												<Info className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => handleEdit(question)}
												title="Chỉnh sửa"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-destructive hover:text-destructive"
														title="Xóa"
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
						setEditingTestCase(null)
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

					{/* Question Info */}
					{selectedQuestion && (
						<div className="bg-muted/50 rounded-lg p-4 space-y-2">
							<div className="flex items-center justify-between">
								<h4 className="font-semibold">{selectedQuestion.title}</h4>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										handleEdit(selectedQuestion)
										setIsTestCaseDialogOpen(false)
									}}
								>
									<Pencil className="h-4 w-4 mr-1" />
									Sửa câu hỏi
								</Button>
							</div>
							<div className="grid grid-cols-4 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">Mã:</span>
									<p className="font-mono font-medium">
										{selectedQuestion.code}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">Điểm:</span>
									<p className="font-medium">{selectedQuestion.score}</p>
								</div>
								<div>
									<span className="text-muted-foreground">Time Limit:</span>
									<p className="font-medium">{selectedQuestion.timeLimit}ms</p>
								</div>
								<div>
									<span className="text-muted-foreground">Memory:</span>
									<p className="font-medium">
										{selectedQuestion.memoryLimit}KB
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Existing Test Cases */}
					<div className="space-y-4">
						<h4 className="font-medium">
							Danh sách Test Cases ({testCases.length})
						</h4>
						{testCasesLoading ? (
							<div className="flex justify-center py-4">
								<Loader2 className="h-6 w-6 animate-spin" />
							</div>
						) : testCases.length > 0 ? (
							<div className="space-y-2 max-h-[300px] overflow-y-auto">
								{testCases.map((tc, idx) => (
									<div
										key={tc.testcaseId || idx}
										className="border rounded-lg p-3 space-y-2"
									>
										<div className="flex items-center justify-between">
											<span className="font-medium">Test Case #{tc.index}</span>
											<div className="flex items-center gap-2">
												<Badge variant={tc.is_hidden ? 'secondary' : 'default'}>
													{tc.is_hidden ? 'Hidden' : 'Public'}
												</Badge>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														setEditingTestCase({
															testcaseId: tc.testcaseId,
															index: tc.index,
															input: tc.input || '',
															output: tc.output || '',
															is_hidden: tc.is_hidden === 1
														})
													}
												>
													<Pencil className="h-3.5 w-3.5" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-destructive hover:text-destructive"
														>
															<Trash2 className="h-3.5 w-3.5" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Xóa test case?
															</AlertDialogTitle>
															<AlertDialogDescription>
																Hành động này không thể hoàn tác.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Hủy</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDeleteTestCase(tc.testcaseId)
																}
																className="bg-destructive hover:bg-destructive/90"
															>
																Xóa
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
										{editingTestCase?.testcaseId === tc.testcaseId ? (
											<div className="space-y-3 pt-2 border-t">
												<div className="grid grid-cols-3 gap-3">
													<div className="grid gap-1">
														<Label className="text-xs">Số thứ tự</Label>
														<Input
															type="number"
															value={editingTestCase.index}
															onChange={e =>
																setEditingTestCase({
																	...editingTestCase,
																	index: Number.parseInt(e.target.value) || 1
																})
															}
														/>
													</div>
													<div className="grid gap-1">
														<Label className="text-xs">Điểm</Label>
														<Input
															type="number"
															disabled
															value={selectedQuestion?.score || 0}
														/>
													</div>
													<div className="grid gap-1">
														<Label className="text-xs">Hidden</Label>
														<div className="flex items-center h-10">
															<Switch
																checked={editingTestCase.is_hidden}
																onCheckedChange={checked =>
																	setEditingTestCase({
																		...editingTestCase,
																		is_hidden: checked
																	})
																}
															/>
														</div>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-3">
													<div className="grid gap-1">
														<Label className="text-xs">Input</Label>
														<Textarea
															value={editingTestCase.input}
															onChange={e =>
																setEditingTestCase({
																	...editingTestCase,
																	input: e.target.value
																})
															}
															rows={3}
														/>
													</div>
													<div className="grid gap-1">
														<Label className="text-xs">Expected Output</Label>
														<Textarea
															value={editingTestCase.output}
															onChange={e =>
																setEditingTestCase({
																	...editingTestCase,
																	output: e.target.value
																})
															}
															rows={3}
														/>
													</div>
												</div>
												<div className="flex gap-2 justify-end">
													<Button
														variant="outline"
														size="sm"
														onClick={() => setEditingTestCase(null)}
													>
														Hủy
													</Button>
													<Button
														size="sm"
														onClick={handleUpdateTestCase}
														disabled={updateTestCase.isPending}
														className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
													>
														{updateTestCase.isPending && (
															<Loader2 className="h-4 w-4 animate-spin mr-1" />
														)}
														Lưu
													</Button>
												</div>
											</div>
										) : (
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-muted-foreground">Input:</span>
													<pre className="bg-muted p-2 rounded mt-1 overflow-x-auto max-h-20">
														{tc.input || '(empty)'}
													</pre>
												</div>
												<div>
													<span className="text-muted-foreground">
														Expected Output:
													</span>
													<pre className="bg-muted p-2 rounded mt-1 overflow-x-auto max-h-20">
														{tc.output || '(empty)'}
													</pre>
												</div>
											</div>
										)}
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
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Số thứ tự</Label>
									<Input
										type="number"
										value={testCaseFormData.index}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												index: Number.parseInt(e.target.value) || 1
											})
										}
									/>
									{testCases.some(
										tc => tc.index === testCaseFormData.index
									) && (
										<p className="text-xs text-destructive">
											Số thứ tự này đã tồn tại
										</p>
									)}
								</div>
								<div className="grid gap-2">
									<Label>Hidden</Label>
									<div className="flex items-center h-10">
										<Switch
											checked={testCaseFormData.is_hidden}
											onCheckedChange={checked =>
												setTestCaseFormData({
													...testCaseFormData,
													is_hidden: checked
												})
											}
										/>
										<span className="ml-2 text-sm text-muted-foreground">
											{testCaseFormData.is_hidden ? 'Ẩn' : 'Hiện'}
										</span>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Input</Label>
									<Textarea
										value={testCaseFormData.input_path}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												input_path: e.target.value
											})
										}
										placeholder="Nhập input..."
										rows={4}
									/>
								</div>
								<div className="grid gap-2">
									<Label>Expected Output</Label>
									<Textarea
										value={testCaseFormData.output_path}
										onChange={e =>
											setTestCaseFormData({
												...testCaseFormData,
												output_path: e.target.value
											})
										}
										placeholder="Nhập expected output..."
										rows={4}
									/>
								</div>
							</div>
							<Button
								onClick={handleCreateTestCase}
								disabled={
									createTestCase.isPending ||
									testCases.some(tc => tc.index === testCaseFormData.index)
								}
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

			{/* Question Info Dialog */}
			<Dialog
				open={isInfoDialogOpen}
				onOpenChange={open => {
					setIsInfoDialogOpen(open)
					if (!open) setViewingQuestion(null)
				}}
			>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Chi tiết câu hỏi</DialogTitle>
						<DialogDescription>Thông tin đầy đủ của câu hỏi</DialogDescription>
					</DialogHeader>
					{viewingQuestion && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								{/* <div>
									<Label className="text-xs text-muted-foreground">
										Mã câu hỏi
									</Label>
									<p className="font-mono font-medium">
										{viewingQuestion.code}
									</p>
								</div> */}
								<div>
									<Label className="text-xs text-muted-foreground">
										Thứ tự
									</Label>
									<p className="font-medium">{viewingQuestion.order}</p>
								</div>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground">Tiêu đề</Label>
								<p className="font-semibold">{viewingQuestion.title}</p>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground">
									Phòng thi
								</Label>
								<Link
									href={`/admin/rooms/${viewingQuestion.roomId}`}
									className="text-[#40E0D0] hover:underline block"
								>
									{roomMap[viewingQuestion.roomId] || viewingQuestion.roomId}
								</Link>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">Điểm</Label>
									<p className="font-medium text-primary">
										{viewingQuestion.score}
									</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">
										Time Limit
									</Label>
									<p className="font-medium">{viewingQuestion.timeLimit}ms</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">
										Memory Limit
									</Label>
									<p className="font-medium">{viewingQuestion.memoryLimit}KB</p>
								</div>
							</div>
							{viewingQuestion.descriptionPath && (
								<div>
									<Label className="text-xs text-muted-foreground">
										Đường dẫn mô tả
									</Label>
									<p className="font-mono text-sm break-all">
										{viewingQuestion.descriptionPath}
									</p>
								</div>
							)}
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsInfoDialogOpen(false)}
						>
							Đóng
						</Button>
						<Button
							onClick={() => {
								if (viewingQuestion) {
									handleEdit(viewingQuestion)
									setIsInfoDialogOpen(false)
								}
							}}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							<Pencil className="h-4 w-4 mr-1" />
							Chỉnh sửa
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
