import Elysia from 'elysia'

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.post('/login', () => {})
	.post('/register', () => {})
