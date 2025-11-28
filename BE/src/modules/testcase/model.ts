export interface TestCaseFile {
	roomId: string
	questionId: string
	testCaseNumber: number
	input: string
	expectedOutput: string
}

export interface TestCaseMetadata {
	roomId: string
	questionId: string
	testCaseNumber: number
	isPublic?: boolean // Public test case (visible to students) or private (hidden)
	points?: number // Points for this test case
	description?: string
}

export interface TestCaseInfo {
	roomId: string
	questionId: string
	testCaseNumber: number
	input: string
	expectedOutput: string
	isPublic?: boolean
	points?: number
	description?: string
}

export interface LoadTestCasesRequest {
	roomId: string
	questionId: string
	includePrivate?: boolean // Whether to include private test cases
}

export interface CreateTestCaseRequest {
	roomId: string
	questionId: string
	testCaseNumber: number
	input: string
	expectedOutput: string
	isPublic?: boolean
	points?: number
	description?: string
}

export interface UpdateTestCaseRequest {
	roomId: string
	questionId: string
	testCaseNumber: number
	input?: string
	expectedOutput?: string
	isPublic?: boolean
	points?: number
	description?: string
}

export interface DeleteTestCaseRequest {
	roomId: string
	questionId: string
	testCaseNumber: number
}

