export interface CompileRequest {
	code: string
	input?: string
	timeLimit?: number // milliseconds, default 5000
	memoryLimit?: number // MB, default 256
	optimizationLevel?: 0 | 1 | 2 | 3 | 's' // GCC optimization level, default 0
}

export interface CompileResult {
	success: boolean
	output?: string
	error?: string
	executionTime?: number // milliseconds
	compilationTime?: number // milliseconds
	memoryUsed?: number // MB
	compilationError?: string
}

export interface TestCase {
	input: string
	expectedOutput: string
}

export interface JudgeRequest {
	code: string
	testCases: TestCase[]
	timeLimit?: number
	memoryLimit?: number
	optimizationLevel?: 0 | 1 | 2 | 3 | 's' // GCC optimization level, default 0
}

export interface JudgeFromFileRequest {
	code: string
	roomId: string
	questionId: string
	includePrivate?: boolean // Whether to include private test cases
	timeLimit?: number
	memoryLimit?: number
	optimizationLevel?: 0 | 1 | 2 | 3 | 's' // GCC optimization level, default 0
}

export interface JudgeResult {
	passed: number
	failed: number
	total: number
	results: Array<{
		testCase: number
		passed: boolean
		input: string
		expectedOutput: string
		actualOutput?: string
		error?: string
		executionTime?: number
	}>
}
