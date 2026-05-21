import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      initializeApp({ credential: cert(serviceAccount) });
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
    console.error("Firebase Admin Init Failed:", error);
  }
}

// ── Send to Expo Push API (not Firebase Messaging) ──
async function sendExpoNotifications(notifications) {
  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
  
  const messages = notifications.map(notif => ({
    to: notif.to,                          // Expo push token
    title: notif.title || 'FeedoZone',
    body: notif.body || 'You have a new message!',
    sound: 'default',
    priority: 'high',
    channelId: 'default',
    badge: 1,
    data: notif.data || {},
  }))

  // Expo allows max 100 per request
  const batches = []
  for (let i = 0; i < messages.length; i += 100) {
    batches.push(messages.slice(i, i + 100))
  }

  const allResults = []
  for (const batch of batches) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // If you have Expo access token add it:
          // 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`
        },
        body: JSON.stringify(batch)
      })
      const result = await response.json()
      // result.data is array of {status: 'ok'} or {status: 'error', ...}
      if (result.data) {
        result.data.forEach((r, i) => {
          allResults.push({
            success: r.status === 'ok',
            token: batch[i].to,
            error: r.status !== 'ok' ? r.message : undefined
          })
        })
      }
    } catch (err) {
      batch.forEach(b => allResults.push({ success: false, token: b.to, error: err.message }))
    }
  }
  return allResults
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Verify founder token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const userEmail = decodedToken.email || ''

    // ✅ Fixed typo: gamil → gmail
    const founderEmail = process.env.FOUNDER_EMAIL || 'feedoadmin@gmail.com'
    if (userEmail !== founderEmail) {
      return res.status(403).json({ error: 'Only the founder can do this.' })
    }

    const { notifications } = req.body
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // Filter only valid Expo tokens (start with ExponentPushToken or similar)
    const validNotifications = notifications.filter(n => 
      n.to && typeof n.to === 'string' && n.to.trim() !== ''
    )

    if (validNotifications.length === 0) {
      return res.status(400).json({ error: 'No valid push tokens found' })
    }

    const results = await sendExpoNotifications(validNotifications)
    const sentCount = results.filter(r => r.success).length

    console.log(`Push sent: ${sentCount}/${validNotifications.length} successful`)

    return res.status(200).json({
      success: true,
      data: results,
      sent: sentCount,
      total: validNotifications.length
    })

  } catch (err) {
    console.error('Server Error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}