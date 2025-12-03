// Student Submission interfaces

export interface SubmitAnswerRequest {
	roomId: string
	questionId: string
	answerCode: string
}

export interface SubmissionDetail {
	testCaseIndex: number
	status: string
	runTime: number | null // ms
	memoryUsed: number | null // KB
	stdout: string | null
	stderr: string | null
}

export interface SubmitAnswerResponse {
	status: string
	score: number | null
	totalRunTime: number | null // ms
	memoryUsed: number | null // KB
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
	score: number | null
	myScore: number
	solved: boolean
	attempts: number
	bestSubmissionId: string | null
}

export interface GetSubmissionsResponse {
	totalScore: number
	questions: QuestionResult[]
}

