import { useState } from 'react'
import { loginUser, logoutUser } from '../firebase/services'
import { createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [role, setRole] = useState('user')
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [college, setCollege] = useState('')
  const [pincode, setPincode] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const resetFields = () => {
    setEmail(''); setPassword(''); setName(''); setMobile('')
    setAddress(''); setCity(''); setCollege(''); setPincode('')
    setAgreedToTerms(false)
  }

  // ── GOOGLE SIGN-IN ──
  const handleGoogleSignIn = async () => {
    if (role === 'vendor') return toast.error('Google sign-in is not available for restaurants.')
    setGoogleLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const uid = cred.user.uid
      const snap = await getDoc(doc(db, 'users', uid))

      if (snap.exists()) {
        // Existing user — just log in
        const userData = snap.data()
        if (userData.role !== 'user') {
          await logoutUser()
          toast.error('This account does not have user access.')
          setGoogleLoading(false); return
        }
        toast.success(`Welcome back, ${userData.name || cred.user.displayName || ''}! 👋`)
      } else {
        // New user — create Firestore doc
        const displayName = cred.user.displayName || ''
        await setDoc(doc(db, 'users', uid), {
          uid,
          name: displayName,
          email: cred.user.email,
          mobile: '',
          address: '',
          city: '',
          college: '',
          pincode: '',
          role: 'user',
          createdAt: new Date().toISOString(),
        })
        toast.success(`Welcome to FeedoZone, ${displayName.split(' ')[0] || 'there'}! 🎉`)
      }

      setTimeout(() => { window.location.href = '/home' }, 500)
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User cancelled — no toast needed
      } else {
        toast.error('Google sign-in failed. Try again.')
      }
      setGoogleLoading(false)
    }
  }

  // ── FORGOT PASSWORD ──
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Enter your registered email address')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      toast.success('Password reset email sent! Check your inbox 📬')
      setTimeout(() => { setMode('login'); resetFields() }, 1500)
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' ? 'No account found with this email.' :
        err.code === 'auth/invalid-email' ? 'Invalid email format.' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.' :
        'Failed to send reset email. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── SIGNUP ──
  const handleSignup = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Enter your full name')
    if (!mobile.trim() || mobile.length < 10) return toast.error('Enter a valid 10-digit mobile number')
    if (!email.trim()) return toast.error('Enter email address')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!agreedToTerms) return toast.error('Please agree to Terms & Conditions')

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      await setDoc(doc(db, 'users', uid), {
        uid, name: name.trim(), email: email.trim().toLowerCase(),
        mobile: mobile.trim(), address: address.trim(), city: city.trim(),
        college: college.trim(), pincode: pincode.trim(),
        role: 'user', createdAt: new Date().toISOString(),
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

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter email and password')
    setLoading(true)
    try {
      const cred = await loginUser(email, password)
      const uid = cred.user.uid
      const snap = await getDoc(doc(db, 'users', uid))
      if (!snap.exists()) { await logoutUser(); toast.error('Account not found.'); setLoading(false); return }
      const userData = snap.data()
      const actualRole = userData.role
      if (actualRole !== role) {
        await logoutUser()
        toast.error(role === 'vendor' ? 'You are not a Restaurant. Try User login.' : `You are not a User. You have ${actualRole} access.`)
        setLoading(false); return
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

  const inp = {
    width: '100%', padding: '13px 14px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb',
    borderRadius: 10, fontSize: 14, fontFamily: 'Poppins, sans-serif',
    outline: 'none', color: '#1f2937', boxSizing: 'border-box', background: '#fff',
  }

  const isSignupMode = role === 'user' && mode === 'signup'
  const isForgotMode = mode === 'forgot'

  const termsContent = [
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
  ]

  const privacyContent = [
    { title:'1. Information We Collect', body:'We collect your name, email, phone number, address, and order history to provide our food delivery service.' },
    { title:'2. How We Use Your Data', body:'Your data is used to process orders, improve our services, send order updates, and provide customer support.' },
    { title:'3. Data Sharing', body:'We do not sell your personal data. We share your delivery details with vendors only to fulfill your orders.' },
    { title:'4. Data Storage', body:'Your data is securely stored on Firebase (Google Cloud). We use industry-standard security measures to protect your information.' },
    { title:'5. Cookies', body:'We use local storage to remember your preferences such as language and location. No third-party tracking cookies are used.' },
    { title:'6. Your Rights', body:'You can request to view, update, or delete your personal data at any time by contacting our support team.' },
    { title:"7. Children's Privacy", body:'FeedoZone is not intended for children under 13. We do not knowingly collect data from children.' },
    { title:'8. Changes to Policy', body:'We may update this privacy policy from time to time. We will notify you of significant changes through the app.' },
    { title:'9. Contact Us', body:'For privacy-related concerns, reach us at feedozone2030@gmail.com' },
  ]

  const Modal = ({ show, onClose, title, content, onAgree }) => !show ? null : (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
      onClick={e => { if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'85vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
        <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>{title}</div>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'20px 20px 10px' }}>
          <div style={{ fontSize:11, color:'#9ca3af', marginBottom:16 }}>Last updated: March 2026</div>
          {content.map(s => (
            <div key={s.title} style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{s.body}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 20px 30px', position:'sticky', bottom:0, background:'#fff' }}>
          {onAgree
            ? <button onClick={onAgree} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:13, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>✅ I Agree & Close</button>
            : <button onClick={onClose} style={{ width:'100%', background:'#1f2937', color:'#fff', border:'none', padding:13, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>Close</button>
          }
        </div>
      </div>
    </div>
  )

  // ── Google Button SVG icon ──
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )

  // ── Divider ──
  const Divider = ({ label }) => (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
      <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
      <span style={{ fontSize:11, color:'#9ca3af', whiteSpace:'nowrap' }}>{label}</span>
      <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
    </div>
  )

  return (
    <div style={{ maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', padding:'32px 24px 40px', fontFamily:'Poppins, sans-serif', overflowY:'auto' }}>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:28, marginTop: isSignupMode ? 0 : 40 }}>
        <div style={{ fontSize:36, fontWeight:700, color:'#E24B4A', letterSpacing:-1 }}>Feedo</div>
        <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>Click, Eat, Repeat.</div>
      </div>

      {/* ── FORGOT PASSWORD SCREEN ── */}
      {isForgotMode ? (
        <div>
          {/* Back button */}
          <button onClick={() => { setMode('login'); resetFields() }} style={{
            display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
            color:'#6b7280', fontSize:13, cursor:'pointer', fontFamily:'Poppins, sans-serif',
            marginBottom:20, padding:0,
          }}>
            ← Back to Login
          </button>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:20, fontWeight:700, color:'#1f2937', marginBottom:6 }}>🔑 Forgot Password?</div>
            <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }}>
              Enter your registered email and we'll send you a link to reset your password.
            </div>
          </div>

          <form onSubmit={handleForgotPassword} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input
              type="email"
              placeholder="Your registered email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inp}
            />
            <button type="submit" disabled={loading} style={{
              width:'100%', background: loading ? '#f09595' : '#E24B4A',
              color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:15, fontWeight:600,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Poppins, sans-serif', marginTop:4,
            }}>
              {loading ? 'Sending...' : 'Send Reset Link 📬'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:12, color:'#6b7280', marginTop:20 }}>
            Remembered it?{' '}
            <span onClick={() => { setMode('login'); resetFields() }} style={{ color:'#E24B4A', cursor:'pointer', fontWeight:600 }}>
              Back to Login
            </span>
          </p>
        </div>
      ) : (
        <>
          {/* Role selector */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            {['user','vendor'].map(r2 => (
              <button key={r2} onClick={() => { setRole(r2); setMode('login'); resetFields() }} style={{
                flex:1, padding:'10px 4px', borderWidth:2, borderStyle:'solid',
                borderColor: role===r2 ? '#E24B4A' : '#e5e7eb', borderRadius:10,
                background: role===r2 ? '#FCEBEB' : '#fafafa',
                color: role===r2 ? '#A32D2D' : '#6b7280',
                fontWeight: role===r2 ? 600 : 400, fontSize:14, cursor:'pointer',
                fontFamily:'Poppins, sans-serif', transition:'all 0.15s',
              }}>
                {r2 === 'user' ? '👤 User' : '🏪 Restaurant'}
              </button>
            ))}
          </div>

          {/* Role hint */}
          <div style={{ padding:'10px 14px', background:r.bg, borderWidth:1, borderStyle:'solid', borderColor:r.border, borderRadius:10, fontSize:12, color:r.color, marginBottom:20, textAlign:'center' }}>
            {roleInfo[role].hint}
          </div>

          {/* Login / Signup toggle */}
          {role === 'user' && (
            <div style={{ display:'flex', background:'#f3f4f6', borderRadius:10, padding:4, marginBottom:20, gap:4 }}>
              {['login','signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); resetFields() }} style={{
                  flex:1, padding:'9px 0', borderRadius:8, border:'none', cursor:'pointer',
                  fontFamily:'Poppins, sans-serif', fontSize:13,
                  fontWeight: mode===m ? 600 : 400,
                  background: mode===m ? '#fff' : 'transparent',
                  color: mode===m ? '#E24B4A' : '#6b7280',
                  boxShadow: mode===m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition:'all 0.15s',
                }}>
                  {m === 'login' ? '🔑 Login' : '✨ Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* ── SIGNUP FORM ── */}
          {isSignupMode && (
            <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:11 }}>
              <input type="text" placeholder="Full name *" value={name} onChange={e => setName(e.target.value)} style={inp} />

              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#6b7280', pointerEvents:'none' }}>+91</span>
                <input type="tel" placeholder="Mobile number *" value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,10))}
                  style={{ ...inp, paddingLeft:48 }} />
              </div>

              <input type="email" placeholder="Email address *" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
              <input type="password" placeholder="Create password (min 6 chars) *" value={password} onChange={e => setPassword(e.target.value)} style={inp} />

              <Divider label="📍 Address Details (optional)" />

              <input type="text" placeholder="Full address (room no, building...)" value={address} onChange={e => setAddress(e.target.value)} style={inp} />
              <div style={{ display:'flex', gap:10 }}>
                <input type="text" placeholder="City / Area" value={city} onChange={e => setCity(e.target.value)} style={{ ...inp, flex:1 }} />
                <input type="text" placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))} style={{ ...inp, width:110, flex:'none' }} />
              </div>

              {/* T&C Checkbox */}
              <div onClick={() => setAgreedToTerms(a => !a)} style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', cursor:'pointer',
                background: agreedToTerms ? '#f0fdf4' : '#fafafa', borderRadius:10,
                borderWidth:1, borderStyle:'solid', borderColor: agreedToTerms ? '#86efac' : '#e5e7eb',
                transition:'all 0.15s',
              }}>
                <div style={{
                  width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
                  borderWidth:2, borderStyle:'solid',
                  borderColor: agreedToTerms ? '#16a34a' : '#d1d5db',
                  background: agreedToTerms ? '#16a34a' : '#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.15s',
                }}>
                  {agreedToTerms && <span style={{ color:'#fff', fontSize:12, fontWeight:700, lineHeight:1 }}>✓</span>}
                </div>
                <div style={{ fontSize:12, color:'#374151', lineHeight:1.6 }}>
                  I agree to the{' '}
                  <span onClick={e => { e.stopPropagation(); setShowTermsModal(true) }}
                    style={{ color:'#E24B4A', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>
                    Terms & Conditions
                  </span>
                  {' '}and{' '}
                  <span onClick={e => { e.stopPropagation(); setShowPrivacyModal(true) }}
                    style={{ color:'#E24B4A', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>
                    Privacy Policy
                  </span>
                </div>
              </div>

              <button type="submit" disabled={loading || !agreedToTerms} style={{
                width:'100%', background: loading ? '#f09595' : !agreedToTerms ? '#d1d5db' : '#E24B4A',
                color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:15, fontWeight:600,
                cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
                fontFamily:'Poppins, sans-serif', marginTop:4,
              }}>
                {loading ? 'Creating Account...' : 'Create Account 🚀'}
              </button>

              {/* Google Sign-up */}
              <Divider label="or sign up with" />
              <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                background:'#fff', border:'1.5px solid #e5e7eb', padding:13, borderRadius:10,
                fontSize:14, fontWeight:600, cursor: googleLoading ? 'not-allowed' : 'pointer',
                fontFamily:'Poppins, sans-serif', color:'#1f2937',
                boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <GoogleIcon />
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <p style={{ textAlign:'center', fontSize:12, color:'#6b7280', margin:'4px 0 0' }}>
                Already have an account?{' '}
                <span onClick={() => { setMode('login'); resetFields() }} style={{ color:'#E24B4A', cursor:'pointer', fontWeight:600 }}>Login here</span>
              </p>
            </form>
          )}

          {/* ── LOGIN FORM ── */}
          {!isSignupMode && (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <input type="email"
                placeholder={role === 'vendor' ? 'Restaurant email (given by founder)' : 'Your email address'}
                value={email} onChange={e => setEmail(e.target.value)} style={inp} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inp} />

              {/* Forgot Password link — only for user role */}
              {role === 'user' && (
                <div style={{ textAlign:'right', marginTop:-4 }}>
                  <span
                    onClick={() => { setMode('forgot'); resetFields() }}
                    style={{ fontSize:12, color:'#E24B4A', cursor:'pointer', fontWeight:600 }}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width:'100%', background: loading ? '#f09595' : '#E24B4A',
                color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:15, fontWeight:600,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Poppins, sans-serif', marginTop:4,
              }}>
                {loading ? 'Verifying...' : `Login as ${role === 'vendor' ? 'Restaurant' : 'User'}`}
              </button>

              {/* Google Sign-in — only for user */}
              {role === 'user' && (
                <>
                  <Divider label="or continue with" />
                  <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                    background:'#fff', border:'1.5px solid #e5e7eb', padding:13, borderRadius:10,
                    fontSize:14, fontWeight:600, cursor: googleLoading ? 'not-allowed' : 'pointer',
                    fontFamily:'Poppins, sans-serif', color:'#1f2937',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <GoogleIcon />
                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                  </button>
                </>
              )}

              {role === 'user' && (
                <p style={{ textAlign:'center', fontSize:12, color:'#6b7280', margin:'4px 0 0' }}>
                  New to FeedoZone?{' '}
                  <span onClick={() => { setMode('signup'); resetFields() }} style={{ color:'#E24B4A', cursor:'pointer', fontWeight:600 }}>Create account</span>
                </p>
              )}
            </form>
          )}

          {/* Become a Partner */}
          {role === 'vendor' && (
            <div style={{ marginTop:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
                <span style={{ fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>New restaurant?</span>
                <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
              </div>
              <button onClick={() => window.open('https://forms.gle/1arTekd59tidriKcA','_blank')} style={{
                width:'100%', padding:'13px 14px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer',
                fontFamily:'Poppins, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 2px 8px rgba(124,58,237,0.25)',
              }}>
                🤝 Become a Restaurant Partner
              </button>
              <p style={{ textAlign:'center', fontSize:11, color:'#9ca3af', marginTop:8 }}>
                Submit your details — our team will set up your restaurant account
              </p>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop:32, fontSize:11, color:'#9ca3af', textAlign:'center' }}>
        FeedoZone © 2025 · feedozone2030@gmail.com
      </div>

      <Modal show={showTermsModal} onClose={() => setShowTermsModal(false)} title="📜 Terms & Conditions"
        content={termsContent} onAgree={() => { setAgreedToTerms(true); setShowTermsModal(false) }} />
      <Modal show={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="🔒 Privacy Policy"
        content={privacyContent} onAgree={null} />
    </div>
  )
}