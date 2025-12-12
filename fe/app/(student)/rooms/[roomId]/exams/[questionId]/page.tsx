'use client'

import { useState, use } from 'react'
import { ExamQuestionView } from '@/components/student/ExamQuestionView'
import { TestResults } from '@/components/student/TestResults'
import { SubmissionResults } from '@/components/student/SubmissionResults'
import { useGetQuestion } from '@/service/student/exam.service'
import { useGetRoomDetails } from '@/service/student/room.service'
import { useTestAnswer } from '@/service/student/test.service'
import { useExecuteCode } from '@/service/student/execute.service'
import { useSubmitAnswer } from '@/service/student/submission.service'
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TestAnswerResponse } from '@/interface/student/test.interface'
import type { ExecuteCodeResponse } from '@/interface/student/execute.interface'
import type { SubmitAnswerResponse } from '@/interface/student/submission.interface'

// Helper functions for status display
function getStatusDisplayName(status: string): string {
	const statusMap: Record<string, string> = {
		PENDING: 'Pending',
		RUNNING: 'Running',
		AC: 'Accepted',
		WA: 'Wrong Answer',
		TLE: 'Time Limit Exceeded',
		MLE: 'Memory Limit Exceeded',
		RE: 'Runtime Error',
		CE: 'Compilation Error',
		JUDGE_ERROR: 'Judge Error',
		SKIP: 'Skipped'
	}
	return statusMap[status.toUpperCase()] || status
}

function getStatusBadgeVariant(
	status: string
): 'success' | 'destructive' | 'warning' | 'default' {
	const upperStatus = status.toUpperCase()

	if (upperStatus === 'AC') {
		return 'success'
	}

	if (upperStatus === 'TLE' || upperStatus === 'MLE') {
		return 'warning'
	}

	if (
		upperStatus === 'WA' ||
		upperStatus === 'RE' ||
		upperStatus === 'CE' ||
		upperStatus === 'JUDGE_ERROR'
	) {
		return 'destructive'
	}

	return 'default'
}

export default function QuestionPage({
	params
}: {
	params: Promise<{ roomId: string; questionId: string }>
}) {
	const { roomId, questionId } = use(params)
	const {
		data: question,
		isLoading: questionLoading,
		error: questionError
	} = useGetQuestion(roomId, questionId)
	const {
		data: room,
		isLoading: roomLoading,
		error: roomError
	} = useGetRoomDetails(roomId)

	const testMutation = useTestAnswer()
	const executeMutation = useExecuteCode()
	const submitMutation = useSubmitAnswer()
	const { toast } = useToast()
	const [testResult, setTestResult] = useState<TestAnswerResponse | null>(null)
	const [executeResult, setExecuteResult] =
		useState<ExecuteCodeResponse | null>(null)
	const [submissionResult, setSubmissionResult] =
		useState<SubmitAnswerResponse | null>(null)

	// Collapsible states for better UX
	const [isTestResultsOpen, setIsTestResultsOpen] = useState(false)
	const [isSubmissionResultsOpen, setIsSubmissionResultsOpen] = useState(false)

	const isLoading = questionLoading || roomLoading
	const error = questionError || roomError

	const handleExecute = async (code: string) => {
		try {
			setExecuteResult(null)
			const result = await executeMutation.mutateAsync({
				roomId: roomId,
				questionId: questionId,
				answerCode: code
			})
			setExecuteResult(result)

			// Check if there's a compilation error
			if (result.error) {
				toast({
					title: 'Compilation failed',
					description: result.error,
					variant: 'destructive'
				})
			} else {
				toast({
					title: 'Code executed successfully',
					description: 'Your code has been executed. Check the output below.',
					variant: 'default'
				})
			}
		} catch (error) {
			toast({
				title: 'Execution failed',
				description:
					error instanceof Error
						? error.message
						: 'An error occurred while executing your code.',
				variant: 'destructive'
			})
		}
	}

	const handleTest = async (code: string) => {
		try {
			setTestResult(null)
			setIsTestResultsOpen(true) // Auto-expand results
			const result = await testMutation.mutateAsync({
				roomId: roomId,
				questionId: questionId,
				answerCode: code
			})
			setTestResult(result)

			// Check compilation status first
			if (result.compileStatus !== 'success') {
				toast({
					title: 'Compilation failed',
					description:
						'Your code could not be compiled. Please check for syntax errors.',
					variant: 'destructive'
				})
				return
			}

			if (result.overallPassed) {
				toast({
					title: 'All tests passed!',
					description: `All ${result.results.length} test cases passed successfully.`,
					variant: 'default'
				})
			} else {
				const passedCount = result.results.filter(r => r.passed).length
				toast({
					title: 'Some tests failed',
					description: `${passedCount}/${result.results.length} test cases passed.`,
					variant: 'destructive'
				})
			}
		} catch (error) {
			toast({
				title: 'Test failed',
				description:
					error instanceof Error
						? error.message
						: 'An error occurred while running tests.',
				variant: 'destructive'
			})
		}
	}

	const handleSubmit = async (code: string) => {
		try {
			setSubmissionResult(null)
			setIsSubmissionResultsOpen(true) // Auto-expand results
			const result = await submitMutation.mutateAsync({
				roomId: roomId,
				questionId: questionId,
				answerCode: code
			})
			setSubmissionResult(result)

			// Check if submission was accepted
			const isSuccess = result.status.toUpperCase() === 'AC'
			const statusDisplayName = getStatusDisplayName(result.status)

			toast({
				title: isSuccess ? 'Submission successful!' : 'Submission completed',
				description: isSuccess
					? `Your answer scored ${result.score ?? 0} points!`
					: `Status: ${statusDisplayName}. Score: ${result.score ?? 0}`,
				variant: isSuccess ? 'default' : 'destructive'
			})
		} catch (error) {
			toast({
				title: 'Submission failed',
				description:
					error instanceof Error
						? error.message
						: 'An error occurred while submitting your answer.',
				variant: 'destructive'
			})
		}
	}

	// Format execute results for display
	const formatExecuteOutput = (result: ExecuteCodeResponse | null): string => {
		if (!result || !result.results || result.results.length === 0) {
			return ''
		}

		return result.results
			.map((r, index) => {
				return `Test Case ${index + 1}:
Current Test Case Output:
${r.currentTestCase || '(no output)'}

Example Test Case Output:
${r.exampleTestCase || '(no output)'}
${index < result.results.length - 1 ? '\n---\n' : ''}`
			})
			.join('\n')
	}

	const executeOutput = formatExecuteOutput(executeResult)
	const executeError = executeResult?.error || ''
	const executeErrorCode = executeResult?.errorCode
	const executeErrorLineNumber = executeResult?.lineNumber
	const executeErrorColumnNumber = executeResult?.columnNumber
	const executeErrorDetails = executeResult?.errorDetails

	if (isLoading) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardContent className="flex items-center justify-center p-12">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-muted-foreground">Loading question...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (error || !question || !room) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardContent className="flex items-center justify-center p-12">
						<div className="flex flex-col items-center gap-4">
							<AlertCircle className="h-8 w-8 text-destructive" />
							<p className="text-destructive">
								{error instanceof Error
									? error.message
									: 'Failed to load question or room'}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	const hasTestResults =
		testResult || testMutation.isPending || testMutation.error
	const hasSubmissionResults =
		submissionResult || submitMutation.isPending || submitMutation.error

	// Get test result summary for badge
	const getTestSummary = () => {
		if (!testResult || testResult.compileStatus !== 'success') return null
		const passedCount = testResult.results.filter(r => r.passed).length
		const totalCount = testResult.results.length
		return {
			passed: passedCount,
			total: totalCount,
			allPassed: testResult.overallPassed
		}
	}

	const testSummary = getTestSummary()

	return (
		<div className="container mx-auto p-4 space-y-6">
			<ExamQuestionView
				question={question}
				room={room}
				onExecute={handleExecute}
				onTest={handleTest}
				onSubmit={handleSubmit}
				isExecuting={executeMutation.isPending}
				isTesting={testMutation.isPending}
				isSubmitting={submitMutation.isPending}
				executeOutput={executeOutput}
				executeError={executeError}
				executeErrorCode={executeErrorCode}
				executeErrorLineNumber={executeErrorLineNumber}
				executeErrorColumnNumber={executeErrorColumnNumber}
				executeErrorDetails={executeErrorDetails}
			/>

			{/* Test Results - Collapsible */}
			{hasTestResults && (
				<Collapsible
					open={isTestResultsOpen}
					onOpenChange={setIsTestResultsOpen}
				>
					<Card className="border-2">
						<CollapsibleTrigger className="w-full">
							<CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{isTestResultsOpen ? (
											<ChevronUp className="h-5 w-5 text-muted-foreground" />
										) : (
											<ChevronDown className="h-5 w-5 text-muted-foreground" />
										)}
										<CardTitle className="text-lg">Test Results</CardTitle>
										{testMutation.isPending && (
											<Loader2 className="h-4 w-4 animate-spin text-primary" />
										)}
									</div>
									{testSummary && (
										<Badge
											variant={
												testSummary.allPassed ? 'success' : 'destructive'
											}
											className="text-sm"
										>
											{testSummary.passed}/{testSummary.total} Passed
										</Badge>
									)}
									{testMutation.error && (
										<Badge variant="destructive" className="text-sm">
											Error
										</Badge>
									)}
									{testResult && testResult.compileStatus !== 'success' && (
										<Badge variant="destructive" className="text-sm">
											Compilation Failed
										</Badge>
									)}
								</div>
							</CardHeader>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<CardContent className="pt-0">
								<TestResults
									result={testResult}
									isLoading={testMutation.isPending}
									error={
										testMutation.error instanceof Error
											? testMutation.error
											: testMutation.error
											? new Error(String(testMutation.error))
											: null
									}
									noCard={true}
								/>
							</CardContent>
						</CollapsibleContent>
					</Card>
				</Collapsible>
			)}

			{/* Submission Results - Collapsible */}
			{hasSubmissionResults && (
				<Collapsible
					open={isSubmissionResultsOpen}
					onOpenChange={setIsSubmissionResultsOpen}
				>
					<Card
						className={cn(
							'border-2',
							submissionResult && submissionResult.status.toUpperCase() === 'AC'
								? 'border-green-500 dark:border-green-600'
								: submissionResult &&
								  (submissionResult.status.toUpperCase() === 'WA' ||
										submissionResult.status.toUpperCase() === 'RE' ||
										submissionResult.status.toUpperCase() === 'CE' ||
										submissionResult.status.toUpperCase() === 'JUDGE_ERROR')
								? 'border-red-500 dark:border-red-600'
								: submissionResult &&
								  (submissionResult.status.toUpperCase() === 'TLE' ||
										submissionResult.status.toUpperCase() === 'MLE')
								? 'border-yellow-500 dark:border-yellow-600'
								: ''
						)}
					>
						<CollapsibleTrigger className="w-full">
							<CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{isSubmissionResultsOpen ? (
											<ChevronUp className="h-5 w-5 text-muted-foreground" />
										) : (
											<ChevronDown className="h-5 w-5 text-muted-foreground" />
										)}
										<CardTitle className="text-lg">
											Submission Results
										</CardTitle>
										{submitMutation.isPending && (
											<Loader2 className="h-4 w-4 animate-spin text-primary" />
										)}
									</div>
									{submissionResult && (
										<div className="flex items-center gap-2">
											<Badge
												variant={getStatusBadgeVariant(submissionResult.status)}
												className="text-sm"
											>
												{getStatusDisplayName(submissionResult.status)}
											</Badge>
											{submissionResult.score !== null &&
												submissionResult.score !== undefined && (
													<Badge
														variant="outline"
														className="text-sm font-semibold"
													>
														Score: {submissionResult.score}
													</Badge>
												)}
										</div>
									)}
									{submitMutation.error && (
										<Badge variant="destructive" className="text-sm">
											Error
										</Badge>
									)}
								</div>
							</CardHeader>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<CardContent className="pt-0">
								<SubmissionResults
									result={submissionResult}
									isLoading={submitMutation.isPending}
									error={
										submitMutation.error instanceof Error
											? submitMutation.error
											: submitMutation.error
											? new Error(String(submitMutation.error))
											: null
									}
									noCard={true}
								/>
							</CardContent>
						</CollapsibleContent>
					</Card>
				</Collapsible>
			)}
		</div>
	)
}
