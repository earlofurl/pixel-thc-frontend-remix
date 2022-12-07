import { Authenticator, AuthorizationError } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import invariant from 'tiny-invariant'
import type { AuthUser } from '~/services/session.server'
import { sessionStorage } from '~/services/session.server'
import type { Session } from '@remix-run/node'

export const authenticator = new Authenticator<string | Error | null>(
	sessionStorage,
)
// {
// 	sessionKey: 'sessionKey', // keep in sync
// 		sessionErrorKey: 'sessionErrorKey', // keep in sync
// },

authenticator.use(
	new FormStrategy(async ({ form, context }) => {
		// Here you can use `form` to access and input values from the form.
		// and also use `context` to access more things from the server
		let email = form.get('email') as string // or email... etc
		let password = form.get('password') as string

		// You can validate the inputs however you want
		invariant(typeof email === 'string', 'email must be a string')
		invariant(email.length > 0, 'email must not be empty')

		invariant(typeof password === 'string', 'password must be a string')
		invariant(password.length > 0, 'password must not be empty')

		// TODO: First test auth flow without hashed password in frontend. Then add hashing to password.
		// And if you have a password you should hash it
		// let hashedPassword = await hash(password)

		// const bodyObject = new URLSearchParams({ email, password }).toString()

		const bodyObject = JSON.stringify({ email, password })
		console.log('bodyObject', bodyObject)

		// And finally, you can find, or create, the user
		const userResponse = await fetch(`${process.env.API_BASE_URL}/users/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: bodyObject,
		})

		// console.log(
		// 	'userResponse cookie header:',
		// 	userResponse.headers.get('set-cookie'),
		// )

		// console log userResponse body JSON object
		const userResponseBody = await userResponse.json()
		console.log('userResponseBody', userResponseBody)

		// const session = await sessionStorage.getSession(
		// 	(userResponse.headers.get('Set-Cookie') as string) ?? '',
		// )

		const session = await sessionStorage.getSession(
			userResponseBody.access_token as string ?? null
		)

		await sessionStorage.commitSession(session)

		// return (userResponse.headers.get('Set-Cookie') as string) ?? null
		return userResponseBody.access_token as string ?? null
	}),
	'email-pass',
)
