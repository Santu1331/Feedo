import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

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

    const notifications = []

    vendorSnap.forEach(doc => {
      const data = doc.data()
      const token = data.expoPushToken
      const isOpen = data.isOpen

      if (!token || !token.startsWith('ExponentPushToken')) return
      if (!isOpen) return

      notifications.push({
        to: token,
        title: '🔔 Pending Orders',
        body: 'You may have pending orders. Check your dashboard!',
        sound: 'default',
        priority: 'high',
        channelId: 'default',
      })
    })

    if (notifications.length === 0) {
      return res.status(200).json({
        message: 'No open vendors with tokens',
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
    return res.status(200).json({ sent: notifications.length, expoData })

  } catch (err) {
    console.error('notify-pending-orders error:', err)
    return res.status(500).json({ error: err.message })
  }
}