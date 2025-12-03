'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import { useMutation } from '@tanstack/react-query'
=======
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
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
<<<<<<< HEAD
import { RegisterRequest } from '@/interface'
import { useAuthStore } from '@/store/auth.store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface AuthResponse {
	success: boolean
	data: {
		user: {
			uuid: string
			email: string
			fullName: string
			role: string
		}
		token: string
	}
	message: string
	code: number
}

function useRegister() {
	return useMutation({
		mutationFn: async (payload: RegisterRequest) => {
			const res = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			const json = (await res.json()) as AuthResponse
			if (!res.ok || !json.success)
				throw new Error(json.message || 'Registration failed')
			return json
		}
	})
}
=======
import { useRegister } from '@/service/register.service'
import { useAuthStore } from '@/store/auth.store'
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2

export function RegisterForm() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [fullName, setFullName] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<{
		email?: string
		fullName?: string
		password?: string
		confirmPassword?: string
		general?: string
	}>({})

<<<<<<< HEAD
	const { mutate: registerMutation, isPending } = useRegister()
	const login = useAuthStore(state => state.login)
=======
	const { mutate: register, isPending } = useRegister()
	const loginStore = useAuthStore(state => state.login)
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2

	const validate = () => {
		const newErrors: typeof errors = {}
		if (!email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
<<<<<<< HEAD
			newErrors.email = 'Please enter a valid email'
		}
		if (!fullName.trim()) {
			newErrors.fullName = 'Full name is required'
		} else if (fullName.trim().length < 2) {
			newErrors.fullName = 'Full name must be at least 2 characters'
=======
			newErrors.email = 'Please enter a valid email address'
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
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
		if (!validate()) return

<<<<<<< HEAD
		registerMutation(
			{ email, password, fullName },
			{
				onSuccess: data => {
					login(data.data.token, {
						uuid: data.data.user.uuid,
						email: data.data.user.email,
						fullName: data.data.user.fullName,
						role: data.data.user.role
					})
					router.push('/dashboard')
=======
		register(
			{ email, password, fullName: fullName.trim() || undefined },
			{
				onSuccess: data => {
					loginStore(data.token, data.user)
					router.push('/')
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
				},
				onError: (error: Error) => {
					setErrors({
						general: error.message || 'Registration failed. Please try again.'
					})
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
<<<<<<< HEAD
						<label htmlFor="fullName" className="text-sm font-medium">
							Full Name
						</label>
						<Input
							id="fullName"
							type="text"
							placeholder="Enter your full name"
							value={fullName}
							onChange={e => {
								setFullName(e.target.value)
								if (errors.fullName)
									setErrors({ ...errors, fullName: undefined })
							}}
							disabled={isPending}
							className={errors.fullName ? 'border-destructive' : ''}
						/>
						{errors.fullName && (
							<p className="text-sm text-destructive">{errors.fullName}</p>
						)}
					</div>
					<div className="space-y-2">
=======
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<Input
							id="email"
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={e => {
								setEmail(e.target.value)
								if (errors.email) setErrors({ ...errors, email: undefined })
							}}
							disabled={isPending}
							className={errors.email ? 'border-destructive' : ''}
						/>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email}</p>
						)}
					</div>
<<<<<<< HEAD

=======
					<div className="space-y-2">
						<label htmlFor="fullName" className="text-sm font-medium">
							Full Name{' '}
							<span className="text-muted-foreground">(optional)</span>
						</label>
						<Input
							id="fullName"
							type="text"
							placeholder="Enter your full name"
							value={fullName}
							onChange={e => {
								setFullName(e.target.value)
								if (errors.fullName)
									setErrors({ ...errors, fullName: undefined })
							}}
							disabled={isPending}
							className={errors.fullName ? 'border-destructive' : ''}
							maxLength={48}
						/>
						{errors.fullName && (
							<p className="text-sm text-destructive">{errors.fullName}</p>
						)}
					</div>
>>>>>>> 9cf62f544a07cb6c53b1297f7878a607451d40c2
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
								if (errors.password)
									setErrors({ ...errors, password: undefined })
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
								if (errors.confirmPassword)
									setErrors({ ...errors, confirmPassword: undefined })
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
