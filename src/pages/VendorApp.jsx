import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getVendorOrders, getMenuItems, updateOrderStatus,
  updateVendorStore, addMenuItem, updateMenuItem, deleteMenuItem,
  uploadVendorPhoto, uploadMenuItemPhoto
} from '../firebase/services'
import { useNotifications } from '../hooks/useNotifications'
import { listenNotifications, markNotificationRead } from '../firebase/services'
import toast from 'react-hot-toast'
import { useOrderAlert } from '../hooks/useOrderAlert'
import { usePendingOrderNotifier } from '../hooks/usePendingOrderNotifier'

const STATUS_NEXT  = { pending:'accepted', accepted:'preparing', preparing:'ready', ready:'out_for_delivery', out_for_delivery:'delivered' }
const STATUS_LABEL = { pending:'Accept Order', accepted:'Start Preparing', preparing:'Mark Ready', ready:'Out for Delivery', out_for_delivery:'Mark Delivered' }
const CANCELLABLE_STATUSES = ['accepted', 'preparing', 'ready']
const DEFAULT_CATEGORIES = ['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice']
const EMPTY_ITEM = { name:'', price:'', category:'Thali', description:'', isVeg: true }

// ── ORDER HISTORY FILTER TABS ──────────────────────────────────────────────
const ORDER_FILTERS = [
  { id:'all',              label:'All',           emoji:'📋' },
  { id:'pending',          label:'Pending',        emoji:'⏳' },
  { id:'accepted',         label:'Accepted',       emoji:'✅' },
  { id:'preparing',        label:'Preparing',      emoji:'👨‍🍳' },
  { id:'ready',            label:'Ready',           emoji:'🎉' },
  { id:'out_for_delivery', label:'On the way',     emoji:'🚴' },
  { id:'delivered',        label:'Delivered',      emoji:'✔️' },
  { id:'cancelled',        label:'Cancelled',      emoji:'❌' },
]

export default function VendorApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState(EMPTY_ITEM)
  const [customCategories, setCustomCategories] = useState([])
  const [newCatInput, setNewCatInput] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [selectedVendorOrder, setSelectedVendorOrder] = useState(null)

  // ── ORDER HISTORY FILTER ─────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState('all')

  // ── CANCEL ORDER STATES ──────────────────────────────────────────────────
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancellingOrder, setCancellingOrder] = useState(false)

  // ── MENU EDIT STATES ─────────────────────────────────────────────────────
  const [menuEditMode, setMenuEditMode] = useState(false)
  const [menuCatFilter, setMenuCatFilter] = useState('All')
  const [editingItem, setEditingItem] = useState(null)
  const [editItemData, setEditItemData] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const prevOrderCountRef = useRef(0)
  const { startAlarm, stopAlarm, unlockAudio } = useOrderAlert()
  usePendingOrderNotifier(true)

  useEffect(() => {
    const unlock = () => { unlockAudio(); setAudioUnlocked(true) }
    document.addEventListener('click', unlock, { once: true })
    document.addEventListener('touchstart', unlock, { once: true })
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [fssai, setFssai] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)

  const [vendorPhotoUploading, setVendorPhotoUploading] = useState(false)
  const [vendorPhotoProgress, setVendorPhotoProgress] = useState(0)
  const [itemPhotoUploading, setItemPhotoUploading] = useState(null)
  const [itemPhotoProgress, setItemPhotoProgress] = useState(0)
  const [newItemPhotoFile, setNewItemPhotoFile] = useState(null)
  const [newItemPhotoPreview, setNewItemPhotoPreview] = useState(null)
  const [addingItem, setAddingItem] = useState(false)

  const vendorPhotoRef = useRef()
  const newItemPhotoRef = useRef()

  const [vendorLocation, setVendorLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [searchingLoc, setSearchingLoc] = useState(false)

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  useNotifications(user?.uid, 'vendor')

  useEffect(() => {
    if (!user) return
    return listenNotifications(user.uid, (notifs) => {
      notifs.forEach(n => {
        toast(n.body, { icon: '🔔', duration: 6000 })
        markNotificationRead(n.id)
      })
    })
  }, [user])

  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending')
    const pendingCount = pendingOrders.length
    if (pendingCount > prevOrderCountRef.current && prevOrderCountRef.current >= 0) {
      setNewOrderAlert(pendingOrders[0])
      setAlertDismissed(false)
      startAlarm()
    } else if (pendingCount === 0) {
      stopAlarm()
    }
    prevOrderCountRef.current = pendingCount
  }, [orders])

  useEffect(() => {
    if (!user) return
    setIsOpen(userData?.isOpen || false)
    if (userData?.customCategories) setCustomCategories(userData.customCategories)
    if (userData?.deliveryCharge !== undefined) setDeliveryCharge(String(userData.deliveryCharge ?? ''))
    if (userData?.fssai) setFssai(userData.fssai)
    if (userData?.openTime) setOpenTime(userData.openTime)
    if (userData?.closeTime) setCloseTime(userData.closeTime)
    if (userData?.location) { setVendorLocation(userData.location); setLocationName(userData.locationName || '') }
    const u1 = getVendorOrders(user.uid, setOrders)
    const u2 = getMenuItems(user.uid, setMenuItems)
    return () => { u1(); u2() }
  }, [user, userData])

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || "Your Location"
    } catch { return "Your Location" }
  }

  const handleDetectLocation = async () => {
    setDetectingLocation(true)
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }))
      const lat = pos.coords.latitude; const lng = pos.coords.longitude
      const name = await reverseGeocode(lat, lng)
      setVendorLocation({ lat, lng }); setLocationName(name)
      await updateVendorStore(user.uid, { location: { lat, lng }, locationName: name })
      toast.success(`📍 Location set: ${name}`)
    } catch { toast.error("Could not detect location. Enable GPS.") }
    setDetectingLocation(false)
  }

  const handleLocationSearch = async (q) => {
    setLocationSearch(q)
    if (q.length < 3) { setLocationSuggestions([]); return }
    setSearchingLoc(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocationSuggestions(data.map(d => ({ name: d.display_name.split(",").slice(0, 3).join(", "), lat: parseFloat(d.lat), lng: parseFloat(d.lon) })))
    } catch { setLocationSuggestions([]) }
    setSearchingLoc(false)
  }

  const handleSelectLocation = async (s) => {
    const name = s.name.split(",")[0]
    setVendorLocation({ lat: s.lat, lng: s.lng }); setLocationName(name)
    await updateVendorStore(user.uid, { location: { lat: s.lat, lng: s.lng }, locationName: name })
    toast.success(`📍 Location set: ${name}`)
    setLocationSearch(""); setLocationSuggestions([])
  }

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    try {
      await updateVendorStore(user.uid, { deliveryCharge: deliveryCharge === '' ? 0 : Number(deliveryCharge), fssai: fssai.trim(), openTime: openTime.trim(), closeTime: closeTime.trim() })
      toast.success('Store details saved! ✅')
    } catch { toast.error('Failed to save. Try again.') }
    setSavingDetails(false)
  }

  const toggleStore = async () => {
    const val = !isOpen; setIsOpen(val)
    await updateVendorStore(user.uid, { isOpen: val })
    toast.success(val ? '🟢 Store is now Open!' : '🔴 Store is now Closed')
  }

  const handleStatus = async (orderId, current, orderData = {}) => {
    const next = STATUS_NEXT[current]; if (!next) return
    await updateOrderStatus(orderId, next, orderData)
    toast.success(`Order → ${next.replace('_',' ')}`)
  }

  const handleReject = async (orderId) => {
    await updateOrderStatus(orderId, 'cancelled')
    toast.error('Order rejected')
  }

  const openCancelModal = (order) => { setCancelOrderTarget(order); setCancelReason(''); setShowCancelModal(true) }

  const handleVendorCancelOrder = async () => {
    if (!cancelOrderTarget) return
    if (!cancelReason.trim()) return toast.error('Please select or enter a reason')
    setCancellingOrder(true)
    try {
      await updateOrderStatus(cancelOrderTarget.id, 'cancelled', {
        userUid: cancelOrderTarget.userUid, vendorName: userData?.storeName || '',
        cancellationReason: cancelReason.trim(), cancelledBy: 'vendor',
      })
      toast.success('Order cancelled and user notified')
      setShowCancelModal(false); setCancelOrderTarget(null)
      if (selectedVendorOrder?.id === cancelOrderTarget.id) {
        setSelectedVendorOrder(prev => ({ ...prev, status: 'cancelled' }))
      }
    } catch { toast.error('Failed to cancel. Try again.') }
    setCancellingOrder(false)
  }

  const startEditItem = (item) => {
    setEditingItem(item.id)
    setEditItemData({ name: item.name, price: String(item.price), category: item.category, description: item.description || '', isVeg: item.isVeg !== false })
  }

  const handleSaveEdit = async (itemId) => {
    if (!editItemData.name.trim()) return toast.error('Item name required')
    if (!editItemData.price || isNaN(editItemData.price) || Number(editItemData.price) <= 0) return toast.error('Enter valid price')
    setSavingEdit(true)
    try {
      await updateMenuItem(user.uid, itemId, { name: editItemData.name.trim(), price: Number(editItemData.price), category: editItemData.category, description: editItemData.description.trim(), isVeg: editItemData.isVeg })
      toast.success('Item updated! ✅'); setEditingItem(null)
    } catch { toast.error('Failed to update. Try again.') }
    setSavingEdit(false)
  }

  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim()
    if (!trimmed) return toast.error('Enter category name')
    if (allCategories.map(c=>c.toLowerCase()).includes(trimmed.toLowerCase())) return toast.error('Category already exists')
    const updated = [...customCategories, trimmed]; setCustomCategories(updated)
    setNewItem(p => ({ ...p, category: trimmed }))
    await updateVendorStore(user.uid, { customCategories: updated })
    setNewCatInput(''); setShowAddCat(false); toast.success(`Category "${trimmed}" added!`)
  }

  const handleVendorPhotoChange = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setVendorPhotoUploading(true); setVendorPhotoProgress(0)
    try { await uploadVendorPhoto(user.uid, file, 'photo', setVendorPhotoProgress); toast.success('Store photo updated! ✅') }
    catch (err) { console.error(err); toast.error('Upload failed.') }
    setVendorPhotoUploading(false); setVendorPhotoProgress(0); e.target.value = ''
  }

  const handleNewItemPhotoSelect = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setNewItemPhotoFile(file); setNewItemPhotoPreview(URL.createObjectURL(file))
  }

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return toast.error('Enter item name')
    if (!newItem.price || isNaN(newItem.price) || Number(newItem.price) <= 0) return toast.error('Enter valid price')
    setAddingItem(true)
    try {
      const docRef = await addMenuItem(user.uid, { name: newItem.name.trim(), price: Number(newItem.price), category: newItem.category, description: newItem.description.trim(), isVeg: newItem.isVeg, photo: '' })
      if (newItemPhotoFile && docRef?.id) await uploadMenuItemPhoto(user.uid, docRef.id, newItemPhotoFile, setItemPhotoProgress)
      setNewItem(EMPTY_ITEM); setNewItemPhotoFile(null); setNewItemPhotoPreview(null); setShowAddItem(false)
      toast.success('Menu item added! 🎉')
    } catch (err) { console.error(err); toast.error('Failed to add item.') }
    setAddingItem(false); setItemPhotoProgress(0)
  }

  const handleExistingItemPhoto = async (e, itemId) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setItemPhotoUploading(itemId); setItemPhotoProgress(0)
    try { await uploadMenuItemPhoto(user.uid, itemId, file, setItemPhotoProgress); toast.success('Photo updated! ✅') }
    catch (err) { console.error(err); toast.error('Upload failed.') }
    setItemPhotoUploading(null); setItemPhotoProgress(0); e.target.value = ''
  }

  const liveOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const todayRevenue = orders.filter(o => o.status==='delivered').reduce((s,o) => s+(o.total||0), 0)

  // ── FILTERED ORDERS for history view ────────────────────────────────────
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter)

  const menuCategories = ['All', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))]
  const filteredMenuItems = menuCatFilter === 'All' ? menuItems : menuItems.filter(i => i.category === menuCatFilter)

  const inp = {
    width:'100%', padding:'10px 12px', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box'
  }

  const CANCEL_REASONS = [
    'Delivery location too far',
    'Out of stock / ingredients unavailable',
    'Store closing early today',
    'Unable to prepare on time',
    'Customer unreachable',
    'Other',
  ]

  // Status badge styles helper
  const statusBadgeStyle = (status) => ({
    fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20,
    background: status==='pending'?'#fef3c7': status==='accepted'?'#dbeafe': status==='preparing'?'#ede9fe': status==='ready'?'#dcfce7': status==='out_for_delivery'?'#e0f2fe': status==='delivered'?'#d1fae5':'#fee2e2',
    color: status==='pending'?'#92400e': status==='accepted'?'#1e40af': status==='preparing'?'#6d28d9': status==='ready'?'#15803d': status==='out_for_delivery'?'#0369a1': status==='delivered'?'#065f46':'#991b1b',
  })

  return (
    <div style={{ maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background:'#1a1a1a', padding:16, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div onClick={() => vendorPhotoRef.current?.click()} style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:'#2a2a2a', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', borderWidth:2, borderStyle:'solid', borderColor:'#333', position:'relative' }}>
              {userData?.photo ? <img src={userData.photo} alt="store" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:20 }}>🏪</span>}
              {vendorPhotoUploading && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700 }}>{vendorPhotoProgress}%</div>}
            </div>
            <input ref={vendorPhotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleVendorPhotoChange} />
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{userData?.storeName || 'My Store'}</div>
              <div style={{ fontSize:10, color:'#888', marginTop:1 }}>📷 Tap photo to change · {userData?.category||'Food'}</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color: isOpen?'#4ade80':'#9ca3af' }}>{isOpen?'Open':'Closed'}</span>
            <div onClick={toggleStore} style={{ width:44, height:24, background: isOpen?'#16a34a':'#6b7280', borderRadius:12, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
              <div style={{ position:'absolute', width:18, height:18, background:'#fff', borderRadius:'50%', top:3, left: isOpen?23:3, transition:'left 0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <div style={{ display:'flex', background:'#111', overflowX:'auto', flexShrink:0 }}>
        {[
          { id:'orders',   label:`Orders${liveOrders.length>0?` (${liveOrders.length})`:''}` },
          { id:'menu',     label:'Menu' },
          { id:'earnings', label:'Earnings' },
          { id:'settings', label:'Settings' }
        ].map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{ flexShrink:0, padding:'11px 16px', fontSize:12, fontWeight:500, color: tab===t2.id?'#E24B4A':'#888', borderBottomWidth:2, borderBottomStyle:'solid', borderBottomColor: tab===t2.id?'#E24B4A':'transparent', borderTop:'none', borderLeft:'none', borderRight:'none', background:'transparent', cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap' }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <>
            {/* ── FULL SCREEN ORDER DETAIL ── */}
            {selectedVendorOrder && (
              <div style={{ position:'fixed', inset:0, background:'#f7f7f7', zIndex:999, overflowY:'auto', maxWidth:430, margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
                <div style={{ background: selectedVendorOrder.status==='pending'?'linear-gradient(135deg,#E24B4A,#c73232)': selectedVendorOrder.status==='delivered'?'linear-gradient(135deg,#16a34a,#15803d)': selectedVendorOrder.status==='cancelled'?'linear-gradient(135deg,#dc2626,#b91c1c)':'linear-gradient(135deg,#1a1a1a,#2a2a2a)', padding:'20px 16px 28px', color:'#fff' }}>
                  <button onClick={() => setSelectedVendorOrder(null)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'Poppins', marginBottom:16 }}>← Back to Orders</button>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:11, opacity:0.7, letterSpacing:1, marginBottom:4 }}>ORDER</div>
                      <div style={{ fontSize:24, fontWeight:900, letterSpacing:-0.5 }}>#{selectedVendorOrder.id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize:12, opacity:0.85, marginTop:4 }}>{selectedVendorOrder.createdAt?.toDate?.()?.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) || ''}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:28, fontWeight:900 }}>₹{selectedVendorOrder.total}</div>
                      <div style={{ fontSize:11, opacity:0.8, marginTop:2 }}>💵 Cash on Delivery</div>
                      <div style={{ marginTop:6, background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'3px 12px', display:'inline-block' }}>
                        <span style={{ fontSize:11, fontWeight:700 }}>{selectedVendorOrder.status?.replace('_',' ').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding:'16px 16px 100px', marginTop:-8 }}>
                  {/* Customer Info */}
                  <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:0.5, marginBottom:12, textTransform:'uppercase' }}>Customer Details</div>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ width:46, height:46, borderRadius:12, background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:20, fontWeight:700, color:'#fff' }}>{selectedVendorOrder.userName?.[0]?.toUpperCase() || '👤'}</span>
                      </div>
                      <div>
                        <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>{selectedVendorOrder.userName}</div>
                        <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>📱 {selectedVendorOrder.userPhone || 'No phone'}</div>
                      </div>
                    </div>
                    <div style={{ background:'#f9fafb', borderRadius:10, padding:'10px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>📍</span>
                      <div>
                        <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:3 }}>DELIVERY ADDRESS</div>
                        <div style={{ fontSize:13, color:'#1f2937', fontWeight:500, lineHeight:1.5 }}>{selectedVendorOrder.address || 'No address provided'}</div>
                      </div>
                    </div>
                    {selectedVendorOrder.userPhone && (
                      <div style={{ display:'flex', gap:8, marginTop:10 }}>
                        <a href={`tel:+91${selectedVendorOrder.userPhone}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 0', background:'#E24B4A', borderRadius:10, textDecoration:'none' }}>
                          <span style={{ fontSize:16 }}>📞</span><span style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'Poppins' }}>Call Customer</span>
                        </a>
                        <a href={`https://wa.me/91${selectedVendorOrder.userPhone}`} target="_blank" rel="noreferrer" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 0', background:'#25D366', borderRadius:10, textDecoration:'none' }}>
                          <span style={{ fontSize:16 }}>💬</span><span style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'Poppins' }}>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:0.5, marginBottom:12, textTransform:'uppercase' }}>Items Ordered</div>
                    {selectedVendorOrder.items?.map((item, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottomWidth: i < selectedVendorOrder.items.length-1 ? 1 : 0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:8, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🍛</div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:600, color:'#1f2937' }}>{item.name}</div>
                            <div style={{ fontSize:12, color:'#9ca3af', marginTop:1 }}>₹{item.price} × {item.qty}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#E24B4A' }}>₹{item.price * item.qty}</div>
                      </div>
                    ))}
                    <div style={{ marginTop:12, paddingTop:12, borderTopWidth:2, borderTopStyle:'dashed', borderTopColor:'#f3f4f6' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:13, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:13 }}>₹{selectedVendorOrder.subtotal || selectedVendorOrder.total}</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:13, color:'#6b7280' }}>Delivery fee</span><span style={{ fontSize:13, color: selectedVendorOrder.deliveryFee===0?'#16a34a':'#1f2937' }}>{selectedVendorOrder.deliveryFee===0?'Free 🎉':`₹${selectedVendorOrder.deliveryFee}`}</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb' }}>
                        <span style={{ fontSize:16, fontWeight:800, color:'#1f2937' }}>Total</span>
                        <span style={{ fontSize:16, fontWeight:800, color:'#E24B4A' }}>₹{selectedVendorOrder.total}</span>
                      </div>
                    </div>
                  </div>

                  {selectedVendorOrder.address?.includes('Note:') && (
                    <div style={{ background:'#fef3c7', borderRadius:12, padding:'12px 14px', marginBottom:12, borderWidth:1, borderStyle:'solid', borderColor:'#fde68a' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#92400e', marginBottom:4 }}>📝 SPECIAL NOTE</div>
                      <div style={{ fontSize:13, color:'#78350f' }}>{selectedVendorOrder.address.split('Note:')[1]?.trim()}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!['delivered','cancelled'].includes(selectedVendorOrder.status) && (
                    <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:10 }}>
                      <div style={{ display:'flex', gap:10 }}>
                        {selectedVendorOrder.status === 'pending' && (
                          <button onClick={async () => { await handleReject(selectedVendorOrder.id); setSelectedVendorOrder(prev => ({ ...prev, status: 'cancelled' })) }} style={{ flex:1, background:'transparent', color:'#E24B4A', borderWidth:2, borderStyle:'solid', borderColor:'#E24B4A', padding:'14px 0', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>❌ Reject</button>
                        )}
                        {STATUS_NEXT[selectedVendorOrder.status] && (
                          <button onClick={async () => { await handleStatus(selectedVendorOrder.id, selectedVendorOrder.status, { userUid: selectedVendorOrder.userUid, vendorName: userData?.storeName||'' }); setSelectedVendorOrder(prev => ({ ...prev, status: STATUS_NEXT[prev.status] })) }} style={{ flex:2, background: selectedVendorOrder.status==='pending'?'#E24B4A':'#16a34a', color:'#fff', border:'none', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>{STATUS_LABEL[selectedVendorOrder.status]} ✓</button>
                        )}
                      </div>
                      {CANCELLABLE_STATUSES.includes(selectedVendorOrder.status) && (
                        <button onClick={() => openCancelModal(selectedVendorOrder)} style={{ width:'100%', background:'#fff5f5', color:'#dc2626', borderWidth:1.5, borderStyle:'solid', borderColor:'#fca5a5', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>🚫 Cancel This Order</button>
                      )}
                    </div>
                  )}
                  {selectedVendorOrder.status === 'cancelled' && (
                    <div style={{ background:'#fee2e2', borderRadius:12, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>❌</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#dc2626' }}>Order Cancelled</div>
                      {selectedVendorOrder.cancellationReason && <div style={{ fontSize:12, color:'#991b1b', marginTop:6, background:'rgba(255,255,255,0.5)', borderRadius:8, padding:'8px 12px' }}>Reason: {selectedVendorOrder.cancellationReason}</div>}
                    </div>
                  )}
                  {selectedVendorOrder.status === 'delivered' && (
                    <div style={{ background:'#d1fae5', borderRadius:12, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>✅</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#065f46' }}>Order Delivered Successfully!</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                ORDER FILTER TABS
            ══════════════════════════════════════════ */}
            <div style={{ marginBottom:12 }}>
              {/* Filter summary line */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#1f2937' }}>
                  {orderFilter === 'all' ? 'All Orders' : ORDER_FILTERS.find(f=>f.id===orderFilter)?.emoji + ' ' + ORDER_FILTERS.find(f=>f.id===orderFilter)?.label}
                  <span style={{ fontSize:11, color:'#9ca3af', fontWeight:400, marginLeft:6 }}>({filteredOrders.length})</span>
                </div>
                {liveOrders.length > 0 && (
                  <div style={{ background:'#fee2e2', borderRadius:20, padding:'3px 10px', display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#E24B4A', animation:'pulse 1s infinite' }} />
                    <span style={{ fontSize:11, fontWeight:700, color:'#E24B4A' }}>{liveOrders.length} active</span>
                  </div>
                )}
              </div>

              {/* Scrollable filter pills */}
              <div style={{ overflowX:'auto', paddingBottom:4 }}>
                <div style={{ display:'flex', gap:8, width:'max-content' }}>
                  {ORDER_FILTERS.map(f => {
                    const count = f.id === 'all' ? orders.length : orders.filter(o => o.status === f.id).length
                    const isActive = orderFilter === f.id
                    const isLive = ['pending','accepted','preparing','ready','out_for_delivery'].includes(f.id)
                    return (
                      <button
                        key={f.id}
                        onClick={() => setOrderFilter(f.id)}
                        style={{
                          flexShrink:0, padding:'7px 13px', borderRadius:20, cursor:'pointer',
                          fontFamily:'Poppins', fontSize:12, fontWeight: isActive ? 700 : 500,
                          border:'none', whiteSpace:'nowrap', transition:'all 0.18s',
                          background: isActive
                            ? (f.id==='cancelled' ? '#fee2e2' : f.id==='delivered' ? '#d1fae5' : f.id==='pending' ? '#fef3c7' : '#E24B4A')
                            : '#f3f4f6',
                          color: isActive
                            ? (f.id==='cancelled' ? '#991b1b' : f.id==='delivered' ? '#065f46' : f.id==='pending' ? '#92400e' : '#fff')
                            : '#6b7280',
                          boxShadow: isActive ? '0 3px 10px rgba(0,0,0,0.12)' : 'none',
                          position:'relative',
                        }}
                      >
                        {f.emoji} {f.label}
                        {count > 0 && (
                          <span style={{
                            marginLeft:5, fontSize:10, fontWeight:700,
                            background: isActive ? 'rgba(0,0,0,0.15)' : (isLive && count > 0 ? '#E24B4A' : '#e5e7eb'),
                            color: isActive ? 'inherit' : (isLive && count > 0 ? '#fff' : '#6b7280'),
                            borderRadius:10, padding:'1px 6px',
                          }}>
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── ORDER LIST (filtered) ── */}
            {filteredOrders.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:'40px 20px', fontSize:13 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>
                  {orderFilter === 'delivered' ? '✅' : orderFilter === 'cancelled' ? '❌' : '📋'}
                </div>
                <div style={{ fontWeight:600, marginBottom:4 }}>
                  {orderFilter === 'all' ? 'No orders yet' : `No ${ORDER_FILTERS.find(f=>f.id===orderFilter)?.label?.toLowerCase()} orders`}
                </div>
                <div style={{ fontSize:12 }}>
                  {orderFilter === 'all' ? 'Orders will appear here when customers place them' : `You have no orders with "${ORDER_FILTERS.find(f=>f.id===orderFilter)?.label}" status`}
                </div>
              </div>
            )}

            {filteredOrders.map(order => (
              <div key={order.id} onClick={() => setSelectedVendorOrder(order)}
                style={{ background:'#fff', borderWidth:1, borderStyle:'solid', borderColor: order.status==='pending'?'#fecaca': order.status==='delivered'?'#bbf7d0': order.status==='cancelled'?'#fecaca':'#e5e7eb', borderRadius:12, padding:14, marginBottom:10, cursor:'pointer', opacity: order.status==='cancelled'?0.8:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>#{order.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:2, fontWeight:500 }}>{order.userName} · {order.userPhone}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>📍 {order.address?.slice(0,40)}{order.address?.length>40?'...':''}</div>
                    {order.createdAt && <div style={{ fontSize:10, color:'#d1d5db', marginTop:2 }}>{order.createdAt?.toDate?.()?.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>}
                  </div>
                  <span style={statusBadgeStyle(order.status)}>{order.status?.replace('_',' ').toUpperCase()}</span>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>{order.items?.map(i => `${i.qty}x ${i.name}`).join(' · ')}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#E24B4A' }}>₹{order.total} <span style={{ fontSize:11, color:'#9ca3af', fontWeight:400 }}>COD</span></div>
                  <span style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Tap for details →</span>
                </div>
                {/* Quick action buttons — only for live orders */}
                {!['delivered','cancelled'].includes(order.status) && (
                  <div style={{ display:'flex', gap:8, marginTop:10 }} onClick={e => e.stopPropagation()}>
                    {order.status === 'pending' && (
                      <button onClick={() => handleReject(order.id)} style={{ background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>Reject</button>
                    )}
                    {CANCELLABLE_STATUSES.includes(order.status) && (
                      <button onClick={() => openCancelModal(order)} style={{ background:'#fff5f5', color:'#dc2626', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>🚫 Cancel</button>
                    )}
                    {STATUS_NEXT[order.status] && (
                      <button onClick={() => handleStatus(order.id, order.status, { userUid: order.userUid, vendorName: userData?.storeName||'' })} style={{ flex:1, background: order.status==='pending'?'#E24B4A':'#1a1a1a', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600 }}>{STATUS_LABEL[order.status]}</button>
                    )}
                  </div>
                )}
                {/* Cancelled reason preview on card */}
                {order.status === 'cancelled' && order.cancellationReason && (
                  <div style={{ marginTop:8, background:'#fff5f5', borderRadius:8, padding:'6px 10px', fontSize:11, color:'#991b1b' }}>
                    🚫 {order.cancellationReason}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <span style={{ fontSize:13, color:'#6b7280' }}>{menuItems.length} items</span>
                {menuEditMode && <span style={{ fontSize:11, color:'#E24B4A', fontWeight:600, marginLeft:8 }}>· Edit Mode ON</span>}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => { setMenuEditMode(e => !e); setEditingItem(null) }} style={{ background: menuEditMode?'#fef3c7':'#f3f4f6', color: menuEditMode?'#92400e':'#6b7280', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600 }}>
                  {menuEditMode ? '✅ Done Editing' : '✏️ Edit Menu'}
                </button>
                <button onClick={() => setShowAddItem(!showAddItem)} style={{ background:'#E24B4A', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>+ Add</button>
              </div>
            </div>

            {menuCategories.length > 1 && (
              <div style={{ overflowX:'auto', marginBottom:12 }}>
                <div style={{ display:'flex', gap:8, width:'max-content', paddingBottom:4 }}>
                  {menuCategories.map(cat => {
                    const count = cat==='All' ? menuItems.length : menuItems.filter(i => i.category===cat).length
                    const isActive = menuCatFilter===cat
                    return (
                      <button key={cat} onClick={() => { setMenuCatFilter(cat); setEditingItem(null) }} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight: isActive?700:500, background: isActive?'#E24B4A':'#f3f4f6', color: isActive?'#fff':'#6b7280', boxShadow: isActive?'0 4px 12px rgba(226,75,74,0.3)':'none', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                        {cat} <span style={{ opacity:0.7, fontSize:10 }}>({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {showAddItem && (
              <div style={{ background:'#f9fafb', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, padding:14, marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>New Menu Item</div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {[true,false].map(isV => (
                    <button key={String(isV)} onClick={() => setNewItem(p=>({...p,isVeg:isV}))} style={{ flex:1, padding:'8px 0', borderRadius:8, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:600, borderWidth:2, borderStyle:'solid', borderColor: newItem.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#e5e7eb', background: newItem.isVeg===isV?(isV?'#f0fdf4':'#fff5f5'):'#fff', color: newItem.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#9ca3af' }}>
                      <span style={{ marginRight:5 }}>{isV?'🟢':'🔴'}</span>{isV?'Veg':'Non-Veg'}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input style={inp} placeholder="Item name *" value={newItem.name} onChange={e => setNewItem(p=>({...p,name:e.target.value}))} />
                  <input style={inp} type="number" placeholder="Price (₹) *" value={newItem.price} onChange={e => setNewItem(p=>({...p,price:e.target.value}))} />
                  <textarea style={{...inp,minHeight:70,resize:'vertical',lineHeight:1.5}} placeholder="Description e.g. 2 Roti + Dal + Rice" value={newItem.description} onChange={e => setNewItem(p=>({...p,description:e.target.value}))} />
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Category</label>
                    <div style={{ display:'flex', gap:6, marginTop:4 }}>
                      <select style={{...inp,marginTop:0,flex:1,cursor:'pointer'}} value={newItem.category} onChange={e => setNewItem(p=>({...p,category:e.target.value}))}>
                        {allCategories.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button onClick={() => setShowAddCat(!showAddCat)} style={{ padding:'0 12px', background:'#f3f4f6', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:18, cursor:'pointer', flexShrink:0 }}>+</button>
                    </div>
                  </div>
                  {showAddCat && (
                    <div style={{ display:'flex', gap:6 }}>
                      <input style={{...inp,marginTop:0,flex:1}} placeholder="New category name" value={newCatInput} onChange={e => setNewCatInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleAddCategory()} />
                      <button onClick={handleAddCategory} style={{ padding:'0 14px', background:'#E24B4A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600, flexShrink:0 }}>Add</button>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Item Photo (optional)</label>
                    <div onClick={() => newItemPhotoRef.current?.click()} style={{ marginTop:6, borderWidth:2, borderStyle:'dashed', borderColor:'#e5e7eb', borderRadius:10, padding:16, textAlign:'center', cursor:'pointer', background:'#fafafa', minHeight:80, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {newItemPhotoPreview ? <img src={newItemPhotoPreview} alt="preview" style={{ maxHeight:120, maxWidth:'100%', objectFit:'cover', borderRadius:8 }} /> : <div><div style={{ fontSize:28 }}>📷</div><div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>Tap to add photo</div></div>}
                    </div>
                    <input ref={newItemPhotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleNewItemPhotoSelect} />
                    {newItemPhotoPreview && <button onClick={() => { setNewItemPhotoFile(null); setNewItemPhotoPreview(null) }} style={{ marginTop:4, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'Poppins' }}>✕ Remove photo</button>}
                  </div>
                  {addingItem && newItemPhotoFile && itemPhotoProgress > 0 && <div style={{ background:'#f3f4f6', borderRadius:8, overflow:'hidden', height:6 }}><div style={{ height:'100%', background:'#E24B4A', width:`${itemPhotoProgress}%`, transition:'width 0.3s' }} /></div>}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleAddItem} disabled={addingItem} style={{ flex:1, background: addingItem?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:11, borderRadius:8, fontSize:13, cursor: addingItem?'not-allowed':'pointer', fontFamily:'Poppins', fontWeight:500 }}>{addingItem?'Adding...':'✅ Add to Menu'}</button>
                    <button onClick={() => { setShowAddItem(false); setNewItem(EMPTY_ITEM); setNewItemPhotoFile(null); setNewItemPhotoPreview(null); setShowAddCat(false) }} style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:11, borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {filteredMenuItems.length===0 && !showAddItem && <div style={{ textAlign:'center', color:'#9ca3af', padding:32, fontSize:13 }}>{menuItems.length===0?'No items yet. Add your first menu item!':`No items in "${menuCatFilter}"`}</div>}

            {filteredMenuItems.map(item => (
              <div key={item.id}>
                {menuEditMode && editingItem===item.id ? (
                  <div style={{ background:'#fffbeb', borderWidth:1.5, borderStyle:'solid', borderColor:'#fde68a', borderRadius:14, padding:14, marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span>✏️ Editing: {item.name}</span>
                      <button onClick={() => setEditingItem(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#9ca3af' }}>✕</button>
                    </div>
                    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                      {[true,false].map(isV => (
                        <button key={String(isV)} onClick={() => setEditItemData(p=>({...p,isVeg:isV}))} style={{ flex:1, padding:'7px 0', borderRadius:8, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:600, borderWidth:2, borderStyle:'solid', borderColor: editItemData.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#e5e7eb', background: editItemData.isVeg===isV?(isV?'#f0fdf4':'#fff5f5'):'#fff', color: editItemData.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#9ca3af' }}>
                          {isV?'🟢 Veg':'🔴 Non-Veg'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Item Name *</label><input style={inp} value={editItemData.name} onChange={e => setEditItemData(p=>({...p,name:e.target.value}))} placeholder="Item name" /></div>
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Price (₹) *</label><input style={inp} type="number" value={editItemData.price} onChange={e => setEditItemData(p=>({...p,price:e.target.value}))} placeholder="Price" /></div>
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Description</label><textarea style={{...inp,minHeight:60,resize:'vertical',lineHeight:1.5}} value={editItemData.description} onChange={e => setEditItemData(p=>({...p,description:e.target.value}))} placeholder="What's included?" /></div>
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Category</label><select style={{...inp,cursor:'pointer'}} value={editItemData.category} onChange={e => setEditItemData(p=>({...p,category:e.target.value}))}>{allCategories.map(c => <option key={c}>{c}</option>)}</select></div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => handleSaveEdit(item.id)} disabled={savingEdit} style={{ flex:2, background: savingEdit?'#f09595':'#16a34a', color:'#fff', border:'none', padding:'11px 0', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>{savingEdit?'Saving...':'💾 Save Changes'}</button>
                        <button onClick={() => setEditingItem(null)} style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'11px 0', borderRadius:9, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background: menuEditMode?'#fafafa':'transparent', borderRadius: menuEditMode?10:0, paddingLeft: menuEditMode?8:0, marginBottom: menuEditMode?4:0 }}>
                    <div onClick={() => { const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=(e)=>handleExistingItemPhoto(e,item.id); input.click() }} style={{ width:64, height:64, borderRadius:10, overflow:'hidden', background:'#f3f4f6', flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
                      {item.photo?<img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />:<span style={{ fontSize:22 }}>📷</span>}
                      {itemPhotoUploading===item.id && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>{itemPhotoProgress}%</div>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:14, height:14, borderRadius:3, flexShrink:0, borderWidth:1.5, borderStyle:'solid', borderColor: item.isVeg===false?'#dc2626':'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:7, height:7, borderRadius:'50%', background: item.isVeg===false?'#dc2626':'#16a34a' }} /></div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{item.name}</div>
                      </div>
                      {item.description && <div style={{ fontSize:11, color:'#6b7280', marginTop:2, lineHeight:1.4 }}>{item.description}</div>}
                      <div style={{ display:'flex', gap:8, marginTop:3, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'#E24B4A' }}>₹{item.price}</span>
                        <span style={{ fontSize:10, color:'#9ca3af' }}>·</span>
                        <span style={{ fontSize:11, color:'#9ca3af' }}>{item.category}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center', flexShrink:0 }}>
                      {menuEditMode && <button onClick={() => startEditItem(item)} style={{ background:'#E24B4A', color:'#fff', border:'none', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap' }}>✏️ Edit</button>}
                      <div onClick={() => updateMenuItem(user.uid, item.id, { available: !item.available })} style={{ width:40, height:22, background: item.available?'#16a34a':'#d1d5db', borderRadius:11, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                        <div style={{ position:'absolute', width:16, height:16, background:'#fff', borderRadius:'50%', top:3, left: item.available?21:3, transition:'left 0.2s' }} />
                      </div>
                      <button onClick={() => { deleteMenuItem(user.uid, item.id); toast.success('Item deleted') }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#dc2626', padding:2 }}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── EARNINGS TAB ── */}
        {tab === 'earnings' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:"Today's Sales", val:`₹${todayRevenue.toLocaleString()}`, sub:`${orders.filter(o=>o.status==='delivered').length} delivered` },
                { label:"Total Orders",  val:orders.length, sub:`${liveOrders.length} active` },
                { label:"COD Collected", val:`₹${todayRevenue.toLocaleString()}`, sub:"pending settlement" },
                { label:"Menu Items",    val:menuItems.length, sub:`${menuItems.filter(m=>m.available).length} available` }
              ].map(s => (
                <div key={s.label} style={{ background:'#f9fafb', borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontWeight:600 }}>{s.val}</div>
                  <div style={{ fontSize:10, color:'#16a34a', marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#f9fafb', borderRadius:10, padding:12 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Recent Delivered Orders</div>
              {orders.filter(o=>o.status==='delivered').slice(0,5).map(o => (
                <div key={o.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#e5e7eb' }}>
                  <span style={{ fontSize:12 }}>{o.userName} · {o.items?.length} item(s)</span>
                  <span style={{ fontSize:12, fontWeight:600 }}>₹{o.total}</span>
                </div>
              ))}
              {orders.filter(o=>o.status==='delivered').length===0 && <div style={{ fontSize:12, color:'#9ca3af', textAlign:'center', padding:16 }}>No delivered orders yet</div>}
            </div>
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Store Info</div>
              {[
                { label:'Store Name', val:userData?.storeName },
                { label:'Email', val:userData?.email },
                { label:'Phone / WhatsApp', val:userData?.phone },
                { label:'Address', val:userData?.address },
                { label:'Category', val:userData?.category },
                { label:'Subscription Plan', val:userData?.plan }
              ].map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#e5e7eb' }}>
                  <span style={{ fontSize:12, color:'#6b7280' }}>{f.label}</span>
                  <span style={{ fontSize:12, fontWeight:500 }}>{f.val||'—'}</span>
                </div>
              ))}
            </div>

            {customCategories.length > 0 && (
              <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Your Custom Categories</div>
                {customCategories.map(c => (
                  <div key={c} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                    <span style={{ fontSize:13 }}>{c}</span>
                    <button onClick={async () => { const updated=customCategories.filter(x=>x!==c); setCustomCategories(updated); await updateVendorStore(user.uid,{customCategories:updated}); toast.success(`"${c}" removed`) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626', fontSize:13 }}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>📍 Store Location</div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>{vendorLocation?<span style={{ color:'#16a34a', fontWeight:500 }}>✅ Location set: {locationName}</span>:<span style={{ color:'#dc2626' }}>⚠️ Location not set</span>}</div>
              <button onClick={handleDetectLocation} disabled={detectingLocation} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'#fff5f5', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', borderRadius:10, cursor:'pointer', marginBottom:8, fontFamily:'Poppins' }}>
                <span style={{ fontSize:18 }}>📍</span>
                <div style={{ textAlign:'left' }}><div style={{ fontSize:13, fontWeight:600, color:'#E24B4A' }}>{detectingLocation?'Detecting...':'Use Current GPS Location'}</div><div style={{ fontSize:11, color:'#9ca3af' }}>Automatically detect store location</div></div>
              </button>
              <div style={{ position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, background:'#fff' }}>
                  <span>🔍</span>
                  <input style={{ border:'none', outline:'none', fontSize:13, flex:1, fontFamily:'Poppins' }} placeholder="Search area / city manually..." value={locationSearch} onChange={e => handleLocationSearch(e.target.value)} />
                  {searchingLoc && <span style={{ fontSize:11, color:'#9ca3af' }}>...</span>}
                </div>
                {locationSuggestions.length > 0 && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, zIndex:50, marginTop:4, overflow:'hidden' }}>
                    {locationSuggestions.map((s,i) => (
                      <button key={i} onClick={() => handleSelectLocation(s)} style={{ width:'100%', padding:'10px 14px', border:'none', borderBottomWidth: i<locationSuggestions.length-1?1:0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background:'#fff', cursor:'pointer', textAlign:'left', fontFamily:'Poppins', display:'flex', gap:8, alignItems:'center' }}>
                        <span>📍</span>
                        <div><div style={{ fontSize:13, color:'#1f2937' }}>{s.name.split(",")[0]}</div><div style={{ fontSize:11, color:'#9ca3af' }}>{s.name.split(",").slice(1,3).join(",")}</div></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>🏪 Store Details</div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🚴 Delivery Charge (₹)</label><input type="number" placeholder="e.g. 20 (0 for free delivery)" value={deliveryCharge} onChange={e => setDeliveryCharge(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }} /></div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>📋 FSSAI Licence Number</label><input type="text" placeholder="e.g. 10012345000123" value={fssai} onChange={e => setFssai(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }} /></div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🕐 Opening Hours</label>
                <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center' }}>
                  <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={{ flex:1, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none' }} />
                  <span style={{ fontSize:12, color:'#6b7280' }}>to</span>
                  <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={{ flex:1, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none' }} />
                </div>
              </div>
              <button onClick={handleSaveDetails} disabled={savingDetails} style={{ width:'100%', background: savingDetails?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:11, borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>{savingDetails?'Saving...':'💾 Save Store Details'}</button>
            </div>

            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>Logout</button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          CANCEL ORDER MODAL
      ══════════════════════════════════════════════ */}
      {showCancelModal && cancelOrderTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1100, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e => { if(e.target===e.currentTarget) setShowCancelModal(false) }}>
          <div style={{ background:'#fff', borderRadius:'22px 22px 0 0', maxHeight:'85vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}><div style={{ width:40, height:4, borderRadius:2, background:'#e5e7eb' }} /></div>
            <div style={{ padding:'16px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'#dc2626' }}>🚫 Cancel Order</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:3 }}>Order #{cancelOrderTarget.id.slice(-6).toUpperCase()} · {cancelOrderTarget.userName}</div>
              </div>
              <button onClick={() => setShowCancelModal(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'0 20px 36px' }}>
              <div style={{ background:'#fff5f5', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', borderRadius:12, padding:'12px 14px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
                <div style={{ fontSize:12, color:'#991b1b', lineHeight:1.6 }}>The customer will be notified that their order was cancelled. This action cannot be undone.</div>
              </div>
              <div style={{ background:'#f9fafb', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
                <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:6 }}>ORDER SUMMARY</div>
                <div style={{ fontSize:13, color:'#374151' }}>{cancelOrderTarget.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#E24B4A', marginTop:4 }}>₹{cancelOrderTarget.total}</div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>Select cancellation reason *</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {CANCEL_REASONS.map(reason => (
                    <button key={reason} onClick={() => setCancelReason(reason==='Other'?'':reason)} style={{ width:'100%', padding:'11px 14px', borderRadius:10, cursor:'pointer', fontFamily:'Poppins', fontSize:13, fontWeight:500, textAlign:'left', display:'flex', alignItems:'center', gap:10, borderWidth:1.5, borderStyle:'solid', borderColor: cancelReason===reason?'#E24B4A':'#e5e7eb', background: cancelReason===reason?'#fff5f5':'#fff', color:'#374151', transition:'all 0.15s' }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, borderWidth:2, borderStyle:'solid', borderColor: cancelReason===reason?'#E24B4A':'#d1d5db', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {cancelReason===reason && <div style={{ width:8, height:8, borderRadius:'50%', background:'#E24B4A' }} />}
                      </div>
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              {(cancelReason==='' || !CANCEL_REASONS.slice(0,-1).includes(cancelReason)) && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:6 }}>{cancelReason===''?'Or type a custom reason:':'Custom reason:'}</div>
                  <textarea value={!CANCEL_REASONS.slice(0,-1).includes(cancelReason)?cancelReason:''} onChange={e => setCancelReason(e.target.value)} placeholder="Describe why you are cancelling this order..." rows={3} style={{ width:'100%', padding:'10px 12px', borderWidth:1.5, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
                </div>
              )}
              <button onClick={handleVendorCancelOrder} disabled={cancellingOrder || !cancelReason.trim()} style={{ width:'100%', background: (cancellingOrder||!cancelReason.trim())?'#fca5a5':'#dc2626', color:'#fff', border:'none', padding:'14px 0', borderRadius:12, fontSize:14, fontWeight:700, cursor: (cancellingOrder||!cancelReason.trim())?'not-allowed':'pointer', fontFamily:'Poppins', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {cancellingOrder?'⏳ Cancelling...':'🚫 Confirm Cancel Order'}
              </button>
              <button onClick={() => setShowCancelModal(false)} style={{ width:'100%', background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'12px 0', borderRadius:12, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Keep Order Active</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}