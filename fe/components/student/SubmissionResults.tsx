'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle, AlertCircle, Loader2, Trophy, Clock, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubmitAnswerResponse } from '@/interface/student/submission.interface'

interface SubmissionResultsProps {
	result: SubmitAnswerResponse | null
	isLoading?: boolean
	error?: Error | null
}

function getStatusBadgeVariant(status: string): 'success' | 'destructive' | 'warning' | 'default' {
	const lowerStatus = status.toLowerCase()
	if (lowerStatus.includes('accepted') || lowerStatus.includes('success') || lowerStatus.includes('passed')) {
		return 'success'
	}
	if (lowerStatus.includes('error') || lowerStatus.includes('failed') || lowerStatus.includes('wrong')) {
		return 'destructive'
	}
	if (lowerStatus.includes('timeout') || lowerStatus.includes('memory')) {
		return 'warning'
	}
	return 'default'
}

function formatTime(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`
	}
	return `${(ms / 1000).toFixed(2)}s`
}

function formatMemory(kb: number): string {
	if (kb < 1024) {
		return `${kb} KB`
	}
	return `${(kb / 1024).toFixed(2)} MB`
}

export function SubmissionResults({
	result,
	isLoading = false,
	error = null
}: SubmissionResultsProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Submission Results</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center p-8">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-sm text-muted-foreground">
								Submitting and evaluating your answer...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Submission Results</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<div>
							<p className="text-sm font-medium text-destructive">
								Error submitting answer
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{error instanceof Error ? error.message : 'An unknown error occurred'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!result) {
		return null
	}

	const statusVariant = getStatusBadgeVariant(result.status)
	const passedCount = result.details.filter(d => 
		d.status.toLowerCase().includes('accepted') || 
		d.status.toLowerCase().includes('passed') ||
		d.status.toLowerCase().includes('success')
	).length
	const totalCount = result.details.length

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Submission Results</CardTitle>
					<Badge variant={statusVariant} className="text-sm">
						{statusVariant === 'success' ? (
							<>
								<CheckCircle2 className="mr-1 h-3 w-3" />
								{result.status}
							</>
						) : (
							<>
								<XCircle className="mr-1 h-3 w-3" />
								{result.status}
							</>
						)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="p-4 rounded-md bg-muted/50 border">
						<div className="flex items-center gap-2 mb-1">
							<Trophy className="h-4 w-4 text-primary" />
							<p className="text-xs font-medium text-muted-foreground">Score</p>
						</div>
						<p className="text-2xl font-bold">{result.score}</p>
					</div>
					<div className="p-4 rounded-md bg-muted/50 border">
						<div className="flex items-center gap-2 mb-1">
							<Clock className="h-4 w-4 text-primary" />
							<p className="text-xs font-medium text-muted-foreground">Total Runtime</p>
						</div>
						<p className="text-2xl font-bold">{formatTime(result.totalRunTime)}</p>
					</div>
					<div className="p-4 rounded-md bg-muted/50 border">
						<div className="flex items-center gap-2 mb-1">
							<HardDrive className="h-4 w-4 text-primary" />
							<p className="text-xs font-medium text-muted-foreground">Memory Used</p>
						</div>
						<p className="text-2xl font-bold">{formatMemory(result.memoryUsed)}</p>
					</div>
					<div className="p-4 rounded-md bg-muted/50 border">
						<div className="flex items-center gap-2 mb-1">
							<CheckCircle2 className="h-4 w-4 text-primary" />
							<p className="text-xs font-medium text-muted-foreground">Test Cases</p>
						</div>
						<p className="text-2xl font-bold">
							{passedCount}/{totalCount}
						</p>
					</div>
				</div>

				<Separator />

				{/* Detailed Test Case Results */}
				<div>
					<h3 className="text-sm font-semibold mb-4">Test Case Details</h3>
					<div className="space-y-4">
						{result.details.map((detail, index) => {
							const detailStatusVariant = getStatusBadgeVariant(detail.status)
							const isPassed = detailStatusVariant === 'success'

							return (
								<div key={index}>
									<div
										className={cn(
											'p-4 rounded-md border',
											isPassed
												? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
												: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
										)}
									>
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2">
												{isPassed ? (
													<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
												) : (
													<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
												)}
												<span className="font-semibold text-sm">
													Test Case {detail.testCaseIndex}
												</span>
												<Badge variant={detailStatusVariant} className="text-xs">
													{detail.status}
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{formatTime(detail.runTime)}
												</span>
												<span className="flex items-center gap-1">
													<HardDrive className="h-3 w-3" />
													{formatMemory(detail.memoryUsed)}
												</span>
											</div>
										</div>

										<div className="space-y-3 text-sm">
											{detail.stdout && (
												<div>
													<p className="font-medium text-muted-foreground mb-1">
														Standard Output:
													</p>
													<pre className="p-2 rounded bg-muted font-mono text-xs overflow-x-auto">
														{detail.stdout || '(empty)'}
													</pre>
												</div>
											)}

											{detail.stderr && (
												<div>
													<p className="font-medium text-destructive mb-1">
														Standard Error:
													</p>
													<pre className="p-2 rounded bg-destructive/10 border border-destructive/20 font-mono text-xs text-destructive overflow-x-auto">
														{detail.stderr}
													</pre>
												</div>
											)}
										</div>
									</div>
									{index < result.details.length - 1 && (
										<Separator className="my-4" />
									)}
								</div>
							)
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

