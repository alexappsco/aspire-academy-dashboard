'use client';

import { useEffect, useRef, useState } from 'react';

import {
  subscribeSessionRequestsHub,
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
   * Optional REST fallback while SignalR is down (ms).
   * Default 0 (disabled) — rely on SignalR + automatic reconnect only.
   */
  pollingIntervalMs?: number;
};

/**
 * Subscribes to the shared session-requests SignalR hub (singleton).
 * Survives React Strict Mode remounts without aborting negotiation.
 */
export function useSessionRequestsHub(
  role: SessionRequestHubRole,
  onEvent: HubHandler,
  options: Options = {}
) {
  const { enabled = true, debounceMs = 400, pollingIntervalMs = 0 } = options;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const [status, setStatus] = useState<SessionRequestHubStatus>('idle');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let disposed = false;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let lastEventName: SessionRequestHubEventName | null = null;
    let lastPayload: unknown;

    const flush = () => {
      if (!lastEventName || disposed) return;
      const eventName = lastEventName;
      const payload = lastPayload;
      lastEventName = null;
      lastPayload = undefined;
      onEventRef.current(eventName, payload);
    };

    const handleEvent = (eventName: SessionRequestHubEventName, payload?: unknown) => {
      if (disposed) return;
      lastEventName = eventName;
      lastPayload = payload;
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

    const unsubscribe = subscribeSessionRequestsHub(
      role,
      handleEvent,
      (nextStatus) => {
        if (disposed) return;
        setStatus(nextStatus);
        if (nextStatus === 'connected') {
          stopPolling();
        } else if (nextStatus === 'error' || nextStatus === 'disconnected') {
          startPolling();
        }
      }
    );

    return () => {
      disposed = true;
      clearTimeout(debounceTimer);
      stopPolling();
      unsubscribe();
    };
  }, [role, enabled, debounceMs, pollingIntervalMs]);

  return { status };
}
