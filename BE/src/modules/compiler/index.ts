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
import { ValidationError } from './validation'
import { RateLimitError } from './rate-limiter'

/**
 * Extract identifier for rate limiting from request context
 * Uses user ID if authenticated, falls back to IP address
 */
function getIdentifier(context: any): string {
	// Try to get user ID from auth context
	if (context.user && context.user.userId) {
		return `user:${context.user.userId}`
	}
	
	// Fallback to IP address
	const ip = context.request?.headers?.get('x-forwarded-for') 
		|| context.request?.headers?.get('x-real-ip')
		|| 'unknown'
	
	return `ip:${ip}`
}

export const compiler = new Elysia({ prefix: '/compiler' })
	.post('/compile', async (context) => {
		const identifier = getIdentifier(context)
		try {
			return await compilerService.compileC(context.body, identifier)
		} catch (error) {
			if (error instanceof RateLimitError) {
				context.set.status = 429
				context.set.headers = { 'Retry-After': error.retryAfter.toString() }
				return { success: false, error: error.message }
			}
			if (error instanceof ValidationError) {
				context.set.status = 400
				return { success: false, error: error.message }
			}
			throw error
		}
	}, {
		body: CompileRequestSchema,
		detail: CompileDetail
	})
	.post('/judge', async (context) => {
		const identifier = getIdentifier(context)
		try {
			return await compilerService.judge(context.body, identifier)
		} catch (error) {
			if (error instanceof RateLimitError) {
				context.set.status = 429
				context.set.headers = { 'Retry-After': error.retryAfter.toString() }
				return { 
					passed: 0, 
					failed: 0, 
					total: 0, 
					results: [],
					error: error.message 
				}
			}
			if (error instanceof ValidationError) {
				context.set.status = 400
				return { 
					passed: 0, 
					failed: 0, 
					total: 0, 
					results: [],
					error: error.message 
				}
			}
			throw error
		}
	}, {
		body: JudgeRequestSchema,
		detail: JudgeDetail
	})
	.post(
		'/judge-from-file',
		async (context) => {
			const identifier = getIdentifier(context)
			try {
				return await compilerService.judgeFromFile(context.body, identifier)
			} catch (error) {
				if (error instanceof RateLimitError) {
					context.set.status = 429
					context.set.headers = { 'Retry-After': error.retryAfter.toString() }
					return { 
						passed: 0, 
						failed: 0, 
						total: 0, 
						results: [],
						error: error.message 
					}
				}
				if (error instanceof ValidationError) {
					context.set.status = 400
					return { 
						passed: 0, 
						failed: 0, 
						total: 0, 
						results: [],
						error: error.message 
					}
				}
				throw error
			}
		},
		{
			body: JudgeFromFileRequestSchema,
			detail: JudgeFromFileDetail
		}
	)
