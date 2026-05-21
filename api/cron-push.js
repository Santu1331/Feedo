// api/cron-push.js
// Called by cron job — notifies vendors ONLY if they have real pending orders
// Fix: checks actual pending orders per vendor + cooldown to prevent spam

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      });
    }
    console.log("Firebase Admin Initialized Successfully");
  } catch (error) {
    console.error("CRITICAL: Firebase Admin Initialization Failed:", error);
  }
}

// ── How long to wait before re-notifying same vendor (10 minutes) ──
const COOLDOWN_MS = 10 * 60 * 1000

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-cron-secret')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // Auth check — only cron job can call this
  const cronSecret = process.env.CRON_SECRET || 'feedozone_cron_2025'
  const secret = req.query.secret || req.headers['x-cron-secret']
  if (!secret || secret !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const db = getFirestore()
    const now = Date.now()

    // ── Step 1: Get all open vendors with a valid push token ──
    const vendorSnap = await db.collection('vendors').get()
    if (vendorSnap.empty) {
      return res.status(200).json({ message: 'No vendors found', sent: 0 })
    }

    const notifications = []
    const skipped = []

    for (const doc of vendorSnap.docs) {
      const data = doc.data()
      const vendorId = doc.id
      const token = data.expoPushToken

      // Skip vendors with no token or who are closed
      if (!token || typeof token !== 'string' || token.trim() === '') continue
      if (!data.isOpen) continue

      // ── Step 2: Cooldown check — did we notify this vendor recently? ──
      const lastNotified = data.lastPendingNotifiedAt?.toMillis?.() || 0
      if (now - lastNotified < COOLDOWN_MS) {
        skipped.push(vendorId)
        continue
      }

      // ── Step 3: Check if vendor actually has pending orders ──
      const pendingSnap = await db.collection('orders')
        .where('vendorUid', '==', vendorId)
        .where('status', '==', 'pending')
        .get()

      if (pendingSnap.empty) continue // No pending orders — skip silently

      // Filter out stale pending orders (created > 1 hour ago)
      const activePendingOrders = pendingSnap.docs.filter(orderDoc => {
        const orderData = orderDoc.data()
        const createdAt = orderData.createdAt?.toDate?.() || new Date(0)
        return (now - createdAt.getTime()) < 60 * 60 * 1000 // 1 hour threshold
      })

      if (activePendingOrders.length === 0) continue

      const pendingCount = activePendingOrders.length
      const orderId = activePendingOrders[0].id

      // ── Step 4: Queue notification with real order data ──
      notifications.push({
        to: token,
        title: `🛎️ New Order from Customer`,
        body: `You have ${pendingCount} pending order${pendingCount > 1 ? 's' : ''}. Tap to accept or view.`,
        sound: 'default',
        priority: 'high',
        channelId: 'default',
        // ✅ categoryId enables Accept / View buttons in the Expo app
        categoryId: 'NEW_ORDER',
        data: {
          orderId,
          vendorId,
          screen: 'VendorOrders',
          url: `/vendor/orders/${orderId}`,
        },
      })

      // ── Step 5: Save timestamp so we don't spam this vendor ──
      await db.collection('vendors').doc(vendorId).update({
        lastPendingNotifiedAt: new Date(),
      })
    }

    if (notifications.length === 0) {
      return res.status(200).json({
        message: 'No notifications needed',
        sent: 0,
        skippedCooldown: skipped.length,
      })
    }

    // ── Step 6: Send all notifications in one batch via FCM ──
    const fcmMessages = notifications.map(notif => {
      const dataPayload = {};
      if (notif.data) {
        for (const [key, val] of Object.entries(notif.data)) {
          dataPayload[key] = String(val);
        }
      }
      if (notif.categoryId) {
        dataPayload.categoryId = String(notif.categoryId);
      }
      return {
        token: notif.to,
        notification: {
          title: notif.title,
          body: notif.body,
        },
        data: dataPayload,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            clickAction: notif.categoryId || undefined,
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              category: notif.categoryId || undefined,
            }
          }
        }
      };
    });

    const fcmResponse = await getMessaging().sendEach(fcmMessages);
    console.log(`FCM batch sent: ${fcmResponse.successCount} success, ${fcmResponse.failureCount} failure`);

    return res.status(200).json({
      success: true,
      sent: notifications.length,
      skippedCooldown: skipped.length,
      fcmResponse: {
        successCount: fcmResponse.successCount,
        failureCount: fcmResponse.failureCount,
        responses: fcmResponse.responses.map(r => ({ success: r.success, error: r.error?.message || null }))
      },
    })

  } catch (err) {
    console.error('cron-push error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}