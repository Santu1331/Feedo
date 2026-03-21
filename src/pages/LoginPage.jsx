import { useState } from 'react'
import { loginUser, logoutUser } from '../firebase/services'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [role, setRole] = useState('user')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)

  const resetFields = () => {
    setEmail(''); setPassword(''); setName(''); setMobile('')
  }

  // ── SIGN UP (User only) ──────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault()

    if (!name.trim()) return toast.error('Enter your full name')
    if (!mobile.trim() || mobile.length < 10) return toast.error('Enter a valid 10-digit mobile number')
    if (!email.trim()) return toast.error('Enter email address')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        role: 'user',
        createdAt: new Date().toISOString(),
      })

      toast.success(`Welcome to FeedoZone, ${name.trim().split(' ')[0]}! 🎉`)
      setTimeout(() => { window.location.href = '/home' }, 600)

    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'This email is already registered. Try logging in.' :
        err.code === 'auth/invalid-email' ? 'Invalid email format' :
        err.code === 'auth/weak-password' ? 'Password is too weak' :
        'Sign up failed. Try again.'
      toast.error(msg)
      setLoading(false)
    }
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
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
        toast.error('Account not found. Ask FeedoZone founder to create your account.')
        setLoading(false)
        return
      }

      const userData = snap.data()
      const actualRole = userData.role

      if (actualRole !== role) {
        await logoutUser()
        toast.error(
          role === 'vendor' ? 'You are not a Vendor. Try User login.' :
          `You are not a User. You have ${actualRole} access.`
        )
        setLoading(false)
        return
      }

      toast.success(`Welcome back, ${userData.name || userData.storeName || ''}!`)
      setTimeout(() => {
        if (actualRole === 'vendor') window.location.href = '/vendor'
        else window.location.href = '/home'
      }, 500)

    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' ? 'Wrong email or password' :
        err.code === 'auth/user-not-found' ? 'No account found' :
        err.code === 'auth/invalid-email' ? 'Invalid email format' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.' :
        'Login failed. Try again.'
      toast.error(msg)
      setLoading(false)
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const roleInfo = {
    user:   { hint: 'Order food from local restaurants',          color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    vendor: { hint: 'Login with credentials given by FeedoZone founder', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  }
  const r = roleInfo[role]

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, fontFamily: 'Poppins, sans-serif',
    outline: 'none', color: '#1f2937', boxSizing: 'border-box',
  }

  const isSignupMode = role === 'user' && mode === 'signup'

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', background: '#fff',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', fontFamily: 'Poppins, sans-serif',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#E24B4A', letterSpacing: -1 }}>Feedo</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Warananagar, Kolhapur</div>
      </div>

      {/* Role selector — User & Vendor only */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, width: '100%' }}>
        {['user', 'vendor'].map(r2 => (
          <button
            key={r2}
            onClick={() => { setRole(r2); setMode('login'); resetFields() }}
            style={{
              flex: 1, padding: '10px 4px',
              border: `2px solid ${role === r2 ? '#E24B4A' : '#e5e7eb'}`,
              borderRadius: 10,
              background: role === r2 ? '#FCEBEB' : '#fafafa',
              color: role === r2 ? '#A32D2D' : '#6b7280',
              fontWeight: role === r2 ? 600 : 400,
              fontSize: 14, cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {r2 === 'user' ? '👤 User' : '🏪 Vendor'}
          </button>
        ))}
      </div>

      {/* Role hint */}
      <div style={{
        width: '100%', padding: '10px 14px',
        background: r.bg, border: `1px solid ${r.border}`,
        borderRadius: 10, fontSize: 12,
        color: r.color, marginBottom: 20, textAlign: 'center',
      }}>
        {roleInfo[role].hint}
      </div>

      {/* Login / Signup toggle — only for User */}
      {role === 'user' && (
        <div style={{
          display: 'flex', width: '100%',
          background: '#f3f4f6', borderRadius: 10,
          padding: 4, marginBottom: 20, gap: 4,
        }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); resetFields() }}
              style={{
                flex: 1, padding: '9px 0',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif', fontSize: 13,
                fontWeight: mode === m ? 600 : 400,
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#E24B4A' : '#6b7280',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? '🔑 Login' : '✨ Sign Up'}
            </button>
          ))}
        </div>
      )}

      {/* ── SIGN UP FORM ── */}
      {isSignupMode ? (
        <form onSubmit={handleSignup} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, color: '#6b7280', fontFamily: 'Poppins, sans-serif',
              pointerEvents: 'none',
            }}>+91</span>
            <input
              type="tel"
              placeholder="Mobile number"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{ ...inputStyle, paddingLeft: 48 }}
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Create password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#f09595' : '#E24B4A',
              color: '#fff', border: 'none', padding: 14,
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', marginTop: 4,
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
            Already have an account?{' '}
            <span
              onClick={() => { setMode('login'); resetFields() }}
              style={{ color: '#E24B4A', cursor: 'pointer', fontWeight: 600 }}
            >
              Login here
            </span>
          </p>
        </form>

      ) : (
        /* ── LOGIN FORM ── */
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder={
              role === 'founder' ? 'Founder email' :
              role === 'vendor' ? 'Vendor email (given by founder)' :
              'Your email address'
            }
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#f09595' : '#E24B4A',
              color: '#fff', border: 'none', padding: 14,
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', marginTop: 4,
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Verifying...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>

          {role === 'user' && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
              New to FeedoZone?{' '}
              <span
                onClick={() => { setMode('signup'); resetFields() }}
                style={{ color: '#E24B4A', cursor: 'pointer', fontWeight: 600 }}
              >
                Create account
              </span>
            </p>
          )}
        </form>
      )}

      {/* Become a Partner — Vendor tab only */}
      {role === 'vendor' && (
        <div style={{ width: '100%', marginTop: 20 }}>
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>New vendor?</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Become a Partner button */}
          <button
            onClick={() => window.open('https://forms.gle/1arTekd59tidriKcA', '_blank')}
            style={{
              width: '100%', padding: '13px 14px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            🤝 Become a Partner
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Submit your details — our team will set up your vendor account
          </p>
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        FeedoZone © 2025 · feedozone2030@gmail.com
      </div>
    </div>
  )
}