'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold">PiedTeam C exam</h1>
					<p className="mt-2 text-muted-foreground">
						Create your account to get started.
					</p>
				</div>
				<RegisterForm />
				<div className="text-center text-sm">
					<span className="text-muted-foreground">
						Already have an account?{' '}
					</span>
					<Link
						href="/login"
						className="font-medium text-primary hover:underline"
					>
						Login
					</Link>
				</div>
			</div>
		</div>
	)
}
