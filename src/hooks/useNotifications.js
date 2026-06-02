import { useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

// ─── Vendor / User notification setup ────────────────────────────────────────
// On mount we:
//   1. Capture any Expo push token the WebView injected (mobile-app shell).
//   2. Register the firebase-messaging-sw.js service worker.
//   3. Ask the browser for Notification permission (one-time).
//   4. Get the FCM web push token (VAPID key) and save it on the user/vendor
//      Firestore doc as `fcmToken`. The server reads this when an order comes
//      in and pushes a notification that fires sound + vibration even when
//      the browser tab is closed or backgrounded.
//   5. Hook the foreground `onMessage` listener so when the tab IS open we
//      still show a toast + play the alarm sound (FCM suppresses banner
//      notifications when the page is focused — this is by design).
const VAPID_KEY = 'BLJfHrZCd5GYUZ-02OnZXq4N6nkIosaBOMjJzFJGS1OAhgJ_Hi-xeb7zMzuBWPHqGxtuqsC8zYcWiaqBBvISdOQ'

export const useNotifications = (uid, role) => {
  useEffect(() => {
    if (!uid) return

    let foregroundUnsub = null

    const saveTokens = async () => {
      // ─── 1. Persist Expo token (mobile-app WebView only) ─────────────────
      try {
        let expoToken = window.expoPushToken
        if (!expoToken) {
          try { expoToken = localStorage.getItem('expoPushToken') } catch {}
        }
        if (expoToken) {
          await setDoc(doc(db, 'users', uid), { expoPushToken: expoToken }, { merge: true })
          if (role === 'vendor') {
            await setDoc(doc(db, 'vendors', uid), { expoPushToken: expoToken }, { merge: true })
          }
        }
      } catch (err) {
        console.warn('Expo token save skipped:', err.message)
      }

      // ─── 2-4. Web FCM (browser push) — works in any browser, even when
      // the tab is closed, as long as the user grants permission. This is
      // the channel that delivers loud OS notifications to vendors.
      if (typeof window === 'undefined') return
      if (!('Notification' in window)) return
      if (!('serviceWorker' in navigator)) return

      try {
        // Register the messaging service worker. Vite copies anything in
        // /public to the site root so the URL is /firebase-messaging-sw.js.
        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        })

        // Browsers only show their permission popup in response to a user
        // gesture — but if we already have permission, this resolves to
        // 'granted' instantly. If the user previously denied we silently
        // skip; they can re-enable from the lock icon → Site settings.
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const { getMessaging, getToken, onMessage } = await import('firebase/messaging')
        const messaging = getMessaging()

        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        })

        if (fcmToken) {
          // setDoc with merge:true creates the field if it doesn't exist
          // — avoids the previous bug where updateDoc was used without
          // being imported and silently failed.
          await setDoc(doc(db, 'users', uid), { fcmToken }, { merge: true })
          if (role === 'vendor') {
            await setDoc(doc(db, 'vendors', uid), { fcmToken }, { merge: true })
          }
        }

        // ─── 5. Foreground handler ─────────────────────────────────────
        // FCM does NOT show a notification banner when the tab is focused.
        // We handle that case ourselves by showing a toast (the dedicated
        // useOrderAlert hook in VendorApp already plays the alarm sound
        // when a new pending order appears, so we don't double-play here).
        foregroundUnsub = onMessage(messaging, (payload) => {
          const title = payload?.notification?.title || 'FeedoZone'
          const body  = payload?.notification?.body  || 'You have a new update'
          toast(`${title}\n${body}`, { icon: '🔔', duration: 5000 })
          // Light vibration tap so phones in hand still buzz when focused.
          try { navigator.vibrate?.([200, 100, 200]) } catch {}
        })
      } catch (err) {
        console.warn('Web push setup skipped:', err?.message || err)
      }
    }

    saveTokens()

    // Listen for late Expo token injection (WebView sometimes injects
    // after first render).
    const handleExpoTokenInjected = async (e) => {
      const token = e.detail
      if (!token) return
      try {
        await setDoc(doc(db, 'users', uid), { expoPushToken: token }, { merge: true })
        if (role === 'vendor') {
          await setDoc(doc(db, 'vendors', uid), { expoPushToken: token }, { merge: true })
        }
      } catch (err) {
        console.error('Expo token dynamic save error:', err)
      }
    }
    window.addEventListener('expoPushToken', handleExpoTokenInjected)

    return () => {
      window.removeEventListener('expoPushToken', handleExpoTokenInjected)
      if (typeof foregroundUnsub === 'function') foregroundUnsub()
    }
  }, [uid, role])
}
