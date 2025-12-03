'use client'

import Link from 'next/link'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { StudentProfileResponse } from '@/interface/student/profile.interface'
import { Loader2, AlertCircle, Edit } from 'lucide-react'

interface ProfileViewProps {
	profile: StudentProfileResponse | undefined
	isLoading: boolean
	error: Error | null
}

export function ProfileView({ profile, isLoading, error }: ProfileViewProps) {
	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-6">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					<span className="ml-2 text-muted-foreground">Loading profile...</span>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						<div>
							<p className="font-semibold">Error loading profile</p>
							<p className="text-sm text-muted-foreground">
								{error.message || 'Failed to load profile information'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!profile) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-muted-foreground">No profile data available</p>
				</CardContent>
			</Card>
		)
	}

	const formatDate = (date: Date | string | null | undefined) => {
		if (!date) return 'N/A'
		try {
			const dateObj = typeof date === 'string' ? new Date(date) : date
			return dateObj.toLocaleString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		} catch {
			return 'Invalid date'
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Profile Information</CardTitle>
						<CardDescription>
							View your account details and information
						</CardDescription>
					</div>
					<Button asChild variant="outline" size="sm">
						<Link href="/profile/edit">
							<Edit className="mr-2 h-4 w-4" />
							Edit Profile
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4">
					<div className="grid gap-2">
						<label className="text-sm font-medium text-muted-foreground">
							Full Name
						</label>
						<p className="text-base">
							{profile.full_name || (
								<span className="text-muted-foreground italic">Not set</span>
							)}
						</p>
					</div>

					<div className="grid gap-2">
						<label className="text-sm font-medium text-muted-foreground">
							Email
						</label>
						<p className="text-base">
							{profile.email || (
								<span className="text-muted-foreground italic">Not set</span>
							)}
						</p>
					</div>

					<div className="grid gap-2">
						<label className="text-sm font-medium text-muted-foreground">
							Account Created
						</label>
						<p className="text-base">{formatDate(profile.created_at)}</p>
					</div>

					<div className="grid gap-2">
						<label className="text-sm font-medium text-muted-foreground">
							Last Updated
						</label>
						<p className="text-base">{formatDate(profile.updated_at)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
