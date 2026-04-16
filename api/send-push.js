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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-cron-secret')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // ✅ Auth check — accept secret from query OR header
  const secret = req.query.secret || req.headers['x-cron-secret']
  if (secret !== 'feedozone_cron_2025') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const db = getFirestore()
    const vendorSnap = await db.collection('vendors').get()

    if (vendorSnap.empty) {
      return res.status(200).json({ message: 'No vendors found', sent: 0 })
    }

    // ✅ Check if this is a BROADCAST (custom title/body from founder dashboard)
    const { title, body, targetAll } = req.body || {}
    const isBroadcast = req.method === 'POST' && title && body

    const notifications = []

    vendorSnap.forEach(doc => {
      const data = doc.data()
      const token = data.expoPushToken

      if (!token || !token.startsWith('ExponentPushToken')) return

      if (isBroadcast) {
        // ✅ Broadcast mode — send to ALL vendors with a token
        notifications.push({
          to: token,
          title: title,
          body: body,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
        })
      } else {
        // ✅ Cron mode — only open vendors, fixed message
        if (!data.isOpen) return
        notifications.push({
          to: token,
          title: '🔔 Pending Orders',
          body: 'You may have pending orders. Check your dashboard!',
          sound: 'default',
          priority: 'high',
          channelId: 'default',
        })
      }
    })

    if (notifications.length === 0) {
      return res.status(200).json({
        message: isBroadcast ? 'No vendors with push tokens' : 'No open vendors with tokens',
        sent: 0,
        totalVendors: vendorSnap.size
      })
    }

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications)
    })

    const expoData = await expoRes.json()

    // ✅ Save broadcast to Firestore history
    if (isBroadcast) {
      await db.collection('broadcastHistory').add({
        title,
        body,
        sentCount: notifications.length,
        sentAt: new Date().toISOString(),
        type: 'broadcast',
      })
    }

    return res.status(200).json({
      success: true,
      sent: notifications.length,
      mode: isBroadcast ? 'broadcast' : 'cron',
      expoData
    })

  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: err.message })
  }
}