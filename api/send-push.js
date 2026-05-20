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

    // ── Verify User Role (Must be Founder, Vendor, or Customer) ──
    const db = getFirestore()
    let role = 'user'
    try {
      const userDoc = await db.collection('users').doc(uid).get()
      if (userDoc.exists) {
        role = userDoc.data()?.role || 'user'
      } else {
        return res.status(403).json({ error: 'Access denied: Profile not found' })
      }
    } catch (dbErr) {
      console.error('Firestore read error in send-push, falling back to email checks:', dbErr)
      const userEmail = decodedToken.email || ''
      if (
        userEmail === 'feedozone2030@gmail.com' ||
        userEmail.includes('founder') ||
        userEmail.endsWith('@feedozone.com')
      ) {
        role = 'founder'
      } else {
        return res.status(403).json({ error: 'Access denied: Firestore down and email unauthorized' })
      }
    }

    const { notifications } = req.body
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // ── Verify authorization context for each notification ──
    if (role !== 'founder') {
      for (const notif of notifications) {
        const orderId = notif.data?.orderId
        if (!orderId) {
          return res.status(400).json({ error: 'Access denied: orderId is required in data payload for verification' })
        }
        
        // Fetch order details
        const orderDoc = await db.collection('orders').doc(orderId).get()
        if (!orderDoc.exists) {
          return res.status(404).json({ error: `Access denied: Order ${orderId} not found` })
        }
        const orderData = orderDoc.data()

        // Caller must be either the customer (userUid) or the vendor (vendorUid) for this order
        const isCustomer = orderData.userUid === uid
        const isVendor = orderData.vendorUid === uid

        if (!isCustomer && !isVendor) {
          return res.status(403).json({ error: 'Access denied: You are not authorized to send notifications for this order' })
        }

        // Validate destination token:
        // If caller is the customer, the target token ('to' field) must match the vendor's push token.
        // If caller is the vendor, the target token ('to' field) must match the customer's push token.
        let expectedToken = ''
        if (isCustomer) {
          const vendorDoc = await db.collection('vendors').doc(orderData.vendorUid).get()
          expectedToken = vendorDoc.exists ? vendorDoc.data()?.expoPushToken : ''
        } else if (isVendor) {
          const customerDoc = await db.collection('users').doc(orderData.userUid).get()
          expectedToken = customerDoc.exists ? customerDoc.data()?.expoPushToken : ''
        }

        if (!expectedToken || notif.to !== expectedToken) {
          return res.status(403).json({ error: 'Access denied: Destination push token mismatch or recipient token missing' })
        }
      }
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