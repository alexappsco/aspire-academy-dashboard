import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

import { COOKIES_KEYS, SESSION_REQUESTS_HUB_URL } from 'src/config-global';

export const SESSION_REQUEST_ADMIN_EVENTS = [
  'SessionRequestAwaitingAdminReview',
  'SessionRequestBroadcastCreated',
  'SessionRequestBroadcastWithdrawn',
  'SessionRequestTargetedCreated',
  'SessionRequestCancelled',
  'SessionRequestReviewed',
] as const;

export const SESSION_REQUEST_INSTRUCTOR_EVENTS = [
  'SessionRequestBroadcastCreated',
  'SessionRequestBroadcastWithdrawn',
  'SessionRequestTargetedCreated',
  'SessionRequestCancelled',
  'SessionRequestReviewed',
  'SessionRequestAwaitingAdminReview',
] as const;

export type SessionRequestHubRole = 'admin' | 'instructor';

export type SessionRequestHubEventName =
  | (typeof SESSION_REQUEST_ADMIN_EVENTS)[number]
  | (typeof SESSION_REQUEST_INSTRUCTOR_EVENTS)[number];

export type SessionRequestHubStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Normalize hub URLs. Relative paths stay relative (same-origin proxy).
 * Absolute wss/https URLs are cleaned; access_token is stripped (factory adds it).
 */
export function normalizeSessionRequestsHubUrl(raw?: string | null): string | null {
  const value = (raw || '').trim();
  if (!value) return null;

  // Same-origin relative path (preferred)
  if (value.startsWith('/')) {
    return value.split('?')[0].replace(/\/$/, '') || '/hubs/session-requests';
  }

  try {
    const withProtocol = value
      .replace(/^wss:\/\//i, 'https://')
      .replace(/^ws:\/\//i, 'http://');

    const url = new URL(withProtocol);
    url.searchParams.delete('access_token');
    url.hash = '';
    return `${url.origin}${url.pathname}`.replace(/\/$/, '');
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getSessionRequestsAccessToken(): string {
  if (typeof window === 'undefined') return '';

  return (
    getCookie(COOKIES_KEYS.session) ||
    getCookie('accessToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem(COOKIES_KEYS.session) ||
    ''
  );
}

export function getSessionRequestEventsForRole(
  role: SessionRequestHubRole
): readonly string[] {
  return role === 'admin' ? SESSION_REQUEST_ADMIN_EVENTS : SESSION_REQUEST_INSTRUCTOR_EVENTS;
}

export function createSessionRequestsHubConnection(token: string): HubConnection | null {
  const hubUrl = normalizeSessionRequestsHubUrl(SESSION_REQUESTS_HUB_URL);
  if (!hubUrl) {
    console.warn('[SignalR] Invalid SESSION_REQUESTS_HUB_URL — realtime disabled');
    return null;
  }

  if (!token) {
    console.warn('[SignalR] Missing access token — realtime skipped');
    return null;
  }

  try {
    // Same-origin Next rewrite proxies HTTP well; WebSocket upgrades are unreliable through it.
    // Use SSE/LongPolling for relative hub URLs. Direct absolute hubs can use WebSockets.
    const isSameOriginProxy = hubUrl.startsWith('/');
    const transport = isSameOriginProxy
      ? HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling
      : HttpTransportType.WebSockets |
        HttpTransportType.ServerSentEvents |
        HttpTransportType.LongPolling;

    return new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getSessionRequestsAccessToken() || token,
        transport,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        process.env.NODE_ENV === 'development' ? LogLevel.Information : LogLevel.Warning
      )
      .build();
  } catch (error) {
    console.warn('[SignalR] Failed to create session-requests hub connection:', error);
    return null;
  }
}

export async function startSessionRequestsHub(connection: HubConnection): Promise<boolean> {
  if (connection.state === HubConnectionState.Connected) return true;
  if (connection.state === HubConnectionState.Connecting) return false;

  try {
    await connection.start();
    console.info('[SignalR] Connected to session-requests hub via', connection.state);
    return true;
  } catch (error) {
    console.warn(
      '[SignalR] Could not connect to session-requests hub.',
      'If you see a CORS error, keep using the same-origin /hubs proxy (restart next dev).',
      error
    );
    return false;
  }
}

export async function stopSessionRequestsHub(connection: HubConnection | null): Promise<void> {
  if (!connection) return;
  try {
    if (connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
  } catch {
    // ignore stop errors during unmount
  }
}
