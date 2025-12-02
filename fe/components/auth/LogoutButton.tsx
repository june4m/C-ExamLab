'use client'

import { useRouter } from 'next/navigation'
import { useLogout } from '@/service/logout.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
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
		logout(
			{},
			{
				onSuccess: () => {
					// Clear auth state
					logoutStore()
					// Redirect to login
					router.push('/login')
				},
				onError: () => {
					// Even if API call fails, clear local state and redirect
					// This ensures user can still logout if API is down
					logoutStore()
					router.push('/login')
				}
			}
		)
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

