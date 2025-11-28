import { Elysia } from 'elysia'
import { compilerService } from './service'
import {
	CompileRequestSchema,
	JudgeRequestSchema,
	JudgeFromFileRequestSchema,
	CompileDetail,
	JudgeDetail,
	JudgeFromFileDetail
} from './model.detail'

export const compiler = new Elysia({ prefix: '/compiler' })
	.post('/compile', async ({ body }) => await compilerService.compileC(body), {
		body: CompileRequestSchema,
		detail: CompileDetail
	})
	.post('/judge', async ({ body }) => await compilerService.judge(body), {
		body: JudgeRequestSchema,
		detail: JudgeDetail
	})
	.post(
		'/judge-from-file',
		async ({ body }) => await compilerService.judgeFromFile(body),
		{
			body: JudgeFromFileRequestSchema,
			detail: JudgeFromFileDetail
		}
	)
