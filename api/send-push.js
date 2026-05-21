import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  // 1. Grab the key from Vercel
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  
  // 2. Clean the key: remove rogue quotes and fix Vercel's broken newlines
  const cleanPrivateKey = rawKey.replace(/"/g, '').replace(/\\n/g, '\n');

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: cleanPrivateKey, // Use the cleaned key!
    })
  })
}

// ... (keep the rest of your export default async function handler exactly the same!)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // 1. Verify who is clicking the button
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const userEmail = decodedToken.email || ''

    // 2. Check if it's the Founder
    const founderEmail = process.env.FOUNDER_EMAIL || 'feedoadmin@gamil.com'
    if (userEmail !== founderEmail) {
      return res.status(403).json({ error: 'Only the founder can do this.' })
    }

    const { notifications } = req.body
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // 3. Drive straight to the Post Office (Google Firebase)
    const results = []
    for (const notif of notifications) {
      const message = {
        token: notif.to, 
        notification: {
          title: notif.title || 'FeedoZone Update',
          body: notif.body || 'You have a new message!',
        },
        data: {
          // Google strictly requires these to be Strings (Text), not numbers!
          orderId: String(notif.data?.orderId || ''),
          url: String(notif.data?.url || '')
        }
      };

      try {
        const response = await getMessaging().send(message);
        results.push({ success: true, id: response });
      } catch (err) {
        console.error('Failed to send to a user:', err.message);
        results.push({ success: false, error: err.message });
      }
    }

    const sentCount = results.filter(r => r.success).length

    return res.status(200).json({
      success: true,
      data: results,
      sent: sentCount
    })

  } catch (err) {
    console.error('Server Error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}