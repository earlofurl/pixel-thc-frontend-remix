import { CircleStackIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth.server';
import ActionGrid from '~/components/ActionGrid';
import { sessionStorage } from '~/services/session.server';

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
];

type LoaderData = {
  error: { message: string } | null;
};

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const error = session.get(
    authenticator.sessionErrorKey,
  ) as LoaderData['error'];
  return json<LoaderData>({ error });
}

export default function Dashboard(): JSX.Element {
  const { error } = useLoaderData<LoaderData>();

  return (
    <div className="mx-auto items-center py-8">
      {error ? <div>{error.message}</div> : null}
      <ActionGrid actions={actions} />
    </div>
  );
}
