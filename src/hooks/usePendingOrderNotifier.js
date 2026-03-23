// src/hooks/usePendingOrderNotifier.js
// Calls Vercel API every 10 seconds to send FCM push to vendor
// Only runs when vendor dashboard is open

import { useEffect, useRef } from 'react'

const CRON_SECRET = import.meta.env.VITE_CRON_SECRET || 'feedozone_cron_2025'
const API_URL = '/api/notify-pending-orders'

export const usePendingOrderNotifier = (isVendorOrFounder = false) => {
  const intervalRef = useRef(null)
  const isRunningRef = useRef(false)

  const triggerNotification = async () => {
    if (isRunningRef.current) return // prevent overlap
    isRunningRef.current = true
    try {
      await fetch(`${API_URL}?secret=${CRON_SECRET}`, {
        method: 'GET',
        headers: { 'x-cron-secret': CRON_SECRET }
      })
    } catch (err) {
      // Silently fail — don't spam console
    }
    isRunningRef.current = false
  }

  useEffect(() => {
    if (!isVendorOrFounder) return

    // Run immediately on mount
    triggerNotification()

    // Then every 10 seconds
    intervalRef.current = setInterval(triggerNotification, 10000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isVendorOrFounder])
}