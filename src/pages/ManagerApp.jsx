import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, updateVendorStore, founderCreateVendor, uploadPhoto } from '../firebase/services'
import {
  collection, onSnapshot, doc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

const EMPTY_VENDOR_FORM = {
  storeName: '', email: '', phone: '', password: '', confirmPass: '',
  address: '', category: 'Thali', deliveryCharge: 30, town: ''
}

export default function ManagerApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('overview')

  // Responsive
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Data
  const [vendors, setVendors] = useState([])
  const [orders, setOrders] = useState([])
  const [cityVendors, setCityVendors] = useState([])

  // Add vendor form
  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR_FORM)
  const [creatingVendor, setCreatingVendor] = useState(false)
  const [vendorPhotoFile, setVendorPhotoFile] = useState(null)
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState(null)
  const [photoProgress, setPhotoProgress] = useState(0)
  const photoRef = useRef()

  // Support
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const city    = userData?.city || ''
  const district = userData?.district || city
  const talukas  = userData?.assignedTalukas || []
  const managerName = userData?.name || 'Manager'

  // ── Live listeners scoped to manager's city ───────────────────────────
  useEffect(() => {
    if (!city) return
    const unsubVendors = onSnapshot(collection(db, 'vendors'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const myVendors = all.filter(v => {
        // Match by explicit managerCity tag (set when manager creates vendor)
        if (v.managerCity && v.managerCity.toLowerCase() === city.toLowerCase()) return true
        // Match by createdByManager
        if (v.createdByManager === user?.uid) return true
        // Match by town/locationName containing city, district or any taluka
        const vTown = (v.town || v.locationName || '').toLowerCase()
        if (city && vTown.includes(city.toLowerCase())) return true
        if (district && district !== city && vTown.includes(district.toLowerCase())) return true
        return talukas.some(t => t && vTown.includes(t.toLowerCase()))
      })
      setCityVendors(myVendors)
      setVendors(all)
    })
    // Orders for city vendors
    const unsubOrders = onSnapshot(collection(db, 'orders'), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    // Support tickets
    const unsubTickets = onSnapshot(collection(db, 'supportTickets'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setTickets(all)
    })
    return () => { unsubVendors(); unsubOrders(); unsubTickets() }
  }, [city, district])

  // ── Derived stats ─────────────────────────────────────────────────────
  const cityOrders = orders.filter(o =>
    cityVendors.some(v => v.id === o.vendorUid)
  )
  const todayOrders = cityOrders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  })
  const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
  const liveOrders   = cityOrders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const openVendors  = cityVendors.filter(v => v.isOpen).length

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleToggleVendor = async (vendorId, current) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), { isOpen: !current })
      toast.success(!current ? '🟢 Vendor opened' : '🔴 Vendor closed')
    } catch { toast.error('Failed to update vendor') }
  }

  const handleCreateVendor = async () => {
    const { storeName, email, password, confirmPass, category, address, phone, deliveryCharge, town } = vendorForm
    if (!storeName) return toast.error('Store name required')
    if (!email)     return toast.error('Email required')
    if (!password || password.length < 6) return toast.error('Password must be 6+ chars')
    if (password !== confirmPass) return toast.error('Passwords do not match')
    setCreatingVendor(true)
    try {
      const maxOrder = vendors.reduce((m, v) => Math.max(m, v.sortOrder ?? 0), 0)
      const vendorUid = await founderCreateVendor(user.uid, {
        email, password, storeName, address, phone, category,
        plan: '₹500/month',
        town: town || city,
        deliveryCharge: Number(deliveryCharge) || 30,
        sortOrder: maxOrder + 1,
        createdByManager: user.uid,
        managerCity: city,
      })
      if (vendorPhotoFile && vendorUid) {
        const url = await uploadPhoto(vendorPhotoFile, setPhotoProgress)
        await updateVendorStore(vendorUid, { photo: url })
      }
      toast.success(`✅ "${storeName}" added to ${city}!`)
      setVendorForm(EMPTY_VENDOR_FORM)
      setVendorPhotoFile(null); setVendorPhotoPreview(null)
      setShowAddVendor(false)
    } catch (err) { toast.error(err.message) }
    setCreatingVendor(false)
  }

  const handleReplyTicket = async (ticketId) => {
    if (!replyText.trim()) return toast.error('Enter reply')
    setSendingReply(true)
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        managerReply: replyText.trim(), status: 'replied',
        repliedAt: serverTimestamp(), repliedBy: user.uid
      })
      setReplyText(''); setSelectedTicket(null)
      toast.success('Reply sent!')
    } catch { toast.error('Failed') }
    setSendingReply(false)
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderWidth: 1, borderStyle: 'solid',
    borderColor: '#e5e7eb', borderRadius: 8, fontSize: 13,
    fontFamily: 'Poppins,sans-serif', outline: 'none', marginTop: 4, boxSizing: 'border-box'
  }
  const f = field => ({ value: vendorForm[field], onChange: e => setVendorForm(p => ({ ...p, [field]: e.target.value })) })

  return (
    <div style={{
      maxWidth: isDesktop ? '100%' : 480, margin: '0 auto', background: isDesktop ? '#f1f5f9' : '#fff',
      minHeight: '100vh', display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
      fontFamily: 'Poppins,sans-serif'
    }}>

      {/* ── DESKTOP SIDEBAR ── */}
      {isDesktop && (
        <aside style={{ width: 240, flexShrink: 0, background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 }}>
          <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, background: '#6366f1', borderRadius: '50%' }} />
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>FeedoZone</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🧑‍💼</span><span>Manager · {city}</span>
            </div>
            {district !== city && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>District: {district}</div>}
            {talukas.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {talukas.map(t => <span key={t} style={{ fontSize: 9, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 8, padding: '2px 6px' }}>📍{t}</span>)}
              </div>
            )}
          </div>

          <nav style={{ flex: 1, padding: '10px 8px' }}>
            {[
              { id: 'overview',  icon: '📊', label: 'Overview' },
              { id: 'orders',    icon: '📦', label: 'Orders', count: liveOrders.length },
              { id: 'vendors',   icon: '🏪', label: 'Vendors', count: cityVendors.length },
              { id: 'addvendor', icon: '➕', label: 'Add Vendor' },
              { id: 'support',   icon: '💬', label: 'Support', count: tickets.filter(t => t.status === 'open').length, alert: true },
            ].map(item => {
              const active = tab === item.id
              return (
                <button key={item.id} onClick={() => setTab(item.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', marginBottom: 2,
                  background: active ? 'linear-gradient(90deg,rgba(99,102,241,0.25),transparent)' : 'transparent',
                  borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                  border: 'none', borderRadius: 8,
                  color: active ? '#fff' : '#94a3b8',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'Poppins', textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.count > 0 && (
                    <span style={{ background: item.alert ? '#E24B4A' : 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{item.count}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>👤 {managerName}</div>
            <button onClick={logoutUser} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: isDesktop ? '#f1f5f9' : '#fff' }}>

      {/* ── MOBILE HEADER ── */}
      {!isDesktop && (
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '14px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, background: '#6366f1', borderRadius: '50%' }} />
                <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>FeedoZone</span>
                <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.12)', color: '#94a3b8', borderRadius: 10, padding: '2px 8px', fontWeight: 600 }}>Manager</span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>👤 {managerName} · 📍 {city}</div>
            </div>
            <button onClick={logoutUser} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Logout</button>
          </div>
          {talukas.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {talukas.map(t => <span key={t} style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', borderRadius: 10, padding: '2px 8px' }}>📍 {t}</span>)}
            </div>
          )}
        </div>
      )}

      {/* ── DESKTOP TOP BAR ── */}
      {isDesktop && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Manager Dashboard</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginTop: 2, textTransform: 'capitalize' }}>
              {tab === 'addvendor' ? 'Add Vendor' : tab}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>TODAY</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>₹{todayRevenue.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>VENDORS</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{cityVendors.length}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
              {managerName[0]?.toUpperCase() || 'M'}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE NAV ── */}
      {!isDesktop && (
        <div style={{ display: 'flex', background: '#111', overflowX: 'auto', flexShrink: 0 }}>
          {[
            { id: 'overview',  label: '📊 Overview' },
            { id: 'orders',    label: `📦 Orders${liveOrders.length > 0 ? ` (${liveOrders.length})` : ''}` },
            { id: 'vendors',   label: `🏪 Vendors (${cityVendors.length})` },
            { id: 'addvendor', label: '➕ Add Vendor' },
            { id: 'support',   label: `💬 Support${tickets.filter(t => t.status === 'open').length > 0 ? ` (${tickets.filter(t => t.status === 'open').length})` : ''}` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flexShrink: 0, padding: '11px 14px', fontSize: 12, fontWeight: 500,
              color: tab === t.id ? '#6366f1' : '#888',
              borderBottomWidth: 2, borderBottomStyle: 'solid',
              borderBottomColor: tab === t.id ? '#6366f1' : 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              background: 'transparent', cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap'
            }}>{t.label}</button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '24px 28px' : 14 }}>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === 'overview' && (
          <div style={{ maxWidth: isDesktop ? 900 : '100%' }}>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>City Dashboard</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>📍 {city}</div>
              {district !== city && <div style={{ fontSize: 11, color: '#94a3b8' }}>District: {district}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: "Today's Orders", val: todayOrders.length, sub: `${liveOrders.length} live`, color: '#E24B4A', bg: '#fff5f5' },
                { label: "Today's Revenue", val: `₹${todayRevenue.toLocaleString()}`, sub: 'delivered orders', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Total Vendors', val: cityVendors.length, sub: `${openVendors} open now`, color: '#0369a1', bg: '#f0f9ff' },
                { label: 'Support Tickets', val: tickets.filter(t => t.status === 'open').length, sub: 'open issues', color: '#d97706', bg: '#fffbeb' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderStyle: 'solid', borderColor: 'transparent' }}>
                  <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Vendor status quick list */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>⚡ Vendor Status</div>
            {cityVendors.slice(0, 6).map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderRadius: 10, padding: '10px 12px', marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: v.isOpen ? '#bbf7d0' : '#fecaca' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', background: '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.photo ? <img src={v.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16 }}>🏪</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.storeName}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{v.category} · {v.town || city}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: v.isOpen ? '#16a34a' : '#dc2626' }}>{v.isOpen ? '🟢 Open' : '🔴 Closed'}</span>
              </div>
            ))}
            {cityVendors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No vendors in {city} yet</div>
                <button onClick={() => setTab('addvendor')} style={{ marginTop: 12, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>+ Add First Vendor</button>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {tab === 'orders' && (
          <div style={{ maxWidth: isDesktop ? 900 : '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Live', val: liveOrders.length, color: '#E24B4A' },
                { label: 'Today', val: todayOrders.length, color: '#0369a1' },
                { label: 'Revenue', val: `₹${todayRevenue}`, color: '#16a34a' },
              ].map(s => (
                <div key={s.label} style={{ background: isDesktop ? '#fff' : '#f9fafb', borderRadius: 10, padding: '10px 8px', textAlign: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {cityOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 36 }}>📦</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No orders in {city} yet</div>
              </div>
            )}

            <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? 'repeat(auto-fill,minmax(320px,1fr))' : 'none', gap: 12 }}>
            {cityOrders.slice(0, 30).map(o => {
              const statusColor = { pending: '#f59e0b', accepted: '#3b82f6', preparing: '#8b5cf6', ready: '#10b981', out_for_delivery: '#0ea5e9', delivered: '#16a34a', cancelled: '#ef4444' }
              return (
                <div key={o.id} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: isDesktop ? 0 : 10, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>#{o.id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{o.vendorName} · {o.userName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#E24B4A' }}>₹{o.total}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: (statusColor[o.status] || '#9ca3af') + '22', color: statusColor[o.status] || '#9ca3af' }}>
                        {o.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{o.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}</div>
                </div>
              )
            })}
            </div>
          </div>
        )}

        {/* ══ VENDORS TAB ══ */}
        {tab === 'vendors' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>🏪 {cityVendors.length} Vendors in {city}</div>
              <button onClick={() => setTab('addvendor')} style={{ background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>+ Add</button>
            </div>

            {cityVendors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 36 }}>🏪</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No vendors yet in {city}</div>
              </div>
            )}

            <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? 'repeat(auto-fill,minmax(300px,1fr))' : 'none', gap: 14 }}>
            {cityVendors.map(v => (
              <div key={v.id} style={{ background: '#fff', borderRadius: 12, marginBottom: isDesktop ? 0 : 12, overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
                <div style={{ height: 80, background: '#1a1a2e', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.photo ? <img src={v.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>🏪</span>}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: v.isOpen ? '#16a34a' : '#dc2626', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>{v.isOpen ? '● Open' : '● Closed'}</div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{v.storeName}</div>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>{v.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{v.email} · 📞 {v.phone || '—'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: v.isOpen ? '#f0fdf4' : '#fff5f5', borderRadius: 9, padding: '8px 12px', borderWidth: 1, borderStyle: 'solid', borderColor: v.isOpen ? '#bbf7d0' : '#fecaca' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: v.isOpen ? '#15803d' : '#dc2626' }}>{v.isOpen ? '🟢 Open' : '🔴 Closed'}</span>
                    <button onClick={() => handleToggleVendor(v.id, v.isOpen)} style={{ background: v.isOpen ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>
                      {v.isOpen ? 'Close Store' : 'Open Store'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>  {/* end vendors grid */}
          </>
        )}

        {/* ══ ADD VENDOR TAB ══ */}
        {tab === 'addvendor' && (
          <div style={{ maxWidth: isDesktop ? 640 : '100%', margin: isDesktop ? '0 auto' : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 12, padding: 14, marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>➕ Add New Vendor</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Adding to: 📍 {city}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Store Photo (optional)</label>
              <div onClick={() => photoRef.current?.click()} style={{ marginTop: 6, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e5e7eb', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                {vendorPhotoPreview ? <img src={vendorPhotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24 }}>🏪</div><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Tap to add photo</div></div>}
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setVendorPhotoFile(f); setVendorPhotoPreview(URL.createObjectURL(f)) }}} />
            </div>

            <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Store Name *</label><input style={inp} placeholder="e.g. Shree Ganesh Hotel" {...f('storeName')} /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Email *</label><input style={inp} type="email" placeholder="vendor@email.com" {...f('email')} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Password *</label><input style={inp} type="password" placeholder="Min 6 chars" {...f('password')} /></div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Confirm *</label><input style={inp} type="password" placeholder="Repeat" {...f('confirmPass')} /></div>
            </div>
            <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Phone</label><input style={inp} placeholder="+91 98765 43210" {...f('phone')} /></div>
            <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Address</label><input style={inp} placeholder="Full address" {...f('address')} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Category</label>
                <select style={{ ...inp, cursor: 'pointer' }} {...f('category')}>
                  {['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice','Fast Food','South Indian'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Delivery (₹)</label><input style={inp} type="number" placeholder="30" {...f('deliveryCharge')} /></div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Town / Taluka *</label>
              <input style={inp} placeholder={`e.g. ${city}`} {...f('town')} />
              {talukas.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Quick:</span>
                  {[city, ...talukas].map(t => <button key={t} type="button" onClick={() => setVendorForm(p => ({ ...p, town: t }))} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, border: 'none', background: vendorForm.town === t ? '#E24B4A' : '#f3f4f6', color: vendorForm.town === t ? '#fff' : '#374151', cursor: 'pointer', fontFamily: 'Poppins' }}>{t}</button>)}
                </div>
              )}
            </div>

            {creatingVendor && photoProgress > 0 && (
              <div><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Uploading photo... {photoProgress}%</div><div style={{ background: '#f3f4f6', borderRadius: 8, height: 6 }}><div style={{ height: '100%', background: '#E24B4A', width: `${photoProgress}%`, borderRadius: 8 }} /></div></div>
            )}
            <button onClick={handleCreateVendor} disabled={creatingVendor} style={{ background: creatingVendor ? '#f09595' : '#E24B4A', color: '#fff', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: creatingVendor ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', marginTop: 4 }}>
              {creatingVendor ? 'Creating...' : '✅ Add Vendor to ' + city}
            </button>
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: '#166534' }}>
              💡 This vendor will appear in the {city} area for customers. Share the email &amp; password with the vendor owner.
            </div>
          </div>
        )}

        {/* ══ SUPPORT TAB ══ */}
        {tab === 'support' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>
              💬 Support Tickets
              <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', marginLeft: 8 }}>
                {tickets.filter(t => t.status === 'open').length} open
              </span>
            </div>

            {tickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 36 }}>💬</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No support tickets yet</div>
              </div>
            )}

            {tickets.map(ticket => (
              <div key={ticket.id} style={{ background: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderStyle: 'solid', borderColor: ticket.status === 'open' ? '#fecaca' : '#e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{ticket.subject || ticket.message?.slice(0, 40) || 'Support Request'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{ticket.userName || ticket.userEmail || 'Customer'}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: ticket.status === 'open' ? '#fee2e2' : '#dcfce7', color: ticket.status === 'open' ? '#991b1b' : '#065f46' }}>
                    {ticket.status === 'open' ? '🔴 Open' : '✅ Replied'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginBottom: 10, lineHeight: 1.5 }}>{ticket.message}</div>

                {ticket.managerReply && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', marginBottom: 2 }}>Your Reply:</div>
                    <div style={{ fontSize: 11, color: '#15803d' }}>{ticket.managerReply}</div>
                  </div>
                )}

                {selectedTicket === ticket.id ? (
                  <div>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 8, fontSize: 12, fontFamily: 'Poppins', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleReplyTicket(ticket.id)} disabled={sendingReply} style={{ flex: 2, background: sendingReply ? '#e5e7eb' : '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: sendingReply ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                        {sendingReply ? 'Sending...' : '✅ Send Reply'}
                      </button>
                      <button onClick={() => { setSelectedTicket(null); setReplyText('') }} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSelectedTicket(ticket.id)} style={{ width: '100%', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    💬 {ticket.managerReply ? 'Update Reply' : 'Reply to Customer'}
                  </button>
                )}
              </div>
            ))}
          </>
        )}

      </div>
      </div>
    </div>
  )
}
