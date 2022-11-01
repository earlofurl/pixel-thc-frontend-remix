import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '__session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [`${process.env.SESSION_SECRET}`], // This should be an env variable
		secure: process.env.NODE_ENV === 'production',
		maxAge: 15 * 24 * 60 * 60 * 1000,
	},
})
