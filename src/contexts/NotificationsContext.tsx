'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  getUserNotifications,
  getUserNotificationsUnreadCount,
  registerFirebaseDevice,
} from 'src/actions/firebase-notifications';
import { useToast } from 'src/components/toast';
import { useAuth } from 'src/contexts/AuthContext';
import {
  requestFirebaseToken,
  saveRegisteredFirebaseToken,
  subscribeToForegroundMessages,
} from 'src/lib/firebase/messaging';
import type {
  FirebaseTokenFailureReason,
  UserNotification,
} from 'src/types/firebase-notification';

type FirebaseSetupStatus =
  | 'idle'
  | 'registering'
  | 'ready'
  | 'permission_denied'
  | 'unsupported'
  | 'failed';

type NotificationsContextValue = {
  notifications: UserNotification[];
  totalCount: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  firebaseStatus: FirebaseSetupStatus;
  firebaseError: FirebaseTokenFailureReason | string | null;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const FOREGROUND_RETRY_DELAYS = [0, 500, 1500, 3000] as const;

function normalizeNotifications(items: UserNotification[] | null | undefined) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    isRead: item.isRead === true || String(item.isRead) === 'true',
  }));
}

function resolveFirebaseStatus(reason: FirebaseTokenFailureReason): FirebaseSetupStatus {
  if (reason === 'permission_not_granted') return 'permission_denied';
  if (
    reason === 'browser_required' ||
    reason === 'browser_unsupported' ||
    reason === 'messaging_unsupported'
  ) {
    return 'unsupported';
  }
  return 'failed';
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseSetupStatus>('idle');
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const activeRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    const [listResponse, unreadResponse] = await Promise.all([
      getUserNotifications({ SkipCount: 0, MaxResultCount: 50 }),
      getUserNotificationsUnreadCount(),
    ]);

    if (!activeRef.current) return;

    if (listResponse.success && listResponse.data) {
      const items = normalizeNotifications(listResponse.data.items);
      setNotifications(items);
      setTotalCount(Math.max(0, listResponse.data.totalCount || 0));
      setError(null);
      setUnreadCount(
        unreadResponse.success && typeof unreadResponse.data === 'number'
          ? Math.max(0, unreadResponse.data)
          : items.filter((item) => !item.isRead).length
      );
    } else {
      setError(listResponse.error || 'Failed to load notifications');
    }

    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    activeRef.current = true;
    if (!isAuthenticated) {
      setNotifications([]);
      setTotalCount(0);
      setUnreadCount(0);
      setError(null);
      setFirebaseStatus('idle');
      setFirebaseError(null);
      return () => {
        activeRef.current = false;
      };
    }

    let unsubscribe: () => void = () => undefined;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const refreshAfterForegroundMessage = () => {
      FOREGROUND_RETRY_DELAYS.forEach((delay) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (!cancelled) void refresh();
        }, delay);
        timers.add(timer);
      });
    };

    const setup = async () => {
      await refresh();
      if (cancelled) return;

      setFirebaseStatus('registering');
      const tokenResult = await requestFirebaseToken();
      if (cancelled) return;

      if (!tokenResult.success) {
        setFirebaseStatus(resolveFirebaseStatus(tokenResult.reason));
        setFirebaseError(
          tokenResult.details
            ? `${tokenResult.reason}: ${tokenResult.details}`
            : tokenResult.reason
        );
        return;
      }

      const registerResult = await registerFirebaseDevice({ token: tokenResult.token, platform: 'Web' });
      if (cancelled) return;

      if (!registerResult.success) {
        setFirebaseStatus('failed');
        setFirebaseError(registerResult.error || 'registration_failed');
        return;
      }

      saveRegisteredFirebaseToken(tokenResult.token);
      setFirebaseStatus('ready');
      setFirebaseError(null);

      unsubscribe = await subscribeToForegroundMessages((payload) => {
        if (cancelled) return;
        const title = payload.notification?.title || payload.data?.title;
        const message = payload.notification?.body || payload.data?.message || payload.data?.body;
        toast.info([title, message].filter(Boolean).join(' — '));
        refreshAfterForegroundMessage();
      });
    };

    void setup();

    return () => {
      cancelled = true;
      activeRef.current = false;
      unsubscribe();
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [isAuthenticated, refresh, toast]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      totalCount,
      unreadCount,
      loading,
      error,
      firebaseStatus,
      firebaseError,
      refresh,
    }),
    [notifications, totalCount, unreadCount, loading, error, firebaseStatus, firebaseError, refresh]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
