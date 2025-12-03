'use client'

import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import {
	useGetProfile,
	useUpdateProfile
} from '@/service/student/profile.service'
import type { UpdateProfileRequest } from '@/interface/student/profile.interface'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

// Zod schema for form validation
const profileFormSchema = z.object({
	full_name: z
		.string()
		.min(1, 'Full name is required')
		.trim()
		.refine(val => val.length > 0, 'Full name cannot be empty'),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileEditForm() {
	const router = useRouter()
	const { data: profile, isLoading: isLoadingProfile } = useGetProfile()
	const updateProfile = useUpdateProfile()

	const formik = useFormik<ProfileFormValues>({
		initialValues: {
			full_name: profile?.full_name || '',
			email: profile?.email || ''
		},
		enableReinitialize: true,
		validate: values => {
			const result = profileFormSchema.safeParse(values)
			if (result.success) {
				return {}
			}
			const errors: Partial<Record<keyof ProfileFormValues, string>> = {}
			result.error.issues.forEach(issue => {
				if (issue.path[0]) {
					errors[issue.path[0] as keyof ProfileFormValues] = issue.message
				}
			})
			return errors
		},
		onSubmit: async values => {
			try {
				// Include studentId if available from profile
				const updatePayload: UpdateProfileRequest = {
					...(profile?.studentId && { studentId: profile.studentId }),
					...values
				}
				await updateProfile.mutateAsync(updatePayload)
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
	})

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

				<form onSubmit={formik.handleSubmit} className="space-y-4">
					<div className="grid gap-2">
						<label htmlFor="full_name" className="text-sm font-medium">
							Full Name <span className="text-destructive">*</span>
						</label>
						<Input
							id="full_name"
							name="full_name"
							type="text"
							value={formik.values.full_name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							disabled={updateProfile.isPending}
							className={
								formik.touched.full_name && formik.errors.full_name
									? 'border-destructive'
									: ''
							}
							placeholder="Enter your full name"
						/>
						{formik.touched.full_name && formik.errors.full_name && (
							<p className="text-sm text-destructive">
								{formik.errors.full_name}
							</p>
						)}
					</div>

					<div className="grid gap-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email <span className="text-destructive">*</span>
						</label>
						<Input
							id="email"
							name="email"
							type="email"
							value={formik.values.email}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							disabled={updateProfile.isPending}
							className={
								formik.touched.email && formik.errors.email
									? 'border-destructive'
									: ''
							}
							placeholder="Enter your email address"
						/>
						{formik.touched.email && formik.errors.email && (
							<p className="text-sm text-destructive">{formik.errors.email}</p>
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
