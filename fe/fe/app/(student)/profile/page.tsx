'use client'

import { useGetProfile } from '@/service/student/profile.service'
import { ProfileView } from '@/components/student/ProfileView'

export default function StudentProfilePage() {
	const { data: profile, isLoading, error } = useGetProfile()

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">My Profile</h1>
				<p className="mt-2 text-muted-foreground">
					View your profile information
				</p>
			</div>
			<ProfileView profile={profile} isLoading={isLoading} error={error} />
		</div>
	)
}
