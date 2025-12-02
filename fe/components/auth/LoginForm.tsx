'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import { useLogin } from '@/service/login.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function LoginForm() {
	const router = useRouter()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<{
		username?: string
		password?: string
		general?: string
	}>({})

	const { mutate: login, isPending } = useLogin()
	const setToken = useAuthStore(state => state.setToken)

	const validate = () => {
		const newErrors: typeof errors = {}

		if (!username.trim()) {
			newErrors.username = 'Username is required'
		}

		if (!password) {
			newErrors.password = 'Password is required'
		} else if (password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validate()) {
			return
		}

		login(
			{
				username,
				password
			},
			{
				onSuccess: data => {
					// Store token
					setToken(data.accesstoken)
					// Redirect to home or dashboard
					router.push('/')
				},
				onError: (error: Error) => {
					const axiosError = error as AxiosError<{ message?: string }>
					const errorMessage =
						axiosError.response?.data?.message ||
						error.message ||
						'Login failed. Please try again.'
					setErrors({ general: errorMessage })
				}
			}
		)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					{errors.general && (
						<div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							<AlertCircle className="h-4 w-4" />
							<span>{errors.general}</span>
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="username" className="text-sm font-medium">
							Username
						</label>
						<Input
							id="username"
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={e => {
								setUsername(e.target.value)
								if (errors.username) {
									setErrors({ ...errors, username: undefined })
								}
							}}
							disabled={isPending}
							className={errors.username ? 'border-destructive' : ''}
						/>
						{errors.username && (
							<p className="text-sm text-destructive">{errors.username}</p>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={e => {
								setPassword(e.target.value)
								if (errors.password) {
									setErrors({ ...errors, password: undefined })
								}
							}}
							disabled={isPending}
							className={errors.password ? 'border-destructive' : ''}
						/>
						{errors.password && (
							<p className="text-sm text-destructive">{errors.password}</p>
						)}
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? 'Logging in...' : 'Login'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}
