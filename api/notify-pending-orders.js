// api/notify-pending-orders.js
// Vercel Serverless Function
// Called every minute via Vercel cron OR every 10 sec via frontend

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

// ── Firebase Admin init ───────────────────────────────────────────────────
let adminApp = null
const initFirebase = () => {
  if (!adminApp) {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      })
    } else {
      adminApp = getApps()[0]
    }
  }
  return { db: getFirestore(), messaging: getMessaging() }
}

export default async function handler(req, res) {
  // Allow GET (from frontend) or POST (from cron)
  // Security check
  const secret = req.headers['x-cron-secret'] || req.query.secret
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { db, messaging } = initFirebase()

    // Get all pending orders
    const snapshot = await db
      .collection('orders')
      .where('status', '==', 'pending')
      .get()

    if (snapshot.empty) {
      return res.status(200).json({ success: true, notified: 0, message: 'No pending orders' })
    }

    const results = []

    for (const orderDoc of snapshot.docs) {
      const order = { id: orderDoc.id, ...orderDoc.data() }

      // Get vendor FCM token
      const vendorDoc = await db.doc(`vendors/${order.vendorUid}`).get()
      if (!vendorDoc.exists) continue

      const vendor = vendorDoc.data()
      const fcmToken = vendor.fcmToken

      if (!fcmToken) {
        results.push({ orderId: order.id, status: 'no_token', vendor: vendor.storeName })
        continue
      }

      // Build notification
      const itemsList = order.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || 'items'
      const message = {
        token: fcmToken,
        notification: {
          title: '🔔 Pending Order Alert!',
          body: `${order.userName} ordered ₹${order.total} — ${itemsList}. Please accept!`,
        },
        data: {
          orderId: order.id,
          type: 'pending_order_alert',
          total: String(order.total),
          userName: order.userName || '',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'order_alerts',
            priority: 'high',
            defaultVibrateTimings: true,
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            }
          }
        },
        webpush: {
          headers: { Urgency: 'high' },
          notification: {
            title: '🔔 Pending Order Alert!',
            body: `${order.userName} — ₹${order.total}. Please accept!`,
            icon: 'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-192_nggcjv.png',
            badge: 'https://res.cloudinary.com/dqlwojavr/image/upload/v1774093229/icon-192_nggcjv.png',
            requireInteraction: true,
            tag: `order-${order.id}`,
          },
          fcmOptions: {
            link: '/vendor'
          }
        }
      }

      try {
        const response = await messaging.send(message)
        results.push({ orderId: order.id, status: 'sent', vendor: vendor.storeName, messageId: response })
      } catch (fcmError) {
        // Token expired — remove it
        if (fcmError.code === 'messaging/registration-token-not-registered') {
          await db.doc(`vendors/${order.vendorUid}`).update({ fcmToken: '' })
          results.push({ orderId: order.id, status: 'token_expired', vendor: vendor.storeName })
        } else {
          results.push({ orderId: order.id, status: 'error', error: fcmError.message })
        }
      }
    }

    return res.status(200).json({
      success: true,
      pendingOrders: snapshot.size,
      notified: results.filter(r => r.status === 'sent').length,
      results
    })

  } catch (err) {
    console.error('Notify error:', err)
    return res.status(500).json({ error: err.message })
  }
}