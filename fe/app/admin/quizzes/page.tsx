'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Loader2, Search, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGetQuizzes } from '@/service/admin/quiz.service'

export default function AdminQuizzesPage() {
	const { data: quizzes, isLoading, error } = useGetQuizzes()
	const [searchQuery, setSearchQuery] = useState('')

	// Filter quizzes based on search query
	const filteredQuizzes = quizzes
		?.slice()
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.filter(quiz => {
			if (!searchQuery.trim()) return true
			const query = searchQuery.toLowerCase()
			return (
				quiz.title.toLowerCase().includes(query) ||
				(quiz.description && quiz.description.toLowerCase().includes(query))
			)
		})

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					Quizzes | {filteredQuizzes?.length || 0}
				</h1>
				<Link href="/admin/quizzes/new">
					<Button className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white shadow-sm">
						<Plus className="h-4 w-4 mr-2" />
						Create New Quiz
					</Button>
				</Link>
			</div>

			{/* Search Bar */}
			<div className="mb-6">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by title or description..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="pl-10 pr-10"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
							onClick={() => setSearchQuery('')}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
					{error.message || 'Failed to load quizzes'}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && quizzes?.length === 0 && (
				<div className="rounded-md border border-dashed p-12 text-center">
					<FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
					<p className="text-muted-foreground">No quizzes yet</p>
					<Link href="/admin/quizzes/new">
						<Button className="mt-4">
							<Plus className="mr-2 h-4 w-4" />
							Create the first quiz
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
					<div className="rounded-md border border-dashed p-12 text-center">
						<Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
						<p className="text-muted-foreground">
							No quizzes found matching &quot;{searchQuery}&quot;
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => setSearchQuery('')}
						>
							Clear search
						</Button>
					</div>
				)}

			{/* Quizzes Grid */}
			{!isLoading && !error && filteredQuizzes && filteredQuizzes.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredQuizzes.map(quiz => (
						<Card key={quiz.uuid} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<div className="flex items-start justify-between">
									<CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
									<Badge variant={quiz.isActive ? 'default' : 'secondary'}>
										{quiz.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>
								{quiz.description && (
									<CardDescription className="line-clamp-2 mt-2">
										{quiz.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
									<span>
										Created:{' '}
										{new Date(quiz.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})}
									</span>
								</div>
								<div className="flex flex-col gap-2">
  <Link href={`/admin/quizzes/${quiz.uuid}/submissions`}>
    <Button variant="outline" className="w-full">
      View Submissions
    </Button>
  </Link>
  <div className="flex gap-2">
    <Link href={`/admin/quizzes/${quiz.uuid}/edit`}>
      <Button variant="secondary" className="flex-1">Edit</Button>
    </Link>
    <Button
      variant="destructive"
      className="flex-1"
      onClick={() => {
        if(window.confirm('Are you sure you want to delete this quiz?')) {
          alert('Delete quiz API not implemented yet!');
        }
      }}
    >
      Delete
    </Button>
  </div>
</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}

