'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { useGetProfile, useUpdateProfile } from '@/service/student/profile.service'
import type { UpdateProfileRequest } from '@/interface/student/profile.interface'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export function ProfileEditForm() {
	const router = useRouter()
	const { data: profile, isLoading: isLoadingProfile } = useGetProfile()
	const updateProfile = useUpdateProfile()

	const [formData, setFormData] = useState<UpdateProfileRequest>({
		studentId: '',
		full_name: '',
		email: ''
	})
	const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileRequest, string>>>({})

	// Initialize form data when profile loads
	useEffect(() => {
		if (profile) {
			setFormData({
				studentId: profile.studentId,
				full_name: profile.full_name,
				email: profile.email
			})
		}
	}, [profile])

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof UpdateProfileRequest, string>> = {}

		if (!formData.full_name.trim()) {
			newErrors.full_name = 'Full name is required'
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		try {
			await updateProfile.mutateAsync(formData)
			// Success is handled by the mutation's onSuccess callback
			// Redirect back to profile page after a short delay to show success message
			setTimeout(() => {
				router.push('/profile')
			}, 1500)
		} catch (error) {
			// Error is handled by the error state in the mutation
			console.error('Failed to update profile:', error)
		}
	}

	const handleChange = (field: keyof UpdateProfileRequest) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: e.target.value
		}))
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: undefined
			}))
		}
	}

	if (isLoadingProfile) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-6">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					<span className="ml-2 text-muted-foreground">Loading profile...</span>
				</CardContent>
			</Card>
		)
	}

	if (!profile) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						<p>Failed to load profile data</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const isSuccess = updateProfile.isSuccess && !updateProfile.isPending

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit Profile</CardTitle>
				<CardDescription>
					Update your profile information. Changes will be saved immediately.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isSuccess && (
					<div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
						<div className="flex items-center gap-2 text-green-800 dark:text-green-200">
							<CheckCircle2 className="h-5 w-5" />
							<p className="font-medium">Profile updated successfully!</p>
						</div>
					</div>
				)}

				{updateProfile.isError && (
					<div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-4">
						<div className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-5 w-5" />
							<div>
								<p className="font-medium">Error updating profile</p>
								<p className="text-sm">
									{updateProfile.error instanceof Error
										? updateProfile.error.message
										: 'An unexpected error occurred. Please try again.'}
								</p>
							</div>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-2">
						<label
							htmlFor="studentId"
							className="text-sm font-medium text-muted-foreground"
						>
							Student ID
						</label>
						<Input
							id="studentId"
							type="text"
							value={formData.studentId}
							disabled
							className="bg-muted cursor-not-allowed"
						/>
						<p className="text-xs text-muted-foreground">
							Student ID cannot be changed
						</p>
					</div>

					<div className="grid gap-2">
						<label
							htmlFor="full_name"
							className="text-sm font-medium"
						>
							Full Name <span className="text-destructive">*</span>
						</label>
						<Input
							id="full_name"
							type="text"
							value={formData.full_name}
							onChange={handleChange('full_name')}
							disabled={updateProfile.isPending}
							className={errors.full_name ? 'border-destructive' : ''}
							placeholder="Enter your full name"
						/>
						{errors.full_name && (
							<p className="text-sm text-destructive">{errors.full_name}</p>
						)}
					</div>

					<div className="grid gap-2">
						<label
							htmlFor="email"
							className="text-sm font-medium"
						>
							Email <span className="text-destructive">*</span>
						</label>
						<Input
							id="email"
							type="email"
							value={formData.email}
							onChange={handleChange('email')}
							disabled={updateProfile.isPending}
							className={errors.email ? 'border-destructive' : ''}
							placeholder="Enter your email address"
						/>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email}</p>
						)}
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							type="submit"
							disabled={updateProfile.isPending || isSuccess}
						>
							{updateProfile.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push('/profile')}
							disabled={updateProfile.isPending}
						>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

