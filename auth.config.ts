import type { Role } from '@/lib/backend-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
} as const;

// Pages an already-signed-in visitor gets bounced away from (to /dashboard).
export const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

// Everything else — the storefront (/, /shop, product pages, ...) — is public
// by default. Only these need a session at all.
export const protectedRoutes = ['/dashboard', '/admin', '/profile'] as const;

export const ADMIN_ROLES: readonly Role[] = ['ADMIN', 'SUPER_ADMIN'];

function matchesRoute(pathname: string, routes: readonly string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAuthRoute(pathname: string) {
  return matchesRoute(pathname, authRoutes);
}

export function isProtectedRoute(pathname: string) {
  return matchesRoute(pathname, protectedRoutes);
}

export function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin');
}

export function hasRole(role: Role | undefined, allowed: readonly Role[]) {
  return !!role && allowed.includes(role);
}
