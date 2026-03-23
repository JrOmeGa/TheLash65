import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip i18n for API routes — prevents next-intl from rewriting
  // /api/auth/callback/google → /th/api/auth/callback/google (OAuth redirect_uri_mismatch)
  if (pathname.startsWith('/api/')) {
    return;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!_next|_vercel|.*\\..*).*)',
};
