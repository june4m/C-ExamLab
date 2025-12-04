import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import bearer from '@elysiajs/bearer'
import openapi from '@elysiajs/openapi'
import { errorHandler } from './middlewares/errorHandler'
import { auth } from './modules/auth'
import { compiler } from './modules/compiler'
import { testcase } from './modules/testcase'
import { room } from './modules/room'
import { admin } from './modules/admin'
import { question } from './modules/question'
import { user } from './modules/user'
import { startRoomReminderJob } from './jobs/roomReminder.job'

// Start cron jobs
startRoomReminderJob()

const app = new Elysia()
	.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
			allowedHeaders: ['Content-Type', 'Authorization']
		})
	)
	.get('/ping', 'pong')
	.use(swagger())
	.use(openapi())
	.use(bearer())
	.use(errorHandler)
	.use(auth)
	.use(compiler)
	.use(testcase)
	.use(room)
	.use(admin)
	.use(question)
	.use(user)
	.listen(5000, () => {
		console.log('🚀 Server running: http://localhost:5000')
		console.log('📘 Swagger docs: http://localhost:5000/swagger')
	})
