import { t } from 'elysia'

export const LoginSchema = t.Object({
	email: t.String({ format: 'email' }),
	password: t.String({ minLength: 6 })
})

export type LoginDto = typeof LoginSchema.static

export const RegisterSchema = t.Object({
	email: t.String({ format: 'email', pattern: '^[a-zA-Z0-9._%+-]+@gmail\\.com$' }),
	password: t.String({ minLength: 6 }),
	fullName: t.Optional(t.String({ maxLength: 48 }))
})

export type RegisterDto = typeof RegisterSchema.static

export const AuthResponseSchema = t.Object({
	user: t.Object({
		uuid: t.String(),
		email: t.String(),
		fullName: t.Union([t.String(), t.Null()]),
		role: t.Union([t.Literal('USER'), t.Literal('ADMIN')])
	}),
	token: t.String()
})

export type AuthResponse = typeof AuthResponseSchema.static
