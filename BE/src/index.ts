import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import bearer from '@elysiajs/bearer'
import openapi from '@elysiajs/openapi'
import { auth } from './modules/auth'

const app = new Elysia()
	.get('/ping', 'pong')
	.use(swagger())
	.use(openapi())
	.use(bearer())
	.use(auth)
	.listen(3000, () => {
		console.log('🚀 Server running: http://localhost:3000')
		console.log('📘 Swagger docs: http://localhost:3000/swagger')
	})
