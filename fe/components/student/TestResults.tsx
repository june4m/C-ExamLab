'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TestAnswerResponse } from '@/interface/student/test.interface'

interface TestResultsProps {
	result: TestAnswerResponse | null
	isLoading?: boolean
	error?: Error | null
}

export function TestResults({
	result,
	isLoading = false,
	error = null
}: TestResultsProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Test Results</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center p-8">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-sm text-muted-foreground">
								Running tests...
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
					<CardTitle className="text-lg">Test Results</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<div>
							<p className="text-sm font-medium text-destructive">
								Error running tests
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

	// Check if compilation failed
	if (result.compileStatus !== 'success') {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Test Results</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20">
						<XCircle className="h-5 w-5 text-destructive" />
						<div>
							<p className="text-sm font-medium text-destructive">
								Compilation Failed
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Please fix compilation errors before testing.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	const passedCount = result.results.filter(r => r.passed).length
	const totalCount = result.results.length

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Test Results</CardTitle>
					<Badge
						variant={result.overallPassed ? 'success' : 'destructive'}
						className="text-sm"
					>
						{result.overallPassed ? (
							<>
								<CheckCircle2 className="mr-1 h-3 w-3" />
								All Tests Passed
							</>
						) : (
							<>
								<XCircle className="mr-1 h-3 w-3" />
								{passedCount}/{totalCount} Tests Passed
							</>
						)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{result.results.map((testCase, index) => (
					<div key={index}>
						<div
							className={cn(
								'p-4 rounded-md border',
								testCase.passed
									? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
									: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
							)}
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-2">
									{testCase.passed ? (
										<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
									) : (
										<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
									)}
									<span className="font-semibold text-sm">
										Test Case {testCase.index}
									</span>
									<Badge
										variant={testCase.passed ? 'success' : 'destructive'}
										className="text-xs"
									>
										{testCase.passed ? 'Passed' : 'Failed'}
									</Badge>
								</div>
							</div>

							<div className="space-y-3 text-sm">
								<div>
									<p className="font-medium text-muted-foreground mb-1">
										Input:
									</p>
									<pre className="p-2 rounded bg-muted font-mono text-xs overflow-x-auto">
										{testCase.input || '(empty)'}
									</pre>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<p className="font-medium text-muted-foreground mb-1">
											Expected Output:
										</p>
										<pre
											className={cn(
												'p-2 rounded bg-muted font-mono text-xs overflow-x-auto',
												!testCase.passed &&
													'ring-2 ring-yellow-400 dark:ring-yellow-500'
											)}
										>
											{testCase.expectedOutput || '(empty)'}
										</pre>
									</div>
									<div>
										<p className="font-medium text-muted-foreground mb-1">
											Actual Output:
										</p>
										<pre
											className={cn(
												'p-2 rounded bg-muted font-mono text-xs overflow-x-auto',
												!testCase.passed &&
													'ring-2 ring-red-400 dark:ring-red-500'
											)}
										>
											{testCase.actualOutput || '(empty)'}
										</pre>
									</div>
								</div>

								{testCase.error && (
									<div>
										<p className="font-medium text-destructive mb-1">Error:</p>
										<pre className="p-2 rounded bg-destructive/10 border border-destructive/20 font-mono text-xs text-destructive overflow-x-auto">
											{testCase.error}
										</pre>
									</div>
								)}
							</div>
						</div>
						{index < result.results.length - 1 && (
							<Separator className="my-4" />
						)}
					</div>
				))}
			</CardContent>
		</Card>
	)
}

