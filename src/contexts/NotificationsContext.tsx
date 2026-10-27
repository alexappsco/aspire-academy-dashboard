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
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
  registerFirebaseDevice,
  unregisterFirebaseDevice,
} from 'src/actions/firebase-notifications';
import { useToast } from 'src/components/toast';
import { useAuth } from 'src/contexts/AuthContext';
import {
  getRegisteredFirebaseToken,
  removeRegisteredFirebaseToken,
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
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  unregisterDevice: () => Promise<void>;
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
  const notificationIdsRef = useRef<Set<string>>(new Set());
  const unreadNotificationIdsRef = useRef<Set<string>>(new Set());

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
      notificationIdsRef.current = new Set(items.map((item) => item.id));
      unreadNotificationIdsRef.current = new Set(
        items.filter((item) => !item.isRead).map((item) => item.id)
      );
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

  const markAsRead = useCallback(async (id: string) => {
    const current = notifications.find((item) => item.id === id);
    if (!current || current.isRead) return true;

    const response = await markUserNotificationAsRead(id);
    if (!response.success) {
      toast.error(response.error || 'Failed to mark notification as read');
      return false;
    }

    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    if (unreadNotificationIdsRef.current.delete(id)) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    return true;
  }, [notifications, toast]);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return true;

    const response = await markAllUserNotificationsAsRead();
    if (!response.success) {
      toast.error(response.error || 'Failed to mark all notifications as read');
      return false;
    }

    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    unreadNotificationIdsRef.current.clear();
    setUnreadCount(0);
    return true;
  }, [toast, unreadCount]);

  const unregisterDevice = useCallback(async () => {
    const token = getRegisteredFirebaseToken();
    if (!token) return;

    try {
      await unregisterFirebaseDevice({ token });
    } finally {
      removeRegisteredFirebaseToken();
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    if (!isAuthenticated) {
      notificationIdsRef.current.clear();
      unreadNotificationIdsRef.current.clear();
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
        const notificationId = payload.data?.notificationId;

        if (notificationId && title && message) {
          if (notificationIdsRef.current.has(notificationId)) return;

          const notification: UserNotification = {
            id: notificationId,
            title,
            message,
            imageUrl: payload.notification?.image || null,
            type: payload.data?.type || 'General',
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          notificationIdsRef.current.add(notificationId);
          unreadNotificationIdsRef.current.add(notificationId);
          setNotifications((items) => [notification, ...items].slice(0, 50));
          setTotalCount((count) => count + 1);
          setUnreadCount((count) => count + 1);
          toast.info(`${title} — ${message}`);
          return;
        }

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
      markAsRead,
      markAllAsRead,
      unregisterDevice,
    }),
    [
      notifications,
      totalCount,
      unreadCount,
      loading,
      error,
      firebaseStatus,
      firebaseError,
      refresh,
      markAsRead,
      markAllAsRead,
      unregisterDevice,
    ]
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
