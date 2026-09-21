'use client';

import * as React from 'react';
import { SessionProvider as NextAuthSessionProvider, useSession, signOut } from 'next-auth/react';

// Watches for session.error (set by auth.ts's jwt() callback when the
// backend confirms the access token is dead or the account is no longer
// active/isActive) and tries one silent refresh before signing out —
// see app/api/auth/refresh/route.ts and the plan's token-bridging design.
function SessionGuard() {
  const { data: session, update } = useSession();
  const recovering = React.useRef(false);

  React.useEffect(() => {
    if (!session?.error || recovering.current) return;

    recovering.current = true;

    fetch('/api/auth/refresh', { method: 'POST' })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { accessToken: string; role: string; isActive: boolean }) => {
        if (!data.isActive) throw new Error('inactive');
        return update(data);
      })
      .catch(() => signOut({ callbackUrl: '/login?error=SessionExpired' }))
      .finally(() => {
        recovering.current = false;
      });
  }, [session?.error, update]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchInterval={300}>
      <SessionGuard />
      {children}
    </NextAuthSessionProvider>
  );
}
