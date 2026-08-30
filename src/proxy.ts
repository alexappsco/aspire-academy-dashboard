import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware handler
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // Return the intl middleware response (handles rewrites/headers for locale)
  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
