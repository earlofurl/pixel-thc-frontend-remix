import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '__session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [`${process.env.SESSION_SECRET}`], // This should be an env variable
		secure: process.env.NODE_ENV === 'production',
		maxAge: 2 * 60 * 60 * 1000, // 2 hours
	},
})

export type AuthUser = {
	username: string
	first_name: string
	last_name: string
	email: string
	phone: string
	role: string
	password_changed_at: string
	created_at: string
}

export type SessionObject = {
	session_id: string
	access_token: string
	access_token_expires_at: string
	refresh_token: string
	refresh_token_expires_at: string
	user: AuthUser
}
