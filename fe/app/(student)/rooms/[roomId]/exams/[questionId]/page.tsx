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
import { Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import type { TestAnswerResponse } from '@/interface/student/test.interface'
import type { ExecuteCodeResponse } from '@/interface/student/execute.interface'
import type { SubmitAnswerResponse } from '@/interface/student/submission.interface'

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

			toast({
				title: 'Code executed successfully',
				description: 'Your code has been executed. Check the output below.',
				variant: 'default'
			})
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
			const result = await testMutation.mutateAsync({
				roomId: roomId,
				questionId: questionId,
				answerCode: code
			})
			setTestResult(result)

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
			const result = await submitMutation.mutateAsync({
				roomId: roomId,
				questionId: questionId,
				answerCode: code
			})
			setSubmissionResult(result)

			const statusLower = result.status.toLowerCase()
			const isSuccess =
				statusLower.includes('accepted') ||
				statusLower.includes('success') ||
				statusLower.includes('passed')

			toast({
				title: isSuccess ? 'Submission successful!' : 'Submission completed',
				description: isSuccess
					? `Your answer scored ${result.score} points!`
					: `Status: ${result.status}. Score: ${result.score}`,
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
	const executeError = executeMutation.error
		? executeMutation.error instanceof Error
			? executeMutation.error.message
			: 'An error occurred while executing your code.'
		: ''

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
			/>
			{(testResult || testMutation.isPending || testMutation.error) && (
				<TestResults
					result={testResult}
					isLoading={testMutation.isPending}
					error={testMutation.error as Error | null}
				/>
			)}
			{(submissionResult ||
				submitMutation.isPending ||
				submitMutation.error) && (
				<SubmissionResults
					result={submissionResult}
					isLoading={submitMutation.isPending}
					error={submitMutation.error as Error | null}
				/>
			)}
		</div>
	)
}
