'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold">PiedTeam C exam</h1>
					<p className="mt-2 text-muted-foreground">
						Welcome back! Please login to continue.
					</p>
				</div>
				<LoginForm />
				<div className="text-center text-sm">
					<span className="text-muted-foreground">
						Don&apos;t have an account?{' '}
					</span>
					<Link
						href="/register"
						className="font-medium text-primary hover:underline"
					>
						Register
					</Link>
				</div>
			</div>
		</div>
	)
}

