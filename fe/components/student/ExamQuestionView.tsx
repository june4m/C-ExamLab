'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeEditor } from '@/components/CodeEditor'
import { OutputPanel } from '@/components/OutputPanel'
import { ExamTimer } from './ExamTimer'
import { Play, Send, Loader2, Zap } from 'lucide-react'
import type { Exam } from '@/interface/student/exam.interface'
import type { Room } from '@/interface/student/room.interface'

interface ExamQuestionViewProps {
	question: Exam
	room: Room
	serverTime?: Date | string
	onTest?: (code: string) => void
	onExecute?: (code: string) => void
	onSubmit?: (code: string) => void
	isTesting?: boolean
	isExecuting?: boolean
	isSubmitting?: boolean
	testOutput?: string
	testError?: string
	executeOutput?: string
	executeError?: string
	executeErrorCode?: string
	executeErrorLineNumber?: number
	executeErrorColumnNumber?: number
	executeErrorDetails?: string
}

const STORAGE_KEY_PREFIX = 'exam_code_'

function getDefaultCode() {
	return `#include <stdio.h>

int main() {
    // Your code here

    return 0;
}`
}

export function ExamQuestionView({
	question,
	room,
	serverTime,
	onTest,
	onExecute,
	onSubmit,
	isTesting = false,
	isExecuting = false,
	isSubmitting = false,
	testOutput = '',
	testError = '',
	executeOutput = '',
	executeError = '',
	executeErrorCode,
	executeErrorLineNumber,
	executeErrorColumnNumber,
	executeErrorDetails
}: ExamQuestionViewProps) {
	const storageKey = `${STORAGE_KEY_PREFIX}${question.questionId}`

	// Initialize code from localStorage or empty
	const [code, setCode] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem(storageKey)
			return saved || getDefaultCode()
		}
		return getDefaultCode()
	})

	// Auto-save to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined' && code) {
			const timeoutId = setTimeout(() => {
				localStorage.setItem(storageKey, code)
			}, 1000) // Debounce: save 1 second after last change

			return () => clearTimeout(timeoutId)
		}
	}, [code, storageKey])

	const handleCodeChange = useCallback((value: string | undefined) => {
		setCode(value || '')
	}, [])

	const handleTest = useCallback(() => {
		if (onTest && code.trim()) {
			onTest(code)
		}
	}, [onTest, code])

	const handleExecute = useCallback(() => {
		if (onExecute && code.trim()) {
			onExecute(code)
		}
	}, [onExecute, code])

	const handleSubmit = useCallback(() => {
		if (onSubmit && code.trim()) {
			// Confirm before submitting
			if (
				window.confirm(
					'Are you sure you want to submit your answer? This action cannot be undone.'
				)
			) {
				onSubmit(code)
			}
		}
	}, [onSubmit, code])

	const handleTimeExpired = useCallback(() => {
		// Auto-submit when time expires (optional)
		// if (onSubmit && code.trim()) {
		//   onSubmit(code)
		// }
		alert('Time has expired! Please submit your answer.')
	}, [])

	return (
		<div className="container mx-auto p-4 space-y-6">
			{/* Header with Timer */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1">
					<h1 className="text-3xl font-bold">{question.title}</h1>
					<p className="mt-2 text-muted-foreground">
						Score: {question.score} points | Time Limit: {question.time_limit}{' '}
						minutes
					</p>
				</div>
				<div className="md:w-64">
					<ExamTimer
						closeTime={room.close_time}
						serverTime={serverTime}
						onTimeExpired={handleTimeExpired}
					/>
				</div>
			</div>

			{/* Question Description */}
			<Card>
				<CardHeader>
					<CardTitle>Problem Description</CardTitle>
				</CardHeader>
				<CardContent>
					{question.description ? (
						<div className="prose prose-sm max-w-none dark:prose-invert">
							<pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-md">
								{question.description}
							</pre>
						</div>
					) : question.description_path ? (
						<p className="text-muted-foreground">
							Description file path: {question.description_path}
							<br />
							<small>
								Note: Description content could not be loaded. Please contact
								the administrator.
							</small>
						</p>
					) : (
						<p className="text-muted-foreground">
							No description available for this question.
						</p>
					)}
				</CardContent>
			</Card>

			{/* Code Editor */}
			<Card>
				<CardHeader>
					<CardTitle>Your Solution</CardTitle>
				</CardHeader>
				<CardContent>
					<CodeEditor
						value={code}
						onChange={handleCodeChange}
						height="500px"
						errorLineNumber={executeErrorLineNumber}
						errorColumnNumber={executeErrorColumnNumber}
						errorCode={executeErrorCode}
					/>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			<div className="flex gap-4">
				<Button
					type="button"
					onClick={handleExecute}
					disabled={!code.trim() || isExecuting || isTesting || isSubmitting}
					variant="default"
					size="lg"
				>
					{isExecuting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Running...
						</>
					) : (
						<>
							<Zap className="mr-2 h-4 w-4" />
							Run
						</>
					)}
				</Button>
				<Button
					type="button"
					onClick={handleTest}
					disabled={!code.trim() || isTesting || isExecuting || isSubmitting}
					variant="outline"
					size="lg"
					className="flex-1"
				>
					{isTesting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Testing...
						</>
					) : (
						<>
							<Play className="mr-2 h-4 w-4" />
							Test Code
						</>
					)}
				</Button>
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={!code.trim() || isTesting || isExecuting || isSubmitting}
					size="lg"
					className="flex-1"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<Send className="mr-2 h-4 w-4" />
							Submit Answer
						</>
					)}
				</Button>
			</div>

			{/* Execute Results Panel */}
			{(executeOutput || executeError || isExecuting) && (
				<OutputPanel
					output={executeOutput}
					error={executeError}
					isLoading={isExecuting}
					errorCode={executeErrorCode}
					lineNumber={executeErrorLineNumber}
					columnNumber={executeErrorColumnNumber}
					errorDetails={executeErrorDetails}
				/>
			)}

			{/* Test Results Panel */}
			{(testOutput || testError || isTesting) && (
				<OutputPanel
					output={testOutput}
					error={testError}
					isLoading={isTesting}
				/>
			)}
		</div>
	)
}
