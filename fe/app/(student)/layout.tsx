'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { StudentSidebar } from '@/components/student/StudentSidebar'

export default function StudentLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<ProtectedRoute>
			<div className="flex min-h-screen">
				<StudentSidebar />
				<main className="flex-1 ml-64">
					{children}
				</main>
			</div>
		</ProtectedRoute>
	)
}
