// src/hooks/usePendingOrderNotifier.js
// FIXED: 
// 1. Listens to Firestore in real-time instead of polling every 10s
// 2. Routes notifications through /api/send-push to avoid CORS block
// 3. Only notifies on NEW orders, never spams

import { useEffect, useRef } from 'react'
import { db } from '../firebase/config'
import {
  collection, query, where, onSnapshot, doc, getDoc
} from 'firebase/firestore'

const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes per order

export const usePendingOrderNotifier = (vendorId = null, isVendorOrFounder = false) => {
  const notifiedOrderIds = useRef(new Set())
  const lastNotifyTime = useRef({})
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (!isVendorOrFounder || !vendorId) return

    const ordersQuery = query(
      collection(db, 'orders'),
      where('vendorId', '==', vendorId),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      // Skip first load — mark existing orders as already seen
      if (isFirstLoad.current) {
        snapshot.docs.forEach(d => {
          notifiedOrderIds.current.add(d.id)
        })
        isFirstLoad.current = false
        return
      }

      snapshot.docChanges().forEach(async (change) => {
        // Only fire on brand new pending orders
        if (change.type !== 'added') return

        const orderId = change.doc.id
        const orderData = change.doc.data()
        const now = Date.now()

        // Skip if already notified for this order
        if (notifiedOrderIds.current.has(orderId)) return
        const lastTime = lastNotifyTime.current[orderId] || 0
        if (now - lastTime < NOTIFY_COOLDOWN_MS) return

        // Mark as notified
        notifiedOrderIds.current.add(orderId)
        lastNotifyTime.current[orderId] = now

        // Get vendor push token from Firestore
        const vendorDoc = await getDoc(doc(db, 'vendors', vendorId))
        if (!vendorDoc.exists()) return

        const token = vendorDoc.data()?.expoPushToken
        if (!token || !token.startsWith('ExponentPushToken')) return

        const customerName = orderData.customerName || 'A customer'

        // ✅ Call /api/send-push (server-side) to avoid CORS block
        // Direct calls to exp.host are blocked by browser CORS policy
        try {
          const res = await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notifications: [{
                to: token,
                title: `🛎️ New Order from ${customerName}`,
                body: 'Tap Accept to confirm or View to see details.',
                sound: 'default',
                priority: 'high',
                channelId: 'default',
                categoryId: 'NEW_ORDER',
                data: {
                  orderId,
                  vendorId,
                  url: `/vendor/orders/${orderId}`,
                },
              }]
            }),
          })
          const result = await res.json()
          console.log('✅ Notification sent for order:', orderId, result)
        } catch (err) {
          console.error('❌ Failed to send notification:', err)
        }
      })
    })

    return () => unsubscribe()
  }, [vendorId, isVendorOrFounder])
}