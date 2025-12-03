'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useLogout } from '@/service/logout.service'
import { useAuthStore } from '@/store/auth.store'

interface LogoutButtonProps {
	variant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	className?: string
	showIcon?: boolean
}

export function LogoutButton({
	variant = 'outline',
	size = 'default',
	className = '',
	showIcon = true
}: LogoutButtonProps) {
	const router = useRouter()
	const { mutate: logout, isPending } = useLogout()
	const logoutStore = useAuthStore(state => state.logout)

	const handleLogout = () => {
		logout(undefined, {
			onSuccess: () => {
				logoutStore()
				router.push('/login')
			},
			onError: () => {
				logoutStore()
				router.push('/login')
			}
		})
	}

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleLogout}
			disabled={isPending}
			className={className}
		>
			{showIcon && <LogOut className="mr-2 h-4 w-4" />}
			{isPending ? 'Logging out...' : 'Logout'}
		</Button>
	)
}
