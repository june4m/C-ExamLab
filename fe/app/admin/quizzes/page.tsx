'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	Plus,
	Loader2,
	Search,
	X,
	FileText,
	Eye,
	Calendar,
	ClipboardList,
	MoreHorizontal,
	Pencil,
	Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useGetQuizzes } from '@/service/admin/quiz.service'

export default function AdminQuizzesPage() {
	const { data: quizzes, isLoading, error } = useGetQuizzes()
	const [searchQuery, setSearchQuery] = useState('')

	// Filter quizzes based on search query
	const filteredQuizzes = quizzes
		?.slice()
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
		.filter(quiz => {
			if (!searchQuery.trim()) return true
			const query = searchQuery.toLowerCase()
			return (
				quiz.title.toLowerCase().includes(query) ||
				(quiz.description && quiz.description.toLowerCase().includes(query))
			)
		})

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		if (isNaN(date.getTime())) return 'N/A'
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
	}

	return (
		<div className="container mx-auto max-w-7xl p-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-primary/10">
							<ClipboardList className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-bold">Quiz Management</h1>
							<p className="text-sm text-muted-foreground">
								{filteredQuizzes?.length || 0} quiz
								{(filteredQuizzes?.length || 0) !== 1 ? 'zes' : ''} total
							</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Link href="/admin/quizzes/add-questions">
							<Button variant="outline" size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Questions
							</Button>
						</Link>
						<Link href="/admin/quizzes/new">
							<Button
								size="sm"
								className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white shadow-sm"
							>
								<Plus className="h-4 w-4 mr-2" />
								New Quiz
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Search Bar */}
			<div className="mb-6">
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search quizzes..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="pl-10 pr-10 h-10"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
							onClick={() => setSearchQuery('')}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex flex-col items-center justify-center py-16">
					<Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
					<p className="text-muted-foreground">Loading quizzes...</p>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="rounded-lg bg-destructive/10 p-6 text-center">
					<p className="text-destructive font-medium">
						{error.message || 'Failed to load quizzes'}
					</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => window.location.reload()}
					>
						Try again
					</Button>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && quizzes?.length === 0 && (
				<div className="rounded-lg border-2 border-dashed p-16 text-center">
					<FileText className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
					<h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
					<p className="text-muted-foreground mb-6">
						Create your first quiz to get started
					</p>
					<Link href="/admin/quizzes/new">
						<Button className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white">
							<Plus className="mr-2 h-4 w-4" />
							Create Quiz
						</Button>
					</Link>
				</div>
			)}

			{/* No Search Results */}
			{!isLoading &&
				!error &&
				quizzes &&
				quizzes.length > 0 &&
				filteredQuizzes?.length === 0 && (
					<div className="rounded-lg border-2 border-dashed p-16 text-center">
						<Search className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
						<h3 className="text-lg font-medium mb-2">No results found</h3>
						<p className="text-muted-foreground mb-4">
							No quizzes match &quot;{searchQuery}&quot;
						</p>
						<Button variant="outline" onClick={() => setSearchQuery('')}>
							Clear search
						</Button>
					</div>
				)}

			{/* Quizzes Grid */}
			{!isLoading &&
				!error &&
				filteredQuizzes &&
				filteredQuizzes.length > 0 && (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredQuizzes.map(quiz => (
							<Card
								key={quiz.uuid}
								className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border hover:border-primary/30"
							>
								{/* Status indicator */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#40E0D0] to-[#40E0D0]/50" />

								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<CardTitle className="text-base font-semibold line-clamp-2 flex-1 group-hover:text-primary transition-colors">
											{quiz.title}
										</CardTitle>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/admin/quizzes/${quiz.uuid}`}>
														<Eye className="h-4 w-4 mr-2" />
														View Details
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/admin/quizzes/${quiz.uuid}/edit`}>
														<Pencil className="h-4 w-4 mr-2" />
														Edit Quiz
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href={`/admin/quizzes/add-questions?quizId=${quiz.uuid}`}
													>
														<Copy className="h-4 w-4 mr-2" />
														Add Questions
													</Link>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									{quiz.description ? (
										<CardDescription className="line-clamp-2 text-sm mt-1.5">
											{quiz.description}
										</CardDescription>
									) : (
										<CardDescription className="text-sm mt-1.5 italic">
											No description
										</CardDescription>
									)}
								</CardHeader>

								<CardContent className="pt-0">
									{/* Meta info */}
									<div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
										<div className="flex items-center gap-1">
											<Calendar className="h-3.5 w-3.5" />
											<span>{formatDate(quiz.createdAt)}</span>
										</div>
										<Badge
											variant={quiz.isActive ? 'default' : 'secondary'}
											className={`text-xs ${
												quiz.isActive
													? 'bg-green-100 text-green-700 hover:bg-green-100'
													: ''
											}`}
										>
											{quiz.isActive ? 'Active' : 'Inactive'}
										</Badge>
									</div>

									{/* Action button */}
									<Link href={`/admin/quizzes/${quiz.uuid}`}>
										<Button
											variant="outline"
											size="sm"
											className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
										>
											<Eye className="h-4 w-4 mr-2" />
											View Details
										</Button>
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				)}
		</div>
	)
}
