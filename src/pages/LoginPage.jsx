import { useState, useRef, useEffect } from 'react'
import { loginUser, logoutUser } from '../firebase/services'
import { createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [role, setRole] = useState('user')
  const [mode, setMode] = useState('login')

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Signup fields
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [college, setCollege] = useState('')
  const [pincode, setPincode] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // OTP states
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const otpRefs = useRef([])
  const recaptchaVerifierRef = useRef(null)

  const [loading, setLoading] = useState(false)

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  const resetFields = () => {
    setEmail(''); setPassword(''); setName(''); setMobile('')
    setAddress(''); setCity(''); setCollege(''); setPincode('')
    setAgreedToTerms(false); setOtpStep(false)
    setOtp(['','','','','','']); setConfirmationResult(null); setResendTimer(0)
  }

  // ── SETUP RECAPTCHA ───────────────────────────────────────────────────────
  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { recaptchaVerifierRef.current = null }
      })
    }
    return recaptchaVerifierRef.current
  }

  // ── SEND OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!name.trim()) return toast.error('Enter your full name')
    if (!mobile.trim() || mobile.length < 10) return toast.error('Enter a valid 10-digit mobile number')
    if (!email.trim()) return toast.error('Enter email address')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!agreedToTerms) return toast.error('Please agree to Terms & Conditions')

    setSendingOtp(true)
    try {
      const verifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, `+91${mobile.trim()}`, verifier)
      setConfirmationResult(result)
      setOtpStep(true)
      setResendTimer(30)
      toast.success(`OTP sent to +91 ${mobile} 📱`)
    } catch (err) {
      recaptchaVerifierRef.current = null
      if (err.code === 'auth/invalid-phone-number') toast.error('Invalid phone number')
      else if (err.code === 'auth/too-many-requests') toast.error('Too many attempts. Try later.')
      else toast.error('Failed to send OTP. Try again.')
    }
    setSendingOtp(false)
  }

  // ── RESEND OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    recaptchaVerifierRef.current = null
    setSendingOtp(true)
    try {
      const verifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, `+91${mobile}`, verifier)
      setConfirmationResult(result)
      setResendTimer(30)
      setOtp(['','','','','',''])
      toast.success('OTP resent! 📱')
    } catch { toast.error('Failed to resend. Try again.') }
    setSendingOtp(false)
  }

  // ── OTP INPUT HANDLER ─────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // ── VERIFY OTP + SIGNUP ───────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter complete 6-digit OTP')
    setVerifyingOtp(true)
    try {
      await confirmationResult.confirm(code)
      toast.success('Mobile verified! ✅ Creating account...')
      await handleSignup()
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') toast.error('Wrong OTP. Try again.')
      else if (err.code === 'auth/code-expired') toast.error('OTP expired. Resend.')
      else toast.error('Verification failed. Try again.')
      setVerifyingOtp(false)
    }
  }

  // ── SIGN UP ───────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        address: address.trim(),
        city: city.trim(),
        college: college.trim(),
        pincode: pincode.trim(),
        role: 'user',
        mobileVerified: true,
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
      setVerifyingOtp(false)
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
        toast.error('Account not found.')
        setLoading(false)
        return
      }
      const userData = snap.data()
      const actualRole = userData.role
      if (actualRole !== role) {
        await logoutUser()
        toast.error(role === 'vendor' ? 'You are not a Restaurant. Try User login.' : `You are not a User. You have ${actualRole} access.`)
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

  const roleInfo = {
    user:   { hint: 'Order food from local restaurants',               color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    vendor: { hint: 'Login with credentials given by FeedoZone team', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  }
  const r = roleInfo[role]

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb',
    borderRadius: 10, fontSize: 14,
    fontFamily: 'Poppins, sans-serif', outline: 'none',
    color: '#1f2937', boxSizing: 'border-box', background: '#fff',
  }

  const isSignupMode = role === 'user' && mode === 'signup'

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', background: '#fff',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '32px 24px 40px', fontFamily: 'Poppins, sans-serif',
      overflowY: 'auto',
    }}>

      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" />

      {/* Spinner CSS */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28, marginTop: isSignupMode ? 0 : 40 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#E24B4A', letterSpacing: -1 }}>Feedo</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Click, Eat, Repeat.</div>
      </div>

      {/* Role selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['user', 'vendor'].map(r2 => (
          <button key={r2} onClick={() => { setRole(r2); setMode('login'); resetFields() }} style={{
            flex: 1, padding: '10px 4px',
            borderWidth: 2, borderStyle: 'solid',
            borderColor: role === r2 ? '#E24B4A' : '#e5e7eb',
            borderRadius: 10,
            background: role === r2 ? '#FCEBEB' : '#fafafa',
            color: role === r2 ? '#A32D2D' : '#6b7280',
            fontWeight: role === r2 ? 600 : 400,
            fontSize: 14, cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s',
          }}>
            {r2 === 'user' ? '👤 User' : '🏪 Restaurant'}
          </button>
        ))}
      </div>

      {/* Role hint */}
      <div style={{
        padding: '10px 14px', background: r.bg,
        borderWidth: 1, borderStyle: 'solid', borderColor: r.border,
        borderRadius: 10, fontSize: 12, color: r.color,
        marginBottom: 20, textAlign: 'center',
      }}>
        {roleInfo[role].hint}
      </div>

      {/* Login / Signup toggle */}
      {role === 'user' && (
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); resetFields() }} style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? '#E24B4A' : '#6b7280',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              {m === 'login' ? '🔑 Login' : '✨ Sign Up'}
            </button>
          ))}
        </div>
      )}

      {/* ── SIGNUP FORM ── */}
      {isSignupMode && !otpStep && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <input type="text" placeholder="Full name *"
            value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#6b7280', pointerEvents: 'none' }}>+91</span>
            <input type="tel" placeholder="Mobile number *"
              value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{ ...inputStyle, paddingLeft: 48 }} />
          </div>

          <input type="email" placeholder="Email address *"
            value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />

          <input type="password" placeholder="Create password (min 6 chars) *"
            value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>📍 Address Details (optional)</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <input type="text" placeholder="Full address (room no, building...)"
            value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />

          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" placeholder="City / Area"
              value={city} onChange={e => setCity(e.target.value)}
              style={{ ...inputStyle, flex: 1 }} />
            <input type="text" placeholder="Pincode"
              value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ ...inputStyle, width: 110, flex: 'none' }} />
          </div>

          {/* ── T&C CHECKBOX ── */}
          <div
            onClick={() => setAgreedToTerms(a => !a)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', cursor: 'pointer',
              background: agreedToTerms ? '#f0fdf4' : '#fafafa',
              borderRadius: 10, borderWidth: 1, borderStyle: 'solid',
              borderColor: agreedToTerms ? '#86efac' : '#e5e7eb',
              transition: 'all 0.15s',
            }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
              borderWidth: 2, borderStyle: 'solid',
              borderColor: agreedToTerms ? '#16a34a' : '#d1d5db',
              background: agreedToTerms ? '#16a34a' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {agreedToTerms && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
            </div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              I agree to the{' '}
              <span onClick={e => { e.stopPropagation(); setShowTermsModal(true) }}
                style={{ color: '#E24B4A', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Terms & Conditions
              </span>
              {' '}and{' '}
              <span onClick={e => { e.stopPropagation(); setShowPrivacyModal(true) }}
                style={{ color: '#E24B4A', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Privacy Policy
              </span>
            </div>
          </div>

          <button
            onClick={handleSendOtp}
            disabled={sendingOtp || !agreedToTerms}
            style={{
              width: '100%',
              background: sendingOtp ? '#f09595' : !agreedToTerms ? '#d1d5db' : '#E24B4A',
              color: '#fff', border: 'none', padding: 14,
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: sendingOtp || !agreedToTerms ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {sendingOtp
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Sending OTP...</>
              : '📱 Send OTP to Verify Mobile'
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
            Already have an account?{' '}
            <span onClick={() => { setMode('login'); resetFields() }} style={{ color: '#E24B4A', cursor: 'pointer', fontWeight: 600 }}>
              Login here
            </span>
          </p>
        </div>
      )}

      {/* ── OTP STEP ── */}
      {isSignupMode && otpStep && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>
            📱
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>Verify Your Number</div>
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
            We sent a 6-digit OTP to
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>+91 {mobile}</div>

          {/* OTP boxes */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                style={{
                  width: 46, height: 54, textAlign: 'center',
                  fontSize: 22, fontWeight: 700, color: '#1f2937',
                  borderWidth: 2, borderStyle: 'solid',
                  borderColor: digit ? '#E24B4A' : '#e5e7eb',
                  borderRadius: 12, outline: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  background: digit ? '#FCEBEB' : '#fff',
                  transition: 'all 0.15s',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerifyOtp}
            disabled={verifyingOtp || otp.join('').length < 6}
            style={{
              width: '100%',
              background: verifyingOtp || otp.join('').length < 6 ? '#f09595' : '#E24B4A',
              color: '#fff', border: 'none', padding: 14, borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: verifyingOtp || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {verifyingOtp
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
              : '✅ Verify & Create Account'
            }
          </button>

          {/* Resend */}
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 14 }}>
            Didn't receive OTP?{' '}
            {resendTimer > 0
              ? <span style={{ color: '#9ca3af' }}>Resend in {resendTimer}s</span>
              : <span onClick={handleResendOtp} style={{ color: '#E24B4A', fontWeight: 600, cursor: 'pointer' }}>
                  {sendingOtp ? 'Sending...' : 'Resend OTP'}
                </span>
            }
          </div>

          <button onClick={() => { setOtpStep(false); setOtp(['','','','','','']); setConfirmationResult(null) }}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
            ← Change mobile number
          </button>
        </div>
      )}

      {/* ── LOGIN FORM ── */}
      {!isSignupMode && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email"
            placeholder={role === 'vendor' ? 'Restaurant email (given by founder)' : 'Your email address'}
            value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <button type="submit" disabled={loading} style={{
            width: '100%', background: loading ? '#f09595' : '#E24B4A',
            color: '#fff', border: 'none', padding: 14,
            borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif', marginTop: 4,
          }}>
            {loading ? 'Verifying...' : `Login as ${role === 'vendor' ? 'Restaurant' : 'User'}`}
          </button>
          {role === 'user' && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
              New to FeedoZone?{' '}
              <span onClick={() => { setMode('signup'); resetFields() }} style={{ color: '#E24B4A', cursor: 'pointer', fontWeight: 600 }}>
                Create account
              </span>
            </p>
          )}
        </form>
      )}

      {/* Become a Partner */}
      {role === 'vendor' && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>New restaurant?</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>
          <button onClick={() => window.open('https://forms.gle/1arTekd59tidriKcA', '_blank')} style={{
            width: '100%', padding: '13px 14px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
          }}>
            🤝 Become a Restaurant Partner
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Submit your details — our team will set up your restaurant account
          </p>
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        FeedoZone © 2025 · feedozone2030@gmail.com
      </div>

      {/* ── TERMS MODAL ── */}
      {showTermsModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowTermsModal(false) }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'85vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>📜 Terms & Conditions</div>
              <button onClick={() => setShowTermsModal(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 10px' }}>
              <div style={{ fontSize:11, color:'#9ca3af', marginBottom:16 }}>Last updated: March 2026</div>
              {[
                { title:'1. Acceptance of Terms', body:'By using FeedoZone, you agree to these terms. If you do not agree, please do not use our platform.' },
                { title:'2. Service Description', body:'FeedoZone is a food ordering platform connecting users with local food vendors in Warananagar and surrounding areas.' },
                { title:'3. User Accounts', body:'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.' },
                { title:'4. Orders & Payment', body:'All orders are subject to vendor acceptance. Payments are currently Cash on Delivery (COD). Prices displayed include all applicable charges.' },
                { title:'5. Cancellation Policy', body:"Orders can be cancelled before the vendor accepts them. Once accepted, cancellations are at the vendor's discretion." },
                { title:'6. User Conduct', body:'You agree not to misuse the platform, place fake orders, or engage in any fraudulent activity. Violations may result in account suspension.' },
                { title:'7. Intellectual Property', body:'All content on FeedoZone including logos, designs, and text is owned by FeedoZone and may not be reproduced without permission.' },
                { title:'8. Limitation of Liability', body:'FeedoZone is not liable for any indirect or consequential damages arising from the use of our service.' },
                { title:'9. Changes to Terms', body:'We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the new terms.' },
                { title:'10. Contact', body:'For any questions about these terms, contact us at feedozone2030@gmail.com' },
              ].map(s => (
                <div key={s.title} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{s.body}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'10px 20px 30px', position:'sticky', bottom:0, background:'#fff' }}>
              <button onClick={() => { setAgreedToTerms(true); setShowTermsModal(false) }}
                style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:13, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                ✅ I Agree & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY MODAL ── */}
      {showPrivacyModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowPrivacyModal(false) }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'85vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>🔒 Privacy Policy</div>
              <button onClick={() => setShowPrivacyModal(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 10px' }}>
              <div style={{ fontSize:11, color:'#9ca3af', marginBottom:16 }}>Last updated: March 2026</div>
              {[
                { title:'1. Information We Collect', body:'We collect your name, email, phone number, address, and order history to provide our food delivery service.' },
                { title:'2. How We Use Your Data', body:'Your data is used to process orders, improve our services, send order updates, and provide customer support.' },
                { title:'3. Data Sharing', body:'We do not sell your personal data. We share your delivery details with vendors only to fulfill your orders.' },
                { title:'4. Data Storage', body:'Your data is securely stored on Firebase (Google Cloud). We use industry-standard security measures to protect your information.' },
                { title:'5. Cookies', body:'We use local storage to remember your preferences such as language and location. No third-party tracking cookies are used.' },
                { title:'6. Your Rights', body:'You can request to view, update, or delete your personal data at any time by contacting our support team.' },
                { title:"7. Children's Privacy", body:'FeedoZone is not intended for children under 13. We do not knowingly collect data from children.' },
                { title:'8. Changes to Policy', body:'We may update this privacy policy from time to time. We will notify you of significant changes through the app.' },
                { title:'9. Contact Us', body:'For privacy-related concerns, reach us at feedozone2030@gmail.com' },
              ].map(s => (
                <div key={s.title} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{s.body}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'10px 20px 30px', position:'sticky', bottom:0, background:'#fff' }}>
              <button onClick={() => setShowPrivacyModal(false)}
                style={{ width:'100%', background:'#1f2937', color:'#fff', border:'none', padding:13, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}