import * as React from 'react'
import { cn } from '@/lib/utils'
import { User, Eye } from 'lucide-react'
import Link from 'next/link'

interface RoomCardProps {
	roomId: string
	roomUuid?: string
	roomName: string
	creatorName: string
	creatorEmail: string
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
			creatorName,
			creatorEmail,
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
		return (
			<div
				ref={ref}
				className={cn(
					'group relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/30',
					className
				)}
				{...props}
			>
				{/* Top Section - Avatar, Name, Email */}
				<div className="mb-4 flex flex-col items-center">
					<div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
						<User className="h-7 w-7 text-primary/70" />
					</div>
					{/* <p className="font-semibold text-foreground">
						{creatorName || 'Admin'}
					</p> */}
					<p className="text-sm text-muted-foreground">{creatorEmail}</p>
				</div>

				{/* Room Name - Centered */}
				<div className="mb-3 text-center">
					<p className="text-lg font-bold text-foreground">{roomName}</p>
				</div>

				{/* Room ID Badge */}
				<div className="mb-4 flex justify-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
						<span className="text-xs text-muted-foreground">Mã phòng:</span>
						<span className="font-mono font-bold text-primary">{roomId}</span>
					</div>
				</div>

				{/* Divider */}
				<div className="mb-4 border-t" />

				{/* Bottom Section - Open/Close Time */}
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-medium text-emerald-600">Bắt đầu</p>
						<p className="text-base font-bold text-foreground">{openTime}</p>
						<p className="text-xs text-muted-foreground">{openDate}</p>
					</div>
					<div className="text-right">
						<p className="text-xs font-medium text-rose-600">Kết thúc</p>
						<p className="text-base font-bold text-foreground">{closeTime}</p>
						<p className="text-xs text-muted-foreground">{closeDate}</p>
					</div>
				</div>

				{/* View Button */}
				<div className="absolute top-3 right-3">
					<Link
						href={`/admin/rooms/${linkId}`}
						className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
						title="Xem chi tiết"
					>
						<Eye className="h-4 w-4" />
					</Link>
				</div>
			</div>
		)
	}
)
RoomCard.displayName = 'RoomCard'
