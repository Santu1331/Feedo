// api/cron-push.js
// Called by cron job — notifies vendors ONLY if they have real pending orders
// Fix: checks actual pending orders per vendor + cooldown to prevent spam

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  })
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
      if (!token || !token.startsWith('ExponentPushToken')) continue
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

      const pendingCount = pendingSnap.size
      const orderId = pendingSnap.docs[0].id

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

    // ── Step 6: Send all notifications in one batch ──
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications),
    })

    const expoData = await expoRes.json()

    return res.status(200).json({
      success: true,
      sent: notifications.length,
      skippedCooldown: skipped.length,
      expoData,
    })

  } catch (err) {
    console.error('cron-push error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}