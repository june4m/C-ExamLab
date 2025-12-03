// Student Test interfaces

export interface TestAnswerRequest {
	roomId: string
	questionId: string
	answerCode: string
}

export interface TestCaseResult {
	index: number
	input: string
	expectedOutput: string
	actualOutput: string
	passed: boolean
	error: string | null
}

export interface TestAnswerResponse {
	compileStatus: 'success' | false
	results: TestCaseResult[]
	overallPassed: boolean
}
