import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, getAllOrders, getAllVendors, founderCreateVendor, uploadPhoto, updateVendorStore } from '../firebase/services'
import toast from 'react-hot-toast'

export default function FounderApp() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    storeName:'', email:'', phone:'', password:'',
    confirmPass:'', address:'', category:'Thali', plan:'₹500/month'
  })

  // Photo states
  const [vendorPhotoFile, setVendorPhotoFile] = useState(null)
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState(null)
  const [photoProgress, setPhotoProgress] = useState(0)
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState(null) // vendorId
  const [existingProgress, setExistingProgress] = useState(0)

  const photoRef = useRef()
  const existingPhotoRef = useRef()

  useEffect(() => {
    const u1 = getAllOrders(setOrders)
    const u2 = getAllVendors(setVendors)
    return () => { u1(); u2() }
  }, [])

  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const today = new Date()
    return d.getDate()===today.getDate() && d.getMonth()===today.getMonth()
  })
  const todayRevenue = todayOrders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0)
  const subRevenue = vendors.length * 500

  const f = field => ({ value: form[field], onChange: e => setForm(p=>({...p,[field]:e.target.value})) })

  // ── Photo select for new vendor ───────────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setVendorPhotoFile(file)
    setVendorPhotoPreview(URL.createObjectURL(file))
  }

  // ── Create vendor + upload photo ──────────────────────────────────────────
  const handleCreate = async () => {
    const { storeName, email, password, confirmPass, plan, category, address, phone } = form
    if (!storeName) return toast.error('Store name required')
    if (!email) return toast.error('Email required')
    if (!password) return toast.error('Password required')
    if (password.length < 6) return toast.error('Password must be 6+ characters')
    if (password !== confirmPass) return toast.error('Passwords do not match')

    setCreating(true)
    try {
      // Step 1: Create vendor account
      const vendorUid = await founderCreateVendor(user.uid, { email, password, storeName, address, phone, plan, category })

      // Step 2: Upload photo if selected
      if (vendorPhotoFile && vendorUid) {
        setPhotoProgress(0)
        const photoUrl = await uploadPhoto(vendorPhotoFile, setPhotoProgress)
        await updateVendorStore(vendorUid, { photo: photoUrl })
      }

      toast.success(`✅ Vendor "${storeName}" created!`)
      setForm({ storeName:'', email:'', phone:'', password:'', confirmPass:'', address:'', category:'Thali', plan:'₹500/month' })
      setVendorPhotoFile(null)
      setVendorPhotoPreview(null)
      setPhotoProgress(0)
      setTab('vendors')
    } catch (err) {
      const msg = err.code==='auth/email-already-in-use' ? 'This email is already registered'
        : err.code==='auth/invalid-email' ? 'Invalid email format'
        : err.message || 'Failed to create vendor'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  // ── Upload photo for existing vendor ──────────────────────────────────────
  const handleExistingVendorPhoto = async (e, vendorId) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setUploadingPhotoFor(vendorId)
    setExistingProgress(0)
    try {
      const url = await uploadPhoto(file, setExistingProgress)
      await updateVendorStore(vendorId, { photo: url })
      toast.success('Vendor photo updated! ✅')
    } catch {
      toast.error('Upload failed. Try again.')
    }
    setUploadingPhotoFor(null)
    setExistingProgress(0)
    e.target.value = ''
  }

  const inp = {
    width:'100%', padding:'11px 13px',
    borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:9, fontSize:13,
    fontFamily:'Poppins,sans-serif', outline:'none',
    marginTop:4, boxSizing:'border-box'
  }

  return (
    <div style={{ maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background:'#111', padding:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, background:'#E24B4A', borderRadius:'50%' }} />
          <span style={{ fontSize:18, fontWeight:700, color:'#fff' }}>FeedoZone</span>
          <span style={{ fontSize:11, color:'#555' }}>👑 Founder</span>
        </div>
        <div style={{ fontSize:11, color:'#555', marginTop:4 }}>Warananagar, Kolhapur</div>
      </div>

      {/* ── NAV ── */}
      <div style={{ display:'flex', background:'#0a0a0a', overflowX:'auto', flexShrink:0 }}>
        {[
          { id:'overview',  label:'Overview' },
          { id:'orders',    label:`Orders (${todayOrders.length})` },
          { id:'vendors',   label:`Vendors (${vendors.length})` },
          { id:'addvendor', label:'+ Add Vendor' }
        ].map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{
            flexShrink:0, padding:'11px 14px', fontSize:12, fontWeight:500,
            color: tab===t2.id?'#E24B4A':'#666',
            borderBottomWidth:2, borderBottomStyle:'solid',
            borderBottomColor: tab===t2.id?'#E24B4A':'transparent',
            borderTop:'none', borderLeft:'none', borderRight:'none',
            background:'transparent', cursor:'pointer',
            fontFamily:'Poppins', whiteSpace:'nowrap'
          }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <div style={{ background:'#E24B4A', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.8)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Today Orders</div>
                <div style={{ fontSize:22, fontWeight:600, color:'#fff' }}>{todayOrders.length}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 }}>live updates</div>
              </div>
              {[
                { label:'Today Revenue', val:`₹${todayRevenue.toLocaleString()}`, sub:`avg ₹${todayOrders.length?Math.round(todayRevenue/todayOrders.length):0}` },
                { label:'Subscriptions', val:`₹${subRevenue.toLocaleString()}`, sub:'this month' },
                { label:'Active Vendors', val:`${vendors.filter(v=>v.isOpen).length}/${vendors.length}`, sub:`${vendors.length-vendors.filter(v=>v.isOpen).length} offline` }
              ].map(s => (
                <div key={s.label} style={{ background:'#f9fafb', borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:10, color:'#6b7280', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                  <div style={{ fontSize:22, fontWeight:600 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:11, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>Logout</button>
          </>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>All orders · live</div>
            {orders.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>No orders yet</div>}
            {orders.slice(0,50).map(o => (
              <div key={o.id} style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div style={{ fontSize:11, color:'#9ca3af', minWidth:42 }}>
                  {o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})||'--'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{o.userName}</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>{o.vendorName}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:600, minWidth:48, textAlign:'right' }}>₹{o.total}</div>
                <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:8, minWidth:55, textAlign:'center',
                  background: o.status==='delivered'?'#d1fae5':o.status==='cancelled'?'#fee2e2':o.status==='preparing'?'#dbeafe':'#fef3c7',
                  color: o.status==='delivered'?'#065f46':o.status==='cancelled'?'#991b1b':o.status==='preparing'?'#1e40af':'#92400e'
                }}>{o.status?.replace('_',' ')}</span>
              </div>
            ))}
          </>
        )}

        {/* ── VENDORS LIST ── */}
        {tab==='vendors' && (
          <>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>{vendors.length} registered vendors</div>
            {vendors.length===0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>No vendors yet. Add your first vendor!</div>
            )}
            {vendors.map(v => (
              <div key={v.id} style={{ background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, overflow:'hidden', marginBottom:12 }}>

                {/* Vendor photo banner */}
                <div style={{ height:100, position:'relative', background:'linear-gradient(135deg,#1a1a1a,#2a2a2a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {v.photo
                    ? <img src={v.photo} alt={v.storeName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:32 }}>🏪</span>
                  }
                  {/* Upload photo button */}
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'; input.accept = 'image/*'
                      input.onchange = (e) => handleExistingVendorPhoto(e, v.id)
                      input.click()
                    }}
                    style={{
                      position:'absolute', bottom:8, right:8,
                      background:'rgba(0,0,0,0.7)', color:'#fff',
                      border:'none', borderRadius:8, padding:'5px 10px',
                      fontSize:11, cursor:'pointer', fontFamily:'Poppins', fontWeight:500
                    }}
                  >
                    {uploadingPhotoFor===v.id ? `${existingProgress}%` : '📷 Change Photo'}
                  </button>
                  {/* Open/Closed badge */}
                  <div style={{ position:'absolute', top:8, left:8, background: v.isOpen?'#16a34a':'#dc2626', color:'#fff', fontSize:10, padding:'3px 8px', borderRadius:20, fontWeight:600 }}>
                    {v.isOpen ? '● Open' : '● Closed'}
                  </div>
                </div>

                <div style={{ padding:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{v.storeName}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:8,
                      background: v.subscriptionStatus==='active'?'#d1fae5':'#fee2e2',
                      color: v.subscriptionStatus==='active'?'#065f46':'#991b1b'
                    }}>{v.subscriptionStatus==='active'?'Paid':'Due'}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:8 }}>{v.email} · {v.category}</div>
                  <div style={{ display:'flex', gap:16 }}>
                    {[
                      { val: v.totalOrders||0,               lbl:'Orders' },
                      { val: `${v.onTimePercent||100}%`,     lbl:'On-time' },
                      { val: `${v.avgPrepTime||v.prepTime||20}m`, lbl:'Avg prep' },
                      { val: v.plan||'₹500/mo',              lbl:'Plan' }
                    ].map(s => (
                      <div key={s.lbl} style={{ textAlign:'center' }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{s.val}</div>
                        <div style={{ fontSize:10, color:'#6b7280' }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── ADD VENDOR ── */}
        {tab==='addvendor' && (
          <div style={{ borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:600 }}>Create Vendor Account</span>
              <span style={{ fontSize:10, background:'#FCEBEB', color:'#A32D2D', padding:'2px 8px', borderRadius:10, fontWeight:600 }}>Founder Only</span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {/* Vendor photo picker */}
              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Store Photo (optional)</label>
                <div
                  onClick={() => photoRef.current?.click()}
                  style={{
                    marginTop:6, borderWidth:2, borderStyle:'dashed', borderColor:'#e5e7eb',
                    borderRadius:12, overflow:'hidden', cursor:'pointer',
                    height:120, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'#fafafa', position:'relative'
                  }}
                >
                  {vendorPhotoPreview
                    ? <img src={vendorPhotoPreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:28 }}>🏪</div>
                        <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>Tap to add store photo</div>
                      </div>
                  }
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoSelect} />
                {vendorPhotoPreview && (
                  <button onClick={() => { setVendorPhotoFile(null); setVendorPhotoPreview(null) }}
                    style={{ marginTop:4, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'Poppins' }}>
                    ✕ Remove photo
                  </button>
                )}
              </div>

              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Store / Vendor Name *</label>
                <input style={inp} placeholder="e.g. Shree Ganesh Thali" {...f('storeName')} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Vendor Email * (used for login)</label>
                <input style={inp} type="email" placeholder="vendor@example.com" {...f('email')} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Password *</label>
                  <input style={inp} type="password" placeholder="Min 6 chars" {...f('password')} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Confirm *</label>
                  <input style={inp} type="password" placeholder="Repeat" {...f('confirmPass')} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Phone / WhatsApp</label>
                <input style={inp} placeholder="+91 98765 43210" {...f('phone')} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Store Address</label>
                <input style={inp} placeholder="Near college gate, Warananagar..." {...f('address')} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Category</label>
                  <select style={{ ...inp, cursor:'pointer', marginTop:4 }} {...f('category')}>
                    {['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Plan</label>
                  <select style={{ ...inp, cursor:'pointer', marginTop:4 }} {...f('plan')}>
                    <option>₹500/month</option>
                    <option>₹1000/month</option>
                    <option>Free Trial</option>
                  </select>
                </div>
              </div>

              {/* Photo upload progress */}
              {creating && vendorPhotoFile && photoProgress > 0 && (
                <div>
                  <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>Uploading photo... {photoProgress}%</div>
                  <div style={{ background:'#f3f4f6', borderRadius:8, overflow:'hidden', height:6 }}>
                    <div style={{ height:'100%', background:'#E24B4A', width:`${photoProgress}%`, transition:'width 0.3s' }} />
                  </div>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  width:'100%', background: creating?'#f09595':'#E24B4A', color:'#fff',
                  border:'none', padding:13, borderRadius:10, fontSize:14,
                  fontWeight:600, cursor: creating?'not-allowed':'pointer',
                  fontFamily:'Poppins', marginTop:4
                }}
              >
                {creating ? 'Creating Account...' : '✅ Create Vendor Account'}
              </button>
            </div>

            <div style={{ marginTop:14, padding:12, background:'#f0fdf4', borderRadius:10, fontSize:12, color:'#166534' }}>
              💡 After creating, share the email + password with the vendor. They select "Vendor" tab on login screen and use those credentials.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}