'use client'

import { ProfileEditForm } from '@/components/student/ProfileEditForm'

export default function EditStudentProfilePage() {
	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Edit Profile</h1>
				<p className="mt-2 text-muted-foreground">
					Update your profile information
				</p>
			</div>
			<ProfileEditForm />
		</div>
	)
}
