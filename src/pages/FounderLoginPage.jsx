import { useState } from 'react'
import { loginUser, logoutUser } from '../firebase/services'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function FounderLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter email and password')
    setLoading(true)

    try {
      const cred = await loginUser(email, password)
      const uid = cred.user.uid

      const snap = await getDoc(doc(db, 'users', uid))
      if (!snap.exists()) {
        await logoutUser()
        toast.error('Account not found.')
        setLoading(false)
        return
      }

      const userData = snap.data()

      if (userData.role !== 'founder') {
        await logoutUser()
        toast.error('Access denied. This portal is for FeedoZone founder only.')
        setLoading(false)
        return
      }

      toast.success(`Welcome back, ${userData.name || 'Founder'}! 👑`)
      setTimeout(() => { window.location.href = '/founder' }, 500)

    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' ? 'Wrong email or password' :
        err.code === 'auth/user-not-found'     ? 'No account found' :
        err.code === 'auth/invalid-email'      ? 'Invalid email format' :
        err.code === 'auth/too-many-requests'  ? 'Too many attempts. Try again later.' :
        'Login failed. Try again.'
      toast.error(msg)
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #2a2a2a', borderRadius: 10,
    fontSize: 14, fontFamily: 'Poppins, sans-serif',
    outline: 'none', background: '#1a1a1a',
    color: '#fff', boxSizing: 'border-box',
  }

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      minHeight: '100vh', background: '#0d0d0d',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', fontFamily: 'Poppins, sans-serif',
    }}>

      {/* Crown + Branding */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #E24B4A, #c73b3a)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28,
          margin: '0 auto 16px',
          boxShadow: '0 0 24px rgba(226,75,74,0.35)',
        }}>
          👑
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>
          Founder Portal
        </div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 5 }}>
          FeedoZone · Warananagar, Kolhapur
        </div>
      </div>

      {/* Restricted badge */}
      <div style={{
        width: '100%', padding: '10px 14px',
        background: '#1a0f0f', border: '1px solid #3a1a1a',
        borderRadius: 10, fontSize: 12,
        color: '#E24B4A', marginBottom: 24,
        textAlign: 'center', letterSpacing: 0.2,
      }}>
        🔒 Restricted access · Authorized personnel only
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Founder email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading
              ? '#5a1a1a'
              : 'linear-gradient(135deg, #E24B4A, #c73b3a)',
            color: '#fff', border: 'none', padding: 14,
            borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif', marginTop: 4,
            boxShadow: loading ? 'none' : '0 4px 14px rgba(226,75,74,0.3)',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Verifying...' : '👑 Enter Dashboard'}
        </button>
      </form>

      {/* Back link */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span
          onClick={() => window.location.href = '/'}
          style={{ fontSize: 12, color: '#444', cursor: 'pointer', textDecoration: 'underline' }}
        >
          ← Back to FeedoZone
        </span>
      </div>

      <div style={{ marginTop: 40, fontSize: 11, color: '#333', textAlign: 'center' }}>
        FeedoZone © 2025 · feedozone2030@gmail.com
      </div>
    </div>
  )
}