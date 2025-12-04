'use client'

import { useState, useMemo } from 'react'
import {
	useGetAdminUsers,
	useBanUser,
	useUnbanUser
} from '@/service/admin/user.service'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import {
	Users,
	Loader2,
	Search,
	Ban,
	ShieldCheck,
	ChevronLeft,
	ChevronRight
} from 'lucide-react'

const ITEMS_PER_PAGE = 10

export default function AdminUsersPage() {
	const { data, isLoading, error } = useGetAdminUsers()
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)

	// Filter users based on search query
	const filteredUsers = useMemo(() => {
		const users = data?.data || []
		if (!searchQuery.trim()) return users

		const query = searchQuery.toLowerCase()
		return users.filter(
			user =>
				user.studentId.toLowerCase().includes(query) ||
				user.studentFullName.toLowerCase().includes(query) ||
				user.studentEmail.toLowerCase().includes(query)
		)
	}, [data?.data, searchQuery])

	// Pagination
	const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
	const paginatedUsers = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE
		return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
	}, [filteredUsers, currentPage])

	// Reset to page 1 when search changes
	const handleSearch = (value: string) => {
		setSearchQuery(value)
		setCurrentPage(1)
	}

	const formatDate = (dateString: string) => {
		if (!dateString) return 'N/A'
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
	}

	const { toast } = useToast()
	const banUser = useBanUser()
	const unbanUser = useUnbanUser()

	const handleBanUser = (userId: string, isBanned: boolean) => {
		if (isBanned) {
			unbanUser.mutate(userId, {
				onSuccess: () => {
					toast({ title: 'Thành công', description: 'Đã bỏ cấm người dùng' })
				},
				onError: () => {
					toast({
						title: 'Lỗi',
						description: 'Không thể bỏ cấm người dùng',
						variant: 'destructive'
					})
				}
			})
		} else {
			banUser.mutate(userId, {
				onSuccess: () => {
					toast({ title: 'Thành công', description: 'Đã cấm người dùng' })
				},
				onError: () => {
					toast({
						title: 'Lỗi',
						description: 'Không thể cấm người dùng',
						variant: 'destructive'
					})
				}
			})
		}
	}

	const isActionLoading = banUser.isPending || unbanUser.isPending

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
				Failed to load users
			</div>
		)
	}

	const allUsers = data?.data || []

	return (
		<div className="container mx-auto p-6">
			{/* Header - same style as Rooms */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">User Management</h1>
					<p className="text-muted-foreground text-sm">
						Manage all users in the system
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Users className="h-5 w-5 text-muted-foreground" />
					<span className="text-sm font-medium">{allUsers.length} users</span>
				</div>
			</div>

			{/* Search Bar */}
			<div className="mb-6 flex items-center justify-between gap-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by student ID, full name or email..."
						value={searchQuery}
						onChange={e => handleSearch(e.target.value)}
						className="pl-10"
					/>
				</div>
				<span className="text-sm text-muted-foreground whitespace-nowrap">
					Showing {paginatedUsers.length} / {filteredUsers.length} results
				</span>
			</div>

			{/* Empty State */}
			{filteredUsers.length === 0 && (
				<div className="rounded-md border border-dashed p-12 text-center">
					<p className="text-muted-foreground">
						{searchQuery ? 'No matching users found' : 'No users yet'}
					</p>
				</div>
			)}

			{/* Users Table */}
			{filteredUsers.length > 0 && (
				<div className="rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[220px]">Student ID</TableHead>
								<TableHead className="w-[180px]">Full name</TableHead>
								<TableHead className="w-[200px]">Email</TableHead>
								<TableHead className="w-[120px]">Status</TableHead>
								<TableHead className="w-[140px]">Last login</TableHead>
								<TableHead className="w-[140px]">Created at</TableHead>
								<TableHead className="w-[100px] text-center">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedUsers.map(user => (
								<TableRow key={user.studentId}>
									<TableCell className="font-mono text-sm">
										{user.studentId}
									</TableCell>
									<TableCell className="font-medium">
										{user.studentFullName}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{user.studentEmail}
									</TableCell>
									<TableCell>
										{user.isBanned ? (
											<Badge variant="destructive" className="gap-1">
												<Ban className="h-3 w-3" />
												Banned
											</Badge>
										) : (
											<Badge className="gap-1 bg-green-600 hover:bg-green-700">
												<ShieldCheck className="h-3 w-3" />
												Active
											</Badge>
										)}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{formatDate(user.lastLogin)}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{formatDate(user.createdAt)}
									</TableCell>
									<TableCell className="text-center">
										<Button
											variant={user.isBanned ? 'outline' : 'destructive'}
											size="sm"
											disabled={isActionLoading}
											onClick={() =>
												handleBanUser(user.studentId, user.isBanned)
											}
										>
											{user.isBanned ? (
												<>
													<ShieldCheck className="h-4 w-4 mr-1" />
													Unban
												</>
											) : (
												<>
													<Ban className="h-4 w-4 mr-1" />
													Ban
												</>
											)}
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between px-4 py-3 border-t">
							<span className="text-sm text-muted-foreground">
								Page {currentPage} / {totalPages}
							</span>
							<div className="flex items-center gap-1">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									let pageNum: number
									if (totalPages <= 5) {
										pageNum = i + 1
									} else if (currentPage <= 3) {
										pageNum = i + 1
									} else if (currentPage >= totalPages - 2) {
										pageNum = totalPages - 4 + i
									} else {
										pageNum = currentPage - 2 + i
									}
									return (
										<Button
											key={pageNum}
											variant={currentPage === pageNum ? 'default' : 'outline'}
											size="sm"
											className="w-8 h-8 p-0"
											onClick={() => setCurrentPage(pageNum)}
										>
											{pageNum}
										</Button>
									)
								})}
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage(p => Math.min(totalPages, p + 1))
									}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
