import type { Role } from '@/lib/backend-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
} as const;

export const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

export const ADMIN_ROLES: readonly Role[] = ['ADMIN', 'SUPER_ADMIN'];

export function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin');
}

export function hasRole(role: Role | undefined, allowed: readonly Role[]) {
  return !!role && allowed.includes(role);
}
