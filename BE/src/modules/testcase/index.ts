import { Elysia } from 'elysia'
import { testCaseService } from './service'
import {
	LoadTestCasesRequestSchema,
	CreateTestCaseRequestSchema,
	UpdateTestCaseRequestSchema,
	DeleteTestCaseRequestSchema,
	LoadTestCasesDetail,
	CreateTestCaseDetail,
	UpdateTestCaseDetail,
	DeleteTestCaseDetail
} from './model.detail'

export const testcase = new Elysia({ prefix: '/testcase' })
	.get(
		'/room/:roomId/question/:questionId',
		async ({ params, query }) => {
			const { roomId, questionId } = params
			const includePrivate = query.includePrivate === 'true'
			return await testCaseService.loadTestCases({
				roomId,
				questionId,
				includePrivate
			})
		},
		{
			detail: LoadTestCasesDetail
		}
	)
	.post(
		'/',
		async ({ body }) => await testCaseService.createTestCase(body),
		{
			body: CreateTestCaseRequestSchema,
			detail: CreateTestCaseDetail
		}
	)
	.put(
		'/',
		async ({ body }) => await testCaseService.updateTestCase(body),
		{
			body: UpdateTestCaseRequestSchema,
			detail: UpdateTestCaseDetail
		}
	)
	.delete(
		'/',
		async ({ body }) => {
			await testCaseService.deleteTestCase(body)
			return { success: true }
		},
		{
			body: DeleteTestCaseRequestSchema,
			detail: DeleteTestCaseDetail
		}
	)
	.get(
		'/room/:roomId/question/:questionId/count',
		async ({ params }) => {
			const { roomId, questionId } = params
			const count = await testCaseService.getTestCaseCount(roomId, questionId)
			return { count }
		},
		{
			detail: {
				summary: 'Get test case count',
				tags: ['Test Cases'],
				description: 'Get the number of test cases for a question.'
			}
		}
	)

