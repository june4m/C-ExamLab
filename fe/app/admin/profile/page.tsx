'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react'

export default function AdminProfilePage() {
	const user = useAuthStore(state => state.user)
	const [isEditing, setIsEditing] = useState(false)
	const [fullName, setFullName] = useState(user?.fullName || '')

	const getInitials = (name: string | null) => {
		if (!name) return 'AD'
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	const handleSave = () => {
		// TODO: Implement API call to update profile
		setIsEditing(false)
	}

	const handleCancel = () => {
		setFullName(user?.fullName || '')
		setIsEditing(false)
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Profile</h1>
				<p className="text-muted-foreground">Manage your account settings</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Profile Card */}
				<Card className="md:col-span-1">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center text-center">
							<Avatar className="h-24 w-24 mb-4">
								<AvatarFallback className="bg-primary text-primary-foreground text-2xl">
									{getInitials(user?.fullName ?? null)}
								</AvatarFallback>
							</Avatar>
							<h2 className="text-xl font-semibold">
								{user?.fullName || 'Admin'}
							</h2>
							<p className="text-sm text-muted-foreground mb-3">
								{user?.email}
							</p>
							<Badge
								variant="default"
								className="bg-emerald-500 hover:bg-emerald-600"
							>
								<Shield className="mr-1 h-3 w-3" />
								{user?.role || 'ADMIN'}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Account Details */}
				<Card className="md:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Account Details</CardTitle>
								<CardDescription>Your personal information</CardDescription>
							</div>
							{!isEditing ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsEditing(true)}
								>
									<Edit2 className="mr-2 h-4 w-4" />
									Edit
								</Button>
							) : (
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={handleCancel}>
										<X className="mr-2 h-4 w-4" />
										Cancel
									</Button>
									<Button size="sm" onClick={handleSave}>
										<Save className="mr-2 h-4 w-4" />
										Save
									</Button>
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									Full Name
								</label>
								{isEditing ? (
									<Input
										value={fullName}
										onChange={e => setFullName(e.target.value)}
										placeholder="Enter your full name"
									/>
								) : (
									<p className="text-sm py-2 px-3 bg-muted rounded-md">
										{user?.fullName || 'Not set'}
									</p>
								)}
							</div>

							<Separator />

							<div className="space-y-2">
								<label className="text-sm font-medium flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									Email Address
								</label>
								<p className="text-sm py-2 px-3 bg-muted rounded-md">
									{user?.email || 'Not set'}
								</p>
							</div>

							<Separator />

							<div className="space-y-2">
								<label className="text-sm font-medium flex items-center gap-2">
									<Shield className="h-4 w-4 text-muted-foreground" />
									Role
								</label>
								<p className="text-sm py-2 px-3 bg-muted rounded-md">
									{user?.role || 'ADMIN'}
								</p>
							</div>

							<Separator />

							<div className="space-y-2">
								<label className="text-sm font-medium flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									Account ID
								</label>
								<p className="text-sm py-2 px-3 bg-muted rounded-md font-mono text-xs">
									{user?.uuid || 'N/A'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
