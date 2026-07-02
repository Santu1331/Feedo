// ─── FeedoZone — Firebase Cloud Messaging Service Worker ────────────────────
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
messaging.onBackgroundMessage((payload) => {
  const data  = payload.data || {}
  const note  = payload.notification || {}
  const title = note.title || data.title || 'FeedoZone 🍽️'
  const body  = note.body  || data.body  || 'You have a new update'
  const type  = data.type  || ''

  const tag = data.orderId ? `feedo-order-${data.orderId}` : 'feedo-' + Date.now()

  // Different action buttons based on notification type
  let actions = [{ action: 'open', title: '👁️ View' }, { action: 'dismiss', title: 'Dismiss' }]

  if (type === 'new_order') {
    actions = [
      { action: 'accept', title: '✅ Accept Order' },
      { action: 'view',   title: '👁️ View Details' },
    ]
  } else if (type === 'order_status') {
    actions = [
      { action: 'open',    title: '📱 Open App' },
      { action: 'dismiss', title: 'OK' },
    ]
  }

  const options = {
    body,
    tag,
    renotify:            true,
    requireInteraction:  type === 'new_order', // keep order alerts up until tapped
    silent:              false,
    icon:  'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-512_q99d8r.png',
    badge: 'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-192_nggcjv.png',
    vibrate: type === 'new_order'
      ? [400, 150, 400, 150, 400, 150, 600] // urgent pattern for orders
      : [200, 100, 200],                     // gentle for status updates
    data: {
      url:     data.url     || '/vendor',
      orderId: data.orderId || null,
      type,
    },
    actions,
  }

  return self.registration.showNotification(title, options)
})

// ── Notification click handler ──────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const notifData = event.notification.data || {}
  const orderId   = notifData.orderId
  const type      = notifData.type

  if (event.action === 'dismiss') return

  // Determine target URL
  let targetUrl = notifData.url || '/vendor'
  if (orderId) targetUrl = '/vendor'

  // Post message to open tab to handle the action
  const actionData = {
    type: 'feedo-open',
    url:      targetUrl,
    orderId,
    action:   event.action, // 'accept' | 'view' | 'open'
    notifType: type,
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            client.postMessage(actionData)
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl).then(newClient => {
            if (newClient) newClient.postMessage(actionData)
          })
        }
      })
  )
})

self.addEventListener('install',  () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
