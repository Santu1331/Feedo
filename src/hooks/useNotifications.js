import { useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export const useNotifications = (uid, role) => {
  useEffect(() => {
    if (!uid) return

    const saveTokens = async () => {
      try {
        // 1. Safely capture Expo Push Token without crashing the WebView
        let expoToken = window.expoPushToken;
        if (!expoToken) {
          try {
            // This is what usually crashes WebViews if not wrapped in try/catch!
            expoToken = localStorage.getItem('expoPushToken');
          } catch (storageErr) {
            console.log('WebView blocked localStorage access, relying on window injection.');
          }
        }

        if (expoToken) {
          await setDoc(doc(db, 'users', uid), { expoPushToken: expoToken }, { merge: true })
            if (role === 'vendor') {
          await setDoc(doc(db, 'vendors', uid), { expoPushToken: expoToken }, { merge: true })
            }
          }

        // 2. Setup Web Notifications (Safe check for browser environment)
        if (typeof window !== 'undefined' && 'Notification' in window && navigator.serviceWorker) {
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

    saveTokens()

    // 3. Listen for dynamic token injection
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
    
    window.addEventListener('expoPushToken', handleExpoTokenInjected)
    return () => window.removeEventListener('expoPushToken', handleExpoTokenInjected)

  }, [uid, role])
}