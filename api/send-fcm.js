// ─── Web Push (FCM) sender ──────────────────────────────────────────────────
// Sends a Firebase Cloud Messaging push to a browser FCM token. This works
// even when the recipient's browser tab is CLOSED — the OS-level push
// machinery (Chrome/Edge/Firefox/Android) wakes the service worker and
// shows a banner with sound + vibration.
//
// Payload accepted:
//   { token: <fcmToken>, title: "...", body: "...", data: { ... } }
// or
//   { tokens: [<fcmToken>, ...], title, body, data }
//
// Requires the same Firebase service-account JSON your other API routes use
// (FIREBASE_SERVICE_ACCOUNT_JSON, or the split FIREBASE_PROJECT_ID /
// FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars on Vercel).

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
      }
      initializeApp({ credential: cert(serviceAccount) })
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }
  } catch (err) {
    console.error('Firebase Admin init failed:', err)
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { token, tokens, title, body, data } = req.body || {}
    const list = Array.isArray(tokens) ? tokens : (token ? [token] : [])
    const cleanTokens = list.filter(t => typeof t === 'string' && t.trim().length > 0)

    if (cleanTokens.length === 0) {
      return res.status(400).json({ error: 'No FCM tokens provided' })
    }
    if (!title) {
      return res.status(400).json({ error: 'title is required' })
    }

    // Stringify all values in `data` — FCM requires data fields to be
    // strings. The service worker's onBackgroundMessage handler reads them
    // back as strings.
    const stringData = {}
    if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        stringData[k] = v == null ? '' : String(v)
      }
    }

    const message = {
      // We send to MULTIPLE tokens via sendEachForMulticast. This way, even
      // if the vendor uses both Chrome desktop AND mobile Chrome, they get
      // the notification on every device they're signed in on.
      tokens: cleanTokens,
      notification: { title, body: body || '' },
      data: stringData,
      webpush: {
        headers: { Urgency: 'high', TTL: '600' },
        notification: {
          icon:  'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-512_q99d8r.png',
          badge: 'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-192_nggcjv.png',
          requireInteraction: true,
          vibrate: [300, 120, 300, 120, 300],
        },
        fcmOptions: { link: stringData.url || '/vendor' },
      },
    }

    const result = await getMessaging().sendEachForMulticast(message)

    return res.status(200).json({
      success: true,
      successCount: result.successCount,
      failureCount: result.failureCount,
      // Return per-token errors so the caller can clean up dead tokens.
      responses: result.responses.map(r => ({
        success: r.success,
        error: r.error?.code || null,
      })),
    })
  } catch (err) {
    console.error('FCM send error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}
