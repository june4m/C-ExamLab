'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X, FileText, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGetQuizzes } from '@/service/student/quiz.service'

export default function QuizzesPage() {
	const { data: quizzes, isLoading, error } = useGetQuizzes()
	const [searchQuery, setSearchQuery] = useState('')

	// Filter quizzes based on search query (only show active quizzes)
	const filteredQuizzes = quizzes
		?.filter(quiz => quiz.isActive) // Only show active quizzes
		.slice()
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
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Quizzes</h1>
				<p className="text-muted-foreground mt-2">
					Take quizzes to test your knowledge
				</p>
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
			{!isLoading && !error && filteredQuizzes?.length === 0 && (
				<div className="rounded-md border border-dashed p-12 text-center">
					<FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
					<p className="text-muted-foreground">
						{searchQuery
							? `No quizzes found matching "${searchQuery}"`
							: 'No active quizzes available'}
					</p>
					{searchQuery && (
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => setSearchQuery('')}
						>
							Clear search
						</Button>
					)}
				</div>
			)}

			{/* Quizzes Grid */}
			{!isLoading && !error && filteredQuizzes && filteredQuizzes.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredQuizzes.map(quiz => (
						<Card key={quiz.uuid} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
								{quiz.description && (
									<CardDescription className="line-clamp-2 mt-2">
										{quiz.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<Badge variant="default">Active</Badge>
									<Link href={`/quizzes/${quiz.uuid}`}>
										<Button variant="outline" size="sm">
											Start Quiz
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}

