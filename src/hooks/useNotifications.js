import { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

export const useNotifications = (uid, role) => {
  useEffect(() => {
    if (!uid) return
    // Notification setup - silently fails if not supported
    const setup = async () => {
      try {
        if (!('Notification' in window)) return
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const { getMessaging, getToken, onMessage } = await import('firebase/messaging')
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
      } catch (err) {
        console.log('Notification setup skipped:', err.message)
      }
    }
    setup()
  }, [uid, role])
}