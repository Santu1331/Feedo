import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, getAllOrders, getAllVendors, founderCreateVendor } from '../firebase/services'
import toast from 'react-hot-toast'

export default function FounderApp() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ storeName:'', email:'', phone:'', password:'', confirmPass:'', address:'', category:'Thali', plan:'₹500/month' })

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

  const handleCreate = async () => {
    const { storeName, email, password, confirmPass, plan, category, address, phone } = form
    if (!storeName) return toast.error('Store name required')
    if (!email) return toast.error('Email required')
    if (!password) return toast.error('Password required')
    if (password.length < 6) return toast.error('Password must be 6+ characters')
    if (password !== confirmPass) return toast.error('Passwords do not match')

    setCreating(true)
    try {
      await founderCreateVendor(user.uid, { email, password, storeName, address, phone, plan, category })
      toast.success(`✅ Vendor "${storeName}" created! They can login with ${email}`)
      setForm({ storeName:'', email:'', phone:'', password:'', confirmPass:'', address:'', category:'Thali', plan:'₹500/month' })
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

  const inp = { width:'100%', padding:'11px 13px', border:'1px solid #e5e7eb', borderRadius:9, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4 }

  return (
    <div style={{ maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>

      <div style={{ background:'#111', padding:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, background:'#E24B4A', borderRadius:'50%' }} />
          <span style={{ fontSize:18, fontWeight:700, color:'#fff' }}>FeedoZone</span>
          <span style={{ fontSize:11, color:'#555' }}>Founder</span>
        </div>
        <div style={{ fontSize:11, color:'#555', marginTop:4 }}>Warananagar, Kolhapur</div>
      </div>

      <div style={{ display:'flex', background:'#0a0a0a', overflowX:'auto', flexShrink:0 }}>
        {[
          { id:'overview', label:'Overview' },
          { id:'orders', label:`Orders (${todayOrders.length})` },
          { id:'vendors', label:`Vendors (${vendors.length})` },
          { id:'addvendor', label:'+ Add Vendor' }
        ].map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{
            flexShrink:0, padding:'11px 14px', fontSize:12, fontWeight:500,
            color: tab===t2.id?'#E24B4A':'#666',
            borderBottom: tab===t2.id?'2px solid #E24B4A':'2px solid transparent',
            background:'transparent', border:'none',
            borderBottom: tab===t2.id?'2px solid #E24B4A':'2px solid transparent',
            cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap'
          }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {/* OVERVIEW */}
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
            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', border:'1px solid #E24B4A', padding:11, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>Logout</button>
          </>
        )}

        {/* ORDERS */}
        {tab==='orders' && (
          <>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>All orders · live</div>
            {orders.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>No orders yet</div>}
            {orders.slice(0,50).map(o => (
              <div key={o.id} style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f3f4f6' }}>
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

        {/* VENDORS LIST */}
        {tab==='vendors' && (
          <>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>{vendors.length} registered vendors</div>
            {vendors.length===0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>
                No vendors yet. Add your first vendor!
              </div>
            )}
            {vendors.map(v => (
              <div key={v.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background: v.isOpen?'#16a34a':'#d1d5db' }} />
                    <span style={{ fontSize:14, fontWeight:600 }}>{v.storeName}</span>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:8,
                    background: v.subscriptionStatus==='active'?'#d1fae5':'#fee2e2',
                    color: v.subscriptionStatus==='active'?'#065f46':'#991b1b'
                  }}>{v.subscriptionStatus==='active'?'Paid':'Due'}</span>
                </div>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:8 }}>{v.email} · {v.category}</div>
                <div style={{ display:'flex', gap:16 }}>
                  {[
                    { val: v.totalOrders||0, lbl:'Orders' },
                    { val: `${v.onTimePercent||100}%`, lbl:'On-time' },
                    { val: `${v.avgPrepTime||v.prepTime||20}m`, lbl:'Avg prep' },
                    { val: v.plan||'₹500/mo', lbl:'Plan' }
                  ].map(s => (
                    <div key={s.lbl} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{s.val}</div>
                      <div style={{ fontSize:10, color:'#6b7280' }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ADD VENDOR */}
        {tab==='addvendor' && (
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:600 }}>Create Vendor Account</span>
              <span style={{ fontSize:10, background:'#FCEBEB', color:'#A32D2D', padding:'2px 8px', borderRadius:10, fontWeight:600 }}>Founder Only</span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
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
                    {['Thali','Biryani','Chinese','Snacks','Drinks','Sweets'].map(c=><option key={c}>{c}</option>)}
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

              <button onClick={handleCreate} disabled={creating} style={{
                width:'100%', background: creating?'#f09595':'#E24B4A', color:'#fff',
                border:'none', padding:13, borderRadius:10, fontSize:14,
                fontWeight:600, cursor: creating?'not-allowed':'pointer',
                fontFamily:'Poppins', marginTop:4
              }}>
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