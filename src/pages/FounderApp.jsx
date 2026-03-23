import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, getAllOrders, getAllVendors, founderCreateVendor, uploadPhoto, updateVendorStore } from '../firebase/services'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function FounderApp() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    storeName:'', email:'', phone:'', password:'',
    confirmPass:'', address:'', category:'Thali', plan:'₹500/month', deliveryCharge:'30'
  })
  const [selectedOrder, setSelectedOrder] = useState(null) // order details modal
  const [analyticsTab, setAnalyticsTab] = useState('items') // most ordered

  // Excel export states
  const [exportMonth, setExportMonth] = useState(new Date().getMonth())
  const [exportYear, setExportYear] = useState(new Date().getFullYear())
  const [exportType, setExportType] = useState('all') // all, vendor, monthly

  // Photo states
  const [vendorPhotoFile, setVendorPhotoFile] = useState(null)
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState(null)
  const [photoProgress, setPhotoProgress] = useState(0)
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState(null) // vendorId
  const [existingProgress, setExistingProgress] = useState(0)

  const photoRef = useRef()
  const existingPhotoRef = useRef()

  // Location for new vendor
  const [newVendorLoc, setNewVendorLoc] = useState(null)
  const [newVendorLocName, setNewVendorLocName] = useState('')
  const [locSearch, setLocSearch] = useState('')
  const [locSuggestions, setLocSuggestions] = useState([])
  const [searchingLoc, setSearchingLoc] = useState(false)
  const [detectingLoc, setDetectingLoc] = useState(false)

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

  // ── Location helpers ──────────────────────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || "Location"
    } catch { return "Location" }
  }

  const handleDetectVendorLoc = async () => {
    setDetectingLoc(true)
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout:10000 }))
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const name = await reverseGeocode(lat, lng)
      setNewVendorLoc({ lat, lng })
      setNewVendorLocName(name)
      toast.success(`📍 ${name}`)
    } catch { toast.error("Could not detect location") }
    setDetectingLoc(false)
  }

  const handleLocSearch = async (q) => {
    setLocSearch(q)
    if (q.length < 3) { setLocSuggestions([]); return }
    setSearchingLoc(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocSuggestions(data.map(d => ({ name: d.display_name.split(",").slice(0,3).join(", "), lat: parseFloat(d.lat), lng: parseFloat(d.lon) })))
    } catch { setLocSuggestions([]) }
    setSearchingLoc(false)
  }

  const handleSelectVendorLoc = (s) => {
    setNewVendorLoc({ lat: s.lat, lng: s.lng })
    setNewVendorLocName(s.name.split(",")[0])
    setLocSearch("")
    setLocSuggestions([])
    toast.success(`📍 ${s.name.split(",")[0]}`)
  }

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
      const vendorUid = await founderCreateVendor(user.uid, { email, password, storeName, address, phone, plan, category, location: newVendorLoc, locationName: newVendorLocName, deliveryCharge: Number(form.deliveryCharge) || 30 })

      // Step 2: Upload photo if selected
      if (vendorPhotoFile && vendorUid) {
        setPhotoProgress(0)
        const photoUrl = await uploadPhoto(vendorPhotoFile, setPhotoProgress)
        await updateVendorStore(vendorUid, { photo: photoUrl })
      }

      toast.success(`✅ Vendor "${storeName}" created!`)
      setForm({ storeName:'', email:'', phone:'', password:'', confirmPass:'', address:'', category:'Thali', plan:'₹500/month', deliveryCharge:'30' })
      setVendorPhotoFile(null)
      setVendorPhotoPreview(null)
      setPhotoProgress(0)
      setNewVendorLoc(null)
      setNewVendorLocName('')
      setLocSearch('')
      setLocSuggestions([])
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

  // ── EXCEL EXPORT ─────────────────────────────────────────────────────────
  const exportToExcel = (type) => {
    let data = []
    let filename = ''

    const formatDate = (o) => o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || ''
    const formatTime = (o) => o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) || ''

    if (type === 'monthly') {
      // Filter by selected month/year
      data = orders.filter(o => {
        const d = o.createdAt?.toDate?.()
        return d && d.getMonth() === exportMonth && d.getFullYear() === exportYear
      })
      const monthName = new Date(exportYear, exportMonth).toLocaleString('en-IN', { month:'long' })
      filename = `FeedoZone_Orders_${monthName}_${exportYear}.csv`
    } else if (type === 'today') {
      const today = new Date()
      data = orders.filter(o => {
        const d = o.createdAt?.toDate?.()
        return d && d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear()
      })
      filename = `FeedoZone_Orders_Today_${today.toLocaleDateString('en-IN').replace(/\//g,'-')}.csv`
    } else {
      data = [...orders]
      filename = `FeedoZone_All_Orders.csv`
    }

    if (data.length === 0) return toast.error('No orders found for selected period!')

    // Build CSV
    const headers = ['Order Date', 'Order Time', 'Customer Name', 'Customer Phone', 'Vendor', 'Items', 'Subtotal', 'Delivery Fee', 'Total', 'Payment', 'Status', 'Address']
    
    const rows = data.map(o => [
      formatDate(o),
      formatTime(o),
      o.userName || '',
      o.userPhone || '',
      o.vendorName || '',
      o.items?.map(i => i.qty + 'x ' + i.name).join(' | ') || '',
      o.subtotal || '',
      o.deliveryFee || '',
      o.total || '',
      o.paymentMode || 'COD',
      o.status || '',
      (o.address || '').replace(/,/g, ';')
    ])

    // Add summary row
    const totalRevenue = data.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0)
    rows.push([])
    rows.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Total Orders', data.length, '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Delivered', data.filter(o=>o.status==='delivered').length, '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Cancelled', data.filter(o=>o.status==='cancelled').length, '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Total Revenue (Delivered)', '', '', '', '', '', '', '', '₹' + totalRevenue, '', '', ''])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
      .join('\n')

    // Download
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`✅ Downloaded: ${filename}`)
  }

  // Vendor-wise export
  const exportVendorWise = () => {
    if (vendors.length === 0) return toast.error('No vendors found!')

    const rows = [['Vendor Name', 'Email', 'Phone', 'Category', 'Plan', 'Total Orders', 'Delivered Orders', 'Total Revenue', 'Status']]

    vendors.forEach(v => {
      const vOrders = orders.filter(o => o.vendorUid === v.id)
      const delivered = vOrders.filter(o => o.status === 'delivered')
      const revenue = delivered.reduce((s,o) => s+(o.total||0), 0)
      rows.push([
        v.storeName || '',
        v.email || '',
        v.phone || '',
        v.category || '',
        v.plan || '',
        vOrders.length,
        delivered.length,
        '₹' + revenue,
        v.isOpen ? 'Open' : 'Closed'
      ])
    })

    const csvContent = rows
      .map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'FeedoZone_Vendor_Report.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('✅ Vendor report downloaded!')
  }

  // ── DELETE VENDOR ────────────────────────────────────────────────────────
  const handleDeleteVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Delete "${vendorName}"? This cannot be undone!`)) return
    try {
      await deleteDoc(doc(db, 'vendors', vendorId))
      await deleteDoc(doc(db, 'users', vendorId))
      toast.success(`"${vendorName}" deleted!`)
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    }
  }

  // ── MOST ORDERED ITEMS ────────────────────────────────────────────────────
  const getMostOrdered = () => {
    const counts = {}
    orders.forEach(o => {
      o.items?.forEach(item => {
        const key = item.name
        counts[key] = (counts[key] || 0) + item.qty
      })
    })
    return Object.entries(counts)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 10)
      .map(([name, qty]) => ({ name, qty }))
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
          { id:'addvendor', label:'+ Add Vendor' },
          { id:'analytics', label:'📊 Analytics' }
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

            {/* ── EXCEL EXPORT SECTION ── */}
            <div style={{ marginTop:16, background:'#f9fafb', borderRadius:12, padding:14, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>📊</span>
                <div style={{ fontSize:13, fontWeight:700, color:'#1f2937' }}>Export to Excel</div>
                <span style={{ fontSize:10, background:'#dcfce7', color:'#166534', padding:'2px 8px', borderRadius:10, fontWeight:600 }}>CSV / Excel</span>
              </div>

              {/* Quick export buttons */}
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                <button
                  onClick={() => exportToExcel('today')}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}
                >
                  <span style={{ fontSize:18 }}>📅</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1f2937' }}>Today's Orders</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{todayOrders.length} orders · ₹{todayRevenue} revenue</div>
                  </div>
                  <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>↓ Download</span>
                </button>

                <button
                  onClick={() => exportToExcel('all')}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}
                >
                  <span style={{ fontSize:18 }}>📦</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1f2937' }}>All Orders</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{orders.length} total orders</div>
                  </div>
                  <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>↓ Download</span>
                </button>

                <button
                  onClick={exportVendorWise}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}
                >
                  <span style={{ fontSize:18 }}>🏪</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1f2937' }}>Vendor-wise Report</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{vendors.length} vendors · orders + revenue</div>
                  </div>
                  <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>↓ Download</span>
                </button>
              </div>

              {/* Monthly export */}
              <div style={{ background:'#fff', borderRadius:10, padding:12, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>📆 Monthly Export</div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <select
                    value={exportMonth}
                    onChange={e => setExportMonth(Number(e.target.value))}
                    style={{ flex:1, padding:'9px 10px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:12, fontFamily:'Poppins', outline:'none', background:'#fff' }}
                  >
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={exportYear}
                    onChange={e => setExportYear(Number(e.target.value))}
                    style={{ width:90, padding:'9px 10px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:12, fontFamily:'Poppins', outline:'none', background:'#fff' }}
                  >
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:8 }}>
                  {orders.filter(o => {
                    const d = o.createdAt?.toDate?.()
                    return d && d.getMonth() === exportMonth && d.getFullYear() === exportYear
                  }).length} orders in {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][exportMonth]} {exportYear}
                </div>
                <button
                  onClick={() => exportToExcel('monthly')}
                  style={{ width:'100%', background:'#16a34a', color:'#fff', border:'none', padding:'10px 0', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                >
                  📊 Download Monthly Report
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <>
            {/* Order detail modal */}
            {selectedOrder && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
                onClick={e => { if(e.target===e.currentTarget) setSelectedOrder(null) }}>
                <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:430, maxHeight:'80vh', overflowY:'auto' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <div style={{ fontSize:15, fontWeight:700 }}>Order Details</div>
                    <button onClick={() => setSelectedOrder(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>✕</button>
                  </div>
                  <div style={{ background:'#f9fafb', borderRadius:10, padding:12, marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>Customer</span>
                      <span style={{ fontSize:12, fontWeight:600 }}>{selectedOrder.userName}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>Phone</span>
                      <span style={{ fontSize:12, fontWeight:600 }}>{selectedOrder.userPhone || '—'}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>Vendor</span>
                      <span style={{ fontSize:12, fontWeight:600 }}>{selectedOrder.vendorName}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>Address</span>
                      <span style={{ fontSize:12, fontWeight:600, maxWidth:180, textAlign:'right' }}>{selectedOrder.address || '—'}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>Date</span>
                      <span style={{ fontSize:12 }}>{selectedOrder.createdAt?.toDate?.()?.toLocaleString('en-IN') || '—'}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>Status</span>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:8,
                        background: selectedOrder.status==='delivered'?'#d1fae5':selectedOrder.status==='cancelled'?'#fee2e2':'#fef3c7',
                        color: selectedOrder.status==='delivered'?'#065f46':selectedOrder.status==='cancelled'?'#991b1b':'#92400e'
                      }}>{selectedOrder.status?.replace('_',' ')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:8, textTransform:'uppercase' }}>Items Ordered</div>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                      <span style={{ fontSize:13 }}>{item.qty}x {item.name}</span>
                      <span style={{ fontSize:13, fontWeight:600 }}>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTopWidth:2, borderTopStyle:'solid', borderTopColor:'#e5e7eb' }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>Total</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>All orders · live · tap for details</div>
            {orders.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>No orders yet</div>}
            {orders.slice(0,50).map(o => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ display:'flex', gap:8, alignItems:'center', padding:'10px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', cursor:'pointer' }}>
                <div style={{ fontSize:11, color:'#9ca3af', minWidth:42 }}>
                  {o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})||'--'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{o.userName}</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>{o.vendorName} · {o.items?.length} item(s)</div>
                  {o.address && <div style={{ fontSize:10, color:'#9ca3af', marginTop:1 }}>📍 {o.address?.slice(0,35)}{o.address?.length>35?'...':''}</div>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>₹{o.total}</div>
                  <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:8,
                    background: o.status==='delivered'?'#d1fae5':o.status==='cancelled'?'#fee2e2':o.status==='preparing'?'#dbeafe':'#fef3c7',
                    color: o.status==='delivered'?'#065f46':o.status==='cancelled'?'#991b1b':o.status==='preparing'?'#1e40af':'#92400e'
                  }}>{o.status?.replace('_',' ')}</span>
                </div>
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
                <div style={{ fontSize:11, color:'#6b7280', marginBottom:8 }}>🚴 Delivery: {v.deliveryCharge === 0 ? 'Free' : ('₹' + (v.deliveryCharge ?? 30))} · 📞 {v.phone || '—'}</div>
                  <div style={{ display:'flex', gap:16, marginBottom:10 }}>
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
                  <button
                    onClick={() => handleDeleteVendor(v.id, v.storeName)}
                    style={{ width:'100%', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:8, padding:'8px 0', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}
                  >
                    🗑️ Delete Vendor
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── ANALYTICS ── */}
        {tab==='analytics' && (
          <>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>📊 Analytics</div>

            {/* Summary stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                { label:'Total Orders',    val: orders.length, icon:'📦' },
                { label:'Total Revenue',   val: '₹' + orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0).toLocaleString(), icon:'💰' },
                { label:'Delivered',       val: orders.filter(o=>o.status==='delivered').length, icon:'✅' },
                { label:'Cancelled',       val: orders.filter(o=>o.status==='cancelled').length, icon:'❌' },
              ].map(s => (
                <div key={s.label} style={{ background:'#f9fafb', borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:20, fontWeight:700 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab switcher */}
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[['items','🍽️ Most Ordered'],['vendors','🏪 Top Vendors'],['users','👤 Top Users']].map(([id,label]) => (
                <button key={id} onClick={() => setAnalyticsTab(id)} style={{ flex:1, padding:'8px 0', fontSize:11, fontWeight:600, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Poppins', background: analyticsTab===id?'#E24B4A':'#f3f4f6', color: analyticsTab===id?'#fff':'#6b7280' }}>{label}</button>
              ))}
            </div>

            {/* Most ordered items */}
            {analyticsTab==='items' && (
              <div style={{ background:'#fff', borderRadius:12, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', fontSize:12, fontWeight:600, color:'#6b7280' }}>TOP 10 MOST ORDERED ITEMS</div>
                {getMostOrdered().length === 0 && <div style={{ padding:20, textAlign:'center', color:'#9ca3af', fontSize:13 }}>No orders yet</div>}
                {getMostOrdered().map((item, i) => {
                  const max = getMostOrdered()[0]?.qty || 1
                  return (
                    <div key={item.name} style={{ padding:'10px 14px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f9fafb' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:16, fontWeight:700, color:'#E24B4A', minWidth:22 }}>#{i+1}</span>
                          <span style={{ fontSize:13, fontWeight:500 }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:'#E24B4A' }}>{item.qty} orders</span>
                      </div>
                      <div style={{ background:'#f3f4f6', borderRadius:4, height:6, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:'#E24B4A', width:((item.qty/max)*100)+'%', borderRadius:4 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Top vendors by orders */}
            {analyticsTab==='vendors' && (
              <div style={{ background:'#fff', borderRadius:12, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', fontSize:12, fontWeight:600, color:'#6b7280' }}>TOP VENDORS BY ORDERS</div>
                {vendors.map(v => {
                  const vOrders = orders.filter(o => o.vendorUid === v.id)
                  const vRevenue = vOrders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.total||0),0)
                  return (
                    <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f9fafb' }}>
                      <div style={{ width:36, height:36, borderRadius:9, overflow:'hidden', background:'#fee2e2', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {v.photo ? <img src={v.photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>🏪</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{v.storeName}</div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>{vOrders.length} orders · ₹{vRevenue.toLocaleString()} revenue</div>
                      </div>
                      <div style={{ background: v.isOpen?'#dcfce7':'#fee2e2', borderRadius:20, padding:'3px 8px' }}>
                        <span style={{ fontSize:10, fontWeight:600, color: v.isOpen?'#16a34a':'#dc2626' }}>{v.isOpen?'Open':'Closed'}</span>
                      </div>
                    </div>
                  )
                }).sort((a,b) => orders.filter(o=>o.vendorUid===b.key).length - orders.filter(o=>o.vendorUid===a.key).length)}
              </div>
            )}

            {/* Top users */}
            {analyticsTab==='users' && (
              <div style={{ background:'#fff', borderRadius:12, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', fontSize:12, fontWeight:600, color:'#6b7280' }}>TOP USERS BY ORDERS</div>
                {(() => {
                  const userMap = {}
                  orders.forEach(o => {
                    if (!userMap[o.userUid]) userMap[o.userUid] = { name: o.userName, phone: o.userPhone, count: 0, spent: 0 }
                    userMap[o.userUid].count++
                    if (o.status === 'delivered') userMap[o.userUid].spent += o.total || 0
                  })
                  return Object.values(userMap)
                    .sort((a,b) => b.count - a.count)
                    .slice(0,10)
                    .map((u, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f9fafb' }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>#{i+1}</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{u.name}</div>
                          <div style={{ fontSize:11, color:'#6b7280' }}>{u.phone || '—'} · ₹{u.spent.toLocaleString()} spent</div>
                        </div>
                        <div style={{ background:'#fef3c7', borderRadius:20, padding:'3px 10px' }}>
                          <span style={{ fontSize:11, fontWeight:700, color:'#92400e' }}>{u.count} orders</span>
                        </div>
                      </div>
                    ))
                })()}
              </div>
            )}
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

              {/* Delivery Charge */}
              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🚴 Delivery Charge (₹)</label>
                <input style={inp} type="number" placeholder="e.g. 30 (enter 0 for free)" {...f('deliveryCharge')} />
              </div>

              {/* Vendor Location */}
              <div>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>📍 Store Location (for distance sorting)</label>
                <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:6 }}>
                  {newVendorLocName && (
                    <div style={{ fontSize:12, color:'#16a34a', fontWeight:500, padding:'6px 10px', background:'#f0fdf4', borderRadius:8 }}>
                      ✅ {newVendorLocName}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleDetectVendorLoc}
                    disabled={detectingLoc}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', background:'#fff5f5', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', borderRadius:9, cursor:'pointer', fontFamily:'Poppins' }}
                  >
                    <span>📍</span>
                    <span style={{ fontSize:12, color:'#E24B4A', fontWeight:500 }}>{detectingLoc ? 'Detecting...' : 'Use Current GPS'}</span>
                  </button>
                  <div style={{ position:'relative' }}>
                    <input
                      style={{ ...inp, marginTop:0 }}
                      placeholder="Or search: Warananagar, Kolhapur..."
                      value={locSearch}
                      onChange={e => handleLocSearch(e.target.value)}
                    />
                    {locSuggestions.length > 0 && (
                      <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:9, zIndex:50, marginTop:2, overflow:'hidden' }}>
                        {locSuggestions.map((s, i) => (
                          <button key={i} type="button" onClick={() => handleSelectVendorLoc(s)} style={{ width:'100%', padding:'9px 12px', border:'none', borderBottomWidth: i < locSuggestions.length-1?1:0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background:'#fff', cursor:'pointer', textAlign:'left', fontFamily:'Poppins', fontSize:12, color:'#1f2937' }}>
                            📍 {s.name.split(",")[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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