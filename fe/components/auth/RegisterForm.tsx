'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import { useRegister } from '@/service/register.service'
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

export function RegisterForm() {
	const router = useRouter()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<{
		username?: string
		password?: string
		confirmPassword?: string
		general?: string
	}>({})

	const { mutate: register, isPending } = useRegister()
	const setToken = useAuthStore(state => state.setToken)

	const validate = () => {
		const newErrors: typeof errors = {}

		if (!username.trim()) {
			newErrors.username = 'Username is required'
		} else if (username.trim().length < 3) {
			newErrors.username = 'Username must be at least 3 characters'
		}

		if (!password) {
			newErrors.password = 'Password is required'
		} else if (password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters'
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password'
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validate()) {
			return
		}

		register(
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
						'Registration failed. Please try again.'
					setErrors({ general: errorMessage })
				}
			}
		)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Register</CardTitle>
				<CardDescription>Create a new account to get started</CardDescription>
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
								// Clear confirm password error if passwords now match
								if (
									errors.confirmPassword &&
									e.target.value === confirmPassword
								) {
									setErrors({ ...errors, confirmPassword: undefined })
								}
							}}
							disabled={isPending}
							className={errors.password ? 'border-destructive' : ''}
						/>
						{errors.password && (
							<p className="text-sm text-destructive">{errors.password}</p>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="confirmPassword" className="text-sm font-medium">
							Confirm Password
						</label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							value={confirmPassword}
							onChange={e => {
								setConfirmPassword(e.target.value)
								if (errors.confirmPassword) {
									setErrors({ ...errors, confirmPassword: undefined })
								}
							}}
							disabled={isPending}
							className={errors.confirmPassword ? 'border-destructive' : ''}
						/>
						{errors.confirmPassword && (
							<p className="text-sm text-destructive">
								{errors.confirmPassword}
							</p>
						)}
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? 'Registering...' : 'Register'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}
