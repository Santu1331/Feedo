import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, updateVendorStore, founderCreateVendor, uploadPhoto } from '../firebase/services'
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

const EMPTY_VENDOR_FORM = {
  storeName:'', email:'', phone:'', password:'', confirmPass:'',
  address:'', category:'Thali', deliveryCharge:30, town:''
}

export default function ManagerApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('overview')

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const [allVendors, setAllVendors] = useState([])
  const [cityVendors, setCityVendors] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [tickets, setTickets] = useState([])

  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR_FORM)
  const [creatingVendor, setCreatingVendor] = useState(false)
  const [vendorPhotoFile, setVendorPhotoFile] = useState(null)
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState(null)
  const [photoProgress, setPhotoProgress] = useState(0)
  const photoRef = useRef()

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const [subFeeInput, setSubFeeInput] = useState('')
  const [savingSubFee, setSavingSubFee] = useState(false)
  const [activatingVendor, setActivatingVendor] = useState(null)

  // Delete request state
  const [requestingDelete, setRequestingDelete] = useState(null) // vendorId being requested
  const [deleteRequests, setDeleteRequests] = useState([])       // pending requests this manager sent

  const [analyticsFilter, setAnalyticsFilter] = useState('all')
  const [orderFilter, setOrderFilter] = useState('all')
  const [customerSearch, setCustomerSearch] = useState('')

  const city     = userData?.city || ''
  const district = userData?.district || city
  const talukas  = userData?.assignedTalukas || []
  const mgr      = userData?.name || 'Manager'

  const isMyVendor = (v) => {
    if (v.managerCity && v.managerCity.toLowerCase() === city.toLowerCase()) return true
    if (v.createdByManager === user?.uid) return true
    const vt = (v.town || v.locationName || '').toLowerCase()
    if (city && vt.includes(city.toLowerCase())) return true
    if (district && district !== city && vt.includes(district.toLowerCase())) return true
    return talukas.some(t => t && vt.includes(t.toLowerCase()))
  }

  useEffect(() => {
    if (!user?.uid) return
    const u1 = onSnapshot(collection(db, 'vendors'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAllVendors(all)
      setCityVendors(all.filter(isMyVendor))
    })
    const u2 = onSnapshot(collection(db, 'orders'), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      arr.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))
      setOrders(arr)
    })
    const u3 = onSnapshot(collection(db, 'users'), snap =>
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    const u4 = onSnapshot(collection(db, 'supportTickets'), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      arr.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))
      setTickets(arr)
    })
    // Delete requests raised by this manager
    const u5 = onSnapshot(collection(db, 'vendorDeleteRequests'), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setDeleteRequests(arr.filter(r => r.requestedBy === user.uid))
    })
    return () => { u1(); u2(); u3(); u4(); u5() }
  }, [user?.uid, city, district])

  const cityOrders   = orders.filter(o => cityVendors.some(v => v.id === o.vendorUid))
  const now          = new Date()
  const todayOrders  = cityOrders.filter(o => { const d=o.createdAt?.toDate?.(); return d && d.getDate()===now.getDate() && d.getMonth()===now.getMonth() })
  const todayRevenue = todayOrders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0)
  const liveOrders   = cityOrders.filter(o=>!['delivered','cancelled'].includes(o.status))
  const openVendors  = cityVendors.filter(v=>v.isOpen).length
  const thirtyAgo    = new Date(Date.now()-30*86400000)

  const cityCustomers = (() => {
    const map = {}
    cityOrders.forEach(o => {
      if (!o.userUid) return
      if (!map[o.userUid]) {
        const u = users.find(x => x.id === o.userUid) || {}
        map[o.userUid] = { id: o.userUid, name: u.name||o.userName||'—', phone: u.mobile||u.phone||o.userPhone||'', email: u.email||'', orders:[], totalSpent:0, delivered:0, lastOrder:null }
      }
      const c = map[o.userUid]
      if (!c.name||c.name==='—') c.name=o.userName||'—'
      c.orders.push(o)
      if (o.status==='delivered') { c.delivered++; c.totalSpent+=o.total||0 }
      const d = o.createdAt?.toDate?.()
      if (d && (!c.lastOrder||d>c.lastOrder)) c.lastOrder=d
    })
    return Object.values(map)
  })()

  const filteredCustomers = cityCustomers.filter(c => {
    const q = customerSearch.toLowerCase()
    if (!q) return true
    return c.name?.toLowerCase().includes(q)||c.phone?.includes(q)||c.email?.toLowerCase().includes(q)
  })

  const getSubDaysLeft = (v) => {
    const d = v.subscriptionDueDate?.toDate?.() || null
    if (!d) return null
    return Math.ceil((d-now)/86400000)
  }

  const handleToggleVendor = async (id, cur) => {
    try { await updateDoc(doc(db,'vendors',id),{isOpen:!cur}); toast.success(!cur?'🟢 Opened':'🔴 Closed') }
    catch { toast.error('Failed') }
  }

  const handleActivateVendor = async (vendorId, storeName) => {
    setActivatingVendor(vendorId)
    try {
      const due = new Date(); due.setDate(due.getDate()+30)
      await updateDoc(doc(db,'vendors',vendorId),{ subscriptionStatus:'active', subscriptionDueDate:due, subscriptionActivatedAt:now })
      toast.success(`✅ ${storeName} activated!`)
    } catch(e) { toast.error(e.message) }
    setActivatingVendor(null)
  }

  const handleDeactivateVendor = async (vendorId, storeName) => {
    if(!window.confirm(`Deactivate ${storeName}?`)) return
    setActivatingVendor(vendorId)
    try { await updateDoc(doc(db,'vendors',vendorId),{subscriptionStatus:'due',subscriptionDueDate:now}); toast.success('Deactivated') }
    catch(e) { toast.error(e.message) }
    setActivatingVendor(null)
  }

  const handleSaveSubFee = async () => {
    const fee = Number(subFeeInput)
    if(!fee||fee<=0) return toast.error('Enter valid fee')
    setSavingSubFee(true)
    try {
      await Promise.all(cityVendors.map(v=>updateDoc(doc(db,'vendors',v.id),{subscriptionFee:fee})))
      toast.success(`✅ Fee ₹${fee} set for all ${city} vendors`)
    } catch(e) { toast.error(e.message) }
    setSavingSubFee(false)
  }

  const handleCreateVendor = async () => {
    const {storeName,email,password,confirmPass,category,address,phone,deliveryCharge,town}=vendorForm
    if(!storeName) return toast.error('Store name required')
    if(!email) return toast.error('Email required')
    if(!password||password.length<6) return toast.error('Password must be 6+ chars')
    if(password!==confirmPass) return toast.error('Passwords do not match')
    setCreatingVendor(true)
    try {
      const maxOrder = allVendors.reduce((m,v)=>Math.max(m,v.sortOrder??0),0)
      const uid = await founderCreateVendor(user.uid,{
        email,password,storeName,address,phone,category,
        plan:'₹500/month', town:town||city,
        deliveryCharge:Number(deliveryCharge)||30,
        sortOrder:maxOrder+1, createdByManager:user.uid, managerCity:city,
      })
      if(vendorPhotoFile&&uid) { const url=await uploadPhoto(vendorPhotoFile,setPhotoProgress); await updateVendorStore(uid,{photo:url}) }
      toast.success(`✅ "${storeName}" added to ${city}!`)
      setVendorForm(EMPTY_VENDOR_FORM); setVendorPhotoFile(null); setVendorPhotoPreview(null)
    } catch(e) { toast.error(e.message) }
    setCreatingVendor(false)
  }

  const handleReplyTicket = async (id) => {
    if(!replyText.trim()) return toast.error('Enter reply')
    setSendingReply(true)
    try {
      await updateDoc(doc(db,'supportTickets',id),{ managerReply:replyText.trim(), status:'replied', repliedAt:serverTimestamp(), repliedBy:user.uid })
      setReplyText(''); setSelectedTicket(null); toast.success('Reply sent!')
    } catch { toast.error('Failed') }
    setSendingReply(false)
  }

  // City-scoped tickets — match by userCity field (set when customer sends message)
  // or fall back to matching by vendor city if userCity not set
  const cityTickets = tickets.filter(t => {
    const tCity = (t.userCity || '').toLowerCase().trim()
    const mCity = city.toLowerCase().trim()
    if (!tCity) return false // tickets without city tag go to founder only
    return tCity.includes(mCity) || mCity.includes(tCity) ||
      mCity.split(/[\s,]+/).some(w => w.length > 3 && tCity.includes(w)) ||
      tCity.split(/[\s,]+/).some(w => w.length > 3 && mCity.includes(w))
  })

  const handleRequestVendorDelete = async (vendorId, storeName) => {
    // Check if request already exists
    const existing = deleteRequests.find(r => r.vendorId === vendorId && r.status === 'pending')
    if (existing) { toast('⏳ Delete request already sent — waiting for founder approval'); return }
    setRequestingDelete(vendorId)
    try {
      await addDoc(collection(db, 'vendorDeleteRequests'), {
        vendorId, storeName,
        requestedBy: user.uid,
        managerName: mgr,
        managerCity: city,
        status: 'pending',
        requestedAt: serverTimestamp(),
      })
      toast.success(`📤 Delete request sent to founder for "${storeName}"`)
    } catch(e) { toast.error('Failed to send request: ' + e.message) }
    setRequestingDelete(null)
  }

  const inp = { width:'100%',padding:'10px 12px',borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb',borderRadius:8,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',marginTop:4,boxSizing:'border-box' }
  const f   = field => ({ value:vendorForm[field], onChange:e=>setVendorForm(p=>({...p,[field]:e.target.value})) })

  const NAV = [
    {id:'overview',  icon:'📊', label:'Overview'},
    {id:'orders',    icon:'📦', label:'Orders',        count:liveOrders.length},
    {id:'vendors',   icon:'🏪', label:'Vendors',       count:cityVendors.length},
    {id:'customers', icon:'👥', label:'Customers',     count:cityCustomers.length},
    {id:'subscription',icon:'💳',label:'Subscriptions'},
    {id:'analytics', icon:'📈', label:'Analytics'},
    {id:'addvendor', icon:'➕', label:'Add Vendor'},
    {id:'support',   icon:'💬', label:'Support',       count:cityTickets.filter(t=>t.status==='open').length, alert:true},
  ]

  const filteredOrders = (() => {
    let list = [...cityOrders]
    if(orderFilter!=='all') list = list.filter(o=>o.status===orderFilter)
    return list
  })()

  return (
    <div style={{maxWidth:isDesktop?'100%':500,margin:'0 auto',background:isDesktop?'#f1f5f9':'#fff',minHeight:'100vh',display:'flex',flexDirection:isDesktop?'row':'column',fontFamily:'Poppins,sans-serif'}}>

      {/* ── DESKTOP SIDEBAR ── */}
      {isDesktop && (
        <aside style={{width:240,flexShrink:0,background:'#0f172a',display:'flex',flexDirection:'column',minHeight:'100vh',position:'sticky',top:0}}>
          <div style={{padding:'20px 18px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:10,height:10,background:'#6366f1',borderRadius:'50%'}}/>
              <span style={{fontSize:18,fontWeight:800,color:'#fff',letterSpacing:-0.3}}>FeedoZone</span>
            </div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:5}}>🧑‍💼 {mgr} · Manager</div>
            <div style={{fontSize:10,color:'#475569',marginTop:2}}>📍 {city}{district!==city?` · ${district}`:''}</div>
            {talukas.length>0&&<div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:4}}>{talukas.map(t=><span key={t} style={{fontSize:9,background:'rgba(99,102,241,0.2)',color:'#a5b4fc',borderRadius:8,padding:'2px 6px'}}>📍{t}</span>)}</div>}
          </div>
          <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
            {NAV.map(item=>{
              const active=tab===item.id
              return(
                <button key={item.id} onClick={()=>setTab(item.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 14px',marginBottom:2,background:active?'linear-gradient(90deg,rgba(99,102,241,0.25),transparent)':'transparent',borderLeft:active?'3px solid #6366f1':'3px solid transparent',border:'none',borderRadius:8,color:active?'#fff':'#94a3b8',fontSize:13,fontWeight:active?700:500,cursor:'pointer',fontFamily:'Poppins',textAlign:'left',transition:'all 0.15s'}}>
                  <span style={{fontSize:16,width:18,textAlign:'center'}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  {item.count>0&&<span style={{background:item.alert?'#E24B4A':'rgba(255,255,255,0.1)',color:'#fff',borderRadius:10,padding:'2px 8px',fontSize:10,fontWeight:700}}>{item.count}</span>}
                </button>
              )
            })}
          </nav>
          <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{fontSize:11,color:'#475569',marginBottom:8}}>👤 {mgr}</div>
            <button onClick={logoutUser} style={{width:'100%',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',borderRadius:8,padding:'8px 0',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Poppins'}}>Logout</button>
          </div>
        </aside>
      )}

      {/* ── MAIN ── */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>

        {/* Mobile header */}
        {!isDesktop&&(
          <div style={{background:'linear-gradient(135deg,#0f172a,#1e1b4b)',padding:'14px 16px',flexShrink:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:8,height:8,background:'#6366f1',borderRadius:'50%'}}/>
                  <span style={{fontSize:17,fontWeight:800,color:'#fff'}}>FeedoZone</span>
                  <span style={{fontSize:10,background:'rgba(255,255,255,0.12)',color:'#94a3b8',borderRadius:10,padding:'2px 8px'}}>Manager</span>
                </div>
                <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>👤 {mgr} · 📍 {city}</div>
              </div>
              <button onClick={logoutUser} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',borderRadius:8,padding:'6px 12px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'Poppins'}}>Logout</button>
            </div>
          </div>
        )}

        {/* Desktop top bar */}
        {isDesktop&&(
          <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
            <div>
              <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,letterSpacing:0.5,textTransform:'uppercase'}}>Manager Dashboard · {city}</div>
              <div style={{fontSize:18,fontWeight:800,color:'#1e293b',marginTop:2,textTransform:'capitalize'}}>{tab==='addvendor'?'Add Vendor':tab}</div>
            </div>
            <div style={{display:'flex',gap:14,alignItems:'center'}}>
              {[{label:'TODAY',val:`₹${todayRevenue.toLocaleString()}`,color:'#16a34a'},{label:'ORDERS',val:cityOrders.length,color:'#1e293b'},{label:'VENDORS',val:cityVendors.length,color:'#4f46e5'}].map(s=>(
                <div key={s.label} style={{textAlign:'right'}}>
                  <div style={{fontSize:10,color:'#94a3b8',fontWeight:600}}>{s.label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:s.color}}>{s.val}</div>
                </div>
              ))}
              <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,fontWeight:700}}>{mgr[0]?.toUpperCase()||'M'}</div>
            </div>
          </div>
        )}

        {/* Mobile nav */}
        {!isDesktop&&(
          <div style={{display:'flex',background:'#111',overflowX:'auto',flexShrink:0}}>
            {NAV.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,padding:'11px 14px',fontSize:12,fontWeight:500,color:tab===t.id?'#6366f1':'#888',borderBottomWidth:2,borderBottomStyle:'solid',borderBottomColor:tab===t.id?'#6366f1':'transparent',borderTop:'none',borderLeft:'none',borderRight:'none',background:'transparent',cursor:'pointer',fontFamily:'Poppins',whiteSpace:'nowrap'}}>{t.icon} {t.label}{t.count>0?` (${t.count})`:''}</button>
            ))}
          </div>
        )}

        <div style={{flex:1,overflowY:'auto',padding:isDesktop?'24px 28px':14}}>

          {/* ══ OVERVIEW ══ */}
          {tab==='overview'&&(
            <div style={{maxWidth:isDesktop?960:'100%'}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#312e81)',borderRadius:14,padding:16,marginBottom:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:0.06}}>🧑‍💼</div>
                <div style={{fontSize:10,color:'#818cf8',fontWeight:700,letterSpacing:1.5,marginBottom:4,textTransform:'uppercase'}}>City Operations</div>
                <div style={{fontSize:20,fontWeight:800,color:'#fff',marginBottom:2}}>📍 {city}</div>
                {district!==city&&<div style={{fontSize:11,color:'#94a3b8'}}>District: {district}</div>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:isDesktop?'repeat(4,1fr)':'1fr 1fr',gap:10,marginBottom:16}}>
                {[{label:"Today's Orders",val:todayOrders.length,sub:`${liveOrders.length} live`,color:'#E24B4A',bg:'#fff5f5'},{label:"Revenue",val:`₹${todayRevenue.toLocaleString()}`,sub:'today delivered',color:'#16a34a',bg:'#f0fdf4'},{label:'Vendors',val:cityVendors.length,sub:`${openVendors} open`,color:'#4f46e5',bg:'#eff6ff'},{label:'Customers',val:cityCustomers.length,sub:'unique buyers',color:'#d97706',bg:'#fffbeb'}].map(s=>(
                  <div key={s.label} style={{background:s.bg,borderRadius:12,padding:12}}>
                    <div style={{fontSize:10,color:'#6b7280',marginBottom:4,fontWeight:500}}>{s.label}</div>
                    <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
                    <div style={{fontSize:10,color:'#9ca3af',marginTop:2}}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:isDesktop?'1fr 1fr':'1fr',gap:14}}>
                <div style={{background:'#fff',borderRadius:12,padding:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>⚡ Vendor Status</div>
                  {cityVendors.slice(0,8).map(v=>(
                    <div key={v.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottomWidth:1,borderBottomStyle:'solid',borderBottomColor:'#f3f4f6'}}>
                      <div style={{width:32,height:32,borderRadius:8,overflow:'hidden',background:'#f3f4f6',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {v.photo?<img src={v.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:14}}>🏪</span>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#1f2937',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.storeName}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{v.category}·{v.town||city}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:v.isOpen?'#16a34a':'#dc2626'}}>{v.isOpen?'🟢':'🔴'}</span>
                    </div>
                  ))}
                  {cityVendors.length===0&&<div style={{textAlign:'center',padding:'20px 0',color:'#9ca3af',fontSize:12}}>No vendors yet</div>}
                </div>
                <div style={{background:'#fff',borderRadius:12,padding:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>📦 Recent Orders</div>
                  {cityOrders.slice(0,6).map(o=>(
                    <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottomWidth:1,borderBottomStyle:'solid',borderBottomColor:'#f3f4f6'}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:'#1f2937'}}>{o.vendorName||'—'}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{o.userName}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#E24B4A'}}>₹{o.total}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{o.status}</div>
                      </div>
                    </div>
                  ))}
                  {cityOrders.length===0&&<div style={{textAlign:'center',padding:'20px 0',color:'#9ca3af',fontSize:12}}>No orders yet</div>}
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {tab==='orders'&&(
            <div style={{maxWidth:isDesktop?960:'100%'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
                {[{label:'Live',val:liveOrders.length,color:'#E24B4A'},{label:'Today',val:todayOrders.length,color:'#0369a1'},{label:'Delivered',val:cityOrders.filter(o=>o.status==='delivered').length,color:'#16a34a'},{label:'Revenue',val:`₹${todayRevenue}`,color:'#4f46e5'}].map(s=>(
                  <div key={s.label} style={{background:'#fff',borderRadius:10,padding:'10px 8px',textAlign:'center',borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.val}</div>
                    <div style={{fontSize:10,color:'#6b7280'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                {['all','pending','accepted','preparing','ready','out_for_delivery','delivered','cancelled'].map(f=>(
                  <button key={f} onClick={()=>setOrderFilter(f)} style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontFamily:'Poppins',fontSize:11,fontWeight:600,background:orderFilter===f?'#4f46e5':'#f3f4f6',color:orderFilter===f?'#fff':'#6b7280'}}>{f==='out_for_delivery'?'On the Way':f.charAt(0).toUpperCase()+f.slice(1)}</button>
                ))}
              </div>
              {filteredOrders.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:'#9ca3af'}}><div style={{fontSize:36}}>📦</div><div style={{marginTop:8,fontSize:13,fontWeight:600}}>No orders</div></div>}
              <div style={{display:isDesktop?'grid':'block',gridTemplateColumns:isDesktop?'repeat(auto-fill,minmax(320px,1fr))':'none',gap:12}}>
                {filteredOrders.slice(0,50).map(o=>{
                  const sc={pending:'#f59e0b',accepted:'#3b82f6',preparing:'#8b5cf6',ready:'#10b981',out_for_delivery:'#0ea5e9',delivered:'#16a34a',cancelled:'#ef4444'}
                  return(
                    <div key={o.id} style={{background:'#fff',borderRadius:12,padding:12,marginBottom:isDesktop?0:10,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:'#1f2937'}}>#{o.id.slice(-6).toUpperCase()}</div>
                          <div style={{fontSize:11,color:'#6b7280',marginTop:2}}>{o.vendorName}·{o.userName}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:14,fontWeight:800,color:'#E24B4A'}}>₹{o.total}</div>
                          <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,background:(sc[o.status]||'#9ca3af')+'22',color:sc[o.status]||'#9ca3af'}}>{o.status?.replace(/_/g,' ').toUpperCase()}</span>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>{o.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ VENDORS ══ */}
          {tab==='vendors'&&(
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1f2937'}}>🏪 {cityVendors.length} Vendors in {city}</div>
                <button onClick={()=>setTab('addvendor')} style={{background:'#4f46e5',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Poppins'}}>+ Add</button>
              </div>
              {cityVendors.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:'#9ca3af'}}><div style={{fontSize:36}}>🏪</div><div style={{marginTop:8,fontSize:13,fontWeight:600}}>No vendors yet in {city}</div></div>}
              <div style={{display:isDesktop?'grid':'block',gridTemplateColumns:isDesktop?'repeat(auto-fill,minmax(300px,1fr))':'none',gap:14}}>
                {cityVendors.map(v=>{
                  const daysLeft=getSubDaysLeft(v)
                  const subActive=v.subscriptionStatus==='active'&&daysLeft!==null&&daysLeft>0
                  return(
                    <div key={v.id} style={{background:'#fff',borderRadius:12,marginBottom:isDesktop?0:12,overflow:'hidden',borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                      <div style={{height:80,background:'#0f172a',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {v.photo?<img src={v.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:28}}>🏪</span>}
                        <div style={{position:'absolute',top:8,left:8,background:v.isOpen?'#16a34a':'#dc2626',color:'#fff',fontSize:10,padding:'3px 8px',borderRadius:20,fontWeight:600}}>{v.isOpen?'● Open':'● Closed'}</div>
                        <div style={{position:'absolute',top:8,right:8,background:subActive?'rgba(74,222,128,0.2)':'rgba(239,68,68,0.2)',color:subActive?'#4ade80':'#f87171',fontSize:9,padding:'2px 8px',borderRadius:20,fontWeight:700,border:`1px solid ${subActive?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.4)'}`}}>{subActive?`✅ ${daysLeft}d`:'⚠️ Due'}</div>
                      </div>
                      <div style={{padding:12}}>
                        <div style={{fontSize:14,fontWeight:700,color:'#1f2937',marginBottom:2}}>{v.storeName}</div>
                        <div style={{fontSize:11,color:'#9ca3af',marginBottom:10}}>{v.email}·{v.phone||'—'}</div>
                        <div style={{display:'flex',gap:8,marginBottom:8}}>
                          <button onClick={()=>handleToggleVendor(v.id,v.isOpen)} style={{flex:1,background:v.isOpen?'#fff5f5':'#f0fdf4',color:v.isOpen?'#dc2626':'#16a34a',border:`1px solid ${v.isOpen?'#fecaca':'#bbf7d0'}`,borderRadius:8,padding:'7px 0',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Poppins'}}>{v.isOpen?'🔴 Close':'🟢 Open'}</button>
                          <div style={{fontSize:11,color:'#6b7280',display:'flex',alignItems:'center'}}>₹{v.subscriptionFee||'—'}/mo</div>
                        </div>
                        {/* Delete request button */}
                        {(() => {
                          const req = deleteRequests.find(r => r.vendorId === v.id)
                          if (req?.status === 'approved') {
                            return <div style={{background:'#dcfce7',borderRadius:8,padding:'6px 10px',fontSize:11,fontWeight:600,color:'#15803d',textAlign:'center'}}>✅ Founder approved deletion</div>
                          }
                          if (req?.status === 'pending') {
                            return <div style={{background:'#fef3c7',borderRadius:8,padding:'6px 10px',fontSize:11,fontWeight:600,color:'#92400e',textAlign:'center'}}>⏳ Delete request pending founder approval</div>
                          }
                          if (req?.status === 'denied') {
                            return <div style={{background:'#fee2e2',borderRadius:8,padding:'6px 10px',fontSize:11,fontWeight:600,color:'#991b1b',textAlign:'center'}}>❌ Founder denied delete request</div>
                          }
                          return (
                            <button
                              onClick={()=>handleRequestVendorDelete(v.id,v.storeName)}
                              disabled={requestingDelete===v.id}
                              style={{width:'100%',background:'#fff5f5',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,padding:'7px 0',fontSize:11,fontWeight:700,cursor:requestingDelete===v.id?'not-allowed':'pointer',fontFamily:'Poppins'}}
                            >
                              {requestingDelete===v.id?'⏳ Sending...':'🗑️ Request Delete (needs founder approval)'}
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ══ CUSTOMERS ══ */}
          {tab==='customers'&&(
            <div style={{maxWidth:isDesktop?960:'100%'}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:14,padding:14,marginBottom:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:-10,top:-10,fontSize:60,opacity:0.07}}>👥</div>
                <div style={{fontSize:10,color:'#818cf8',fontWeight:700,letterSpacing:1.5,marginBottom:4,textTransform:'uppercase'}}>Regional Customers</div>
                <div style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:4}}>👥 {city} Customers</div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  {[{val:cityCustomers.length,label:'Total',color:'#fff'},{val:cityCustomers.filter(c=>c.delivered>=2).length,label:'Repeat',color:'#4ade80'},{val:cityCustomers.filter(c=>c.lastOrder&&c.lastOrder>thirtyAgo).length,label:'Active 30d',color:'#60a5fa'}].map(s=>(
                    <div key={s.label} style={{background:'rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 12px',textAlign:'center',flex:1}}>
                      <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.val}</div>
                      <div style={{fontSize:10,color:'#94a3b8'}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <input style={{...inp,marginTop:0,background:'#fff'}} placeholder="Search by name, phone or email..." value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)}/>
              </div>
              {filteredCustomers.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:'#9ca3af'}}><div style={{fontSize:36}}>👥</div><div style={{marginTop:8,fontSize:13,fontWeight:600}}>No customers found</div></div>}
              <div style={{display:isDesktop?'grid':'block',gridTemplateColumns:isDesktop?'repeat(auto-fill,minmax(280px,1fr))':'none',gap:12}}>
                {filteredCustomers.sort((a,b)=>b.orders.length-a.orders.length).slice(0,60).map(c=>(
                  <div key={c.id} style={{background:'#fff',borderRadius:12,padding:14,marginBottom:isDesktop?0:10,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,fontWeight:700,flexShrink:0}}>{c.name?.[0]?.toUpperCase()||'U'}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#1f2937',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{c.phone||c.email||'—'}</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,textAlign:'center'}}>
                      {[{label:'Orders',val:c.orders.length,color:'#4f46e5'},{label:'Delivered',val:c.delivered,color:'#16a34a'},{label:'Spent',val:`₹${c.totalSpent}`,color:'#E24B4A'}].map(s=>(
                        <div key={s.label} style={{background:'#f8fafc',borderRadius:8,padding:'6px 4px'}}>
                          <div style={{fontSize:14,fontWeight:700,color:s.color}}>{s.val}</div>
                          <div style={{fontSize:9,color:'#9ca3af'}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {c.lastOrder&&<div style={{fontSize:10,color:'#9ca3af',marginTop:8}}>Last order: {c.lastOrder.toLocaleDateString('en-IN')}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SUBSCRIPTIONS ══ */}
          {tab==='subscription'&&(
            <div style={{maxWidth:isDesktop?900:'100%'}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:14,padding:16,marginBottom:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:-10,top:-10,fontSize:60,opacity:0.06}}>💳</div>
                <div style={{fontSize:10,color:'#818cf8',fontWeight:700,letterSpacing:1.5,marginBottom:4,textTransform:'uppercase'}}>City Subscriptions</div>
                <div style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:12}}>💳 {city} Vendor Subscriptions</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                  {[{val:cityVendors.filter(v=>v.subscriptionStatus==='active'&&getSubDaysLeft(v)>0).length,label:'Active',color:'#4ade80'},{val:cityVendors.filter(v=>v.subscriptionStatus!=='active'||!v.subscriptionDueDate||getSubDaysLeft(v)<=0).length,label:'Due/Expired',color:'#f87171'},{val:cityVendors.filter(v=>{const d=getSubDaysLeft(v);return d!==null&&d<=2&&d>0}).length,label:'Expiring≤2d',color:'#fbbf24'}].map(s=>(
                    <div key={s.label} style={{background:'rgba(255,255,255,0.08)',borderRadius:8,padding:'10px 8px',textAlign:'center'}}>
                      <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
                      <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:'#fff',borderRadius:12,padding:14,marginBottom:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:8}}>🌐 Set Same Fee for All {city} Vendors</div>
                <div style={{display:'flex',gap:8}}>
                  <div style={{position:'relative',flex:1}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:13,fontWeight:700,color:'#E24B4A'}}>₹</span>
                    <input type="number" placeholder="e.g. 149" value={subFeeInput} onChange={e=>setSubFeeInput(e.target.value)} style={{width:'100%',padding:'11px 12px 11px 28px',borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb',borderRadius:9,fontSize:14,fontFamily:'Poppins',outline:'none',boxSizing:'border-box'}}/>
                  </div>
                  <button onClick={handleSaveSubFee} disabled={savingSubFee} style={{background:savingSubFee?'#e5e7eb':'#4f46e5',color:savingSubFee?'#9ca3af':'#fff',border:'none',borderRadius:9,padding:'11px 18px',fontSize:13,fontWeight:700,cursor:savingSubFee?'not-allowed':'pointer',fontFamily:'Poppins',whiteSpace:'nowrap'}}>{savingSubFee?'⏳':'✅ Set Fee'}</button>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>🏪 Individual Vendor Control</div>
              {cityVendors.map(v=>{
                const daysLeft=getSubDaysLeft(v)
                const isActive=v.subscriptionStatus==='active'&&daysLeft!==null&&daysLeft>0
                const isGrace=isActive&&daysLeft<=2
                const isDue=!isActive
                const dueDate=v.subscriptionDueDate?.toDate?.()
                return(
                  <div key={v.id} style={{background:'#fff',borderRadius:12,marginBottom:12,overflow:'hidden',borderWidth:1.5,borderStyle:'solid',borderColor:isDue?'#fecaca':isGrace?'#fde68a':'#bbf7d0'}}>
                    <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomStyle:'solid',borderBottomColor:'#f3f4f6'}}>
                      <div style={{width:38,height:38,borderRadius:9,overflow:'hidden',background:'#f3f4f6',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{v.photo?<img src={v.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:18}}>🏪</span>}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#1f2937',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.storeName}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{v.email}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <span style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,background:isDue?'#fee2e2':isGrace?'#fef3c7':'#dcfce7',color:isDue?'#991b1b':isGrace?'#92400e':'#065f46'}}>{isDue?'🔴 DUE':isGrace?`⚠️ ${daysLeft}d`:`🟢 ${daysLeft}d`}</span>
                        <div style={{fontSize:12,fontWeight:800,color:'#E24B4A',marginTop:3}}>₹{v.subscriptionFee||'—'}/mo</div>
                      </div>
                    </div>
                    <div style={{padding:'10px 14px'}}>
                      {dueDate&&<div style={{fontSize:10,color:'#6b7280',marginBottom:8}}>Due: {dueDate.toLocaleDateString('en-IN')}</div>}
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>handleActivateVendor(v.id,v.storeName)} disabled={activatingVendor===v.id} style={{flex:1,padding:'8px 0',background:activatingVendor===v.id?'#e5e7eb':'#16a34a',color:activatingVendor===v.id?'#9ca3af':'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:700,cursor:activatingVendor===v.id?'not-allowed':'pointer',fontFamily:'Poppins'}}>{activatingVendor===v.id?'⏳':'✅ Activate +30d'}</button>
                        {isActive&&<button onClick={()=>handleDeactivateVendor(v.id,v.storeName)} disabled={activatingVendor===v.id} style={{flex:1,padding:'8px 0',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Poppins'}}>🔴 Deactivate</button>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab==='analytics'&&(
            <div style={{maxWidth:isDesktop?1000:'100%'}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#312e81)',borderRadius:14,padding:16,marginBottom:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:-10,top:-10,fontSize:60,opacity:0.06}}>📈</div>
                <div style={{fontSize:10,color:'#818cf8',fontWeight:700,letterSpacing:1.5,marginBottom:4,textTransform:'uppercase'}}>City Analytics</div>
                <div style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:12}}>📈 {city} Performance</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['all','today','week','month'].map(f=>(
                    <button key={f} onClick={()=>setAnalyticsFilter(f)} style={{padding:'5px 14px',borderRadius:20,border:'none',cursor:'pointer',fontFamily:'Poppins',fontSize:11,fontWeight:600,background:analyticsFilter===f?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.08)',color:'#fff'}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
                  ))}
                </div>
              </div>

              {(() => {
                const filtered = cityOrders.filter(o => {
                  if(analyticsFilter==='all') return true
                  const d=o.createdAt?.toDate?.()
                  if(!d) return false
                  const n=new Date()
                  if(analyticsFilter==='today') return d.getDate()===n.getDate()&&d.getMonth()===n.getMonth()
                  if(analyticsFilter==='week') return d>=new Date(Date.now()-7*86400000)
                  if(analyticsFilter==='month') return d>=new Date(Date.now()-30*86400000)
                  return true
                })
                const delivered=filtered.filter(o=>o.status==='delivered')
                const totalRev=delivered.reduce((s,o)=>s+(o.total||0),0)
                const cancelled=filtered.filter(o=>o.status==='cancelled')
                const vendorOrderCount={}
                filtered.forEach(o=>{ vendorOrderCount[o.vendorName]=(vendorOrderCount[o.vendorName]||0)+1 })
                const topVendors=Object.entries(vendorOrderCount).sort((a,b)=>b[1]-a[1]).slice(0,5)
                const itemCount={}
                filtered.forEach(o=>o.items?.forEach(i=>{ itemCount[i.name]=(itemCount[i.name]||0)+i.qty }))
                const topItems=Object.entries(itemCount).sort((a,b)=>b[1]-a[1]).slice(0,5)

                return(
                  <>
                    <div style={{display:'grid',gridTemplateColumns:isDesktop?'repeat(4,1fr)':'1fr 1fr',gap:10,marginBottom:16}}>
                      {[{label:'Total Orders',val:filtered.length,color:'#4f46e5',bg:'#eff6ff'},{label:'Delivered',val:delivered.length,color:'#16a34a',bg:'#f0fdf4'},{label:'Revenue',val:`₹${totalRev.toLocaleString()}`,color:'#E24B4A',bg:'#fff5f5'},{label:'Cancelled',val:cancelled.length,color:'#f59e0b',bg:'#fffbeb'}].map(s=>(
                        <div key={s.label} style={{background:s.bg,borderRadius:12,padding:12}}>
                          <div style={{fontSize:10,color:'#6b7280',marginBottom:4}}>{s.label}</div>
                          <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:isDesktop?'1fr 1fr 1fr':'1fr',gap:14,marginBottom:16}}>
                      <div style={{background:'#fff',borderRadius:12,padding:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>🏪 Top Vendors</div>
                        {topVendors.map(([name,count])=>(
                          <div key={name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottomWidth:1,borderBottomStyle:'solid',borderBottomColor:'#f3f4f6'}}>
                            <span style={{fontSize:12,color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'70%'}}>{name}</span>
                            <span style={{fontSize:12,fontWeight:700,color:'#4f46e5'}}>{count} orders</span>
                          </div>
                        ))}
                        {topVendors.length===0&&<div style={{fontSize:12,color:'#9ca3af',textAlign:'center',padding:'12px 0'}}>No data</div>}
                      </div>
                      <div style={{background:'#fff',borderRadius:12,padding:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>🍽️ Top Items</div>
                        {topItems.map(([name,qty])=>(
                          <div key={name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottomWidth:1,borderBottomStyle:'solid',borderBottomColor:'#f3f4f6'}}>
                            <span style={{fontSize:12,color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'70%'}}>{name}</span>
                            <span style={{fontSize:12,fontWeight:700,color:'#E24B4A'}}>{qty}x sold</span>
                          </div>
                        ))}
                        {topItems.length===0&&<div style={{fontSize:12,color:'#9ca3af',textAlign:'center',padding:'12px 0'}}>No data</div>}
                      </div>
                      <div style={{background:'#fff',borderRadius:12,padding:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>👥 Customer Stats</div>
                        {[{label:'Total Customers',val:cityCustomers.length},{label:'Repeat Buyers',val:cityCustomers.filter(c=>c.delivered>=2).length},{label:'Active (30d)',val:cityCustomers.filter(c=>c.lastOrder&&c.lastOrder>thirtyAgo).length},{label:'Avg Order Value',val:`₹${filtered.length?Math.round(totalRev/(delivered.length||1)):0}`},{label:'Subscriptions Active',val:cityVendors.filter(v=>v.subscriptionStatus==='active'&&getSubDaysLeft(v)>0).length}].map(s=>(
                          <div key={s.label} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottomWidth:1,borderBottomStyle:'solid',borderBottomColor:'#f3f4f6'}}>
                            <span style={{fontSize:11,color:'#6b7280'}}>{s.label}</span>
                            <span style={{fontSize:12,fontWeight:700,color:'#1f2937'}}>{s.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{background:'#fff',borderRadius:12,padding:14,borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>🏪 Vendor Performance</div>
                      <div style={{display:isDesktop?'grid':'block',gridTemplateColumns:isDesktop?'repeat(auto-fill,minmax(220px,1fr))':'none',gap:10}}>
                        {cityVendors.map(v=>{
                          const vOrders=filtered.filter(o=>o.vendorUid===v.id)
                          const vDelivered=vOrders.filter(o=>o.status==='delivered')
                          const vRev=vDelivered.reduce((s,o)=>s+(o.total||0),0)
                          return(
                            <div key={v.id} style={{background:'#f8fafc',borderRadius:10,padding:'10px 12px',marginBottom:isDesktop?0:8}}>
                              <div style={{fontSize:12,fontWeight:700,color:'#1f2937',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.storeName}</div>
                              <div style={{display:'flex',gap:8}}>
                                <div style={{flex:1,textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#4f46e5'}}>{vOrders.length}</div><div style={{fontSize:9,color:'#9ca3af'}}>Orders</div></div>
                                <div style={{flex:1,textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#16a34a'}}>₹{vRev}</div><div style={{fontSize:9,color:'#9ca3af'}}>Revenue</div></div>
                                <div style={{flex:1,textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:v.isOpen?'#16a34a':'#dc2626'}}>{v.isOpen?'🟢':'🔴'}</div><div style={{fontSize:9,color:'#9ca3af'}}>Status</div></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          {/* ══ ADD VENDOR ══ */}
          {tab==='addvendor'&&(
            <div style={{maxWidth:isDesktop?640:'100%',margin:isDesktop?'0 auto':0,display:'flex',flexDirection:'column',gap:10}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:12,padding:14,marginBottom:6}}>
                <div style={{fontSize:14,fontWeight:800,color:'#fff',marginBottom:2}}>➕ Add New Vendor</div>
                <div style={{fontSize:11,color:'#94a3b8'}}>Adding to: 📍 {city}</div>
              </div>
              <div>
                <label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Store Photo (optional)</label>
                <div onClick={()=>photoRef.current?.click()} style={{marginTop:6,borderWidth:2,borderStyle:'dashed',borderColor:'#e5e7eb',borderRadius:10,overflow:'hidden',cursor:'pointer',height:100,display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa'}}>
                  {vendorPhotoPreview?<img src={vendorPhotoPreview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{textAlign:'center'}}><div style={{fontSize:24}}>🏪</div><div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Tap to add photo</div></div>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const fi=e.target.files[0];if(fi){setVendorPhotoFile(fi);setVendorPhotoPreview(URL.createObjectURL(fi))}}}/>
              </div>
              <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Store Name *</label><input style={inp} placeholder="e.g. Shree Ganesh Hotel" {...f('storeName')}/></div>
              <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Email *</label><input style={inp} type="email" placeholder="vendor@email.com" {...f('email')}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Password *</label><input style={inp} type="password" placeholder="Min 6 chars" {...f('password')}/></div>
                <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Confirm *</label><input style={inp} type="password" placeholder="Repeat" {...f('confirmPass')}/></div>
              </div>
              <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Phone</label><input style={inp} placeholder="+91 98765 43210" {...f('phone')}/></div>
              <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Address</label><input style={inp} placeholder="Full address" {...f('address')}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Category</label>
                  <select style={{...inp,cursor:'pointer'}} {...f('category')}>
                    {['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice','Fast Food','South Indian'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Delivery (₹)</label><input style={inp} type="number" placeholder="30" {...f('deliveryCharge')}/></div>
              </div>
              <div>
                <label style={{fontSize:12,color:'#6b7280',fontWeight:500}}>Town / Taluka *</label>
                <input style={inp} placeholder={`e.g. ${city}`} {...f('town')}/>
                {talukas.length>0&&(
                  <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:11,color:'#9ca3af'}}>Quick:</span>
                    {[city,...talukas].map(t=><button key={t} type="button" onClick={()=>setVendorForm(p=>({...p,town:t}))} style={{fontSize:11,padding:'2px 8px',borderRadius:10,border:'none',background:vendorForm.town===t?'#4f46e5':'#f3f4f6',color:vendorForm.town===t?'#fff':'#374151',cursor:'pointer',fontFamily:'Poppins'}}>{t}</button>)}
                  </div>
                )}
              </div>
              {creatingVendor&&photoProgress>0&&(
                <div><div style={{fontSize:11,color:'#6b7280',marginBottom:4}}>Uploading photo... {photoProgress}%</div><div style={{background:'#f3f4f6',borderRadius:8,height:6}}><div style={{height:'100%',background:'#4f46e5',width:`${photoProgress}%`,borderRadius:8}}/></div></div>
              )}
              <button onClick={handleCreateVendor} disabled={creatingVendor} style={{background:creatingVendor?'#e5e7eb':'linear-gradient(135deg,#4f46e5,#7c3aed)',color:creatingVendor?'#9ca3af':'#fff',border:'none',padding:13,borderRadius:10,fontSize:14,fontWeight:700,cursor:creatingVendor?'not-allowed':'pointer',fontFamily:'Poppins',marginTop:4,boxShadow:creatingVendor?'none':'0 4px 16px rgba(79,70,229,0.35)'}}>
                {creatingVendor?'Creating...':'✅ Add Vendor to '+city}
              </button>
              <div style={{background:'#f0fdf4',borderRadius:10,padding:'10px 14px',fontSize:11,color:'#166534'}}>
                💡 This vendor will appear for customers in {city}. Share the email &amp; password with the vendor owner.
              </div>
            </div>
          )}

          {/* ══ SUPPORT ══ */}
          {tab==='support'&&(
            <div style={{maxWidth:isDesktop?800:'100%'}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:14,padding:14,marginBottom:14,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:-10,top:-10,fontSize:60,opacity:0.07}}>💬</div>
                <div style={{fontSize:10,color:'#818cf8',fontWeight:700,letterSpacing:1.5,marginBottom:4,textTransform:'uppercase'}}>City Support</div>
                <div style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:4}}>💬 {city} Support Tickets</div>
                <div style={{fontSize:11,color:'#94a3b8'}}>Only showing tickets from customers in {city}</div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:'#1f2937',marginBottom:10}}>
                {cityTickets.filter(t=>t.status==='open').length} open · {cityTickets.length} total in {city}
              </div>
              {cityTickets.length===0&&(
                <div style={{textAlign:'center',padding:'40px 0',color:'#9ca3af'}}>
                  <div style={{fontSize:36}}>💬</div>
                  <div style={{marginTop:8,fontSize:13,fontWeight:600}}>No support tickets from {city} yet</div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Tickets appear here when {city} customers send queries</div>
                </div>
              )}
              {cityTickets.map(ticket=>(
                <div key={ticket.id} style={{background:'#fff',borderRadius:12,padding:14,marginBottom:10,borderWidth:1,borderStyle:'solid',borderColor:ticket.status==='open'?'#fecaca':'#e5e7eb'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#1f2937'}}>{ticket.subject||ticket.message?.slice(0,40)||'Support Request'}</div>
                      <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{ticket.userName||ticket.userEmail||'Customer'}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:ticket.status==='open'?'#fee2e2':'#dcfce7',color:ticket.status==='open'?'#991b1b':'#065f46',flexShrink:0}}>{ticket.status==='open'?'🔴 Open':'✅ Replied'}</span>
                  </div>
                  <div style={{fontSize:12,color:'#374151',marginBottom:10,lineHeight:1.5}}>{ticket.message}</div>
                  {ticket.managerReply&&(
                    <div style={{background:'#f0fdf4',borderRadius:8,padding:'8px 12px',marginBottom:8,borderWidth:1,borderStyle:'solid',borderColor:'#bbf7d0'}}>
                      <div style={{fontSize:10,fontWeight:700,color:'#166534',marginBottom:2}}>Your Reply:</div>
                      <div style={{fontSize:11,color:'#15803d'}}>{ticket.managerReply}</div>
                    </div>
                  )}
                  {selectedTicket===ticket.id?(
                    <div>
                      <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply..." rows={3} style={{width:'100%',padding:'10px 12px',borderWidth:1,borderStyle:'solid',borderColor:'#e5e7eb',borderRadius:8,fontSize:12,fontFamily:'Poppins',outline:'none',resize:'none',boxSizing:'border-box',marginBottom:8}}/>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>handleReplyTicket(ticket.id)} disabled={sendingReply} style={{flex:2,background:sendingReply?'#e5e7eb':'#16a34a',color:'#fff',border:'none',borderRadius:8,padding:'9px 0',fontSize:12,fontWeight:700,cursor:sendingReply?'not-allowed':'pointer',fontFamily:'Poppins'}}>{sendingReply?'Sending...':'✅ Send Reply'}</button>
                        <button onClick={()=>{setSelectedTicket(null);setReplyText('')}} style={{flex:1,background:'#f3f4f6',color:'#374151',border:'none',borderRadius:8,padding:'9px 0',fontSize:12,cursor:'pointer',fontFamily:'Poppins'}}>Cancel</button>
                      </div>
                    </div>
                  ):(
                    <button onClick={()=>setSelectedTicket(ticket.id)} style={{width:'100%',background:'#f0f9ff',color:'#0369a1',border:'1px solid #bae6fd',borderRadius:8,padding:'8px 0',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Poppins'}}>
                      💬 {ticket.managerReply?'Update Reply':'Reply to Customer'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
