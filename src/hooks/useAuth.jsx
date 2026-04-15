// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Save push token to Firestore when received from native app
  useEffect(() => {
    const saveToken = async (token, uid) => {
      if (!token || !uid) return
      try {
        await updateDoc(doc(db, 'users', uid), {
          expoPushToken: token,
          tokenUpdatedAt: new Date().toISOString()
        })
        console.log('✅ Push token saved to Firestore:', token)
      } catch (err) {
        console.error('Error saving push token:', err)
      }
    }

    const handleToken = (e) => {
      const token = e.detail || e.data
      if (token && typeof token === 'string' && token.startsWith('ExponentPushToken')) {
        console.log('📱 Token received from native app:', token)
        const currentUser = auth.currentUser
        if (currentUser) {
          saveToken(token, currentUser.uid)
        } else {
          // Store token temporarily, save after login
          window._pendingPushToken = token
        }
      }
    }

    // Listen for token from WebView injection
    window.addEventListener('expoPushToken', handleToken)

    // Also check if token already set before this component mounted
    if (window.expoPushToken) {
      handleToken({ detail: window.expoPushToken })
    }

    // Check localStorage as fallback
    try {
      const stored = localStorage.getItem('expoPushToken')
      if (stored && stored.startsWith('ExponentPushToken')) {
        handleToken({ detail: stored })
      }
    } catch (e) {}

    return () => window.removeEventListener('expoPushToken', handleToken)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setUserData(snap.data())

            // Save pending token if user just logged in
            if (window._pendingPushToken) {
              try {
                await updateDoc(doc(db, 'users', firebaseUser.uid), {
                  expoPushToken: window._pendingPushToken,
                  tokenUpdatedAt: new Date().toISOString()
                })
                console.log('✅ Pending push token saved after login')
                window._pendingPushToken = null
              } catch (err) {
                console.error('Error saving pending token:', err)
              }
            }
          } else {
            console.warn('No Firestore profile found for UID:', firebaseUser.uid)
            setUserData(null)
          }
        } catch (err) {
          console.error('Firestore fetch error:', err)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)