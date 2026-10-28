import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  // Exclude SignalR hubs so /hubs/* is not rewritten to /ar/hubs/* (breaks negotiate → 404 HTML).
  matcher: ['/((?!api|hubs|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
