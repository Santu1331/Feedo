// ─── FeedoZone — Firebase Cloud Messaging Service Worker ────────────────────
// Lives at /firebase-messaging-sw.js so the browser can register it at the
// site root (required by FCM). When a push arrives while the tab is
// backgrounded or the browser is closed, this worker shows the OS
// notification (sound + vibration on Android, banner on desktop).
//
// Tab open + focused → FCM stays silent and `onMessage` in useNotifications.js
// shows a toast instead, so we don't double-notify.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyB2Q-qfQADa6FWrXnv5wFQrU4i9fdt3BQU',
  authDomain: 'feedozone.firebaseapp.com',
  projectId: 'feedozone',
  storageBucket: 'feedozone.firebasestorage.app',
  messagingSenderId: '203132079474',
  appId: '1:203132079474:web:97886d0ca3fce961fea1eb',
})

const messaging = firebase.messaging()

// ── Background notification handler ─────────────────────────────────────────
// Triggered when the page is hidden / closed and the server sends a push.
// We deliberately ignore the auto-displayed `payload.notification` and build
// our own NotificationOptions so we get full control over icon, badge,
// vibrate pattern, action buttons, and renotify behaviour.
messaging.onBackgroundMessage((payload) => {
  const data  = payload.data || {}
  const note  = payload.notification || {}
  const title = note.title || data.title || 'FeedoZone 🍽️'
  const body  = note.body  || data.body  || 'You have a new update'

  // Use the order ID as the tag so multiple pushes for the same order
  // collapse into one notification (and `renotify:true` re-fires sound).
  const tag = data.orderId ? `feedo-order-${data.orderId}` : 'feedo-' + Date.now()

  const options = {
    body,
    tag,
    renotify: true,
    requireInteraction: true,           // keeps the banner up until tapped
    silent: false,
    icon:  'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-512_q99d8r.png',
    badge: 'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-192_nggcjv.png',
    vibrate: [300, 120, 300, 120, 300], // strong Android buzz pattern
    data: {
      url: data.url || '/vendor',
      orderId: data.orderId || null,
    },
    actions: [
      { action: 'open',    title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  return self.registration.showNotification(title, options)
})

// ── Notification click handler ──────────────────────────────────────────────
// Bring an existing tab to the front (if any) and navigate it to the order
// dashboard. Otherwise open a fresh tab.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const targetUrl = (event.notification.data && event.notification.data.url) || '/vendor'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          // If a Feedo tab is already open, focus it and tell it to navigate.
          if ('focus' in client) {
            client.postMessage({ type: 'feedo-open', url: targetUrl })
            return client.focus()
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl)
      })
  )
})

// Take control of any open clients as soon as the worker is activated, so
// FCM can deliver to existing tabs without a page reload.
self.addEventListener('install', (event) => { self.skipWaiting() })
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()) })
