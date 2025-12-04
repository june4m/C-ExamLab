'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, DoorOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/LogoutButton'

const menuItems = [
	{
		title: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		title: 'Rooms',
		href: '/rooms',
		icon: DoorOpen,
	},
	{
		title: 'Profile',
		href: '/profile',
		icon: User,
	},
]

export function StudentSidebar() {
	const pathname = usePathname()

	return (
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
			<div className="flex h-full flex-col">
				{/* Logo/Header */}
				<div className="flex h-16 items-center border-b px-6">
					<h2 className="text-lg font-semibold">Student Portal</h2>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 p-4">
					{menuItems.map((item) => {
						const Icon = item.icon
						const isActive =
							pathname === item.href ||
							(pathname.startsWith(item.href) &&
								item.href !== '/dashboard')

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									isActive
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								)}
							>
								<Icon className="h-5 w-5" />
								<span>{item.title}</span>
							</Link>
						)
					})}
				</nav>

				{/* Logout Button */}
				<div className="border-t p-4">
					<LogoutButton
						variant="ghost"
						className="w-full justify-start"
					/>
				</div>
			</div>
		</aside>
	)
}

