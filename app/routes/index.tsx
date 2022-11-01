import { Link } from '@remix-run/react'

export default function Index(): JSX.Element {
	return (
		<>
			<div>
				<h1>Welcome to Pixel THC</h1>
				<h2>A next-gen ERP for the cannabis industry.</h2>
				<ul>
					<li>
						<Link to="/login" rel="noreferrer">
							Log in
						</Link>
					</li>
					<li>
						<Link target="_blank" to="/register" rel="noreferrer">
							Sign Up
						</Link>
					</li>
				</ul>
			</div>
		</>
	)
}
