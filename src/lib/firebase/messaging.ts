import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
} from 'firebase/messaging';

import type { FirebaseTokenFailureReason } from 'src/types/firebase-notification';

import { getFirebaseApp } from './config';

export type FirebaseTokenResult =
  | { success: true; token: string; permission: NotificationPermission }
  | {
      success: false;
      reason: FirebaseTokenFailureReason;
      permission?: NotificationPermission;
      details?: string;
    };

const FIREBASE_TOKEN_STORAGE_KEY = 'aspire_fcm_token';
const FIREBASE_SERVICE_WORKER_PATH = '/firebase-messaging-sw.js';

export async function requestFirebaseToken(): Promise<FirebaseTokenResult> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { success: false, reason: 'browser_required' };
  }

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { success: false, reason: 'browser_unsupported' };
  }

  if (!(await isSupported())) {
    return { success: false, reason: 'messaging_unsupported' };
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return { success: false, reason: 'missing_vapid_key' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, reason: 'permission_not_granted', permission };
  }

  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      FIREBASE_SERVICE_WORKER_PATH
    );
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(getFirebaseApp());
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration });

    if (!token.trim()) {
      return { success: false, reason: 'empty_token', permission };
    }

    return { success: true, token, permission };
  } catch (error) {
    const details =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown Firebase Messaging error';
    return { success: false, reason: 'token_request_failed', permission, details };
  }
}

export function saveRegisteredFirebaseToken(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FIREBASE_TOKEN_STORAGE_KEY, token);
  }
}

export function getRegisteredFirebaseToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(FIREBASE_TOKEN_STORAGE_KEY);
}

export function removeRegisteredFirebaseToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(FIREBASE_TOKEN_STORAGE_KEY);
  }
}

export async function subscribeToForegroundMessages(
  listener: (payload: MessagePayload) => void
): Promise<() => void> {
  if (typeof window === 'undefined' || !(await isSupported())) {
    return () => undefined;
  }

  return onMessage(getMessaging(getFirebaseApp()), listener);
}
