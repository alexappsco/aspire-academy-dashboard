importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD6bNDRVYWaz17ilLijZy_xKFrFROzMV9Q',
  authDomain: 'aspire-626e5.firebaseapp.com',
  projectId: 'aspire-626e5',
  storageBucket: 'aspire-626e5.firebasestorage.app',
  messagingSenderId: '837160474244',
  appId: '1:837160474244:web:8e96dbdce43612b0e2d4d1',
});

firebase.messaging();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
