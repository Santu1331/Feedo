// src/hooks/usePendingOrderNotifier.js
// FIXED: Listens to Firestore in real-time instead of polling API every 10s
// Result: vendor gets notified ONCE per new order, never spammed

import { useEffect, useRef } from 'react'
import { db } from '../firebase/config'
import {
  collection, query, where, onSnapshot, doc, getDoc
} from 'firebase/firestore'

// How long to wait before re-notifying same vendor about same order (in ms)
const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export const usePendingOrderNotifier = (vendorId = null, isVendorOrFounder = false) => {
  const notifiedOrderIds = useRef(new Set())   // track which orders already notified
  const lastNotifyTime = useRef({})            // track per-order notify time
  const isFirstLoad = useRef(true)             // skip existing orders on first load

  useEffect(() => {
    // Only run for vendor/founder and only if vendorId is known
    if (!isVendorOrFounder || !vendorId) return

    // Listen to pending orders for THIS vendor only
    const ordersQuery = query(
      collection(db, 'orders'),
      where('vendorId', '==', vendorId),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      // Skip the very first load — these are already existing orders
      // We only want to notify on NEW orders that arrive after page load
      if (isFirstLoad.current) {
        snapshot.docs.forEach(doc => {
          notifiedOrderIds.current.add(doc.id) // mark existing as already seen
        })
        isFirstLoad.current = false
        return
      }

      snapshot.docChanges().forEach(async (change) => {
        // Only care about newly added pending orders
        if (change.type !== 'added') return

        const orderId = change.doc.id
        const orderData = change.doc.data()
        const now = Date.now()

        // Skip if we already notified for this order recently
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

        // Send ONE notification directly via Expo Push API
        // No server needed — fires instantly when order arrives
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            title: `🛎️ New Order from ${customerName}`,
            body: 'Tap Accept to confirm or View to see details.',
            sound: 'default',
            priority: 'high',
            channelId: 'default',
            categoryId: 'NEW_ORDER',   // enables Accept / View buttons in app
            data: {
              orderId,
              vendorId,
              url: `/vendor/orders/${orderId}`,
            },
          }),
        })
      })
    })

    return () => unsubscribe()
  }, [vendorId, isVendorOrFounder])
}