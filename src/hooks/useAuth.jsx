// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          // Fetch role from Firestore
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setUserData(snap.data())
          } else {
            // User exists in Auth but NOT in Firestore users collection
            // This means the Firestore document hasn't been created yet
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
      // ALWAYS set loading false after everything is done
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
