import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authConfig, isAdminRoute, isAuthRoute, isProtectedRoute, hasRole, ADMIN_ROLES } from './auth.config';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Everything not explicitly listed in protectedRoutes (the storefront: /,
  // /shop, product pages, ...) is public and skips this gate entirely.
  if (isProtectedRoute(pathname) && !token) {
    const signInUrl = new URL(authConfig.pages.signIn, request.url);
    signInUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedRoute(pathname) && token) {
    // Optimistic only — this reads whatever was last durably written to the
    // session cookie, so a just-deactivated account may still pass here for
    // up to ~5 minutes until jwt()'s revalidation catches up (see auth.ts).
    // The backend re-checks isActive on every real API call regardless.
    if (token.isActive === false) {
      const signInUrl = new URL(authConfig.pages.signIn, request.url);
      signInUrl.searchParams.set('error', 'AccountDisabled');
      return NextResponse.redirect(signInUrl);
    }

    if (isAdminRoute(pathname) && !hasRole(token.role, ADMIN_ROLES)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon\\.ico|.*\\.(?:png|jpg|svg|webp)).*)'],
};
