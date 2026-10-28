import { paths } from 'src/routes/paths';

// API
export const HOST_API =
  process.env.NEXT_PUBLIC_HOST_API ?? 'http://5.189.130.109:3000';
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

/**
 * SignalR hub for session/private requests.
 * Default: direct API origin (same as Postman WSS) — WebSockets work reliably there.
 * Same-origin `/hubs/...` Next rewrite breaks LongPolling affinity ("No Connection with that ID").
 * Set NEXT_PUBLIC_SESSION_REQUESTS_HUB_URL to override (relative or absolute).
 */
function resolveSessionRequestsHubUrl(): string {
  const override = process.env.NEXT_PUBLIC_SESSION_REQUESTS_HUB_URL?.trim();
  if (override) return override;

  try {
    return `${new URL(HOST_API).origin}/hubs/session-requests`;
  } catch {
    return '/hubs/session-requests';
  }
}

export const SESSION_REQUESTS_HUB_URL = resolveSessionRequestsHubUrl();

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.home; // as '/dashboar

export const COOKIES_KEYS = {
  lang: 'NEXT_LOCALE',
  session: 'accessToken',
  user: 'user',
  role: 'userRole',
  cart: 'cart',
};

export const MAX_FILE_SIZE = 500 * 1024; // 50KB
export const MAX_FILE_SIZE_HELPER = true;
