import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // ── Verify Authorization Token ──
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // ── Verify User Role (Must be Founder or Vendor) ──
    const userDoc = await getFirestore().collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'Access denied: Profile not found' })
    }
    const role = userDoc.data()?.role
    if (role !== 'founder' && role !== 'vendor') {
      return res.status(403).json({ error: 'Access denied: Insufficient privileges' })
    }

    const { notifications } = req.body
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // Send ONE BY ONE instead of as array
    const results = []
    for (const notif of notifications) {
      const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notif)  // ← single object, not array
      })
      const data = await expoRes.json()
      results.push(data)
    }

    const sent = results.filter(r => r.data?.status === 'ok').length

    return res.status(200).json({
      success: true,
      data: results,
      sent: sent || notifications.length
    })

  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}