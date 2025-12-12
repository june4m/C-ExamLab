// Student Execute Code interfaces

export interface ExecuteCodeRequest {
	roomId: string
	questionId: string
	answerCode: string
}

export interface ExecuteResult {
	currentTestCase: string
	exampleTestCase: string
}

export interface ExecuteCodeResponse {
	results: ExecuteResult[]
	error?: string
	errorCode?: string
	lineNumber?: number
	columnNumber?: number
	errorDetails?: string
}

