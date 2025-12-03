'use client'

import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<ProtectedRoute requiredRole="ADMIN" redirectTo="/login">
			<div className="flex min-h-screen">
				<AdminSidebar />
				<main className="flex-1 ml-64">{children}</main>
			</div>
		</ProtectedRoute>
	)
}
