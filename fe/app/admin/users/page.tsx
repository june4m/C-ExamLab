'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Filter, Plus, Link as LinkIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { User } from '@/interface'

// Mock data - sẽ được thay thế bằng API call sau
const mockUsers: User[] = [
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '002',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
	{
		studentId: '001',
		fullName: 'Đặng Quang Hiến',
		email: 'anhvietanh1123@gmail.com',
		lastLogin: '02/12/2025 09:30',
		createdAt: '15/08/2025 08:00',
		updatedAt: '25/11/2025 09:00',
	},
]

export default function AdminUsersPage() {
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10
	const totalPages = Math.ceil(mockUsers.length / itemsPerPage)

	const handleDelete = (studentId: string) => {
		// TODO: Implement delete functionality
		console.log('Delete user:', studentId)
	}

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					Student | {mockUsers.length}
				</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon">
						<Filter className="h-5 w-5" />
					</Button>
					<Link href="/admin/users/create">
						<Button className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white shadow-sm">
							<Plus className="h-4 w-4" />
							Add New Student
						</Button>
					</Link>
				</div>
			</div>

			{/* Table */}
			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-6 py-3 text-left text-sm font-semibold text-destructive">
									Student ID
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Full Name
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Email
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Last Login
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Create At
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Update At
								</th>
								<th className="px-6 py-3 text-left text-sm font-semibold">
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{mockUsers.map((user, index) => (
								<tr
									key={`${user.studentId}-${index}`}
									className="border-b transition-colors hover:bg-muted/50"
								>
									<td className="px-6 py-4 text-sm">{user.studentId}</td>
									<td className="px-6 py-4 text-sm">{user.fullName}</td>
									<td className="px-6 py-4 text-sm">{user.email}</td>
									<td className="px-6 py-4 text-sm">{user.lastLogin}</td>
									<td className="px-6 py-4 text-sm">{user.createdAt}</td>
									<td className="px-6 py-4 text-sm">{user.updatedAt}</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<Link href={`/admin/users/${user.studentId}`}>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
												>
													<LinkIcon className="h-4 w-4" />
												</Button>
											</Link>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => handleDelete(user.studentId)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-center gap-2 border-t p-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
						disabled={currentPage === 1}
					>
						Prev
					</Button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
						if (
							page === 1 ||
							page === totalPages ||
							(page >= currentPage - 1 && page <= currentPage + 1)
						) {
							return (
								<Button
									key={page}
									variant={currentPage === page ? 'default' : 'outline'}
									size="sm"
									onClick={() => setCurrentPage(page)}
									className="min-w-[40px]"
								>
									{page}
								</Button>
							)
						} else if (
							page === currentPage - 2 ||
							page === currentPage + 2
						) {
							return (
								<span key={page} className="px-2 text-muted-foreground">
									...
								</span>
							)
						}
						return null
					})}
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setCurrentPage((prev) => Math.min(totalPages, prev + 1))
						}
						disabled={currentPage === totalPages}
					>
						Next
					</Button>
				</div>
			</Card>
		</div>
	)
}
