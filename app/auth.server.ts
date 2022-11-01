import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import invariant from 'tiny-invariant'
import type { User } from '~/models/types/prisma-model-types'
import { sessionStorage } from '~/services/session.server'

export let authenticator = new Authenticator<User>(sessionStorage)

authenticator.use(
	new FormStrategy(async ({ form, context }) => {
		// Here you can use `form` to access and input values from the form.
		// and also use `context` to access more things from the server
		let email = form.get('email') // or email... etc
		let password = form.get('password')

		// You can validate the inputs however you want
		invariant(typeof email === 'string', 'email must be a string')
		invariant(email.length > 0, 'email must not be empty')

		invariant(typeof password === 'string', 'password must be a string')
		invariant(password.length > 0, 'password must not be empty')

		// TODO: First test auth flow without hashed password in frontend. Then add hashing to password.
		// And if you have a password you should hash it
		// let hashedPassword = await hash(password)

		const bodyObject = new URLSearchParams({ email, password }).toString()

		// And finally, you can find, or create, the user
		const userResponse = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: bodyObject,
		})

		const user = await userResponse.json()

		// And return the user as the Authenticator expects it
		return user
	}),
	'email-pass',
)
