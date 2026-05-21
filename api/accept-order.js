import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { orderId } = req.body || req.query
    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' })
    }

    const db = getFirestore()
    const orderRef = db.collection('orders').doc(orderId)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const orderData = orderDoc.data()
    if (orderData.status !== 'pending') {
      return res.status(200).json({ success: true, message: `Order already in state: ${orderData.status}` })
    }

    // 1. Update order status in Firestore
    await orderRef.update({
      status: 'accepted',
      updatedAt: FieldValue.serverTimestamp()
    })

    // 2. Add In-App notification to Customer
    const userUid = orderData.userUid
    if (userUid) {
      await db.collection('notifications').add({
        toUid: userUid,
        title: '✅ Order Accepted!',
        body: `${orderData.vendorName || 'The restaurant'} accepted your order 🎉`,
        read: false,
        createdAt: FieldValue.serverTimestamp()
      })

      // 3. Send Push Notification to Customer (via FCM)
      const userDoc = await db.collection('users').doc(userUid).get()
      const userPushToken = userDoc.exists ? userDoc.data()?.expoPushToken : null
      if (userPushToken && typeof userPushToken === 'string' && userPushToken.trim() !== '') {
        try {
          const message = {
            token: userPushToken,
            notification: {
              title: '✅ Order Accepted!',
              body: `${orderData.vendorName || 'The restaurant'} accepted your order 🎉`,
            },
            data: {
              orderId: String(orderId),
              type: 'order_status',
              url: '/orders'
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                channelId: 'default'
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default'
                }
              }
            }
          };
          await getMessaging().send(message);
        } catch (pushErr) {
          console.error('Failed to send push notification to customer:', pushErr)
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Order accepted successfully' })
  } catch (err) {
    console.error('accept-order error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
