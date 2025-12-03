'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	BookOpen,
	DoorOpen,
	Users,
	LogOut,
	User,
	ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const menuItems = [
	{
		title: 'Dashboard',
		href: '/admin',
		icon: LayoutDashboard
	},
	{
		title: 'Questions',
		href: '/admin/questions',
		icon: BookOpen
	},
	{
		title: 'Rooms',
		href: '/admin/rooms',
		icon: DoorOpen
	},
	{
		title: 'Users',
		href: '/admin/users',
		icon: Users
	}
]

export function AdminSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const user = useAuthStore(state => state.user)
	const logout = useAuthStore(state => state.logout)

	const handleLogout = () => {
		logout()
		router.push('/login')
	}

	const getInitials = (name: string | null) => {
		if (!name) return 'AD'
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
			<div className="flex h-full flex-col">
				{/* Logo/Header */}
				<div className="flex h-16 items-center border-b px-6">
					<h2 className="text-lg font-semibold">Admin Panel</h2>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 p-4">
					{menuItems.map(item => {
						const Icon = item.icon
						const isActive =
							pathname === item.href ||
							(pathname.startsWith(item.href) && item.href !== '/admin')

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

				{/* User Profile Section */}
				<div className="border-t p-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
								<Avatar className="h-8 w-8">
									<AvatarFallback className="bg-primary text-primary-foreground text-xs">
										{getInitials(user?.fullName ?? null)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 text-left">
									<p className="truncate font-medium">
										{user?.fullName || 'Admin'}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{user?.email || ''}
									</p>
								</div>
								<ChevronUp className="h-4 w-4 text-muted-foreground" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<div className="px-2 py-1.5">
								<p className="text-sm font-medium">
									{user?.fullName || 'Admin'}
								</p>
								<p className="text-xs text-muted-foreground">{user?.email}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/admin/profile" className="flex items-center gap-2">
									<User className="h-4 w-4" />
									<span>Profile</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleLogout}
								className="text-destructive focus:text-destructive"
							>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</aside>
	)
}
