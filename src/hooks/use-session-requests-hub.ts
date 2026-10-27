'use client';

import { useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';

import {
  createSessionRequestsHubConnection,
  getSessionRequestEventsForRole,
  getSessionRequestsAccessToken,
  startSessionRequestsHub,
  stopSessionRequestsHub,
  type SessionRequestHubEventName,
  type SessionRequestHubRole,
  type SessionRequestHubStatus,
} from 'src/lib/signalr/session-requests-hub';

type HubHandler = (eventName: SessionRequestHubEventName, payload?: unknown) => void;

type Options = {
  /** When false, no connection is attempted. */
  enabled?: boolean;
  /** Debounce rapid events before calling onEvent (ms). */
  debounceMs?: number;
  /**
   * Fallback polling while SignalR is down (ms).
   * Set 0 to disable. Default 20000.
   */
  pollingIntervalMs?: number;
};

/**
 * Connects to the session-requests SignalR hub and listens for role-specific events.
 * Uses same-origin `/hubs/...` (Next rewrite) to avoid API CORS.
 * While disconnected, optionally polls via onEvent so the UI still refreshes.
 */
export function useSessionRequestsHub(
  role: SessionRequestHubRole,
  onEvent: HubHandler,
  options: Options = {}
) {
  const { enabled = true, debounceMs = 400, pollingIntervalMs = 20000 } = options;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const [status, setStatus] = useState<SessionRequestHubStatus>('idle');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let disposed = false;
    let connection: HubConnection | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let lastEventName: SessionRequestHubEventName | null = null;
    let lastPayload: unknown;
    const events = getSessionRequestEventsForRole(role);

    const flush = () => {
      if (!lastEventName) return;
      const eventName = lastEventName;
      const payload = lastPayload;
      lastEventName = null;
      lastPayload = undefined;
      console.info('[SignalR] event received:', eventName, payload);
      onEventRef.current(eventName, payload);
    };

    const handleEvent = (eventName: string) => (...args: unknown[]) => {
      if (disposed) return;
      lastEventName = eventName as SessionRequestHubEventName;
      lastPayload = args.length <= 1 ? args[0] : args;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flush, debounceMs);
    };

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = undefined;
      }
    };

    const startPolling = () => {
      if (!pollingIntervalMs || pollTimer) return;
      pollTimer = setInterval(() => {
        if (disposed) return;
        onEventRef.current('SessionRequestAwaitingAdminReview' as SessionRequestHubEventName);
      }, pollingIntervalMs);
    };

    const connect = async () => {
      setStatus('connecting');
      const token = getSessionRequestsAccessToken();
      if (!token) {
        console.warn('[SignalR] No access token found in cookies — realtime skipped');
        setStatus('error');
        startPolling();
        return;
      }

      connection = createSessionRequestsHubConnection(token);
      if (!connection || disposed) {
        if (connection && disposed) await stopSessionRequestsHub(connection);
        setStatus('error');
        startPolling();
        return;
      }

      for (const eventName of events) {
        connection.on(eventName, handleEvent(eventName));
      }

      connection.onreconnecting(() => {
        if (!disposed) {
          setStatus('connecting');
          startPolling();
        }
      });

      connection.onreconnected(() => {
        if (!disposed) {
          console.info('[SignalR] Reconnected to session-requests hub');
          setStatus('connected');
          stopPolling();
        }
      });

      connection.onclose((error) => {
        if (disposed) return;
        setStatus('disconnected');
        startPolling();
        if (error) {
          console.warn('[SignalR] session-requests hub closed:', error);
        }
      });

      const ok = await startSessionRequestsHub(connection);
      if (disposed) {
        await stopSessionRequestsHub(connection);
        return;
      }

      if (ok) {
        setStatus('connected');
        stopPolling();
        console.info('[SignalR] Listening for:', events.join(', '));
      } else {
        setStatus('error');
        startPolling();
      }
    };

    void connect();

    return () => {
      disposed = true;
      clearTimeout(debounceTimer);
      stopPolling();
      if (connection) {
        for (const eventName of events) {
          connection.off(eventName);
        }
        void stopSessionRequestsHub(connection);
      }
    };
  }, [role, enabled, debounceMs, pollingIntervalMs]);

  return { status };
}
