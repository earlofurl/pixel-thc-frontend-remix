import type { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'
import { CircleStackIcon } from '@heroicons/react/24/outline'
import ActionGrid from '~/components/ActionGrid'

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

export async function loader({ request }: LoaderArgs) {
	return authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	})
}

export default function Dashboard(): JSX.Element {
	return (
		<div className="mx-auto items-center py-8">
			<ActionGrid actions={actions} />
		</div>
	)
}
