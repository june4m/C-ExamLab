'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Eye, Plus, Loader2, FileCode } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useCreateQuestion } from '@/service/admin/question.service'
import { useCreateTestCase } from '@/service/admin/testcase.service'

interface RoomCardProps {
	roomId: string
	roomUuid?: string
	roomName: string

	creatorName?: string
	creatorEmail?: string
	openTime: string
	openDate: string
	closeTime: string
	closeDate: string
	className?: string
}

export const RoomCard = React.forwardRef<HTMLDivElement, RoomCardProps>(
	(
		{
			roomId,
			roomUuid,
			roomName,
			creatorName: _creatorName,
			creatorEmail: _creatorEmail,
			openTime,
			openDate,
			closeTime,
			closeDate,
			className,
			...props
		},
		ref
	) => {
		const linkId = roomUuid || roomId
		const { toast } = useToast()
		const createQuestion = useCreateQuestion()
		const createTestCase = useCreateTestCase()

		const [isDialogOpen, setIsDialogOpen] = React.useState(false)
		const [createdQuestionId, setCreatedQuestionId] =
			React.useState<string | null>(null)
		const [currentStep, setCurrentStep] = React.useState<1 | 2>(1)
		const [questionForm, setQuestionForm] = React.useState({
			title: '',
			descriptionPath: '',
			score: 10,
			timeLimit: 1000,
			memoryLimit: 256,
			order: 1
		})
		const [testCaseForm, setTestCaseForm] = React.useState({
			index: 1,
			input_path: '',
			output_path: '',
			is_hidden: false
		})

		const handleCreateQuestion = () => {
			if (!questionForm.title || !roomUuid) {
				toast({
					title: 'Error',
					description: 'Please enter question title',
					variant: 'destructive'
				})
				return
			}

			createQuestion.mutate(
				{
					...questionForm,
					roomId: roomUuid,
					descriptionPath: questionForm.descriptionPath
				},
				{
					onSuccess: data => {
						const newId = data?.data?.questionUuid
						setCreatedQuestionId(newId || null)
						setCurrentStep(2)
						toast({
							title: 'Success',
							description: 'Question created for this room'
						})
					},
					onError: (error: unknown) => {
						console.error('Create question error:', error)
						const message =
							(
								error as {
									response?: {
										data?: { error?: string; message?: string }
									}
									message?: string
								}
							)?.response?.data?.error ||
							(
								error as {
									response?: {
										data?: { error?: string; message?: string }
									}
									message?: string
								}
							)?.response?.data?.message ||
							(error as { message?: string })?.message ||
							'Cannot create question'
						toast({
							title: 'Error',
							description: message,
							variant: 'destructive'
						})
					}
				}
			)
		}

		const handleCreateTestCase = () => {
			if (!createdQuestionId) {
				toast({
					title: 'Error',
					description: 'Create question first before adding test case',
					variant: 'destructive'
				})
				return
			}

			createTestCase.mutate(
				{
					questionId: createdQuestionId,
					...testCaseForm
				},
				{
					onSuccess: () => {
						toast({
							title: 'Success',
							description: 'Test case added for this question'
						})
						setTestCaseForm(prev => ({
							...prev,
							index: prev.index + 1,
							input_path: '',
							output_path: ''
						}))
					},
					onError: (error: unknown) => {
						console.error('Create testcase error:', error)
						const message =
							(error as { message?: string })?.message ||
							'Cannot create test case'
						toast({
							title: 'Error',
							description: message,
							variant: 'destructive'
						})
					}
				}
			)
		}

		const handleCloseDialog = () => {
			setIsDialogOpen(false)
			setCreatedQuestionId(null)
			setCurrentStep(1)
			setQuestionForm({
				title: '',
				descriptionPath: '',
				score: 10,
				timeLimit: 1000,
				memoryLimit: 256,
				order: 1
			})
			setTestCaseForm({
				index: 1,
				input_path: '',
				output_path: '',
				is_hidden: false
			})
		}

		return (
			<div
				ref={ref}
				className={cn(
					'group relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/30',
					className
				)}
				{...props}
			>
				{/*
					Legacy Top Section - Avatar, Name, Email
					Kept here (commented) so we can easily bring it back later if needed.

				<div className="mb-4 flex flex-col items-center">
					<div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
						<User className="h-7 w-7 text-primary/70" />
					</div>
					<p className="text-sm text-muted-foreground">
						{creatorEmail || creatorName || 'Admin'}
					</p>
				</div>
				*/}

				{/* Room Name */}
				<div className="mb-3 text-center">
					<p className="text-lg font-bold text-foreground">{roomName}</p>
				</div>

				{/* Room ID Badge */}
				<div className="mb-4 flex justify-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
						<span className="text-xs text-muted-foreground">Room code:</span>
						<span className="font-mono font-bold text-primary">{roomId}</span>
					</div>
				</div>

				{/* Divider */}
				<div className="mb-3 border-t" />

				{/* Bottom Section - Open/Close Time & Actions */}
				<div className="flex items-end justify-between gap-3">
					<div>
						<p className="text-xs font-medium text-emerald-600">Open</p>
						<p className="text-base font-bold text-foreground">{openTime}</p>
						<p className="text-xs text-muted-foreground">{openDate}</p>
					</div>
					<div className="text-right">
						<p className="text-xs font-medium text-rose-600">Close</p>
						<p className="text-base font-bold text-foreground">{closeTime}</p>
						<p className="text-xs text-muted-foreground">{closeDate}</p>
					</div>
				</div>

				{/* Quick actions */}
				<div className="mt-4 flex items-center justify-between gap-2">
					<Dialog
						open={isDialogOpen}
						onOpenChange={open =>
							open ? setIsDialogOpen(true) : handleCloseDialog()
						}
					>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm" className="text-xs">
								<Plus className="mr-1 h-3 w-3" />
								Add question / test case
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-lg">
							<DialogHeader>
								<DialogTitle>Add question for this room</DialogTitle>
								<DialogDescription>
									Quickly create question and test cases for room{' '}
									<span className="font-semibold">{roomName}</span>
								</DialogDescription>
							</DialogHeader>

							{/* Wizard header */}
							<div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium">
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setCurrentStep(1)}
										className={cn(
											'inline-flex items-center gap-1 rounded-full px-3 py-1',
											currentStep === 1
												? 'bg-primary text-primary-foreground'
												: 'bg-muted text-muted-foreground'
										)}
									>
										<span className="h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center">
											1
										</span>
										<span>Question info</span>
									</button>
									<button
										type="button"
										onClick={() => createdQuestionId && setCurrentStep(2)}
										className={cn(
											'inline-flex items-center gap-1 rounded-full px-3 py-1',
											currentStep === 2
												? 'bg-primary text-primary-foreground'
												: 'bg-muted text-muted-foreground',
											!createdQuestionId && 'cursor-not-allowed opacity-60'
										)}
									>
										<span className="h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center">
											2
										</span>
										<span>Test case</span>
									</button>
								</div>
								{createdQuestionId && (
									<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
										<FileCode className="h-3 w-3" />
										Question ready
									</span>
								)}
							</div>

							{/* Wizard body */}
							{currentStep === 1 ? (
								<div className="space-y-3 rounded-md border p-3">
									<p className="text-xs font-semibold uppercase text-muted-foreground">
										Step 1 · Question info
									</p>
									<div className="grid gap-2">
										<Label>Title *</Label>
										<Input
											value={questionForm.title}
											onChange={e =>
												setQuestionForm(prev => ({
													...prev,
													title: e.target.value
												}))
											}
											placeholder="Enter question title"
											disabled={createQuestion.isPending}
										/>
									</div>
									<div className="grid gap-2">
										<Label>Description path</Label>
										<Input
											value={questionForm.descriptionPath}
											onChange={e =>
												setQuestionForm(prev => ({
													...prev,
													descriptionPath: e.target.value
												}))
											}
											placeholder="/questions/description.md"
											disabled={createQuestion.isPending}
										/>
									</div>
									<div className="grid grid-cols-3 gap-3">
										<div className="grid gap-1">
											<Label>Score</Label>
											<Input
												type="number"
												value={questionForm.score}
												onChange={e =>
													setQuestionForm(prev => ({
														...prev,
														score: Number.parseInt(e.target.value) || 0
													}))
												}
												disabled={createQuestion.isPending}
											/>
										</div>
										<div className="grid gap-1">
											<Label>Time (ms)</Label>
											<Input
												type="number"
												value={questionForm.timeLimit}
												onChange={e =>
													setQuestionForm(prev => ({
														...prev,
														timeLimit:
															Number.parseInt(e.target.value) || 1000
													}))
												}
												disabled={createQuestion.isPending}
											/>
										</div>
										<div className="grid gap-1">
											<Label>Memory (MB)</Label>
											<Input
												type="number"
												value={questionForm.memoryLimit}
												onChange={e =>
													setQuestionForm(prev => ({
														...prev,
														memoryLimit:
															Number.parseInt(e.target.value) || 256
													}))
												}
												disabled={createQuestion.isPending}
											/>
										</div>
									</div>
									<div className="grid gap-1">
											<Label>Order</Label>
										<Input
											type="number"
											value={questionForm.order}
											onChange={e =>
												setQuestionForm(prev => ({
													...prev,
													order: Number.parseInt(e.target.value) || 1
												}))
											}
											disabled={createQuestion.isPending}
										/>
									</div>
									<div className="flex items-center justify-between gap-2 pt-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleCloseDialog}
										>
											Cancel
										</Button>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => createdQuestionId && setCurrentStep(2)}
												disabled={!createdQuestionId}
											>
												Go to step 2
											</Button>
											<Button
												size="sm"
												onClick={handleCreateQuestion}
												disabled={createQuestion.isPending}
												className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
											>
												{createQuestion.isPending && (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												)}
												Create question
											</Button>
										</div>
									</div>
								</div>
							) : (
								<div className="space-y-3 rounded-md border bg-muted/40 p-3">
									<p className="text-xs font-semibold uppercase text-muted-foreground">
										Step 2 · Add test case
									</p>
									{!createdQuestionId && (
										<p className="text-xs text-destructive">
											Please create question in step 1 first.
										</p>
									)}
									<div className="grid grid-cols-2 gap-3">
										<div className="grid gap-1">
											<Label>Index</Label>
											<Input
												type="number"
												value={testCaseForm.index}
												onChange={e =>
													setTestCaseForm(prev => ({
														...prev,
														index:
															Number.parseInt(e.target.value) || 1
													}))
												}
												disabled={
													!createdQuestionId || createTestCase.isPending
												}
											/>
										</div>
										<div className="grid gap-1">
											<Label>Hidden</Label>
											<div className="flex h-9 items-center gap-2">
												<Switch
													checked={testCaseForm.is_hidden}
													onCheckedChange={checked =>
														setTestCaseForm(prev => ({
															...prev,
															is_hidden: checked
														}))
													}
													disabled={
														!createdQuestionId ||
														createTestCase.isPending
													}
												/>
												<span className="text-xs text-muted-foreground">
													{testCaseForm.is_hidden ? 'Hidden' : 'Visible'}
												</span>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="grid gap-1">
											<Label>Input</Label>
											<Textarea
												rows={4}
												value={testCaseForm.input_path}
												onChange={e =>
													setTestCaseForm(prev => ({
														...prev,
														input_path: e.target.value
													}))
												}
												placeholder="Enter input..."
												disabled={
													!createdQuestionId || createTestCase.isPending
												}
											/>
										</div>
										<div className="grid gap-1">
											<Label>Expected Output</Label>
											<Textarea
												rows={4}
												value={testCaseForm.output_path}
												onChange={e =>
													setTestCaseForm(prev => ({
														...prev,
														output_path: e.target.value
													}))
												}
												placeholder="Enter expected output..."
												disabled={
													!createdQuestionId || createTestCase.isPending
												}
											/>
										</div>
									</div>
									<div className="flex items-center justify-between gap-2 pt-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentStep(1)}
										>
											Back to step 1
										</Button>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={handleCloseDialog}
											>
												Close
											</Button>
											<Button
												size="sm"
												onClick={handleCreateTestCase}
												disabled={
													!createdQuestionId ||
													createTestCase.isPending ||
													!testCaseForm.input_path ||
													!testCaseForm.output_path
												}
												className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white"
											>
												{createTestCase.isPending ? (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												) : (
													<Plus className="mr-2 h-4 w-4" />
												)}
												Add test case
											</Button>
										</div>
									</div>
								</div>
							)}

							<DialogFooter className="pt-3">
								<Link href={`/admin/rooms/${linkId}`} className="ml-auto">
									<Button variant="ghost" size="sm">
										<Eye className="mr-1 h-4 w-4" />
										Go to room detail
									</Button>
								</Link>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Link
						href={`/admin/rooms/${linkId}`}
						className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
						title="View detail"
					>
						<Eye className="h-4 w-4" />
					</Link>
				</div>
			</div>
		)
	}
)
RoomCard.displayName = 'RoomCard'
