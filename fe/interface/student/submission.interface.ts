// Student Submission interfaces

export interface SubmitAnswerRequest {
	roomId: string
	questionId: string
	answerCode: string
}

export interface SubmissionDetail {
	testCaseIndex: number
	status: string
	runTime: number // ms
	memoryUsed: number // KB
	stdout: string
	stderr: string
}

export interface SubmitAnswerResponse {
	status: string
	score: number
	totalRunTime: number // ms
	memoryUsed: number // KB
	details: SubmissionDetail[]
}

// Get Submissions Results interfaces
export interface GetSubmissionsRequest {
	roomId: string
	studentId: string
}

export interface QuestionResult {
	questionId: string
	title: string
	score: number
	myScore: number
	solved: boolean
	attempts: number
	bestSubmissionId: string
}

export interface GetSubmissionsResponse {
	totalScore: number
	questions: QuestionResult[]
}

