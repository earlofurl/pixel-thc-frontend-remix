import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticator } from '~/auth.server';
import BackendDash from '~/components/layout/BackendDash';
import { sessionStorage } from '~/services/session.server';

type LoaderData = {
  error: { message: string } | null;
};

export async function action({ request }: ActionArgs) {
  await authenticator.logout(request, { redirectTo: '/login' });
}

export const loader = async ({ request }: LoaderArgs) => {
  const authResponse = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const error = session.get(authenticator.sessionErrorKey);
  session.set(authenticator.sessionKey, authResponse);

  return json<LoaderData>({ error });
};

export default function OrgLayout(): JSX.Element {
  return <BackendDash />;
}
