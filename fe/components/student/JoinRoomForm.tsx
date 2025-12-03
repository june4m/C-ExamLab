'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import { useJoinRoom } from '@/service/student/room.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function JoinRoomForm() {
	const router = useRouter()
	const [roomId, setRoomId] = useState('')
	const [code, setCode] = useState('')
	const [errors, setErrors] = useState<{
		roomId?: string
		code?: string
		general?: string
	}>({})

	const { mutate: joinRoom, isPending } = useJoinRoom()

	const validate = () => {
		const newErrors: typeof errors = {}

		if (!roomId.trim()) {
			newErrors.roomId = 'Room ID is required'
		}

		if (!code.trim()) {
			newErrors.code = 'Room code is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validate()) {
			return
		}

		joinRoom(
			{
				roomId: roomId.trim(),
				code: code.trim(),
				join_at: new Date()
			},
			{
				onSuccess: (data, variables) => {
					// Redirect to the room page after successful join
					router.push(`/rooms/${variables.roomId}`)
				},
				onError: (error: Error) => {
					const axiosError = error as AxiosError<{ message?: string }>
					const errorMessage =
						axiosError.response?.data?.message ||
						error.message ||
						'Failed to join room. Please check your room ID and code.'
					setErrors({ general: errorMessage })
				}
			}
		)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Join Exam Room</CardTitle>
				<CardDescription>
					Enter the room ID and code to join an exam room
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					{errors.general && (
						<div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							<AlertCircle className="h-4 w-4" />
							<span>{errors.general}</span>
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="roomId" className="text-sm font-medium">
							Room ID
						</label>
						<Input
							id="roomId"
							type="text"
							placeholder="Enter room ID"
							value={roomId}
							onChange={e => {
								setRoomId(e.target.value)
								if (errors.roomId) {
									setErrors({ ...errors, roomId: undefined })
								}
							}}
							disabled={isPending}
							className={errors.roomId ? 'border-destructive' : ''}
						/>
						{errors.roomId && (
							<p className="text-sm text-destructive">{errors.roomId}</p>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="code" className="text-sm font-medium">
							Room Code
						</label>
						<Input
							id="code"
							type="text"
							placeholder="Enter room code"
							value={code}
							onChange={e => {
								setCode(e.target.value)
								if (errors.code) {
									setErrors({ ...errors, code: undefined })
								}
							}}
							disabled={isPending}
							className={errors.code ? 'border-destructive' : ''}
						/>
						{errors.code && (
							<p className="text-sm text-destructive">{errors.code}</p>
						)}
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? 'Joining...' : 'Join Room'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}
