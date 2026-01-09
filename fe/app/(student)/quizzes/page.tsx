'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	Search,
	X,
	FileText,
	Loader2,
	ArrowRight,
	Clock,
	BookOpen,
	Sparkles
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
import { useGetQuizzes } from '@/service/student/quiz.service'

export default function QuizzesPage() {
	const { data: quizzes, isLoading, error } = useGetQuizzes()
	const [searchQuery, setSearchQuery] = useState('')

	// Filter quizzes based on search query (only show active quizzes)
	const filteredQuizzes = quizzes
		?.filter(quiz => quiz.isActive) // Only show active quizzes
		.slice()
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
		if (isNaN(date.getTime())) return ''
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		})
	}

	return (
		<div className="container mx-auto max-w-6xl p-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="p-2 rounded-lg bg-primary/10">
						<BookOpen className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-3xl font-bold">Quizzes</h1>
				</div>
				<p className="text-muted-foreground">
					Test your knowledge with our collection of quizzes
				</p>
			</div>

			{/* Search Bar */}
			<div className="mb-8">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search quizzes..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="pl-10 pr-10 h-11"
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
				{filteredQuizzes && filteredQuizzes.length > 0 && (
					<p className="text-sm text-muted-foreground mt-2">
						{filteredQuizzes.length} quiz
						{filteredQuizzes.length !== 1 ? 'zes' : ''} available
					</p>
				)}
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
			{!isLoading && !error && filteredQuizzes?.length === 0 && (
				<div className="rounded-lg border-2 border-dashed p-16 text-center">
					<FileText className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						{searchQuery ? 'No quizzes found' : 'No quizzes available'}
					</h3>
					<p className="text-muted-foreground mb-4">
						{searchQuery
							? `No quizzes match "${searchQuery}"`
							: 'Check back later for new quizzes'}
					</p>
					{searchQuery && (
						<Button variant="outline" onClick={() => setSearchQuery('')}>
							Clear search
						</Button>
					)}
				</div>
			)}

			{/* Quizzes Grid */}
			{!isLoading &&
				!error &&
				filteredQuizzes &&
				filteredQuizzes.length > 0 && (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filteredQuizzes.map((quiz, index) => (
							<Card
								key={quiz.uuid}
								className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
							>
								{/* New badge for recent quizzes */}
								{index < 3 && (
									<div className="absolute top-3 right-3">
										<Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
											<Sparkles className="h-3 w-3 mr-1" />
											New
										</Badge>
									</div>
								)}

								<CardHeader className="pb-3">
									<CardTitle className="text-xl line-clamp-2 pr-16 group-hover:text-primary transition-colors">
										{quiz.title}
									</CardTitle>
									{quiz.description ? (
										<CardDescription className="line-clamp-2 mt-2 min-h-[40px]">
											{quiz.description}
										</CardDescription>
									) : (
										<CardDescription className="line-clamp-2 mt-2 min-h-[40px] italic">
											No description
										</CardDescription>
									)}
								</CardHeader>

								<CardContent className="pt-0">
									{/* Quiz meta info */}
									<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
										{quiz.createdAt && formatDate(quiz.createdAt) && (
											<div className="flex items-center gap-1">
												<Clock className="h-3.5 w-3.5" />
												<span>{formatDate(quiz.createdAt)}</span>
											</div>
										)}
										<Badge
											variant="outline"
											className="bg-green-50 text-green-700 border-green-200"
										>
											Active
										</Badge>
									</div>

									{/* Action button */}
									<Link href={`/quizzes/${quiz.uuid}`} className="block">
										<Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
											Start Quiz
											<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
