import type { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'
import { CircleStackIcon } from '@heroicons/react/24/outline'
import ActionGrid from '~/components/ActionGrid'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

const actions = [
	{
		title: 'Product Inventory',
		href: '/org/inventory',
		icon: CircleStackIcon,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-teal-50',
		description: 'View and edit product inventory',
	},
	{
		title: 'Orders',
		href: '/org/orders',
		icon: CircleStackIcon,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-teal-50',
		description: 'View and edit orders',
	},
	{
		title: 'Sales Sheets',
		href: '/org/sales-sheets',
		icon: CircleStackIcon,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-teal-50',
		description: 'View and edit sales sheets',
	},
	{
		title: 'Lab Tests',
		href: '/org/lab-tests',
		icon: CircleStackIcon,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-teal-50',
		description: 'View and edit lab tests',
	},
	{
		title: 'Locations',
		href: '/org/locations',
		icon: CircleStackIcon,
		iconForeground: 'text-teal-700',
		iconBackground: 'bg-teal-50',
		description: 'View and edit retailer locations',
	},
]

type LoaderData = {
	error: { message: string } | null
}
export async function loader({ request }: LoaderArgs) {
	const session = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})

	return json({ session })
}

export default function Dashboard(): JSX.Element {
	const { session } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto items-center py-8">
			<ActionGrid actions={actions} />
			<div className="max-w-lg">
				<p>Session: {JSON.stringify(session)}</p>
			</div>
		</div>
	)
}
