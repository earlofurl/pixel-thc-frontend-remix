import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import type { User } from '~/models/types/prisma-model-types'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { authenticator } from '~/auth.server'
import { sessionStorage } from '~/services/session.server'

// type LoaderData = {
// 	error: { message: string } | null
// }
type LoaderError = { message: string } | null;

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request }: ActionArgs) {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure
	return authenticator.authenticate('email-pass', request, {
		successRedirect: '/org/dashboard',
		failureRedirect: '/login',
	})
}

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export async function loader({ request }: LoaderArgs) {
	// If the user is already authenticated redirect to /dashboard directly
	await authenticator.isAuthenticated(request, { successRedirect: '/org/dashboard' })
	const session = await sessionStorage.getSession(request.headers.get('Cookie'))
	const error = session.get(authenticator.sessionErrorKey) as LoaderError
	return json({ error })
	// return authenticator.isAuthenticated(request, {
	// 	successRedirect: '/org/dashboard',
	// })
}

export default function LoginPage(): JSX.Element {
	const { error } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div>
						{/*<img*/}
						{/*	className="max-w-20 mx-auto h-12 w-auto"*/}
						{/*	src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"*/}
						{/*	alt="Your Company"*/}
						{/*/>*/}
						<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
							Sign in to your account
						</h2>
					</div>
					{error ? <div>{error.message}</div> : null}
					<Form className="mt-8 space-y-6" action="#" method="post">
						{/*<input type="hidden" name="remember" defaultValue="true" />*/}
						<div className="-space-y-px rounded-md shadow-sm">
							<div>
								<label htmlFor="email-address" className="sr-only">
									Email address
								</label>
								<input
									id="email-address"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
									placeholder="Email address"
								/>
							</div>
							<div>
								<label htmlFor="password" className="sr-only">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
									placeholder="Password"
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							{/*<div className="flex items-center">*/}
							{/*	<input*/}
							{/*		id="remember-me"*/}
							{/*		name="remember-me"*/}
							{/*		type="checkbox"*/}
							{/*		className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"*/}
							{/*	/>*/}
							{/*	<label*/}
							{/*		htmlFor="remember-me"*/}
							{/*		className="ml-2 block text-sm text-gray-900">*/}
							{/*		Remember me*/}
							{/*	</label>*/}
							{/*</div>*/}

							<div className="text-sm">
								<a
									href="#"
									className="font-medium text-indigo-600 hover:text-indigo-500">
									Forgot your password?
								</a>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
								<span className="absolute inset-y-0 left-0 flex items-center pl-3">
									<LockClosedIcon
										className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
										aria-hidden="true"
									/>
								</span>
								Sign in
							</button>
						</div>
					</Form>
				</div>
			</div>
		</>
	)
}
