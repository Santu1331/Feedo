// api/cron-push.js
// Safety-net cron: notifies vendors with pending orders they may have missed.
// Called on a schedule (e.g. every 5 min via Vercel Cron or external cron).
//
// Bug #1 fix: detects token type — Expo tokens → Expo relay, FCM tokens → Admin SDK.
// Bug #3 fix: checks BOTH expoPushToken (mobile) and fcmToken (web browser).
// Bug #5 fix: categoryId is forwarded to Expo payload.

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore }                  from 'firebase-admin/firestore'
import { getMessaging }                  from 'firebase-admin/messaging'
import { sendExpoNotifications }         from './send-push.js'

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n')
      initializeApp({ credential: cert(sa) })
    } else {
      initializeApp({ credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })})
    }
  } catch (e) { console.error('Firebase Admin init failed:', e) }
}

const COOLDOWN_MS = 10 * 60 * 1000 // 10 min between reminders per vendor

// Helper: is this an Expo push token?
const isExpoToken = (t) => typeof t === 'string' && t.startsWith('ExponentPushToken')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-cron-secret')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const cronSecret = process.env.CRON_SECRET || 'feedozone_cron_2025'
  const secret     = req.query.secret || req.headers['x-cron-secret']
  if (!secret || secret !== cronSecret) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const db  = getFirestore()
    const now = Date.now()

    const vendorSnap = await db.collection('vendors').get()
    if (vendorSnap.empty) return res.status(200).json({ message: 'No vendors', sent: 0 })

    const expoMessages = []   // Expo relay
    const fcmMessages  = []   // Firebase Admin SDK (native FCM or web browser)
    const skipped      = []

    for (const doc of vendorSnap.docs) {
      const data      = doc.data()
      const vendorId  = doc.id
      const expoToken = data.expoPushToken   // mobile (Expo)
      const fcmToken  = data.fcmToken        // web browser (FCM)

      if (!data.isOpen) continue
      if (!expoToken && !fcmToken) continue

      // Cooldown
      const lastNotified = data.lastPendingNotifiedAt?.toMillis?.() || 0
      if (now - lastNotified < COOLDOWN_MS) { skipped.push(vendorId); continue }

      // Check pending orders
      const pendingSnap = await db.collection('orders')
        .where('vendorUid', '==', vendorId)
        .where('status',    '==', 'pending')
        .get()
      if (pendingSnap.empty) continue

      // Drop stale orders (>1h old)
      const active = pendingSnap.docs.filter(d => {
        const t = d.data().createdAt?.toDate?.() || new Date(0)
        return (now - t.getTime()) < 60 * 60 * 1000
      })
      if (active.length === 0) continue

      const orderId = active[0].id
      const count   = active.length
      const title   = `🛎️ ${count} Pending Order${count > 1 ? 's' : ''}!`
      const body    = `You have ${count} order${count > 1 ? 's' : ''} waiting. Tap to accept.`
      const dataPayload = { orderId, vendorId, screen: 'VendorOrders', url: '/vendor' }

      // ── Route by token type ──────────────────────────────────────────
      if (expoToken && isExpoToken(expoToken)) {
        // Expo relay handles ExponentPushToken[...]
        expoMessages.push({
          to:         expoToken,
          title,
          body,
          sound:      'default',
          priority:   'high',
          channelId:  'default',
          badge:      1,
          categoryId: 'NEW_ORDER',   // ✅ Bug #5 fix
          data:       dataPayload,
        })
      } else if (expoToken) {
        // Looks like a raw FCM token stored in expoPushToken field
        fcmMessages.push(buildFcmMessage(expoToken, title, body, dataPayload))
      }

      if (fcmToken && typeof fcmToken === 'string') {
        // Web browser FCM token — Bug #3 fix
        fcmMessages.push(buildFcmMessage(fcmToken, title, body, dataPayload))
      }

      await db.collection('vendors').doc(vendorId).update({ lastPendingNotifiedAt: new Date() })
    }

    let expoResults = []
    let fcmResults  = { successCount: 0, failureCount: 0 }

    if (expoMessages.length > 0) {
      expoResults = await sendExpoNotifications(expoMessages)
      console.log(`Expo sent: ${expoResults.filter(r => r.success).length}/${expoMessages.length}`)
    }

    if (fcmMessages.length > 0) {
      fcmResults = await getMessaging().sendEach(fcmMessages)
      console.log(`FCM sent: ${fcmResults.successCount}/${fcmMessages.length}`)
    }

    return res.status(200).json({
      success:         true,
      expoSent:        expoResults.filter(r => r.success).length,
      fcmSent:         fcmResults.successCount,
      skippedCooldown: skipped.length,
    })
  } catch (err) {
    console.error('cron-push error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}

function buildFcmMessage(token, title, body, data) {
  const stringData = {}
  for (const [k, v] of Object.entries(data)) stringData[k] = String(v)
  stringData.categoryId = 'NEW_ORDER'
  return {
    token,
    notification: { title, body },
    data: stringData,
    android: { priority: 'high', notification: { sound: 'default', channelId: 'default' } },
    apns:    { payload: { aps: { sound: 'default', category: 'NEW_ORDER' } } },
  }
}
