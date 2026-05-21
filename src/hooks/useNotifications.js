import { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export const useNotifications = (uid, role) => {
  useEffect(() => {
    if (!uid) return

    const saveTokens = async () => {
      try {
        // 1. Capture and save Expo Push Token (Injected by Mobile App)
        const expoToken = window.expoPushToken || localStorage.getItem('expoPushToken')
        if (expoToken) {
          await updateDoc(doc(db, 'users', uid), { expoPushToken: expoToken })
          if (role === 'vendor') {
            await updateDoc(doc(db, 'vendors', uid), { expoPushToken: expoToken })
          }
        }

        // 2. Setup Web Notifications (For desktop/browser users)
        if ('Notification' in window && navigator.serviceWorker) {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            const { getMessaging, getToken } = await import('firebase/messaging')
            const messaging = getMessaging()
            const token = await getToken(messaging, {
              vapidKey: 'BLJfHrZCd5GYUZ-02OnZXq4N6nkIosaBOMjJzFJGS1OAhgJ_Hi-xeb7zMzuBWPHqGxtuqsC8zYcWiaqBBvISdOQ'
            })
            if (token) {
              await updateDoc(doc(db, 'users', uid), { fcmToken: token })
              if (role === 'vendor') {
                await updateDoc(doc(db, 'vendors', uid), { fcmToken: token })
              }
            }
          }
        }
      } catch (err) {
        console.log('Notification setup skipped:', err.message)
      }
    }

    // Run the token saving logic
    saveTokens()

    // 3. Listen for dynamic token injection (in case WebView loads faster than Expo token generation)
    const handleExpoTokenInjected = async (e) => {
      const token = e.detail;
      if (token) {
        try {
          await updateDoc(doc(db, 'users', uid), { expoPushToken: token })
          if (role === 'vendor') {
            await updateDoc(doc(db, 'vendors', uid), { expoPushToken: token })
          }
        } catch (err) {
          console.error('Error saving Expo token dynamically:', err)
        }
      }
    }
    
    // The mobile app dispatches this custom event in App.js
    window.addEventListener('expoPushToken', handleExpoTokenInjected)
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('expoPushToken', handleExpoTokenInjected)

  }, [uid, role])
}