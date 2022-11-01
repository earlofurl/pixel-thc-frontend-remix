import type { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader({ request }: LoaderArgs) {
	return authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})
}

export default function Dashboard(): JSX.Element {
	return <h1>Dashboard</h1>
}
