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
    // ── 1. Verify Authorization Token ──
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const uid = decodedToken.uid
    const userEmail = decodedToken.email || ''

    // ── 2. Determine Role (Email Bypass FIRST) ──
    let role = 'user'

    // HARDCODED FOUNDER CHECK: Bypasses the database entirely
  const founderEmail = process.env.FOUNDER_EMAIL || 'feedoadmin@gamil.com'; 

    if (userEmail === founderEmail) {
      role = 'founder'
      console.log('✅ Founder access granted securely for:', userEmail)
    }
    // If not the founder, rely on the database for standard users/vendors
    else {
      try {
        const db = getFirestore()
        const userDoc = await db.collection('users').doc(uid).get()
        if (userDoc.exists) {
          role = userDoc.data()?.role || 'user'
        } else {
          return res.status(403).json({ error: 'Access denied: Profile not found' })
        }
      } catch (dbErr) {
        console.error('Firestore read error:', dbErr)
        return res.status(403).json({ error: 'Access denied: Database is currently unavailable' })
      }
    }

    const { notifications } = req.body
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // ── 3. Verify authorization context for regular users (Founders bypass this) ──
    if (role !== 'founder') {
      const db = getFirestore()
      for (const notif of notifications) {
        const orderId = notif.data?.orderId
        if (!orderId) {
          return res.status(400).json({ error: 'Access denied: orderId is required' })
        }
        
        // Fetch order details
        const orderDoc = await db.collection('orders').doc(orderId).get()
        if (!orderDoc.exists) {
          return res.status(404).json({ error: `Access denied: Order ${orderId} not found` })
        }
        const orderData = orderDoc.data()

        // Caller must be customer or vendor
        const isCustomer = orderData.userUid === uid
        const isVendor = orderData.vendorUid === uid

        if (!isCustomer && !isVendor) {
          return res.status(403).json({ error: 'Access denied: Unauthorized for this order' })
        }

        // Validate destination token
        let expectedToken = ''
        if (isCustomer) {
          const vendorDoc = await db.collection('vendors').doc(orderData.vendorUid).get()
          expectedToken = vendorDoc.exists ? vendorDoc.data()?.expoPushToken : ''
        } else if (isVendor) {
          const customerDoc = await db.collection('users').doc(orderData.userUid).get()
          expectedToken = customerDoc.exists ? customerDoc.data()?.expoPushToken : ''
        }

        if (!expectedToken || notif.to !== expectedToken) {
          return res.status(403).json({ error: 'Access denied: Destination mismatch' })
        }
      }
    }


    // ── 4. Send Notifications via Direct FCM ──
    const results = []
    
    for (const notif of notifications) {
      // Structure the payload exactly how Google FCM wants it
      const message = {
        token: notif.to, // This is now the raw FCM token from your database
        notification: {
          title: notif.title,
          body: notif.body,
        },
        data: {
          orderId: notif.data?.orderId || '',
          url: notif.data?.url || '',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'default', // Matches your App.js channel
            sound: 'default'
          }
        }
      };

      try {
        // Send directly from your Vercel backend to Google Firebase
        const response = await getMessaging().send(message);
        results.push({ success: true, messageId: response });
      } catch (error) {
        console.error('FCM Send Error:', error);
        results.push({ success: false, error: error.message });
      }
    }

    const sent = results.filter(r => r.success).length

    return res.status(200).json({
      success: true,
      data: results,
      sent: sent
    })

  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}