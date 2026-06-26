import { useState } from 'react'
import { loginUser, logoutUser } from '../firebase/services'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function ManagerLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter email and password')
    setLoading(true)
    try {
      const cred = await loginUser(email, password)
      const snap = await getDoc(doc(db, 'users', cred.user.uid))

      if (!snap.exists()) {
        await logoutUser()
        toast.error('Account not found.')
        setLoading(false)
        return
      }

      const data = snap.data()
      if (data.role !== 'manager') {
        await logoutUser()
        toast.error('Access denied. This portal is for City Managers only.')
        setLoading(false)
        return
      }

      toast.success(`Welcome, ${data.name || 'Manager'}! 🧑‍💼`)
      setTimeout(() => { window.location.href = '/manager' }, 500)
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

  const inp = {
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #1e293b', borderRadius: 10,
    fontSize: 14, fontFamily: 'Poppins, sans-serif',
    outline: 'none', background: '#0f172a',
    color: '#fff', boxSizing: 'border-box',
  }

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: 'linear-gradient(160deg,#0a0f1e 0%,#0f172a 60%,#1e1b4b 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', fontFamily: 'Poppins, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background decoration */}
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', top: -80, right: -80, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.04)', bottom: -40, left: -40, pointerEvents: 'none' }} />

      {/* Brand + icon */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 16px',
          boxShadow: '0 0 32px rgba(99,102,241,0.4)',
        }}>🧑‍💼</div>
        <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>FeedoZone</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Manager Portal</div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>City Operations Dashboard</div>
      </div>

      {/* Info badge */}
      <div style={{
        width: '100%', padding: '10px 14px', marginBottom: 24,
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 10, fontSize: 12, color: '#a5b4fc', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        🔒 Authorised city managers only · Use credentials provided by Founder
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</label>
          <input
            type="email"
            placeholder="manager@feedozone.online"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ ...inp, marginTop: 6 }}
            autoComplete="username"
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inp, marginTop: 6 }}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', marginTop: 8,
            background: loading ? '#312e81' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', border: 'none', padding: '14px 0',
            borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: loading ? 'none' : '0 4px 18px rgba(99,102,241,0.45)',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Verifying...
            </>
          ) : (
            <>🧑‍💼 Enter City Dashboard</>
          )}
        </button>
      </form>

      {/* Links */}
      <div style={{ marginTop: 28, display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
        <span onClick={() => window.location.href = '/login'} style={{ fontSize: 12, color: '#475569', cursor: 'pointer', textDecoration: 'underline' }}>
          Customer Login
        </span>
        <span onClick={() => window.location.href = '/founder-login'} style={{ fontSize: 12, color: '#475569', cursor: 'pointer', textDecoration: 'underline' }}>
          Founder Login
        </span>
      </div>

      <div style={{ marginTop: 40, fontSize: 11, color: '#1e293b', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        FeedoZone © 2025 · feedozone.online
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
