'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	ArrowLeft,
	Calendar,
	Clock,
	Save,
	AlertCircle
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
import { useAuthStore } from '@/store/auth.store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface CreateRoomRequest {
	name: string
	openTime: string
	closeTime: string
	options: {
		questionIdList: string[]
		testcaseIdList: string[]
	}
}

interface CreateRoomResponse {
	success: boolean
	data: unknown
	message: string
	code: number
}

function useCreateRoom() {
	const token = useAuthStore(state => state.token)

	return useMutation({
		mutationFn: async (payload: CreateRoomRequest) => {
			const res = await fetch(`${API_BASE_URL}/admin/rooms/create-room`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			})
			const json = (await res.json()) as CreateRoomResponse
			if (!res.ok || !json.success) {
				throw new Error(json.message || 'Failed to create room')
			}
			return json
		}
	})
}

// Helper to get AM/PM
const getAmPm = (time: string) => {
	if (!time) return ''
	const hour = parseInt(time.split(':')[0])
	return hour >= 12 ? 'PM' : 'AM'
}

// Get today's date in YYYY-MM-DD format
const getToday = () => {
	const today = new Date()
	return today.toISOString().split('T')[0]
}

export default function CreateRoomPage() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [error, setError] = useState<string | null>(null)
	const today = getToday()
	const [formData, setFormData] = useState({
		name: '',
		openDate: '',
		openTime: '',
		closeDate: '',
		closeTime: ''
	})
	const [questionIds, setQuestionIds] = useState<string[]>([''])
	const [testcaseIds, setTestcaseIds] = useState<string[]>([''])

	const { mutate: createRoom, isPending } = useCreateRoom()

	const addQuestionId = () => setQuestionIds([...questionIds, ''])
	const removeQuestionId = (index: number) => {
		if (questionIds.length > 1) {
			setQuestionIds(questionIds.filter((_, i) => i !== index))
		}
	}
	const updateQuestionId = (index: number, value: string) => {
		const updated = [...questionIds]
		updated[index] = value
		setQuestionIds(updated)
	}

	const addTestcaseId = () => setTestcaseIds([...testcaseIds, ''])
	const removeTestcaseId = (index: number) => {
		if (testcaseIds.length > 1) {
			setTestcaseIds(testcaseIds.filter((_, i) => i !== index))
		}
	}
	const updateTestcaseId = (index: number, value: string) => {
		const updated = [...testcaseIds]
		updated[index] = value
		setTestcaseIds(updated)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Combine date and time to ISO string
		const openTime = new Date(
			`${formData.openDate}T${formData.openTime}`
		).toISOString()
		const closeTime = new Date(
			`${formData.closeDate}T${formData.closeTime}`
		).toISOString()

		const payload: CreateRoomRequest = {
			name: formData.name,
			openTime,
			closeTime,
			options: {
				questionIdList: [],
				testcaseIdList: []
			}
		}

		createRoom(payload, {
			onSuccess: () => {
				// Invalidate rooms query to reload data
				queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
				router.push('/admin/rooms')
			},
			onError: (err: Error) => {
				setError(err.message || 'Failed to create room')
			}
		})
	}

	return (
		<div className="container mx-auto max-w-2xl p-6">
			{/* Header */}
			<div className="mb-6">
				<Link
					href="/admin/rooms"
					className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to rooms list
				</Link>
				<h1 className="text-2xl font-bold">Create new exam room</h1>
				<p className="text-muted-foreground">
					Enter information to create an exam room
				</p>
			</div>

			{error && (
				<div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					<AlertCircle className="h-4 w-4" />
					<span>{error}</span>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Exam room information</CardTitle>
					<CardDescription>
						Fill in the required information for the exam room
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Room Name */}
						<div className="space-y-2">
							<Label htmlFor="name">Room name *</Label>
							<Input
								id="name"
								placeholder="Enter room name"
								value={formData.name}
								onChange={e =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
							/>
						</div>

						{/* Open Time */}
						<div className="space-y-2">
							<Label>Room open time *</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="date"
										className="pl-10"
										value={formData.openDate}
										min={today}
										onChange={e => {
											const newDate = e.target.value
											setFormData(prev => ({
												...prev,
												openDate: newDate,
												closeDate: !prev.closeDate ? newDate : prev.closeDate
											}))
										}}
										required
									/>
								</div>
								<div className="relative flex items-center">
									<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="time"
										className="pl-10"
										value={formData.openTime}
										onChange={e => {
											const newTime = e.target.value
											setFormData(prev => ({
												...prev,
												openTime: newTime,
												closeTime: !prev.closeTime ? newTime : prev.closeTime
											}))
										}}
										required
									/>
									{formData.openTime && (
										<span className="ml-2 text-sm font-medium text-primary whitespace-nowrap">
											{getAmPm(formData.openTime)}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Close Time */}
						<div className="space-y-2">
							<Label>Room close time *</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="date"
										className="pl-10"
										value={formData.closeDate}
										min={formData.openDate || today}
										onChange={e =>
											setFormData({ ...formData, closeDate: e.target.value })
										}
										required
									/>
								</div>
								<div className="relative flex items-center">
									<Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="time"
										className="pl-10"
										value={formData.closeTime}
										onChange={e =>
											setFormData({ ...formData, closeTime: e.target.value })
										}
										required
									/>
									{formData.closeTime && (
										<span className="ml-2 text-sm font-medium text-primary whitespace-nowrap">
											{getAmPm(formData.closeTime)}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Submit */}
						<div className="flex gap-4 pt-4">
							<Button
								type="button"
								variant="outline"
								className="flex-1 bg-transparent"
								onClick={() => router.push('/admin/rooms')}
							>
								Cancel
							</Button>
							<Button type="submit" className="flex-1" disabled={isPending}>
								{isPending ? (
									'Creating...'
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Create room
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
