import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import bearer from '@elysiajs/bearer'
import openapi from '@elysiajs/openapi'
import { auth } from './modules/auth'
import { compiler } from './modules/compiler'
import { testcase } from './modules/testcase'

const app = new Elysia()
	.get('/ping', 'pong')
	.use(swagger())
	.use(openapi())
	.use(bearer())
	.use(auth)
	.use(compiler)
	.use(testcase)
	.listen(5000, () => {
		console.log('🚀 Server running: http://localhost:5000')
		console.log('📘 Swagger docs: http://localhost:5000/swagger')
	})
