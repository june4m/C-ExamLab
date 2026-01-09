'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import {
	ArrowLeft,
	Plus,
	X,
	Save,
	AlertCircle,
	Trash2,
	FileUp,
	Loader2,
	Copy,
	Check,
	Download,
	FileSpreadsheet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
	useGetQuizzes,
	useGetQuiz,
	useImportQuizQuestions,
	useCopyQuestionsFromQuiz
} from '@/service/admin/quiz.service'
import type { Question, Answer } from '@/interface/admin/quiz.interface'

// Excel column headers
const EXCEL_HEADERS = [
	'content',
	'points',
	'type',
	'answer1',
	'correct1',
	'answer2',
	'correct2',
	'answer3',
	'correct3',
	'answer4',
	'correct4'
]

const createSampleExcelData = () => [
	EXCEL_HEADERS,
	[
		'What is the capital of Vietnam?',
		1,
		'MULTIPLE_CHOICE',
		'Hanoi',
		'TRUE',
		'Ho Chi Minh',
		'FALSE',
		'Da Nang',
		'FALSE',
		'Hue',
		'FALSE'
	],
	[
		'1 + 1 = 2?',
		1,
		'TRUE_FALSE',
		'True',
		'TRUE',
		'False',
		'FALSE',
		'',
		'',
		'',
		''
	]
]

export default function AddQuestionsPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const preselectedQuizId = searchParams.get('quizId')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [error, setError] = useState<string | null>(null)
	const [selectedQuizUuid, setSelectedQuizUuid] = useState(
		preselectedQuizId || ''
	)
	const [addMethod, setAddMethod] = useState<'manual' | 'copy'>('manual')
	const [showImportGuide, setShowImportGuide] = useState(false)

	// Data fetching
	const { data: quizzes } = useGetQuizzes()
	const { data: selectedQuiz, isLoading: isLoadingQuiz } =
		useGetQuiz(selectedQuizUuid)

	// Manual add questions state
	const [questions, setQuestions] = useState<
		Array<Question & { tempId: string }>
	>([])

	// Copy from quiz state
	const [sourceQuizUuid, setSourceQuizUuid] = useState('')
	const { data: sourceQuiz, isLoading: isLoadingSourceQuiz } =
		useGetQuiz(sourceQuizUuid)
	const [selectedQuestionUuids, setSelectedQuestionUuids] = useState<string[]>(
		[]
	)

	// Mutations
	const { mutate: importQuestions, isPending: isImporting } =
		useImportQuizQuestions()
	const { mutate: copyQuestions, isPending: isCopying } =
		useCopyQuestionsFromQuiz()

	// Question management
	const addQuestion = () => {
		setQuestions([
			...questions,
			{
				tempId: `temp-${Date.now()}-${Math.random()}`,
				content: '',
				points: 1,
				type: 'MULTIPLE_CHOICE',
				answers: [
					{ content: '', isCorrect: false },
					{ content: '', isCorrect: false }
				]
			}
		])
	}

	const removeQuestion = (index: number) =>
		setQuestions(questions.filter((_, i) => i !== index))

	const updateQuestion = (
		index: number,
		field: keyof Question,
		value: string | number
	) => {
		const updated = [...questions]
		updated[index] = { ...updated[index], [field]: value }
		setQuestions(updated)
	}

	const addAnswer = (qIdx: number) => {
		const updated = [...questions]
		updated[qIdx].answers = [
			...updated[qIdx].answers,
			{ content: '', isCorrect: false }
		]
		setQuestions(updated)
	}

	const removeAnswer = (qIdx: number, aIdx: number) => {
		const updated = [...questions]
		updated[qIdx].answers = updated[qIdx].answers.filter((_, i) => i !== aIdx)
		setQuestions(updated)
	}

	const updateAnswer = (
		qIdx: number,
		aIdx: number,
		field: keyof Answer,
		value: string | boolean
	) => {
		const updated = [...questions]
		updated[qIdx].answers[aIdx] = {
			...updated[qIdx].answers[aIdx],
			[field]: value
		}
		setQuestions(updated)
	}

	// Import from Excel file
	const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = event => {
			try {
				const data = new Uint8Array(event.target?.result as ArrayBuffer)
				const workbook = XLSX.read(data, { type: 'array' })
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

				const dataRows = rows.slice(1).filter(row => row.length > 0 && row[0])

				const imported: Array<Question & { tempId: string }> = []
				for (const row of dataRows) {
					const content = String(row[0] || '').trim()
					if (!content) continue

					const points = Number(row[1]) || 1
					const rawType = String(row[2] || '')
						.trim()
						.toUpperCase()
					const type = rawType.includes('TRUE')
						? 'TRUE_FALSE'
						: 'MULTIPLE_CHOICE'

					const answers: Answer[] = []
					for (let i = 3; i < row.length; i += 2) {
						const answerContent = String(row[i] || '').trim()
						if (!answerContent) continue
						const isCorrect = String(row[i + 1] || '').toUpperCase() === 'TRUE'
						answers.push({ content: answerContent, isCorrect })
					}

					if (answers.length >= 2) {
						imported.push({
							tempId: `temp-${Date.now()}-${Math.random()}`,
							content,
							points,
							type,
							answers
						})
					}
				}

				if (imported.length === 0) {
					toast.error('No valid questions found in file')
					return
				}

				setQuestions([...questions, ...imported])
				toast.success(`Imported ${imported.length} questions from ${file.name}`)
				setShowImportGuide(false)
			} catch (err) {
				console.error('Import error:', err)
				toast.error('Invalid Excel file')
			}
		}
		reader.readAsArrayBuffer(file)
		e.target.value = ''
	}

	const downloadSampleFile = () => {
		const data = createSampleExcelData()
		const ws = XLSX.utils.aoa_to_sheet(data)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, 'Questions')
		XLSX.writeFile(wb, 'sample-questions.xlsx')
	}

	// Copy questions selection
	const toggleSelectQuestion = (uuid: string) => {
		if (selectedQuestionUuids.includes(uuid)) {
			setSelectedQuestionUuids(selectedQuestionUuids.filter(id => id !== uuid))
		} else {
			setSelectedQuestionUuids([...selectedQuestionUuids, uuid])
		}
	}

	const selectAllQuestions = () => {
		if (sourceQuiz?.questions)
			setSelectedQuestionUuids(sourceQuiz.questions.map(q => q.uuid))
	}

	const deselectAllQuestions = () => setSelectedQuestionUuids([])

	// Validation
	const validateQuestions = (): boolean => {
		if (questions.length === 0) {
			setError('At least 1 question is required')
			return false
		}
		for (let i = 0; i < questions.length; i++) {
			const q = questions[i]
			if (!q.content.trim()) {
				setError(`Question ${i + 1}: Content is empty`)
				return false
			}
			if (q.answers.length < 2) {
				setError(`Question ${i + 1}: At least 2 answers required`)
				return false
			}
			if (!q.answers.some(a => a.isCorrect)) {
				setError(`Question ${i + 1}: At least 1 correct answer required`)
				return false
			}
			if (q.answers.some(a => !a.content.trim())) {
				setError(`Question ${i + 1}: Answer content cannot be empty`)
				return false
			}
		}
		return true
	}

	// Submit handlers
	const handleManualSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		if (!selectedQuizUuid) {
			setError('Please select a quiz')
			return
		}
		if (!validateQuestions()) return

		importQuestions(
			{
				quizUuid: selectedQuizUuid,
				questions: questions.map(q => ({
					content: q.content,
					points: q.points,
					type: q.type,
					answers: q.answers
				}))
			},
			{
				onSuccess: data => {
					toast.success(`Added ${data.imported} questions`)
					router.push(`/admin/quizzes/${data.quizUuid}`)
				},
				onError: (err: Error) =>
					setError(err.message || 'Failed to add questions')
			}
		)
	}

	const handleCopySubmit = async () => {
		setError(null)
		if (!selectedQuizUuid) {
			setError('Please select target quiz')
			return
		}
		if (!sourceQuizUuid) {
			setError('Please select source quiz')
			return
		}
		if (selectedQuizUuid === sourceQuizUuid) {
			setError('Source and target quiz cannot be the same')
			return
		}

		copyQuestions(
			{
				targetQuizId: selectedQuizUuid,
				payload: {
					sourceQuizUuid,
					questionUuids:
						selectedQuestionUuids.length > 0 ? selectedQuestionUuids : undefined
				}
			},
			{
				onSuccess: data => {
					toast.success(`Copied ${data.copied} questions`)
					router.push(`/admin/quizzes/${selectedQuizUuid}`)
				},
				onError: (err: Error) =>
					setError(err.message || 'Failed to copy questions')
			}
		)
	}

	const isPending = isImporting || isCopying
	const availableSourceQuizzes =
		quizzes?.filter(q => q.uuid !== selectedQuizUuid) || []

	return (
		<div className="container mx-auto max-w-4xl p-6">
			<input
				ref={fileInputRef}
				type="file"
				accept=".xlsx,.xls"
				onChange={handleFileImport}
				className="hidden"
			/>

			<div className="mb-6">
				<Link
					href="/admin/quizzes"
					className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to quiz list
				</Link>
				<h1 className="text-2xl font-bold">Add Questions to Quiz</h1>
				<p className="text-muted-foreground">
					Add new questions or copy from another quiz
				</p>
			</div>

			{error && (
				<div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					<AlertCircle className="h-4 w-4" />
					<span>{error}</span>
				</div>
			)}

			{/* Select Target Quiz */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Select Target Quiz</CardTitle>
					<CardDescription>Quiz to add questions to</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Quiz *</Label>
						<Select
							value={selectedQuizUuid}
							onValueChange={setSelectedQuizUuid}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select quiz" />
							</SelectTrigger>
							<SelectContent>
								{quizzes?.map(q => (
									<SelectItem key={q.uuid} value={q.uuid}>
										{q.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{selectedQuizUuid && (
						<Card className="bg-muted/30">
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Existing Questions</CardTitle>
							</CardHeader>
							<CardContent>
								{isLoadingQuiz ? (
									<div className="flex justify-center py-4">
										<Loader2 className="h-5 w-5 animate-spin" />
									</div>
								) : selectedQuiz?.questions?.length ? (
									<>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{selectedQuiz.questions.map((q, idx) => (
												<div
													key={q.uuid}
													className="flex items-start justify-between p-2 rounded-md bg-background border text-sm"
												>
													<div className="flex-1">
														<span className="font-medium">Q{idx + 1}:</span>{' '}
														<span className="text-muted-foreground line-clamp-1">
															{q.content}
														</span>
													</div>
													<Badge variant="outline" className="ml-2 shrink-0">
														{q.points} pts
													</Badge>
												</div>
											))}
										</div>
										<p className="text-xs text-muted-foreground mt-2">
											Total: {selectedQuiz.questions.length} questions,{' '}
											{selectedQuiz.questions.reduce((s, q) => s + q.points, 0)}{' '}
											points
										</p>
									</>
								) : (
									<p className="text-sm text-muted-foreground py-2">
										This quiz has no questions yet
									</p>
								)}
							</CardContent>
						</Card>
					)}
				</CardContent>
			</Card>

			{/* Add Method Tabs */}
			<Tabs
				value={addMethod}
				onValueChange={v => setAddMethod(v as 'manual' | 'copy')}
			>
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="manual">
						<Plus className="h-4 w-4 mr-2" />
						Add Manually
					</TabsTrigger>
					<TabsTrigger value="copy">
						<Copy className="h-4 w-4 mr-2" />
						Copy from Quiz
					</TabsTrigger>
				</TabsList>

				{/* Manual Add Tab */}
				<TabsContent value="manual">
					<form onSubmit={handleManualSubmit} className="space-y-6">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>New Questions</CardTitle>
										<CardDescription>
											{questions.length} questions •{' '}
											{questions.reduce((s, q) => s + q.points, 0)} points
										</CardDescription>
									</div>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowImportGuide(true)}
										>
											<FileSpreadsheet className="h-4 w-4 mr-2" />
											Import Excel
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={addQuestion}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Question
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								{questions.map((question, qIdx) => (
									<Card key={question.tempId} className="border-2">
										<CardHeader>
											<div className="flex items-start justify-between">
												<CardTitle className="text-lg">
													Question {qIdx + 1}
												</CardTitle>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeQuestion(qIdx)}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="space-y-2">
												<Label>Question Content *</Label>
												<Textarea
													placeholder="Enter question content"
													value={question.content}
													onChange={e =>
														updateQuestion(qIdx, 'content', e.target.value)
													}
													rows={3}
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label>Points</Label>
													<Input
														type="number"
														min="0"
														step="0.1"
														value={question.points}
														onChange={e =>
															updateQuestion(
																qIdx,
																'points',
																parseFloat(e.target.value) || 0
															)
														}
													/>
												</div>
												<div className="space-y-2">
													<Label>Type</Label>
													<Select
														value={question.type}
														onValueChange={v => updateQuestion(qIdx, 'type', v)}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="MULTIPLE_CHOICE">
																Multiple Choice
															</SelectItem>
															<SelectItem value="TRUE_FALSE">
																True/False
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label>Answers *</Label>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => addAnswer(qIdx)}
													>
														<Plus className="h-3 w-3 mr-1" />
														Add Answer
													</Button>
												</div>
												{question.answers.map((answer, aIdx) => (
													<div
														key={aIdx}
														className="flex items-start gap-3 rounded-md border p-3"
													>
														<div className="flex items-center gap-2 mt-1">
															<Checkbox
																checked={answer.isCorrect}
																onCheckedChange={c =>
																	updateAnswer(qIdx, aIdx, 'isCorrect', !!c)
																}
																id={`c-${qIdx}-${aIdx}`}
															/>
															<label
																htmlFor={`c-${qIdx}-${aIdx}`}
																className="text-sm text-muted-foreground cursor-pointer whitespace-nowrap"
															>
																Correct
															</label>
														</div>
														<Input
															placeholder="Enter answer content"
															value={answer.content}
															onChange={e =>
																updateAnswer(
																	qIdx,
																	aIdx,
																	'content',
																	e.target.value
																)
															}
															className="flex-1"
														/>
														{question.answers.length > 2 && (
															<Button
																type="button"
																variant="ghost"
																size="icon"
																onClick={() => removeAnswer(qIdx, aIdx)}
																className="text-destructive hover:text-destructive"
															>
																<X className="h-4 w-4" />
															</Button>
														)}
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								))}
								{questions.length === 0 && (
									<div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
										No questions yet. Use the buttons above to add questions.
									</div>
								)}
							</CardContent>
						</Card>

						<div className="flex gap-4">
							<Button
								type="button"
								variant="outline"
								className="flex-1"
								onClick={() => router.push('/admin/quizzes')}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="flex-1"
								disabled={isPending || !selectedQuizUuid}
							>
								{isImporting ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Adding...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Add Questions
									</>
								)}
							</Button>
						</div>
					</form>
				</TabsContent>

				{/* Copy from Quiz Tab */}
				<TabsContent value="copy">
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Select Source Quiz</CardTitle>
							<CardDescription>Quiz to copy questions from</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Source Quiz *</Label>
								<Select
									value={sourceQuizUuid}
									onValueChange={v => {
										setSourceQuizUuid(v)
										setSelectedQuestionUuids([])
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select source quiz" />
									</SelectTrigger>
									<SelectContent>
										{availableSourceQuizzes.map(q => (
											<SelectItem key={q.uuid} value={q.uuid}>
												{q.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{sourceQuizUuid && (
								<Card className="bg-muted/30">
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle className="text-base">
												Select Questions to Copy
											</CardTitle>
											<div className="flex gap-2">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={selectAllQuestions}
												>
													<Check className="h-4 w-4 mr-1" />
													Select All
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={deselectAllQuestions}
												>
													<X className="h-4 w-4 mr-1" />
													Deselect
												</Button>
											</div>
										</div>
										<CardDescription>
											{selectedQuestionUuids.length === 0
												? 'Leave empty to copy all questions'
												: `Selected ${selectedQuestionUuids.length} questions`}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isLoadingSourceQuiz ? (
											<div className="flex justify-center py-4">
												<Loader2 className="h-5 w-5 animate-spin" />
											</div>
										) : sourceQuiz?.questions?.length ? (
											<div className="space-y-2 max-h-64 overflow-y-auto">
												{sourceQuiz.questions.map((q, idx) => (
													<div
														key={q.uuid}
														className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
															selectedQuestionUuids.includes(q.uuid)
																? 'bg-primary/10 border-primary'
																: 'bg-background hover:bg-muted/50'
														}`}
														onClick={() => toggleSelectQuestion(q.uuid)}
													>
														<Checkbox
															checked={selectedQuestionUuids.includes(q.uuid)}
															onCheckedChange={() =>
																toggleSelectQuestion(q.uuid)
															}
														/>
														<div className="flex-1">
															<span className="font-medium">Q{idx + 1}:</span>{' '}
															<span className="text-muted-foreground">
																{q.content}
															</span>
														</div>
														<Badge variant="outline">{q.points} pts</Badge>
													</div>
												))}
											</div>
										) : (
											<p className="text-sm text-muted-foreground py-2">
												This quiz has no questions
											</p>
										)}
									</CardContent>
								</Card>
							)}
						</CardContent>
					</Card>

					<div className="flex gap-4">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={() => router.push('/admin/quizzes')}
						>
							Cancel
						</Button>
						<Button
							type="button"
							className="flex-1"
							disabled={isPending || !selectedQuizUuid || !sourceQuizUuid}
							onClick={handleCopySubmit}
						>
							{isCopying ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Copying...
								</>
							) : (
								<>
									<Copy className="mr-2 h-4 w-4" />
									Copy{' '}
									{selectedQuestionUuids.length > 0
										? `${selectedQuestionUuids.length} questions`
										: 'all'}
								</>
							)}
						</Button>
					</div>
				</TabsContent>
			</Tabs>

			{/* Import Guide Dialog */}
			<Dialog open={showImportGuide} onOpenChange={setShowImportGuide}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileSpreadsheet className="h-5 w-5" />
							Import from Excel
						</DialogTitle>
						<DialogDescription>
							Download the sample file and fill in your questions
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="rounded-lg border bg-muted/50 p-4 space-y-3">
							<p className="text-sm font-medium">Excel columns:</p>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div className="flex items-center gap-2">
									<span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
										content
									</span>
									<span className="text-muted-foreground">Question text</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
										points
									</span>
									<span className="text-muted-foreground">Score (1)</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
										type
									</span>
									<span className="text-muted-foreground">MC / TF</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
										answer1-4
									</span>
									<span className="text-muted-foreground">Answers</span>
								</div>
								<div className="flex items-center gap-2 col-span-2">
									<span className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
										correct1-4
									</span>
									<span className="text-muted-foreground">TRUE / FALSE</span>
								</div>
							</div>
						</div>
						<div className="text-xs text-muted-foreground space-y-1">
							<p>
								• Type:{' '}
								<code className="bg-muted px-1 rounded">MULTIPLE_CHOICE</code>{' '}
								or <code className="bg-muted px-1 rounded">TRUE_FALSE</code>
							</p>
							<p>• At least 2 answers required per question</p>
						</div>
					</div>
					<DialogFooter className="flex-col gap-2 sm:flex-col">
						<Button
							variant="outline"
							onClick={downloadSampleFile}
							className="w-full"
						>
							<Download className="h-4 w-4 mr-2" />
							Download Sample File
						</Button>
						<Button
							onClick={() => fileInputRef.current?.click()}
							className="w-full"
						>
							<FileUp className="h-4 w-4 mr-2" />
							Select Excel File
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
