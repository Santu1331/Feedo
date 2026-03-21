// Firebase Messaging Service Worker
// ⚠️ Place this file in: public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyB2Q-qfQADa6FWrXnv5wFQrU4i9fdt3BQU",
  authDomain: "feedozone.firebaseapp.com",
  projectId: "feedozone",
  storageBucket: "feedozone.firebasestorage.app",
  messagingSenderId: "203132079474",
  appId: "1:203132079474:web:97886d0ca3fce961fea1eb"
})

const messaging = firebase.messaging()

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'FeedoZone 🍽️', {
    body: body || 'You have a new update',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'feedozone-notification',
    renotify: true,
  })
})

// Open app on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) return list[0].focus()
      return clients.openWindow('/')
    })
  )
})