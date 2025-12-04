'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	ArrowLeft,
	BookOpen,
	Trophy,
	Users,
	Settings,
	Loader2,
	Calendar,
	Clock,
	Save,
	FileCode,
	Ban,
	ShieldCheck,
	ChevronUp,
	Eye,
	AlertCircle,
	CheckCircle2,
	Timer,
	HardDrive,
	Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/use-toast'
import {
	useGetTestCases,
	useUpdateTestCase,
	useDeleteTestCase
} from '@/service/admin/testcase.service'
import { useGetAdminUsers } from '@/service/admin/user.service'
import { useUpdateQuestion } from '@/service/admin/question.service'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Info, UserPlus, Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface RoomData {
	uuid: string
	code: string
	name: string
	openTime: string
	closeTime: string
	createdBy: string
	createdAt: string
	updatedAt: string
}

interface RoomResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: RoomData
}

interface UpdateRoomRequest {
	name: string
	openTime: string
	closeTime: string
}

interface RoomQuestion {
	uuid: string
	code: string
	roomUuid: string
	title: string
	descriptionPath: string
	score: number
	timeLimit: number
	memoryLimit: number
	order: number
	createdAt: string
}

interface RoomQuestionsResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: RoomQuestion[]
}

interface Participant {
	participantId: string
	studentId: string
	studentFullName: string
	studentEmail: string
	joinedAt: string | null
	isBanned?: boolean
}

interface RoomParticipantsResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: {
		roomId: string
		roomName: string
		participants: Participant[]
	}
}

interface StudentQuestion {
	questionId: string
	title: string
	maxScore: number
	myScore: number
	solved: boolean
	attempts: number
}

interface StudentScore {
	studentId: string
	studentFullName: string
	studentEmail: string
	totalScore: number
	questions: StudentQuestion[]
}

interface RoomScoresResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: {
		roomId: string
		roomName: string
		students: StudentScore[]
	}
}

function useGetRoom(roomId: string) {
	const token = useAuthStore(state => state.token)

	return useQuery({
		queryKey: ['admin-room', roomId],
		queryFn: async () => {
			const res = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const json = (await res.json()) as RoomResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to fetch room')
			}
			return json.data
		},
		enabled: !!roomId
	})
}

function useUpdateRoom(roomId: string) {
	const token = useAuthStore(state => state.token)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: UpdateRoomRequest) => {
			const res = await fetch(
				`${API_BASE_URL}/admin/rooms/update-room/${roomId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(payload)
				}
			)
			const json = await res.json()
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to update room')
			}
			return json
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-room', roomId] })
			queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
		}
	})
}

function useGetRoomQuestions(roomId: string) {
	const token = useAuthStore(state => state.token)

	return useQuery({
		queryKey: ['admin-room-questions', roomId],
		queryFn: async () => {
			const res = await fetch(
				`${API_BASE_URL}/admin/questions/room/${roomId}`,
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			const json = (await res.json()) as RoomQuestionsResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to fetch questions')
			}
			return json.data
		},
		enabled: !!roomId
	})
}

function useGetRoomParticipants(roomId: string) {
	const token = useAuthStore(state => state.token)

	return useQuery({
		queryKey: ['admin-room-participants', roomId],
		queryFn: async () => {
			const res = await fetch(
				`${API_BASE_URL}/admin/room/${roomId}/participants`,
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			const json = (await res.json()) as RoomParticipantsResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to fetch participants')
			}
			return json.data
		},
		enabled: !!roomId
	})
}

function useBanUser(roomId: string) {
	const token = useAuthStore(state => state.token)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			const json = await res.json()
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to ban user')
			}
			return json
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['admin-room-participants', roomId]
			})
		}
	})
}

function useUnbanUser(roomId: string) {
	const token = useAuthStore(state => state.token)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userId: string) => {
			const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			const json = await res.json()
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to unban user')
			}
			return json
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['admin-room-participants', roomId]
			})
		}
	})
}

function useAddStudentsToRoom(roomId: string) {
	const token = useAuthStore(state => state.token)
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (studentIds: string[]) => {
			const res = await fetch(`${API_BASE_URL}/admin/room/add-students`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ roomId, studentIds })
			})
			const json = await res.json()
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to add students')
			}
			return json
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['admin-room-participants', roomId]
			})
		}
	})
}

function useGetRoomScores(roomId: string) {
	const token = useAuthStore(state => state.token)

	return useQuery({
		queryKey: ['admin-room-scores', roomId],
		queryFn: async () => {
			const res = await fetch(`${API_BASE_URL}/admin/room/${roomId}/scores`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const json = (await res.json()) as RoomScoresResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to fetch scores')
			}
			return json.data
		},
		enabled: !!roomId
	})
}
// Helper functions
const formatDateTime = (isoString: string) => {
	const date = new Date(isoString)
	return {
		date: date.toLocaleDateString('vi-VN'),
		time: date.toLocaleTimeString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit'
		}),
		dateInput: date.toISOString().split('T')[0],
		timeInput: date.toTimeString().slice(0, 5)
	}
}

const getAmPm = (time: string) => {
	if (!time) return ''
	const hour = parseInt(time.split(':')[0])
	return hour >= 12 ? 'PM' : 'AM'
}

// Check if participant joined during exam time
const getParticipantStatus = (
	joinedAt: string | null,
	openTime: string,
	closeTime: string
) => {
	if (!joinedAt) {
		return { status: 'not_joined', label: 'Not joined', color: 'gray' }
	}

	const joinTime = new Date(joinedAt).getTime()
	const examStart = new Date(openTime).getTime()
	const examEnd = new Date(closeTime).getTime()
	const now = Date.now()

	if (joinTime >= examStart && joinTime <= examEnd) {
		if (now >= examStart && now <= examEnd) {
			return { status: 'active', label: 'In progress', color: 'green' }
		}
		return { status: 'completed', label: 'Completed', color: 'blue' }
	}

	return { status: 'invalid', label: 'Joined at wrong time', color: 'yellow' }
}

// Question Card Component with TestCase
function QuestionCard({
	question,
	index,
	isExpanded,
	onToggle,
	onEditQuestion
}: {
	question: RoomQuestion
	index: number
	isExpanded: boolean
	onToggle: () => void
	onEditQuestion: (question: RoomQuestion) => void
}) {
	const { toast } = useToast()
	const { data: testCasesResponse, isLoading: testCasesLoading } =
		useGetTestCases(question.uuid)
	const testCases = testCasesResponse?.data?.testcaseList || []
	const updateTestCase = useUpdateTestCase()
	const deleteTestCase = useDeleteTestCase()

	const [editingTestCase, setEditingTestCase] = useState<{
		testcaseId: string
		index: number
		input: string
		output: string
		is_hidden: boolean
	} | null>(null)
	const [showQuestionInfo, setShowQuestionInfo] = useState(false)

	const handleUpdateTestCase = () => {
		if (!editingTestCase) return

		updateTestCase.mutate(
			{
				questionId: question.uuid,
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
		deleteTestCase.mutate(
			{
				questionId: question.uuid,
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

	return (
		<div className="border rounded-lg overflow-hidden bg-card">
			{/* Question Header */}
			<div className="p-4 flex items-center justify-between">
				<div className="flex items-center gap-4 flex-1">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<span className="font-bold text-primary">#{index + 1}</span>
					</div>
					<div className="flex-1">
						<h4 className="font-semibold text-base">{question.title}</h4>
						<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
							<span className="flex items-center gap-1">
								<Trophy className="h-3.5 w-3.5" />
								{question.score} pts
							</span>
							<span className="flex items-center gap-1">
								<Timer className="h-3.5 w-3.5" />
								{question.timeLimit}ms
							</span>
							<span className="flex items-center gap-1">
								<HardDrive className="h-3.5 w-3.5" />
								{question.memoryLimit}KB
							</span>
							<span className="flex items-center gap-1 text-xs">
								Order: {question.order}
							</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant="secondary"
						className="bg-primary/10 text-primary font-semibold"
					>
						{question.score} pts
					</Badge>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setShowQuestionInfo(true)}
						title="View details"
					>
						<Info className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => onEditQuestion(question)}
						title="Edit question"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onToggle}
						className="gap-1"
					>
						{isExpanded ? (
							<>
								<ChevronUp className="h-4 w-4" />
								Hide test cases
							</>
						) : (
							<>
								<Eye className="h-4 w-4" />
								View test cases
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Question Info Dialog */}
			<Dialog open={showQuestionInfo} onOpenChange={setShowQuestionInfo}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Question details</DialogTitle>
						<DialogDescription>
							Full information about this question
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							{/* <div>
								<Label className="text-xs text-muted-foreground">
									Mã câu hỏi
								</Label>
								<p className="font-mono font-medium">
									{question.code || 'N/A'}
								</p>
							</div> */}
							<div>
								<Label className="text-xs text-muted-foreground">Order</Label>
								<p className="font-medium">{question.order}</p>
							</div>
						</div>
						<div>
							<Label className="text-xs text-muted-foreground">Title</Label>
							<p className="font-semibold">{question.title}</p>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div>
								<Label className="text-xs text-muted-foreground">Score</Label>
								<p className="font-medium text-primary">{question.score} pts</p>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground">
									Time Limit
								</Label>
								<p className="font-medium">{question.timeLimit}ms</p>
							</div>
							<div>
								<Label className="text-xs text-muted-foreground">
									Memory Limit
								</Label>
								<p className="font-medium">{question.memoryLimit}KB</p>
							</div>
						</div>
						{question.descriptionPath && (
							<div>
								<Label className="text-xs text-muted-foreground">
									Description path
								</Label>
								<p className="font-mono text-sm break-all">
									{question.descriptionPath}
								</p>
							</div>
						)}
						<div>
							<Label className="text-xs text-muted-foreground">
								Created at
							</Label>
							<p className="text-sm">
								{new Date(question.createdAt).toLocaleString('vi-VN')}
							</p>
						</div>
						<div>
							<Label className="text-xs text-muted-foreground">
								Number of test cases
							</Label>
							<p className="font-medium">{testCases.length}</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowQuestionInfo(false)}
						>
							Close
						</Button>
						<Button
							onClick={() => {
								setShowQuestionInfo(false)
								onEditQuestion(question)
							}}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							<Pencil className="h-4 w-4 mr-1" />
							Edit
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* TestCase Section */}
			{isExpanded && (
				<div className="border-t bg-muted/30 p-4">
					<h5 className="font-medium text-sm mb-3 flex items-center gap-2">
						<FileCode className="h-4 w-4" />
						Test Cases ({testCases.length})
					</h5>
					{testCasesLoading ? (
						<div className="flex justify-center py-4">
							<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						</div>
					) : testCases.length > 0 ? (
						<div className="space-y-3">
							{testCases.map((tc, idx) => (
								<div
									key={tc.testcaseId || idx}
									className="bg-background rounded-lg border p-3"
								>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium">
											Test Case #{tc.index || idx + 1}
										</span>
										<div className="flex items-center gap-2">
											{tc.is_hidden === 1 && (
												<Badge variant="outline" className="text-xs">
													Hidden
												</Badge>
											)}
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
															Delete test case?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() =>
																handleDeleteTestCase(tc.testcaseId)
															}
															className="bg-destructive hover:bg-destructive/90"
														>
															Delete
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
														value={question.score}
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
													Cancel
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
													Save
												</Button>
											</div>
										</div>
									) : (
										<div className="grid grid-cols-2 gap-3">
											<div>
												<p className="text-xs text-muted-foreground mb-1">
													Input:
												</p>
												<pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-24">
													{tc.input || '(empty)'}
												</pre>
											</div>
											<div>
												<p className="text-xs text-muted-foreground mb-1">
													Expected Output:
												</p>
												<pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-24">
													{tc.output || '(empty)'}
												</pre>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-4 text-sm text-muted-foreground">
							No test cases for this question yet
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default function AdminRoomDetailPage() {
	const params = useParams()
	const router = useRouter()
	const roomId = params.roomId as string
	const { toast } = useToast()

	const { data: room, isLoading, error } = useGetRoom(roomId)
	const { mutate: updateRoom, isPending: isUpdating } = useUpdateRoom(roomId)
	const { data: questions, isLoading: questionsLoading } =
		useGetRoomQuestions(roomId)
	const { data: participantsData, isLoading: participantsLoading } =
		useGetRoomParticipants(roomId)
	const { mutate: banUser, isPending: isBanning } = useBanUser(roomId)
	const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser(roomId)
	const { mutate: addStudents, isPending: isAddingStudents } =
		useAddStudentsToRoom(roomId)
	const { data: usersData, isLoading: usersLoading } = useGetAdminUsers()
	const { data: scoresData, isLoading: scoresLoading } =
		useGetRoomScores(roomId)
	const { mutate: updateQuestion, isPending: isUpdatingQuestion } =
		useUpdateQuestion()

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false)
	const [studentSearchQuery, setStudentSearchQuery] = useState('')
	const [selectedStudents, setSelectedStudents] = useState<
		{ studentId: string; studentFullName: string; studentEmail: string }[]
	>([])
	const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] =
		useState(false)
	const [editingQuestion, setEditingQuestion] = useState<RoomQuestion | null>(
		null
	)
	const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
		new Set()
	)
	const [banConfirmUser, setBanConfirmUser] = useState<Participant | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [editForm, setEditForm] = useState({
		name: '',
		openDate: '',
		openTime: '',
		closeDate: '',
		closeTime: ''
	})
	const [questionForm, setQuestionForm] = useState({
		title: '',
		descriptionPath: '',
		score: 10,
		timeLimit: 1000,
		memoryLimit: 256,
		order: 1
	})

	// Toggle question testcase visibility
	const toggleQuestion = (questionId: string) => {
		setExpandedQuestions(prev => {
			const newSet = new Set(prev)
			if (newSet.has(questionId)) {
				newSet.delete(questionId)
			} else {
				newSet.add(questionId)
			}
			return newSet
		})
	}

	// Handle edit question
	const handleEditQuestion = (question: RoomQuestion) => {
		setEditingQuestion(question)
		setQuestionForm({
			title: question.title,
			descriptionPath: question.descriptionPath || '',
			score: question.score,
			timeLimit: question.timeLimit,
			memoryLimit: question.memoryLimit,
			order: question.order
		})
		setIsEditQuestionDialogOpen(true)
	}

	// Handle ban/unban
	const handleBanUser = (user: Participant) => {
		banUser(user.studentId, {
			onSuccess: () => {
				toast({
					title: 'Thành công',
					description: `Đã cấm ${user.studentFullName} khỏi phòng thi`
				})
				setBanConfirmUser(null)
			},
			onError: (err: Error) => {
				toast({
					title: 'Lỗi',
					description: err.message,
					variant: 'destructive'
				})
			}
		})
	}

	const handleUnbanUser = (user: Participant) => {
		unbanUser(user.studentId, {
			onSuccess: () => {
				toast({
					title: 'Thành công',
					description: `Đã bỏ cấm ${user.studentFullName}`
				})
			},
			onError: (err: Error) => {
				toast({
					title: 'Lỗi',
					description: err.message,
					variant: 'destructive'
				})
			}
		})
	}

	const handleAddStudents = () => {
		if (selectedStudents.length === 0) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng chọn ít nhất một học sinh',
				variant: 'destructive'
			})
			return
		}

		const studentIds = selectedStudents.map(s => s.studentId)
		addStudents(studentIds, {
			onSuccess: (response: {
				data?: { added?: number; skipped?: number }
			}) => {
				const { added, skipped } = response.data || {}
				toast({
					title: 'Thành công',
					description: `Đã thêm ${
						added || selectedStudents.length
					} học sinh vào phòng thi${skipped ? ` (${skipped} bị bỏ qua)` : ''}`
				})
				setStudentSearchQuery('')
				setSelectedStudents([])
				setIsAddStudentDialogOpen(false)
			},
			onError: (err: Error) => {
				toast({
					title: 'Lỗi',
					description: err.message,
					variant: 'destructive'
				})
			}
		})
	}

	const toggleStudentSelection = (student: {
		studentId: string
		studentFullName: string
		studentEmail: string
	}) => {
		setSelectedStudents(prev => {
			const exists = prev.find(s => s.studentId === student.studentId)
			if (exists) {
				return prev.filter(s => s.studentId !== student.studentId)
			}
			return [...prev, student]
		})
	}

	const openEditDialog = () => {
		if (room) {
			const openDT = formatDateTime(room.openTime)
			const closeDT = formatDateTime(room.closeTime)
			setEditForm({
				name: room.name,
				openDate: openDT.dateInput,
				openTime: openDT.timeInput,
				closeDate: closeDT.dateInput,
				closeTime: closeDT.timeInput
			})
		}
		setIsEditDialogOpen(true)
	}

	const handleUpdateRoom = () => {
		const openTime = new Date(
			`${editForm.openDate}T${editForm.openTime}`
		).toISOString()
		const closeTime = new Date(
			`${editForm.closeDate}T${editForm.closeTime}`
		).toISOString()

		updateRoom(
			{ name: editForm.name, openTime, closeTime },
			{
				onSuccess: () => setIsEditDialogOpen(false)
			}
		)
	}

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (error || !room) {
		return (
			<div className="container mx-auto p-6">
				<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
					{error?.message || 'Exam room not found'}
				</div>
				<div className="mt-4 text-center">
					<Button variant="outline" onClick={() => router.push('/admin/rooms')}>
						Back to rooms list
					</Button>
				</div>
			</div>
		)
	}

	const openDT = formatDateTime(room.openTime)
	const closeDT = formatDateTime(room.closeTime)

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6">
				<Link
					href="/admin/rooms"
					className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to rooms list
				</Link>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">{room.name}</h1>
						<p className="text-muted-foreground">Room code: {room.code}</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-sm">
							{openDT.date} {openDT.time} - {closeDT.time}
						</Badge>
						<Button variant="outline" size="sm" onClick={openEditDialog}>
							<Settings className="mr-2 h-4 w-4" />
							Edit room
						</Button>
					</div>
				</div>
			</div>

			{/* Room Info Card */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Exam room information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<p className="text-xs text-muted-foreground">Room code</p>
							<p className="font-mono font-bold text-primary">{room.code}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Room name</p>
							<p className="font-medium">{room.name}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Open time</p>
							<p className="font-medium text-emerald-600">
								{openDT.time} - {openDT.date}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Close time</p>
							<p className="font-medium text-rose-600">
								{closeDT.time} - {closeDT.date}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="questions" className="space-y-4">
				<TabsList>
					<TabsTrigger value="questions" className="gap-2">
						<BookOpen className="h-4 w-4" />
						Questions & Test cases
					</TabsTrigger>
					<TabsTrigger value="participants" className="gap-2">
						<Users className="h-4 w-4" />
						Participants
					</TabsTrigger>
					<TabsTrigger value="leaderboard" className="gap-2">
						<Trophy className="h-4 w-4" />
						Leaderboard
					</TabsTrigger>
				</TabsList>

				<TabsContent value="questions">
					<Card>
						<CardHeader>
							<CardTitle>Question list</CardTitle>
							<CardDescription>
								Manage questions and test cases in this room (
								{questions?.length || 0} questions)
							</CardDescription>
						</CardHeader>
						<CardContent>
							{questionsLoading ? (
								<div className="flex justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : questions && questions.length > 0 ? (
								<div className="space-y-4">
									{questions.map((q, idx) => (
										<QuestionCard
											key={q.uuid}
											question={q}
											index={idx}
											isExpanded={expandedQuestions.has(q.uuid)}
											onToggle={() => toggleQuestion(q.uuid)}
											onEditQuestion={handleEditQuestion}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No questions in this room yet
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="participants">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Participants
								</CardTitle>
								<CardDescription>
									Manage students participating in this room (
									{participantsData?.participants?.length || 0} students)
								</CardDescription>
							</div>
							<Button
								onClick={() => setIsAddStudentDialogOpen(true)}
								className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
							>
								<UserPlus className="h-4 w-4 mr-2" />
								Add student
							</Button>
						</CardHeader>
						<CardContent>
							{/* Search Bar */}
							<div className="relative mb-4">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search by name or email..."
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>

							{participantsLoading ? (
								<div className="flex justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : participantsData?.participants &&
							  participantsData.participants.length > 0 ? (
								<div className="grid gap-3">
									{participantsData.participants
										.filter(p => {
											if (!searchQuery.trim()) return true
											const query = searchQuery.toLowerCase()
											return (
												p.studentFullName?.toLowerCase().includes(query) ||
												p.studentEmail?.toLowerCase().includes(query)
											)
										})
										.map(p => {
											const status = getParticipantStatus(
												p.joinedAt,
												room.openTime,
												room.closeTime
											)
											return (
												<Card
													key={p.participantId}
													className={`overflow-hidden transition-all hover:shadow-md ${
														p.isBanned
															? 'border-red-300 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50'
															: 'hover:border-primary/30'
													}`}
												>
													<CardContent className="p-4">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-4">
																{/* Avatar */}
																<div
																	className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm ${
																		p.isBanned
																			? 'bg-red-100 text-red-600 dark:bg-red-900/30'
																			: status.status === 'active'
																			? 'bg-green-100 text-green-600 dark:bg-green-900/30'
																			: status.status === 'not_joined'
																			? 'bg-gray-100 text-gray-500 dark:bg-gray-800'
																			: status.status === 'completed'
																			? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
																			: 'bg-primary/10 text-primary'
																	}`}
																>
																	{p.isBanned ? (
																		<Ban className="h-6 w-6" />
																	) : status.status === 'active' ? (
																		<CheckCircle2 className="h-6 w-6" />
																	) : status.status === 'not_joined' ? (
																		<AlertCircle className="h-6 w-6" />
																	) : (
																		p.studentFullName
																			?.charAt(0)
																			?.toUpperCase() || '?'
																	)}
																</div>

																{/* Info */}
																<div className="space-y-1">
																	<div className="flex items-center gap-2">
																		<h4 className="font-semibold text-base">
																			{p.studentFullName}
																		</h4>
																		{p.isBanned && (
																			<Badge
																				variant="destructive"
																				className="text-xs px-2"
																			>
																				<Ban className="h-3 w-3 mr-1" />
																				Banned
																			</Badge>
																		)}
																	</div>
																	<p className="text-sm text-muted-foreground">
																		{p.studentEmail}
																	</p>
																</div>
															</div>

															{/* Status & Actions */}
															<div className="flex items-center gap-4">
																{/* Status Badge */}
																<div className="text-right space-y-1">
																	<Badge
																		variant={
																			status.status === 'active'
																				? 'default'
																				: status.status === 'not_joined'
																				? 'secondary'
																				: status.status === 'completed'
																				? 'default'
																				: 'outline'
																		}
																		className={`${
																			status.status === 'active'
																				? 'bg-green-500 hover:bg-green-600'
																				: status.status === 'completed'
																				? 'bg-blue-500 hover:bg-blue-600'
																				: status.status === 'invalid'
																				? 'border-yellow-500 text-yellow-600 bg-yellow-50'
																				: ''
																		}`}
																	>
																		{status.status === 'active' && (
																			<span className="relative flex h-2 w-2 mr-1.5">
																				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
																				<span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
																			</span>
																		)}
																		{status.label}
																	</Badge>
																	{p.joinedAt && (
																		<p className="text-xs text-muted-foreground">
																			{new Date(p.joinedAt).toLocaleString(
																				'vi-VN'
																			)}
																		</p>
																	)}
																</div>

																{/* Action Button */}
																{p.isBanned ? (
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleUnbanUser(p)}
																		disabled={isUnbanning}
																		className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 min-w-[90px]"
																	>
																		{isUnbanning ? (
																			<Loader2 className="h-4 w-4 animate-spin" />
																		) : (
																			<>
																				<ShieldCheck className="h-4 w-4 mr-1.5" />
																				Unban
																			</>
																		)}
																	</Button>
																) : (
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => setBanConfirmUser(p)}
																		disabled={isBanning}
																		className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 min-w-[90px]"
																	>
																		<Ban className="h-4 w-4 mr-1.5" />
																		Ban
																	</Button>
																)}
															</div>
														</div>
													</CardContent>
												</Card>
											)
										})}
								</div>
							) : (
								<div className="text-center py-12 text-muted-foreground">
									<Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
									<p>No participants in this room yet</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="leaderboard">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5 text-yellow-500" />
								Leaderboard
							</CardTitle>
							<CardDescription>
								Ranking by descending total score
							</CardDescription>
						</CardHeader>
						<CardContent>
							{scoresLoading ? (
								<div className="flex justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : scoresData?.students && scoresData.students.length > 0 ? (
								<div className="space-y-3">
									{(() => {
										// Tách học sinh có điểm và không có điểm
										const studentsWithScore = [...scoresData.students]
											.filter(s => s.totalScore > 0)
											.sort((a, b) => b.totalScore - a.totalScore)
										const studentsWithoutScore = [
											...scoresData.students
										].filter(s => s.totalScore === 0)

										return [...studentsWithScore, ...studentsWithoutScore].map(
											student => {
												// Chỉ xếp hạng cho học sinh có điểm
												const hasScore = student.totalScore > 0
												const rank = hasScore
													? studentsWithScore.findIndex(
															s => s.studentId === student.studentId
													  ) + 1
													: 0
												const isTop3 = hasScore && rank <= 3
												return (
													<div
														key={student.studentId}
														className={`rounded-lg border p-4 transition-all ${
															rank === 1
																? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 dark:from-yellow-950/20 dark:to-amber-950/20'
																: rank === 2
																? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 dark:from-gray-950/20 dark:to-slate-950/20'
																: rank === 3
																? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 dark:from-orange-950/20 dark:to-amber-950/20'
																: 'hover:bg-muted/50'
														}`}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-4">
																{/* Rank Badge */}
																<div
																	className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
																		rank === 1
																			? 'bg-yellow-400 text-yellow-900'
																			: rank === 2
																			? 'bg-gray-300 text-gray-700'
																			: rank === 3
																			? 'bg-orange-400 text-orange-900'
																			: 'bg-muted text-muted-foreground'
																	}`}
																>
																	{isTop3 ? (
																		<Trophy
																			className={`h-6 w-6 ${
																				rank === 1
																					? 'text-yellow-900'
																					: rank === 2
																					? 'text-gray-700'
																					: 'text-orange-900'
																			}`}
																		/>
																	) : hasScore ? (
																		`#${rank}`
																	) : (
																		'-'
																	)}
																</div>

																{/* Student Info */}
																<div>
																	<div className="flex items-center gap-2">
																		<h4 className="font-semibold text-base">
																			{student.studentFullName}
																		</h4>
																		{isTop3 && (
																			<Badge
																				variant={
																					rank === 1 ? 'default' : 'secondary'
																				}
																				className={
																					rank === 1
																						? 'bg-yellow-500 hover:bg-yellow-600'
																						: rank === 2
																						? 'bg-gray-400 hover:bg-gray-500'
																						: 'bg-orange-500 hover:bg-orange-600'
																				}
																			>
																				Top {rank}
																			</Badge>
																		)}
																	</div>
																	<p className="text-sm text-muted-foreground">
																		{student.studentEmail}
																	</p>
																</div>
															</div>

															{/* Score */}
															<div className="text-right">
																<p
																	className={`text-2xl font-bold ${
																		isTop3 ? 'text-primary' : ''
																	}`}
																>
																	{student.totalScore}
																</p>
																<p className="text-xs text-muted-foreground">
																	points
																</p>
															</div>
														</div>

														{/* Questions Progress */}
														{student.questions &&
															student.questions.length > 0 && (
																<div className="mt-4 pt-4 border-t">
																	<p className="text-xs text-muted-foreground mb-2">
																		Submission details:
																	</p>
																	<div className="flex flex-wrap gap-2">
																		{student.questions.map((q, qIdx) => (
																			<div
																				key={q.questionId}
																				className={`px-3 py-1.5 rounded-md text-xs font-medium ${
																					q.solved
																						? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
																						: q.myScore > 0
																						? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
																						: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
																				}`}
																				title={q.title}
																			>
																				Q{qIdx + 1}: {q.myScore}/{q.maxScore}
																				{q.solved && (
																					<CheckCircle2 className="inline h-3 w-3 ml-1" />
																				)}
																			</div>
																		))}
																	</div>
																</div>
															)}
													</div>
												)
											}
										)
									})()}
								</div>
							) : (
								<div className="text-center py-12 text-muted-foreground">
									<Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
									<p>No score data yet</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Ban Confirm Dialog */}
			<AlertDialog
				open={!!banConfirmUser}
				onOpenChange={() => setBanConfirmUser(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm ban student</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to ban{' '}
							<span className="font-semibold">
								{banConfirmUser?.studentFullName}
							</span>{' '}
							from this room? The student will not be able to continue the exam.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => banConfirmUser && handleBanUser(banConfirmUser)}
							className="bg-red-500 hover:bg-red-600"
						>
							{isBanning ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Ban className="h-4 w-4 mr-2" />
							)}
							Confirm ban
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit Room Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit exam room</DialogTitle>
						<DialogDescription>Update exam room information</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Room name</Label>
							<Input
								value={editForm.name}
								onChange={e =>
									setEditForm({ ...editForm, name: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Open time</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="date"
										className="pl-10"
										value={editForm.openDate}
										onChange={e =>
											setEditForm({ ...editForm, openDate: e.target.value })
										}
									/>
								</div>
								<div className="relative flex items-center">
									<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="time"
										className="pl-10"
										value={editForm.openTime}
										onChange={e =>
											setEditForm({ ...editForm, openTime: e.target.value })
										}
									/>
									{editForm.openTime && (
										<span className="ml-2 text-sm font-medium text-primary">
											{getAmPm(editForm.openTime)}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Close time</Label>
							<div className="grid grid-cols-2 gap-2">
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="date"
										className="pl-10"
										value={editForm.closeDate}
										min={editForm.openDate}
										onChange={e =>
											setEditForm({ ...editForm, closeDate: e.target.value })
										}
									/>
								</div>
								<div className="relative flex items-center">
									<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="time"
										className="pl-10"
										value={editForm.closeTime}
										onChange={e =>
											setEditForm({ ...editForm, closeTime: e.target.value })
										}
									/>
									{editForm.closeTime && (
										<span className="ml-2 text-sm font-medium text-primary">
											{getAmPm(editForm.closeTime)}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleUpdateRoom} disabled={isUpdating}>
							{isUpdating ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Question Dialog */}
			<Dialog
				open={isEditQuestionDialogOpen}
				onOpenChange={open => {
					setIsEditQuestionDialogOpen(open)
					if (!open) setEditingQuestion(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit question {editingQuestion?.title}</DialogTitle>
						<DialogDescription>Update question information</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>Title *</Label>
							<Input
								value={questionForm.title}
								onChange={e =>
									setQuestionForm({ ...questionForm, title: e.target.value })
								}
								placeholder="Enter question title"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Description path</Label>
							<Input
								value={questionForm.descriptionPath}
								onChange={e =>
									setQuestionForm({
										...questionForm,
										descriptionPath: e.target.value
									})
								}
								placeholder="/questions/description.md"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Score</Label>
								<Input
									type="number"
									value={questionForm.score}
									onChange={e =>
										setQuestionForm({
											...questionForm,
											score: Number.parseInt(e.target.value) || 0
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Order</Label>
								<Input
									type="number"
									value={questionForm.order}
									onChange={e =>
										setQuestionForm({
											...questionForm,
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
									value={questionForm.timeLimit}
									onChange={e =>
										setQuestionForm({
											...questionForm,
											timeLimit: Number.parseInt(e.target.value) || 1000
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Memory Limit (KB)</Label>
								<Input
									type="number"
									value={questionForm.memoryLimit}
									onChange={e =>
										setQuestionForm({
											...questionForm,
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
							onClick={() => setIsEditQuestionDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (!editingQuestion) return
								updateQuestion(
									{
										questionId: editingQuestion.uuid,
										title: questionForm.title,
										descriptionPath: questionForm.descriptionPath,
										score: questionForm.score,
										timeLimit: questionForm.timeLimit,
										memoryLimit: questionForm.memoryLimit,
										order: questionForm.order,
										roomId: editingQuestion.roomUuid
									},
									{
										onSuccess: () => {
											toast({
												title: 'Thành công',
												description: 'Đã cập nhật câu hỏi'
											})
											setIsEditQuestionDialogOpen(false)
											setEditingQuestion(null)
										},
										onError: (err: Error) => {
											toast({
												title: 'Lỗi',
												description:
													err.message || 'Không thể cập nhật câu hỏi',
												variant: 'destructive'
											})
										}
									}
								)
							}}
							disabled={isUpdatingQuestion || !questionForm.title.trim()}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							{isUpdatingQuestion ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : null}
							Update
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Students Dialog */}
			<Dialog
				open={isAddStudentDialogOpen}
				onOpenChange={open => {
					setIsAddStudentDialogOpen(open)
					if (!open) {
						setStudentSearchQuery('')
						setSelectedStudents([])
					}
				}}
			>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Add students to room</DialogTitle>
						<DialogDescription>
							Search and select multiple students to add to this room
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{/* Search Input */}
						<div className="space-y-2">
							<Label>Search students</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Enter name, email or student ID..."
									className="pl-10"
									value={studentSearchQuery}
									onChange={e => setStudentSearchQuery(e.target.value)}
								/>
							</div>
						</div>

						{/* Student List */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Student list</Label>
								{selectedStudents.length > 0 && (
									<Badge variant="secondary">
										{selectedStudents.length} selected
									</Badge>
								)}
							</div>
							<ScrollArea className="h-[250px] border rounded-md">
								{usersLoading ? (
									<div className="flex justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : usersData?.data && usersData.data.length > 0 ? (
									<div className="p-2 space-y-1">
										{usersData.data
											.filter(user => {
												if (!studentSearchQuery.trim()) return true
												const query = studentSearchQuery.toLowerCase()
												return (
													user.studentFullName?.toLowerCase().includes(query) ||
													user.studentEmail?.toLowerCase().includes(query) ||
													user.studentId?.toLowerCase().includes(query)
												)
											})
											.filter(user => {
												// Exclude students already in the room
												const existingIds =
													participantsData?.participants?.map(
														p => p.studentId
													) || []
												return !existingIds.includes(user.studentId)
											})
											.map(user => {
												const isSelected = selectedStudents.some(
													s => s.studentId === user.studentId
												)
												return (
													<div
														key={user.studentId}
														className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
															isSelected
																? 'bg-primary/10 border border-primary'
																: 'hover:bg-muted'
														}`}
														onClick={() =>
															toggleStudentSelection({
																studentId: user.studentId,
																studentFullName: user.studentFullName,
																studentEmail: user.studentEmail
															})
														}
													>
														<div className="flex items-center gap-3">
															<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
																<span className="font-semibold text-primary">
																	{user.studentFullName
																		?.charAt(0)
																		?.toUpperCase() || '?'}
																</span>
															</div>
															<div>
																<p className="font-medium text-sm">
																	{user.studentFullName}
																</p>
																<p className="text-xs text-muted-foreground">
																	{user.studentEmail}
																</p>
															</div>
														</div>
														{isSelected && (
															<Check className="h-5 w-5 text-primary" />
														)}
													</div>
												)
											})}
										{usersData.data
											.filter(user => {
												if (!studentSearchQuery.trim()) return true
												const query = studentSearchQuery.toLowerCase()
												return (
													user.studentFullName?.toLowerCase().includes(query) ||
													user.studentEmail?.toLowerCase().includes(query) ||
													user.studentId?.toLowerCase().includes(query)
												)
											})
											.filter(user => {
												const existingIds =
													participantsData?.participants?.map(
														p => p.studentId
													) || []
												return !existingIds.includes(user.studentId)
											}).length === 0 && (
											<div className="text-center py-8 text-muted-foreground text-sm">
												No matching students found
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground text-sm">
										No students in the system
									</div>
								)}
							</ScrollArea>
						</div>

						{/* Selected Students Info */}
						{selectedStudents.length > 0 && (
							<div className="bg-muted/50 rounded-lg p-3">
								<p className="text-xs text-muted-foreground mb-2">
									Selected ({selectedStudents.length}):
								</p>
								<div className="flex flex-wrap gap-2">
									{selectedStudents.map(s => (
										<Badge
											key={s.studentId}
											variant="secondary"
											className="cursor-pointer hover:bg-destructive/20"
											onClick={() => toggleStudentSelection(s)}
										>
											{s.studentFullName}
											<span className="ml-1 text-muted-foreground">×</span>
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsAddStudentDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddStudents}
							disabled={isAddingStudents || selectedStudents.length === 0}
							className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
						>
							{isAddingStudents ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<UserPlus className="h-4 w-4 mr-2" />
							)}
							Add {selectedStudents.length > 0 ? selectedStudents.length : ''}{' '}
							student{selectedStudents.length !== 1 ? 's' : ''}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
