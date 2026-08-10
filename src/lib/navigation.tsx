'use client';
/**
 * Navigation shim — drop-in replacement for react-router-dom's routing hooks.
 * All source files import from here instead of 'react-router-dom'.
 */
import React, { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NextLink from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigateOptions = {
  replace?: boolean;
  /** state is silently ignored — encode data in the URL search params instead */
  state?: Record<string, unknown>;
};

type NavigateFn = ((to: string, options?: NavigateOptions) => void) &
  ((delta: number) => void);

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Works like react-router-dom's useNavigate:
 *   navigate('/path')
 *   navigate('/path', { replace: true })
 *   navigate(-1) → router.back()
 */
export function useNavigate(): NavigateFn {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router],
  ) as NavigateFn;
}

/**
 * Works like react-router-dom's useLocation.
 * Note: .state is always null — use URL search params for passing data.
 */
export function useLocation() {
  const pathname = usePathname() ?? '/';
  return {
    pathname,
    search: '',
    state: null as Record<string, unknown> | null,
  };
}

/**
 * Works like react-router-dom's useParams.
 * Returns the last dynamic path segment as `id`.
 * E.g. /product/42 → { id: '42' }
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const pathname = usePathname() ?? '/';
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? '';
  return { id: lastSegment } as unknown as T;
}

// ─── Components ───────────────────────────────────────────────────────────────

/** Drop-in replacement for react-router-dom's <Link> */
export const Link = NextLink;

/**
 * Stubs for <Routes>, <Route>, <Navigate> — kept so admin files compile.
 * In Next.js App Router, routing is file-based; these tags are unused.
 */
export function Routes({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}

export function Route(_props: { path: string; element: React.ReactNode }) {
  return null;
}

export function Navigate({ to, replace: shouldReplace }: { to: string; replace?: boolean }) {
  if (typeof window !== 'undefined') {
    if (shouldReplace) {
      window.location.replace(to);
    } else {
      window.location.href = to;
    }
  }
  return null;
}
