import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData } from '@remix-run/react';
import React from 'react';
import { authenticator } from '~/auth.server';
import { sessionStorage } from '~/services/session.server';

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

export default function SalesSheets(): JSX.Element {
  const { error } = useLoaderData<LoaderData>();

  return (
    <>
      <Outlet />
      {error ? <div>{error.message}</div> : <h2>Sales Sheets</h2>}
    </>
  );
}

// Error handling below
export function ErrorBoundary({ error }: { error: Error }): JSX.Element {
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
