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
	const [roomCode, setRoomCode] = useState('')
	const [errors, setErrors] = useState<{
		roomCode?: string
		general?: string
	}>({})

	const { mutate: joinRoom, isPending } = useJoinRoom()

	const validate = () => {
		const newErrors: typeof errors = {}

		if (!roomCode.trim()) {
			newErrors.roomCode = 'Room code is required'
		} else if (roomCode.trim().length !== 6) {
			newErrors.roomCode = 'Room code must be 6 characters'
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
				roomCode: roomCode.trim().toUpperCase()
			},
			{
				onSuccess: data => {
					// Redirect to the room page after successful join
					router.push(`/rooms/${data.roomId}`)
				},
				onError: (error: Error) => {
					const axiosError = error as AxiosError<{
						message?: string
						error?: string
					}>
					const errorMessage =
						axiosError.response?.data?.error ||
						axiosError.response?.data?.message ||
						error.message ||
						'Failed to join room. Please check your room code.'
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
					Enter the 6-character room code to join an exam room
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
						<label htmlFor="roomCode" className="text-sm font-medium">
							Room Code
						</label>
						<Input
							id="roomCode"
							type="text"
							placeholder="Enter 6-character room code"
							value={roomCode}
							maxLength={6}
							onChange={e => {
								setRoomCode(e.target.value.toUpperCase())
								if (errors.roomCode) {
									setErrors({ ...errors, roomCode: undefined })
								}
							}}
							disabled={isPending}
							className={errors.roomCode ? 'border-destructive' : ''}
						/>
						{errors.roomCode && (
							<p className="text-sm text-destructive">{errors.roomCode}</p>
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
