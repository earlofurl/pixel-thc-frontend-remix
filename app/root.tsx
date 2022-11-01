import type {
	MetaFunction,
	LinksFunction,
	ErrorBoundaryComponent,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'

import tailwindStylesheetUrl from './styles/tailwind.css'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'Welcome to Pixel THC!',
	description:
		'A next-gen ERP for the cannabis industry. Business intelligence and compliance with ease.',
	viewport: 'width=device-width,initial-scale=1',
})

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
	console.error(error)
	return (
		<html>
			<head>
				<title>Oh no!</title>
				<Meta />
				<Links />
			</head>
			<body className="flex h-screen flex-col items-center justify-center">
				{/* Add here the UI you want your users to see. */}
				<h1 className="text-center text-3xl font-semibold">
					Whoops!
					<br />
					Something went wrong.
				</h1>
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
