// api/prepare-order.js
// Bug #4 fix — the "Prepare" step was never built.
// Called when a vendor taps "Start Preparing" in the dashboard.
// Updates order status to 'preparing' and notifies the customer via:
//   - In-app notification (Firestore)
//   - Mobile push (Expo relay for ExponentPushToken)
//   - Web/browser push (FCM Admin SDK for fcmToken)

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue }      from 'firebase-admin/firestore'
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
    })
  } catch (err) {
    console.error('FCM send error (prepare):', err.code, token.slice(0, 20))
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { orderId } = req.body || req.query
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' })

    const db       = getFirestore()
    const orderRef = db.collection('orders').doc(orderId)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) return res.status(404).json({ error: 'Order not found' })

    const orderData = orderDoc.data()

    // Only transition from accepted → preparing
    if (!['accepted', 'pending'].includes(orderData.status)) {
      return res.status(200).json({ success: true, message: `Order already ${orderData.status}` })
    }

    // 1. Update Firestore
    await orderRef.update({ status: 'preparing', updatedAt: FieldValue.serverTimestamp() })

    // 2. Notify customer
    const userUid = orderData.userUid
    if (userUid) {
      const vendorName = orderData.vendorName || 'The restaurant'

      // In-app bell
      await db.collection('notifications').add({
        toUid:     userUid,
        title:     '👨‍🍳 Chef is Cooking!',
        body:      `${vendorName} has started preparing your food. Fresh & hot coming up! 🍳`,
        read:      false,
        createdAt: FieldValue.serverTimestamp(),
      })

      // Push tokens
      const userDoc  = await db.collection('users').doc(userUid).get()
      const userData = userDoc.exists ? userDoc.data() : {}
      const expoToken = userData.expoPushToken
      const fcmToken  = userData.fcmToken

      const title   = '👨‍🍳 Chef is Cooking!'
      const body    = `${vendorName} is preparing your food. Fresh & hot coming up! 🍳`
      const pushData = { orderId: String(orderId), type: 'order_status', status: 'preparing', url: '/orders' }

      // Mobile
      if (expoToken) {
        if (isExpoToken(expoToken)) {
          await sendExpoNotifications([{ to: expoToken, title, body, data: pushData }])
        } else {
          await sendFcm(expoToken, title, body, pushData)
        }
      }

      // Web
      if (fcmToken && typeof fcmToken === 'string') {
        await sendFcm(fcmToken, title, body, pushData)
      }
    }

    return res.status(200).json({ success: true, message: 'Order status set to preparing, customer notified' })
  } catch (err) {
    console.error('prepare-order error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}
