import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { loginSchema } from '@/lib/validators';
import * as backendAuth from '@/lib/backend-auth';
import { ApiError } from '@/lib/backend-auth';

// Role/isActive are re-checked against the backend at most this often from
// inside jwt() — bounds how long a deactivated account or a role change can
// keep showing a stale session, independent of the access token's own
// (currently 30-day) lifetime. Read-only: never rotates the refresh token,
// so it's safe to run during a plain Server Component render too.
const REVALIDATE_INTERVAL_MS = 5 * 60_000;

export const authOptions: NextAuthOptions = {
  pages: authConfig.pages,
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
        }

        try {
          const { accessToken, user } = await backendAuth.login(
            parsed.data.email,
            parsed.data.password,
          );

          // Shape must match `User` in types/next-auth.d.ts. The login
          // response doesn't include avatarUrl (only /users/me does) — it
          // fills in on the first revalidation below, or right after a
          // profile edit via session.update().
          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            avatarUrl: null,
            accessToken,
          };
        } catch (error) {
          if (error instanceof ApiError) {
            throw new Error(error.message);
          }
          throw new Error('Unable to sign in right now');
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
        token.avatarUrl = user.avatarUrl;
        token.accessToken = user.accessToken;
        token.lastRevalidatedAt = Date.now();
        delete token.error;
        return token;
      }

      // From useSession().update(...) — always a real POST to
      // /api/auth/session, so persisting it here is safe. Used by
      // components/session-provider.tsx's recovery flow after a silent
      // refresh, and by the profile-edit form to reflect changes instantly.
      if (trigger === 'update' && session) {
        const patch = session as Partial<{
          accessToken: string;
          role: typeof token.role;
          isActive: boolean;
          name: string | null;
          avatarUrl: string | null;
        }>;
        if (patch.accessToken !== undefined) token.accessToken = patch.accessToken;
        if (patch.role !== undefined) token.role = patch.role;
        if (patch.isActive !== undefined) token.isActive = patch.isActive;
        if (patch.name !== undefined) token.name = patch.name;
        if (patch.avatarUrl !== undefined) token.avatarUrl = patch.avatarUrl;
        if (patch.isActive !== false) {
          token.lastRevalidatedAt = Date.now();
          delete token.error;
        }
        return token;
      }

      if (Date.now() - (token.lastRevalidatedAt ?? 0) > REVALIDATE_INTERVAL_MS) {
        try {
          const me = await backendAuth.fetchMe(token.accessToken);

          if (!me || !me.isActive) {
            token.error = 'ReauthRequired';
          } else {
            token.role = me.role;
            token.isActive = me.isActive;
            token.name = me.name;
            token.avatarUrl = me.avatarUrl;
            token.lastRevalidatedAt = Date.now();
            delete token.error;
          }
        } catch {
          // Network hiccup — keep the existing token, retry next time.
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isActive = token.isActive;
        session.user.avatarUrl = token.avatarUrl;
      }

      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      await backendAuth.revokeBackendSession(token?.accessToken);
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}
