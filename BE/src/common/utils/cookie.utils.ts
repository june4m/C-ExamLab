import { NODE_ENV } from '../../configurations/env'

export const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict' as const,
	path: '/',
	maxAge: 7 * 24 * 60 * 60 // 7 days
}

export const setAuthCookie = (cookie: any, token: string) => {
	cookie.auth.set({
		value: token,
		...COOKIE_OPTIONS
	})
}

export const unsetAuthCookie = (cookie: any) => {
	cookie.auth.remove()
}
