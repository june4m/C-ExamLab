'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamTimerProps {
	closeTime: Date | string
	serverTime?: Date | string // Optional server time for sync
	onTimeExpired?: () => void
}

export function ExamTimer({
	closeTime,
	serverTime,
	onTimeExpired
}: ExamTimerProps) {
	const [timeRemaining, setTimeRemaining] = useState<number>(0)
	const [isExpired, setIsExpired] = useState(false)

	useEffect(() => {
		const calculateTimeRemaining = () => {
			const now = serverTime ? new Date(serverTime) : new Date()
			const close =
				typeof closeTime === 'string' ? new Date(closeTime) : closeTime
			const diff = close.getTime() - now.getTime()

			if (diff <= 0) {
				setTimeRemaining(0)
				setIsExpired(true)
				if (onTimeExpired) {
					onTimeExpired()
				}
				return
			}

			setTimeRemaining(diff)
			setIsExpired(false)
		}

		// Calculate immediately
		calculateTimeRemaining()

		// Update every second
		const interval = setInterval(calculateTimeRemaining, 1000)

		return () => clearInterval(interval)
	}, [closeTime, serverTime, onTimeExpired])

	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, '0')}:${String(
				seconds
			).padStart(2, '0')}`
		}
		return `${minutes}:${String(seconds).padStart(2, '0')}`
	}

	const getTimeColor = () => {
		if (isExpired) return 'text-destructive'
		const minutes = Math.floor(timeRemaining / 60000)
		if (minutes < 5) return 'text-destructive'
		if (minutes < 15) return 'text-yellow-600'
		return 'text-foreground'
	}

	return (
		<Card className={cn('border-2', isExpired && 'border-destructive')}>
			<CardContent className="p-4">
				<div className="flex items-center gap-3">
					<Clock
						className={cn(
							'h-5 w-5',
							isExpired ? 'text-destructive' : 'text-muted-foreground'
						)}
					/>
					<div className="flex-1">
						<p className="text-sm text-muted-foreground">Time Remaining</p>
						<p className={cn('text-2xl font-bold font-mono', getTimeColor())}>
							{isExpired ? '00:00' : formatTime(timeRemaining)}
						</p>
					</div>
					{isExpired && <AlertTriangle className="h-5 w-5 text-destructive" />}
					{!isExpired && timeRemaining < 5 * 60 * 1000 && (
						<AlertTriangle className="h-5 w-5 text-yellow-600 animate-pulse" />
					)}
				</div>
			</CardContent>
		</Card>
	)
}
