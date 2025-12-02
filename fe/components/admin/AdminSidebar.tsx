'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, DoorOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
	{
		title: 'Dashboard',
		href: '/admin',
		icon: LayoutDashboard,
	},
	{
		title: 'Questions',
		href: '/admin/questions',
		icon: BookOpen,
	},
	{
		title: 'Rooms',
		href: '/admin/rooms',
		icon: DoorOpen,
	},
	{
		title: 'Users',
		href: '/admin/users',
		icon: Users,
	},
]

export function AdminSidebar() {
	const pathname = usePathname()

	return (
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
			<div className="flex h-full flex-col">
				{/* Logo/Header */}
				<div className="flex h-16 items-center border-b px-6">
					<h2 className="text-lg font-semibold">Admin Panel</h2>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 p-4">
					{menuItems.map((item) => {
						const Icon = item.icon
						const isActive =
							pathname === item.href ||
							(pathname.startsWith(item.href) &&
								item.href !== '/admin')

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
			</div>
		</aside>
	)
}

