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

export type SessionRequestHubStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

type HubEventHandler = (eventName: SessionRequestHubEventName, payload?: unknown) => void;
type StatusHandler = (status: SessionRequestHubStatus) => void;

type Subscriber = {
  id: number;
  role: SessionRequestHubRole;
  onEvent: HubEventHandler;
  onStatus: StatusHandler;
};

/**
 * Normalize hub URLs. Relative paths stay relative (same-origin proxy).
 * Absolute wss/https URLs are cleaned; access_token is stripped (factory adds it).
 */
export function normalizeSessionRequestsHubUrl(raw?: string | null): string | null {
  const value = (raw || '').trim();
  if (!value) return null;

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

function isAbortLikeError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    /stopped during negotiation|AbortError|aborted|Handshake was canceled/i.test(message)
  );
}

function isRetryableHubError(error: unknown): boolean {
  if (isAbortLikeError(error)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /No Connection with that ID|Handshake was canceled|Failed to start the connection/i.test(
    message
  );
}

/**
 * Shared hub client — survives React Strict Mode remounts and Fast Refresh.
 * Prefers direct API WebSockets (same approach as Postman) when hub URL is absolute.
 */
class SessionRequestsHubClient {
  private connection: HubConnection | null = null;
  private subscribers = new Map<number, Subscriber>();
  private nextId = 1;
  private status: SessionRequestHubStatus = 'idle';
  private startPromise: Promise<boolean> | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | undefined;
  private handlersBound = false;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private retryAttempt = 0;

  subscribe(
    role: SessionRequestHubRole,
    onEvent: HubEventHandler,
    onStatus: StatusHandler
  ): () => void {
    const id = this.nextId++;
    this.subscribers.set(id, { id, role, onEvent, onStatus });
    onStatus(this.status);

    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = undefined;
    }

    void this.ensureStarted();

    return () => {
      this.subscribers.delete(id);
      if (this.subscribers.size === 0) {
        // Delay stop so Strict Mode remount (unmount → mount) can reuse the connection.
        this.stopTimer = setTimeout(() => {
          if (this.subscribers.size === 0) {
            void this.stop();
          }
        }, 1500);
      }
    };
  }

  private setStatus(next: SessionRequestHubStatus) {
    this.status = next;
    for (const sub of this.subscribers.values()) {
      sub.onStatus(next);
    }
  }

  private notifyEvent(eventName: SessionRequestHubEventName, payload?: unknown) {
    for (const sub of this.subscribers.values()) {
      const allowed = getSessionRequestEventsForRole(sub.role);
      if (allowed.includes(eventName)) {
        sub.onEvent(eventName, payload);
      }
    }
  }

  private scheduleRetry(delayMs = 500) {
    if (this.retryTimer || this.subscribers.size === 0) return;
    const delay = Math.min(delayMs * Math.max(1, this.retryAttempt), 10000);
    this.retryAttempt += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      if (this.subscribers.size > 0 && this.status !== 'connected') {
        void this.ensureStarted();
      }
    }, delay);
  }

  private buildConnection(token: string): HubConnection | null {
    const hubUrl = normalizeSessionRequestsHubUrl(SESSION_REQUESTS_HUB_URL);
    if (!hubUrl) {
      console.warn('[SignalR] Invalid SESSION_REQUESTS_HUB_URL — realtime disabled');
      return null;
    }

    try {
      const isSameOriginProxy = hubUrl.startsWith('/');

      // Direct API URL (Postman-style): skip negotiate + WebSockets only.
      // Next `/hubs` rewrite breaks LongPolling affinity → "No Connection with that ID".
      const transport = isSameOriginProxy
        ? HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling
        : HttpTransportType.WebSockets;

      console.info(
        '[SignalR] Connecting to',
        hubUrl,
        isSameOriginProxy ? '(same-origin proxy)' : '(direct WebSocket)'
      );

      return new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => getSessionRequestsAccessToken() || token,
          transport,
          skipNegotiation: !isSameOriginProxy,
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

  private bindConnectionHandlers(connection: HubConnection) {
    if (this.handlersBound) return;
    this.handlersBound = true;

    const allEvents = new Set<string>([
      ...SESSION_REQUEST_ADMIN_EVENTS,
      ...SESSION_REQUEST_INSTRUCTOR_EVENTS,
    ]);

    for (const eventName of allEvents) {
      connection.on(eventName, (...args: unknown[]) => {
        const payload = args.length <= 1 ? args[0] : args;
        console.info('[SignalR] event received:', eventName, payload);
        this.notifyEvent(eventName as SessionRequestHubEventName, payload);
      });
    }

    connection.onreconnecting(() => {
      this.setStatus('connecting');
    });

    connection.onreconnected(() => {
      this.retryAttempt = 0;
      console.info('[SignalR] Reconnected to session-requests hub');
      this.setStatus('connected');
    });

    connection.onclose((error) => {
      this.handlersBound = false;
      this.connection = null;
      this.startPromise = null;
      this.setStatus('disconnected');
      if (error && !isAbortLikeError(error)) {
        console.warn('[SignalR] session-requests hub closed:', error);
      }

      if (this.subscribers.size > 0) {
        this.scheduleRetry(1000);
      }
    });
  }

  private async ensureStarted(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.subscribers.size === 0) return false;

    if (this.connection?.state === HubConnectionState.Connected) {
      this.setStatus('connected');
      return true;
    }

    if (this.startPromise) return this.startPromise;

    this.startPromise = this.startInternal();
    try {
      return await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  private async startInternal(): Promise<boolean> {
    const token = getSessionRequestsAccessToken();
    if (!token) {
      console.warn('[SignalR] No access token found in cookies — realtime skipped');
      this.setStatus('error');
      return false;
    }

    this.setStatus('connecting');

    if (!this.connection || this.connection.state === HubConnectionState.Disconnected) {
      this.handlersBound = false;
      this.connection = this.buildConnection(token);
      if (!this.connection) {
        this.setStatus('error');
        return false;
      }
      this.bindConnectionHandlers(this.connection);
    }

    const connection = this.connection;

    if (connection.state === HubConnectionState.Connected) {
      this.retryAttempt = 0;
      this.setStatus('connected');
      return true;
    }

    if (connection.state === HubConnectionState.Connecting) {
      return false;
    }

    try {
      await connection.start();
      this.retryAttempt = 0;
      console.info('[SignalR] Connected to session-requests hub via', connection.state);
      this.setStatus('connected');
      return true;
    } catch (error) {
      // Drop broken connection so the next retry builds a fresh one.
      this.handlersBound = false;
      this.connection = null;

      if (isRetryableHubError(error)) {
        this.scheduleRetry(400);
        return false;
      }

      console.warn(
        '[SignalR] Could not connect to session-requests hub.',
        'Expected direct WSS to API (like Postman). Check CORS / token / hub URL.',
        error
      );
      this.setStatus('error');
      this.scheduleRetry(3000);
      return false;
    }
  }

  private async stop(): Promise<void> {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }

    const connection = this.connection;
    this.connection = null;
    this.handlersBound = false;
    this.startPromise = null;
    this.retryAttempt = 0;

    if (!connection) {
      this.setStatus('idle');
      return;
    }

    try {
      if (connection.state !== HubConnectionState.Disconnected) {
        await connection.stop();
      }
    } catch {
      // ignore stop errors
    }

    this.setStatus('idle');
  }
}

type HubGlobal = {
  __aspireSessionRequestsHub?: SessionRequestsHubClient;
  __aspireSessionRequestsHubUrl?: string;
};

const hubClient = (() => {
  if (typeof window === 'undefined') return null;
  const g = globalThis as unknown as HubGlobal;
  // Recreate after hub URL / transport changes (avoids stuck broken proxy connection).
  if (g.__aspireSessionRequestsHubUrl !== SESSION_REQUESTS_HUB_URL) {
    g.__aspireSessionRequestsHub = undefined;
    g.__aspireSessionRequestsHubUrl = SESSION_REQUESTS_HUB_URL;
  }
  g.__aspireSessionRequestsHub ??= new SessionRequestsHubClient();
  return g.__aspireSessionRequestsHub;
})();

export function subscribeSessionRequestsHub(
  role: SessionRequestHubRole,
  onEvent: HubEventHandler,
  onStatus: StatusHandler
): () => void {
  if (!hubClient) return () => undefined;
  return hubClient.subscribe(role, onEvent, onStatus);
}

/** @deprecated Prefer subscribeSessionRequestsHub — kept for rare direct usage. */
export function createSessionRequestsHubConnection(token: string): HubConnection | null {
  const hubUrl = normalizeSessionRequestsHubUrl(SESSION_REQUESTS_HUB_URL);
  if (!hubUrl || !token) return null;

  const isSameOriginProxy = hubUrl.startsWith('/');

  return new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => getSessionRequestsAccessToken() || token,
      transport: isSameOriginProxy
        ? HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling
        : HttpTransportType.WebSockets,
      skipNegotiation: !isSameOriginProxy,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();
}

export async function startSessionRequestsHub(connection: HubConnection): Promise<boolean> {
  if (connection.state === HubConnectionState.Connected) return true;
  if (connection.state === HubConnectionState.Connecting) return false;

  try {
    await connection.start();
    return true;
  } catch (error) {
    if (!isAbortLikeError(error)) {
      console.warn('[SignalR] Could not connect to session-requests hub.', error);
    }
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
    // ignore
  }
}
