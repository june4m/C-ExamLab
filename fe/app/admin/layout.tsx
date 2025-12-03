import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen">
			<AdminSidebar />
			<main className="flex-1 ml-64">
				{children}
			</main>
		</div>
	)
}
