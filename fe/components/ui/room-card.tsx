import * as React from 'react'
import { cn } from '@/lib/utils'
import { User, Settings, Eye } from 'lucide-react'
import Link from 'next/link'
import type { RoomCardProps } from '@/interface'

export const RoomCard = React.forwardRef<HTMLDivElement, RoomCardProps>(
	(
		{
			roomId,
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
		return (
			<div
				ref={ref}
				className={cn(
					'group relative rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md',
					className
				)}
				{...props}
			>
				{/* Top Section - Avatar, Name, Email */}
				<div className="mb-4 flex flex-col items-center">
					<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						<User className="h-6 w-6 text-muted-foreground" />
					</div>
					<p className="font-semibold text-foreground">{creatorName}</p>
					<p className="text-sm text-muted-foreground">{creatorEmail}</p>
				</div>

				{/* Middle Section - RoomID and Room Name */}
				<div className="mb-4 flex items-center justify-between border-b pb-4">
					<div>
						<p className="text-xs text-muted-foreground">RoomID</p>
						<p className="font-medium">{roomId}</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-muted-foreground">Room name</p>
						<p className="font-medium">{roomName}</p>
					</div>
				</div>

				{/* Bottom Section - Open/Close Time */}
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs text-muted-foreground">Open time</p>
						<p className="text-sm font-medium">{openTime}</p>
						<p className="text-xs text-muted-foreground">{openDate}</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-muted-foreground">Close time</p>
						<p className="text-sm font-medium">{closeTime}</p>
						<p className="text-xs text-muted-foreground">{closeDate}</p>
					</div>
				</div>

				<div className="absolute top-0 right-2 flex gap-1">
					<Link
						href={`/admin/rooms/${roomId}`}
						className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						title="Xem chi tiết"
					>
						<Eye className="h-5 w-5" />
					</Link>
					{/* <Link
            href={`/admin/rooms/${roomId}/edit`}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Cài đặt"
          >
            <Settings className="h-5 w-5" />
          </Link> */}
				</div>
			</div>
		)
	}
)
RoomCard.displayName = 'RoomCard'
