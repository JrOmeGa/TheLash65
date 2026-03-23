import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip i18n middleware for API routes (auth callbacks, webhooks, etc.)
  // Without this guard, next-intl rewrites /api/auth/callback/google to /th/api/auth/callback/google
  // which causes OAuth redirect_uri_mismatch errors (Research Pitfall 1)
  if (pathname.startsWith('/api/')) {
    return;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!_next|_vercel|.*\\..*).*)',
};
