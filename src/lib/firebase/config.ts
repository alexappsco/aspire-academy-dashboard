import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

const firebasePublicFallback = {
  apiKey: 'AIzaSyD6bNDRVYWaz17ilLijZy_xKFrFROzMV9Q',
  authDomain: 'aspire-626e5.firebaseapp.com',
  projectId: 'aspire-626e5',
  storageBucket: 'aspire-626e5.firebasestorage.app',
  messagingSenderId: '837160474244',
  appId: '1:837160474244:web:8e96dbdce43612b0e2d4d1',
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebasePublicFallback.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebasePublicFallback.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebasePublicFallback.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebasePublicFallback.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    firebasePublicFallback.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebasePublicFallback.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

export function getFirebaseApp(): FirebaseApp {
  if (requiredConfigValues.some((value) => !value)) {
    throw new Error('Firebase web configuration is incomplete.');
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}
