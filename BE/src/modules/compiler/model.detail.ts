import { t } from 'elysia'

export const CompileRequestSchema = t.Object({
	code: t.String({ minLength: 1 }),
	input: t.Optional(t.String()),
	timeLimit: t.Optional(t.Number({ minimum: 100, maximum: 30000 })),
	memoryLimit: t.Optional(t.Number({ minimum: 16, maximum: 1024 })),
	optimizationLevel: t.Optional(
		t.Union([
			t.Literal(0),
			t.Literal(1),
			t.Literal(2),
			t.Literal(3),
			t.Literal('s')
		])
	)
})

export const JudgeRequestSchema = t.Object({
	code: t.String({ minLength: 1 }),
	testCases: t.Array(
		t.Object({
			input: t.String(),
			expectedOutput: t.String()
		}),
		{ minItems: 1 }
	),
	timeLimit: t.Optional(t.Number({ minimum: 100, maximum: 30000 })),
	memoryLimit: t.Optional(t.Number({ minimum: 16, maximum: 1024 })),
	optimizationLevel: t.Optional(
		t.Union([
			t.Literal(0),
			t.Literal(1),
			t.Literal(2),
			t.Literal(3),
			t.Literal('s')
		])
	)
})

export const CompileDetail = {
	summary: 'Compile and run C code',
	tags: ['Compiler'],
	description:
		'Compile and execute C code with optional input. Returns output or error messages.'
}

export const JudgeFromFileRequestSchema = t.Object({
	code: t.String({ minLength: 1 }),
	roomId: t.String({ minLength: 1 }),
	questionId: t.String({ minLength: 1 }),
	includePrivate: t.Optional(t.Boolean()),
	timeLimit: t.Optional(t.Number({ minimum: 100, maximum: 30000 })),
	memoryLimit: t.Optional(t.Number({ minimum: 16, maximum: 1024 })),
	optimizationLevel: t.Optional(
		t.Union([
			t.Literal(0),
			t.Literal(1),
			t.Literal(2),
			t.Literal(3),
			t.Literal('s')
		])
	)
})

export const JudgeDetail = {
	summary: 'Judge C code with test cases',
	tags: ['Compiler'],
	description:
		'Run C code against multiple test cases and return results for each test.'
}

export const JudgeFromFileDetail = {
	summary: 'Judge C code with test cases from files',
	tags: ['Compiler'],
	description:
		'Load test cases from file system (room/question structure) and judge C code against them.'
}
