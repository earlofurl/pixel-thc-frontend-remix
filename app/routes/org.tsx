import BackendDash from '~/components/layout/BackendDash'
import type { ActionArgs, LoaderArgs, Session } from '@remix-run/node'
import { authenticator } from '~/auth.server'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { sessionStorage } from '~/services/session.server'

type LoaderData = {
	session: Session
	error: { message: string } | null
}

export async function loader({ request }: LoaderArgs) {
	await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})
	const session = await sessionStorage.getSession(request.headers.get('Cookie'))
	const error = session.get(
		authenticator.sessionErrorKey,
	) as LoaderData['error']
	return json<LoaderData>({ session, error })
}

// export async function action({ request }: ActionArgs) {
// 	await authenticator.authenticate('email-pass', request, {
// 		successRedirect: '/org/dashboard',
// 		failureRedirect: '/login',
// 	})
// }

export default function OrgLayout(): JSX.Element {
	const { session, error } = useLoaderData<LoaderData>()

	return (
		<>
			<BackendDash />
		</>
	)
}
