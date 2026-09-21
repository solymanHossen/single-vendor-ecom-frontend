import { NextResponse } from 'next/server';
import { fetchMe, refreshAccessToken } from '@/lib/backend-auth';

// Genuine Route Handler request — the only context where rotating the
// backend's refresh token cookie is safe (see auth.ts / lib/backend-auth.ts
// for why this must never happen from inside the jwt() callback directly).
// Triggered reactively by components/session-provider.tsx when the NextAuth
// session reports session.error, not on a fixed schedule.
export async function POST() {
  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    return NextResponse.json({ message: 'Refresh token invalid or expired' }, { status: 401 });
  }

  const me = await fetchMe(refreshed.accessToken);

  if (!me) {
    return NextResponse.json({ message: 'Account no longer valid' }, { status: 401 });
  }

  return NextResponse.json({
    accessToken: refreshed.accessToken,
    role: me.role,
    isActive: me.isActive,
  });
}
