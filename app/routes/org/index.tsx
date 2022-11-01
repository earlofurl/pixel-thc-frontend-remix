import { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader({ request }: LoaderArgs) {
	return await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})
}

export default function OrgLandingPage(): JSX.Element {
	return (
		<>
			<div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
				<h1>Welcome to pixelthc.com/org</h1>
				<h2>You are a logged in user.</h2>
			</div>
		</>
	)
}
