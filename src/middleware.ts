import { NextRequest, NextResponse } from 'next/server';
import { isSafeInternalPath } from './utils/internalPath';

/**
 * Edge Middleware — Route-level authentication guard.
 *
 * Auth signal: `auth_token` cookie (set by startSession / cleared by clearSession
 * in src/utils/auth.ts). The value mirrors the api_token stored in localStorage
 * on the client.
 *
 * ─ Protected routes  → redirect unauthenticated visitors to /login
 * ─ Auth-only routes  → redirect authenticated visitors to /account
 */

// Routes that require the user to be logged in
const PROTECTED_PREFIXES = [
  '/account',
  '/addresses',
  '/orders',
  '/checkout',
  '/notifications',
  '/points',
  '/favorites',
  '/cart'
];

// Routes that logged-in users should not access
const AUTH_ONLY_PREFIXES = [
  '/welcome',
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
];

/**
 * Resolve the public origin for redirects.
 *
 * `request.nextUrl` contains the standalone Next.js server's internal origin
 * when the app runs behind cPanel's reverse proxy (for example,
 * `http://localhost:3103`). Prefer the configured canonical URL in production,
 * then the standard forwarded headers, before falling back to the direct
 * request origin for local development.
 */
function getPublicOrigin(request: NextRequest): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Ignore a malformed optional value and continue with request headers.
    }
  }

  const firstHeaderValue = (value: string | null) =>
    value?.split(',')[0]?.trim() || null;
  const forwardedHost = firstHeaderValue(
    request.headers.get('x-forwarded-host'),
  );
  const host = forwardedHost || firstHeaderValue(request.headers.get('host'));
  const forwardedProtocol = firstHeaderValue(
    request.headers.get('x-forwarded-proto'),
  );
  const protocol =
    forwardedProtocol === 'http' || forwardedProtocol === 'https'
      ? forwardedProtocol
      : request.nextUrl.protocol.replace(':', '');

  return host ? `${protocol}://${host}` : request.nextUrl.origin;
}

function redirectToInternalPath(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, getPublicOrigin(request)));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(token);

  // ── 1. Protect authenticated pages ────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !isAuthenticated) {
    // The Figma flow ("مرحبا" → "تسجيل دخول") makes /welcome the auth gateway:
    // it offers sign in, register, or continue-as-guest. /login stays directly
    // reachable. Revert this to '/login' to restore the previous behaviour.
    // Persist the intended destination so the login page can redirect back
    // after authentication. Include its query string as part of that path.
    const intendedPath = `${pathname}${request.nextUrl.search}`;
    const params = new URLSearchParams({ redirect: intendedPath });
    return redirectToInternalPath(request, `/welcome?${params.toString()}`);
  }

  // ── 2. Redirect authenticated users away from auth pages ──────────────────
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAuthOnly && isAuthenticated) {
    // Check if there's a redirect param first (e.g. from a post-login flow)
    const requestedRedirect = request.nextUrl.searchParams.get('redirect');
    const redirectTo = isSafeInternalPath(requestedRedirect)
      ? requestedRedirect
      : '/account';
    return redirectToInternalPath(request, redirectTo);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - api routes    (handled separately)
     *  - public assets (anything with an extension, e.g. .png, .svg, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
};
