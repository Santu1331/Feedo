// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ✅ FIXED: saves token to BOTH users and vendors collections
    const saveToken = async (token, uid) => {
      if (!token || !uid) return
      if (!token.startsWith('ExponentPushToken')) return
      try {
        // Get user role first so we know which collections to update
        const userSnap = await getDoc(doc(db, 'users', uid))
        const role = userSnap.exists() ? userSnap.data()?.role : null

        // Always save to users collection
        await setDoc(doc(db, 'users', uid), {
          expoPushToken: token,
          tokenUpdatedAt: serverTimestamp()
        }, { merge: true })

        // ✅ If vendor — also save to vendors collection
        // This is what usePendingOrderNotifier reads to send notifications
        if (role === 'vendor') {
          await setDoc(doc(db, 'vendors', uid), {
            expoPushToken: token,
            tokenUpdatedAt: serverTimestamp()
          }, { merge: true })
          console.log('✅ Push token saved to users + vendors:', token)
        } else {
          console.log('✅ Push token saved to users:', token)
        }
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
          // Store temporarily, save after login
          window._pendingPushToken = token
        }
      }
    }

    // Listen for token injected by Expo WebView
    window.addEventListener('expoPushToken', handleToken)

    // Check if token was injected before this component mounted
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

    // Request token from native WebView if running inside App
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GET_PUSH_TOKEN' }))
    }

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
            const role = snap.data()?.role

            // ✅ Save pending token after login — to both collections if vendor
            if (window._pendingPushToken) {
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  expoPushToken: window._pendingPushToken,
                  tokenUpdatedAt: serverTimestamp()
                }, { merge: true })

                // ✅ Also save to vendors if role is vendor
                if (role === 'vendor') {
                  await setDoc(doc(db, 'vendors', firebaseUser.uid), {
                    expoPushToken: window._pendingPushToken,
                    tokenUpdatedAt: serverTimestamp()
                  }, { merge: true })
                  console.log('✅ Pending token saved to users + vendors after login')
                } else {
                  console.log('✅ Pending push token saved to users after login')
                }

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