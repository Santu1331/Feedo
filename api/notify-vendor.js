// api/notify-vendor.js
// Bug #2 fix — instant push the moment an order lands, before any cron tick.
// Called from services.js placeOrder() right after the Firestore write.
// Checks both expoPushToken (mobile) and fcmToken (web) on the vendor doc.
// No auth required — the caller just placed a valid order.

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

const isExpoToken = (t) => typeof t === 'string' && t.startsWith('ExponentPushToken')

async function sendFcm(token, title, body, data) {
  const stringData = {}
  for (const [k, v] of Object.entries(data)) stringData[k] = String(v)
  try {
    await getMessaging().send({
      token,
      notification: { title, body },
      data: stringData,
      android: { priority: 'high', notification: { sound: 'default', channelId: 'default' } },
      apns:    { payload: { aps: { sound: 'default' } } },
      webpush: {
        headers: { Urgency: 'high', TTL: '600' },
        notification: {
          icon:  'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-512_q99d8r.png',
          badge: 'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-192_nggcjv.png',
          requireInteraction: true,
          vibrate: [400, 150, 400, 150, 400, 150, 600],
        },
        fcmOptions: { link: '/vendor' },
      },
    })
  } catch (err) {
    console.error('FCM send error (notify-vendor):', err.code, token.slice(0, 20))
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  try {
    const {
      vendorUid,
      orderId,
      customerName,
      itemsSummary,
      total,
      // Optional: tokens passed directly from client (avoids Firestore read)
      vendorExpoPushToken,
      vendorFcmToken,
    } = req.body || {}

    if (!vendorUid || !orderId) {
      return res.status(400).json({ error: 'vendorUid and orderId are required' })
    }

    const title = `🛎️ New Order — ₹${total || '?'}`
    const body  = `${customerName || 'A customer'} just placed an order${itemsSummary ? ': ' + itemsSummary.slice(0, 80) : '!'}`
    const pushData = {
      orderId:  String(orderId),
      vendorId: String(vendorUid),
      type:     'new_order',
      url:      '/vendor',
      categoryId: 'NEW_ORDER',
    }

    // Use tokens from request body if provided (faster, avoids Firestore read)
    let expoToken = vendorExpoPushToken || null
    let fcmToken  = vendorFcmToken      || null

    // Fallback: read from Firestore if not provided
    if (!expoToken && !fcmToken) {
      const db      = getFirestore()
      const vendorDoc = await db.collection('vendors').doc(vendorUid).get()
      if (vendorDoc.exists) {
        const vData = vendorDoc.data()
        expoToken = vData.expoPushToken || null
        fcmToken  = vData.fcmToken      || null
      }
    }

    let sent = 0

    // Mobile push — Expo relay for ExponentPushToken[...], FCM otherwise
    if (expoToken) {
      if (isExpoToken(expoToken)) {
        const results = await sendExpoNotifications([{
          to:         expoToken,
          title,
          body,
          sound:      'default',
          priority:   'high',
          channelId:  'default',
          badge:      1,
          categoryId: 'NEW_ORDER',
          data:       pushData,
        }])
        if (results[0]?.success) sent++
      } else {
        await sendFcm(expoToken, title, body, pushData)
        sent++
      }
    }

    // Web browser push — FCM with web push options
    if (fcmToken && typeof fcmToken === 'string' && fcmToken !== expoToken) {
      await sendFcm(fcmToken, title, body, pushData)
      sent++
    }

    return res.status(200).json({ success: true, sent, expoToken: !!expoToken, fcmToken: !!fcmToken })
  } catch (err) {
    console.error('notify-vendor error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}
