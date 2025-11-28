import { t } from 'elysia'

export const LoadTestCasesRequestSchema = t.Object({
	roomId: t.String({ minLength: 1 }),
	questionId: t.String({ minLength: 1 }),
	includePrivate: t.Optional(t.Boolean())
})

export const CreateTestCaseRequestSchema = t.Object({
	roomId: t.String({ minLength: 1 }),
	questionId: t.String({ minLength: 1 }),
	testCaseNumber: t.Number({ minimum: 1 }),
	input: t.String(),
	expectedOutput: t.String(),
	isPublic: t.Optional(t.Boolean()),
	points: t.Optional(t.Number({ minimum: 0 })),
	description: t.Optional(t.String())
})

export const UpdateTestCaseRequestSchema = t.Object({
	roomId: t.String({ minLength: 1 }),
	questionId: t.String({ minLength: 1 }),
	testCaseNumber: t.Number({ minimum: 1 }),
	input: t.Optional(t.String()),
	expectedOutput: t.Optional(t.String()),
	isPublic: t.Optional(t.Boolean()),
	points: t.Optional(t.Number({ minimum: 0 })),
	description: t.Optional(t.String())
})

export const DeleteTestCaseRequestSchema = t.Object({
	roomId: t.String({ minLength: 1 }),
	questionId: t.String({ minLength: 1 }),
	testCaseNumber: t.Number({ minimum: 1 })
})

export const LoadTestCasesDetail = {
	summary: 'Load test cases for a question',
	tags: ['Test Cases'],
	description: 'Load all test cases for a specific question in a room. Can optionally include private test cases.'
}

export const CreateTestCaseDetail = {
	summary: 'Create a new test case',
	tags: ['Test Cases'],
	description: 'Create a new test case with input and expected output files.'
}

export const UpdateTestCaseDetail = {
	summary: 'Update an existing test case',
	tags: ['Test Cases'],
	description: 'Update input, output, or metadata of an existing test case.'
}

export const DeleteTestCaseDetail = {
	summary: 'Delete a test case',
	tags: ['Test Cases'],
	description: 'Delete a test case and its associated files.'
}

