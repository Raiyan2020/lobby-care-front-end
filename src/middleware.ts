import { NextRequest, NextResponse } from 'next/server';

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = Boolean(token);

  // ── 1. Protect authenticated pages ────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    // The Figma flow ("مرحبا" → "تسجيل دخول") makes /welcome the auth gateway:
    // it offers sign in, register, or continue-as-guest. /login stays directly
    // reachable. Revert this to '/login' to restore the previous behaviour.
    loginUrl.pathname = '/welcome';
    // Persist the intended destination so the login page can redirect back
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Redirect authenticated users away from auth pages ──────────────────
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAuthOnly && isAuthenticated) {
    // Check if there's a redirect param first (e.g. from a post-login flow)
    const redirectTo =
      request.nextUrl.searchParams.get('redirect') || '/account';
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = redirectTo;
    targetUrl.searchParams.delete('redirect');
    return NextResponse.redirect(targetUrl);
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
