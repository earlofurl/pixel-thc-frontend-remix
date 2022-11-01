import BackendDash from '~/components/layout/BackendDash'
import type { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader({ request }: LoaderArgs) {
	return authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})
}

export default function OrgLayout(): JSX.Element {
	return <BackendDash />
}
