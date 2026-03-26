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

const DEFAULT_CATEGORIES = ['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice']

const EMPTY_ITEM = { name:'', price:'', category:'Thali', description:'', isVeg: true }

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

  // Order alert states
  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const prevOrderCountRef = useRef(0)
  const { startAlarm, stopAlarm, playNotifSound, unlockAudio } = useOrderAlert()
  usePendingOrderNotifier(true) // trigger FCM every 10 sec for pending orders

  // Unlock audio on first user interaction
  useEffect(() => {
    const unlock = () => {
      unlockAudio()
      setAudioUnlocked(true)
    }
    document.addEventListener('click', unlock, { once: true })
    document.addEventListener('touchstart', unlock, { once: true })
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  // Store details states
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [fssai, setFssai] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)

  // Photo states
  const [vendorPhotoUploading, setVendorPhotoUploading] = useState(false)
  const [vendorPhotoProgress, setVendorPhotoProgress] = useState(0)
  const [itemPhotoUploading, setItemPhotoUploading] = useState(null)
  const [itemPhotoProgress, setItemPhotoProgress] = useState(0)
  const [newItemPhotoFile, setNewItemPhotoFile] = useState(null)
  const [newItemPhotoPreview, setNewItemPhotoPreview] = useState(null)
  const [addingItem, setAddingItem] = useState(false)

  const vendorPhotoRef = useRef()
  const newItemPhotoRef = useRef()

  // Location states
  const [vendorLocation, setVendorLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [searchingLoc, setSearchingLoc] = useState(false)

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  // Setup FCM notifications for vendor
  useNotifications(user?.uid, 'vendor')

  // Listen Firestore notifications
  useEffect(() => {
    if (!user) return
    return listenNotifications(user.uid, (notifs) => {
      notifs.forEach(n => {
        toast(n.body, { icon: '🔔', duration: 6000 })
        markNotificationRead(n.id)
      })
    })
  }, [user])

  // ── DETECT NEW ORDERS + PLAY ALARM ──────────────────────────────────────
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending')
    const pendingCount = pendingOrders.length

    if (pendingCount > prevOrderCountRef.current && prevOrderCountRef.current >= 0) {
      // New pending order arrived!
      const latestOrder = pendingOrders[0]
      setNewOrderAlert(latestOrder)
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
    // Load saved custom categories from userData
    if (userData?.customCategories) setCustomCategories(userData.customCategories)
    if (userData?.deliveryCharge !== undefined) setDeliveryCharge(String(userData.deliveryCharge ?? ''))
    if (userData?.fssai) setFssai(userData.fssai)
    if (userData?.openTime) setOpenTime(userData.openTime)
    if (userData?.closeTime) setCloseTime(userData.closeTime)
    if (userData?.location) {
      setVendorLocation(userData.location)
      setLocationName(userData.locationName || '')
    }
    const u1 = getVendorOrders(user.uid, setOrders)
    const u2 = getMenuItems(user.uid, setMenuItems)
    return () => { u1(); u2() }
  }, [user, userData])

  // ── REVERSE GEOCODE ──────────────────────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || "Your Location"
    } catch { return "Your Location" }
  }

  // ── DETECT VENDOR GPS LOCATION ────────────────────────────────────────────
  const handleDetectLocation = async () => {
    setDetectingLocation(true)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      )
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const name = await reverseGeocode(lat, lng)
      setVendorLocation({ lat, lng })
      setLocationName(name)
      await updateVendorStore(user.uid, { location: { lat, lng }, locationName: name })
      toast.success(`📍 Location set: ${name}`)
    } catch {
      toast.error("Could not detect location. Enable GPS.")
    }
    setDetectingLocation(false)
  }

  // ── SEARCH LOCATION ────────────────────────────────────────────────────────
  const handleLocationSearch = async (q) => {
    setLocationSearch(q)
    if (q.length < 3) { setLocationSuggestions([]); return }
    setSearchingLoc(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocationSuggestions(data.map(d => ({
        name: d.display_name.split(",").slice(0, 3).join(", "),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
      })))
    } catch { setLocationSuggestions([]) }
    setSearchingLoc(false)
  }

  const handleSelectLocation = async (s) => {
    const name = s.name.split(",")[0]
    setVendorLocation({ lat: s.lat, lng: s.lng })
    setLocationName(name)
    await updateVendorStore(user.uid, { location: { lat: s.lat, lng: s.lng }, locationName: name })
    toast.success(`📍 Location set: ${name}`)
    setLocationSearch("")
    setLocationSuggestions([])
  }

  // ── SAVE STORE DETAILS ───────────────────────────────────────────────────
  const handleSaveDetails = async () => {
    setSavingDetails(true)
    try {
      await updateVendorStore(user.uid, {
        deliveryCharge: deliveryCharge === '' ? 0 : Number(deliveryCharge),
        fssai: fssai.trim(),
        openTime: openTime.trim(),
        closeTime: closeTime.trim(),
      })
      toast.success('Store details saved! ✅')
    } catch { toast.error('Failed to save. Try again.') }
    setSavingDetails(false)
  }

  const toggleStore = async () => {
    const val = !isOpen
    setIsOpen(val)
    await updateVendorStore(user.uid, { isOpen: val })
    toast.success(val ? '🟢 Store is now Open!' : '🔴 Store is now Closed')
  }

  const handleStatus = async (orderId, current, orderData = {}) => {
    const next = STATUS_NEXT[current]
    if (!next) return
    await updateOrderStatus(orderId, next, orderData)
    toast.success(`Order → ${next.replace('_',' ')}`)
  }

  const handleReject = async (orderId) => {
    await updateOrderStatus(orderId, 'cancelled')
    toast.error('Order rejected')
  }

  // ── ADD CUSTOM CATEGORY ───────────────────────────────────────────────────
  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim()
    if (!trimmed) return toast.error('Enter category name')
    if (allCategories.map(c=>c.toLowerCase()).includes(trimmed.toLowerCase())) return toast.error('Category already exists')
    const updated = [...customCategories, trimmed]
    setCustomCategories(updated)
    setNewItem(p => ({ ...p, category: trimmed }))
    await updateVendorStore(user.uid, { customCategories: updated })
    setNewCatInput('')
    setShowAddCat(false)
    toast.success(`Category "${trimmed}" added!`)
  }

  // ── VENDOR STORE PHOTO ────────────────────────────────────────────────────
  const handleVendorPhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setVendorPhotoUploading(true)
    setVendorPhotoProgress(0)
    try {
      await uploadVendorPhoto(user.uid, file, 'photo', setVendorPhotoProgress)
      toast.success('Store photo updated! ✅')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed. Check Firebase Storage rules.')
    }
    setVendorPhotoUploading(false)
    setVendorPhotoProgress(0)
    e.target.value = ''
  }

  // ── NEW ITEM PHOTO PREVIEW ────────────────────────────────────────────────
  const handleNewItemPhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setNewItemPhotoFile(file)
    setNewItemPhotoPreview(URL.createObjectURL(file))
  }

  // ── ADD MENU ITEM ─────────────────────────────────────────────────────────
  const handleAddItem = async () => {
    if (!newItem.name.trim()) return toast.error('Enter item name')
    if (!newItem.price || isNaN(newItem.price) || Number(newItem.price) <= 0) return toast.error('Enter valid price')
    setAddingItem(true)
    try {
      const docRef = await addMenuItem(user.uid, {
        name: newItem.name.trim(),
        price: Number(newItem.price),
        category: newItem.category,
        description: newItem.description.trim(),
        isVeg: newItem.isVeg,
        photo: ''
      })
      // Upload photo after item created
      if (newItemPhotoFile && docRef?.id) {
        await uploadMenuItemPhoto(user.uid, docRef.id, newItemPhotoFile, setItemPhotoProgress)
      }
      setNewItem(EMPTY_ITEM)
      setNewItemPhotoFile(null)
      setNewItemPhotoPreview(null)
      setShowAddItem(false)
      toast.success('Menu item added! 🎉')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add item. Try again.')
    }
    setAddingItem(false)
    setItemPhotoProgress(0)
  }

  // ── UPLOAD PHOTO FOR EXISTING ITEM ───────────────────────────────────────
  const handleExistingItemPhoto = async (e, itemId) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setItemPhotoUploading(itemId)
    setItemPhotoProgress(0)
    try {
      await uploadMenuItemPhoto(user.uid, itemId, file, setItemPhotoProgress)
      toast.success('Photo updated! ✅')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed. Check Firebase Storage rules.')
    }
    setItemPhotoUploading(null)
    setItemPhotoProgress(0)
    e.target.value = ''
  }

  const liveOrders   = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const pastOrders   = orders.filter(o => ['delivered','cancelled'].includes(o.status))
  const todayRevenue = orders.filter(o => o.status==='delivered').reduce((s,o) => s+(o.total||0), 0)

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inp = {
    width:'100%', padding:'10px 12px',
    borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:8, fontSize:13,
    fontFamily:'Poppins,sans-serif', outline:'none',
    marginTop:4, boxSizing:'border-box'
  }

  // ── DISMISS ALERT ──────────────────────────────────────────────────────
  const handleDismissAlert = () => {
    stopAlarm()
    setNewOrderAlert(null)
    setAlertDismissed(true)
    setTab('orders') // switch to orders tab
  }

  const handleAcceptFromAlert = async () => {
    if (!newOrderAlert) return
    stopAlarm()
    try {
      await updateOrderStatus(newOrderAlert.id, 'accepted', {
        userUid: newOrderAlert.userUid,
        vendorName: userData?.storeName || '',
      })
      toast.success('✅ Order Accepted!')
    } catch { toast.error('Failed to accept') }
    setNewOrderAlert(null)
    setTab('orders')
  }

  return (
    <div style={{ maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background:'#1a1a1a', padding:16, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Store photo — tap to upload */}
            <div
              onClick={() => vendorPhotoRef.current?.click()}
              style={{
                width:44, height:44, borderRadius:10, overflow:'hidden',
                background:'#2a2a2a', cursor:'pointer', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                borderWidth:2, borderStyle:'solid', borderColor:'#333',
                position:'relative'
              }}
            >
              {userData?.photo
                ? <img src={userData.photo} alt="store" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontSize:20 }}>🏪</span>
              }
              {vendorPhotoUploading && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700 }}>
                  {vendorPhotoProgress}%
                </div>
              )}
            </div>
            <input ref={vendorPhotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleVendorPhotoChange} />
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{userData?.storeName || 'My Store'}</div>
              <div style={{ fontSize:10, color:'#888', marginTop:1 }}>📷 Tap photo to change · {userData?.category||'Food'}</div>
            </div>
          </div>
          {/* Open/Close toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color: isOpen?'#4ade80':'#9ca3af' }}>{isOpen?'Open':'Closed'}</span>
            <div
              onClick={toggleStore}
              style={{ width:44, height:24, background: isOpen?'#16a34a':'#6b7280', borderRadius:12, cursor:'pointer', position:'relative', transition:'background 0.2s' }}
            >
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
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{
            flexShrink:0, padding:'11px 16px', fontSize:12, fontWeight:500,
            color: tab===t2.id?'#E24B4A':'#888',
            borderBottomWidth:2, borderBottomStyle:'solid',
            borderBottomColor: tab===t2.id?'#E24B4A':'transparent',
            borderTop:'none', borderLeft:'none', borderRight:'none',
            background:'transparent', cursor:'pointer',
            fontFamily:'Poppins', whiteSpace:'nowrap'
          }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <>
            {/* ── FULL SCREEN ORDER DETAIL ── */}
            {selectedVendorOrder && (
              <div style={{ position:'fixed', inset:0, background:'#f7f7f7', zIndex:999, overflowY:'auto', maxWidth:430, margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>

                {/* Header */}
                <div style={{ background: selectedVendorOrder.status==='pending' ? 'linear-gradient(135deg,#E24B4A,#c73232)' : selectedVendorOrder.status==='delivered' ? 'linear-gradient(135deg,#16a34a,#15803d)' : selectedVendorOrder.status==='cancelled' ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', padding:'20px 16px 28px', color:'#fff', position:'relative' }}>
                  <button onClick={() => setSelectedVendorOrder(null)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'Poppins', marginBottom:16 }}>
                    ← Back to Orders
                  </button>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:11, opacity:0.7, letterSpacing:1, marginBottom:4 }}>ORDER</div>
                      <div style={{ fontSize:24, fontWeight:900, letterSpacing:-0.5 }}>#{selectedVendorOrder.id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize:12, opacity:0.85, marginTop:4 }}>
                        {selectedVendorOrder.createdAt?.toDate?.()?.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) || ''}
                      </div>
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
                    {/* Call / WhatsApp */}
                    {selectedVendorOrder.userPhone && (
                      <div style={{ display:'flex', gap:8, marginTop:10 }}>
                        <a href={`tel:+91${selectedVendorOrder.userPhone}`}
                          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 0', background:'#E24B4A', borderRadius:10, textDecoration:'none' }}>
                          <span style={{ fontSize:16 }}>📞</span>
                          <span style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'Poppins' }}>Call Customer</span>
                        </a>
                        <a href={`https://wa.me/91${selectedVendorOrder.userPhone}`} target="_blank" rel="noreferrer"
                          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 0', background:'#25D366', borderRadius:10, textDecoration:'none' }}>
                          <span style={{ fontSize:16 }}>💬</span>
                          <span style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'Poppins' }}>WhatsApp</span>
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
                    {/* Bill summary */}
                    <div style={{ marginTop:12, paddingTop:12, borderTopWidth:2, borderTopStyle:'dashed', borderTopColor:'#f3f4f6' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:13, color:'#6b7280' }}>Subtotal</span>
                        <span style={{ fontSize:13 }}>₹{selectedVendorOrder.subtotal || selectedVendorOrder.total}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:13, color:'#6b7280' }}>Delivery fee</span>
                        <span style={{ fontSize:13, color: selectedVendorOrder.deliveryFee===0 ? '#16a34a' : '#1f2937' }}>{selectedVendorOrder.deliveryFee === 0 ? 'Free 🎉' : `₹${selectedVendorOrder.deliveryFee}`}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb' }}>
                        <span style={{ fontSize:16, fontWeight:800, color:'#1f2937' }}>Total</span>
                        <span style={{ fontSize:16, fontWeight:800, color:'#E24B4A' }}>₹{selectedVendorOrder.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special note */}
                  {selectedVendorOrder.address?.includes('Note:') && (
                    <div style={{ background:'#fef3c7', borderRadius:12, padding:'12px 14px', marginBottom:12, borderWidth:1, borderStyle:'solid', borderColor:'#fde68a' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#92400e', marginBottom:4 }}>📝 SPECIAL NOTE</div>
                      <div style={{ fontSize:13, color:'#78350f' }}>{selectedVendorOrder.address.split('Note:')[1]?.trim()}</div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!['delivered','cancelled'].includes(selectedVendorOrder.status) && (
                    <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                      {selectedVendorOrder.status === 'pending' && (
                        <button onClick={async () => { await handleReject(selectedVendorOrder.id); setSelectedVendorOrder(null) }}
                          style={{ flex:1, background:'transparent', color:'#E24B4A', borderWidth:2, borderStyle:'solid', borderColor:'#E24B4A', padding:'14px 0', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                          ❌ Reject
                        </button>
                      )}
                      {STATUS_NEXT[selectedVendorOrder.status] && (
                        <button onClick={async () => {
                          await handleStatus(selectedVendorOrder.id, selectedVendorOrder.status, { userUid: selectedVendorOrder.userUid, vendorName: userData?.storeName || '' })
                          setSelectedVendorOrder(prev => ({ ...prev, status: STATUS_NEXT[prev.status] }))
                        }}
                          style={{ flex:2, background: selectedVendorOrder.status==='pending' ? '#E24B4A' : '#16a34a', color:'#fff', border:'none', padding:'14px 0', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                          {STATUS_LABEL[selectedVendorOrder.status]} ✓
                        </button>
                      )}
                    </div>
                  )}
                  {selectedVendorOrder.status === 'delivered' && (
                    <div style={{ background:'#d1fae5', borderRadius:12, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>✅</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#065f46' }}>Order Delivered Successfully!</div>
                    </div>
                  )}
                  {selectedVendorOrder.status === 'cancelled' && (
                    <div style={{ background:'#fee2e2', borderRadius:12, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>❌</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#991b1b' }}>Order Cancelled</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {liveOrders.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:32, fontSize:13 }}>No active orders right now</div>
            )}
            {liveOrders.map(order => (
              <div key={order.id} onClick={() => setSelectedVendorOrder(order)} style={{ background:'#fff', borderWidth:1, borderStyle:'solid', borderColor: order.status==='pending'?'#fecaca':'#e5e7eb', borderRadius:12, padding:14, marginBottom:10, cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>#{order.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:2, fontWeight:500 }}>{order.userName} · {order.userPhone}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>📍 {order.address?.slice(0,40)}{order.address?.length>40?'...':''}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20,
                    background: order.status==='pending'?'#fef3c7': order.status==='accepted'?'#dbeafe': order.status==='preparing'?'#ede9fe': order.status==='ready'?'#dcfce7':'#f3f4f6',
                    color: order.status==='pending'?'#92400e': order.status==='accepted'?'#1e40af': order.status==='preparing'?'#6d28d9': order.status==='ready'?'#15803d':'#374151'
                  }}>{order.status?.replace('_',' ').toUpperCase()}</span>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>
                  {order.items?.map(i => `${i.qty}x ${i.name}`).join(' · ')}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#E24B4A' }}>₹{order.total} <span style={{ fontSize:11, color:'#9ca3af', fontWeight:400 }}>COD</span></div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Tap for details →</span>
                  </div>
                </div>
                {/* Quick action buttons on card */}
                <div style={{ display:'flex', gap:8, marginTop:10 }} onClick={e => e.stopPropagation()}>
                  {order.status === 'pending' && (
                    <button onClick={() => handleReject(order.id)} style={{ background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>Reject</button>
                  )}
                  {STATUS_NEXT[order.status] && (
                    <button onClick={() => handleStatus(order.id, order.status, { userUid: order.userUid, vendorName: userData?.storeName || '' })}
                      style={{ flex:1, background: order.status==='pending'?'#E24B4A':'#1a1a1a', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600 }}>
                      {STATUS_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {pastOrders.length > 0 && (
              <>
                <div style={{ fontSize:12, color:'#9ca3af', margin:'8px 0 6px', textTransform:'uppercase', letterSpacing:0.5 }}>Past Orders</div>
                {pastOrders.slice(0,10).map(order => (
                  <div key={order.id} onClick={() => setSelectedVendorOrder(order)} style={{ background:'#f9fafb', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6', borderRadius:10, padding:12, marginBottom:8, cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600 }}>#{order.id.slice(-6).toUpperCase()} · {order.items?.length} item(s)</div>
                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{order.userName} · {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10,
                        background: order.status==='delivered'?'#d1fae5':'#fee2e2',
                        color: order.status==='delivered'?'#065f46':'#991b1b'
                      }}>{order.status}</span>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#E24B4A', marginTop:6 }}>₹{order.total}</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:13, color:'#6b7280' }}>{menuItems.length} items in menu</span>
              <button
                onClick={() => setShowAddItem(!showAddItem)}
                style={{ background:'#E24B4A', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}
              >+ Add Item</button>
            </div>

            {/* ── ADD ITEM FORM ── */}
            {showAddItem && (
              <div style={{ background:'#f9fafb', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, padding:14, marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>New Menu Item</div>

                {/* Veg / Non-Veg toggle */}
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {[true, false].map(isV => (
                    <button
                      key={String(isV)}
                      onClick={() => setNewItem(p => ({ ...p, isVeg: isV }))}
                      style={{
                        flex:1, padding:'8px 0',
                        borderRadius:8, cursor:'pointer',
                        fontFamily:'Poppins', fontSize:12, fontWeight:600,
                        borderWidth:2, borderStyle:'solid',
                        borderColor: newItem.isVeg === isV ? (isV?'#16a34a':'#dc2626') : '#e5e7eb',
                        background: newItem.isVeg === isV ? (isV?'#f0fdf4':'#fff5f5') : '#fff',
                        color: newItem.isVeg === isV ? (isV?'#16a34a':'#dc2626') : '#9ca3af',
                        transition:'all 0.15s'
                      }}
                    >
                      <span style={{ marginRight:5 }}>{isV ? '🟢' : '🔴'}</span>
                      {isV ? 'Veg' : 'Non-Veg'}
                    </button>
                  ))}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input
                    style={inp}
                    placeholder="Item name *  e.g. Veg Thali"
                    value={newItem.name}
                    onChange={e => setNewItem(p=>({...p, name:e.target.value}))}
                  />
                  <input
                    style={inp}
                    type="number"
                    placeholder="Price (₹) *"
                    value={newItem.price}
                    onChange={e => setNewItem(p=>({...p, price:e.target.value}))}
                  />

                  {/* Description / Notes */}
                  <textarea
                    style={{ ...inp, minHeight:70, resize:'vertical', lineHeight:1.5 }}
                    placeholder="What's included? e.g. 2 Roti + Dal + Rice + Pickle + Salad"
                    value={newItem.description}
                    onChange={e => setNewItem(p=>({...p, description:e.target.value}))}
                  />

                  {/* Category selector + Add new category */}
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Category</label>
                    <div style={{ display:'flex', gap:6, marginTop:4 }}>
                      <select
                        style={{ ...inp, marginTop:0, flex:1, cursor:'pointer' }}
                        value={newItem.category}
                        onChange={e => setNewItem(p=>({...p, category:e.target.value}))}
                      >
                        {allCategories.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button
                        onClick={() => setShowAddCat(!showAddCat)}
                        style={{ padding:'0 12px', background:'#f3f4f6', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:18, cursor:'pointer', flexShrink:0 }}
                        title="Add new category"
                      >+</button>
                    </div>
                  </div>

                  {/* New category input */}
                  {showAddCat && (
                    <div style={{ display:'flex', gap:6 }}>
                      <input
                        style={{ ...inp, marginTop:0, flex:1 }}
                        placeholder="New category name e.g. Pav Bhaji"
                        value={newCatInput}
                        onChange={e => setNewCatInput(e.target.value)}
                        onKeyDown={e => e.key==='Enter' && handleAddCategory()}
                      />
                      <button
                        onClick={handleAddCategory}
                        style={{ padding:'0 14px', background:'#E24B4A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600, flexShrink:0 }}
                      >Add</button>
                    </div>
                  )}

                  {/* Photo picker */}
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Item Photo (optional)</label>
                    <div
                      onClick={() => newItemPhotoRef.current?.click()}
                      style={{
                        marginTop:6, borderWidth:2, borderStyle:'dashed', borderColor:'#e5e7eb',
                        borderRadius:10, padding:16, textAlign:'center', cursor:'pointer',
                        background:'#fafafa', overflow:'hidden', minHeight:80,
                        display:'flex', alignItems:'center', justifyContent:'center'
                      }}
                    >
                      {newItemPhotoPreview
                        ? <img src={newItemPhotoPreview} alt="preview" style={{ maxHeight:120, maxWidth:'100%', objectFit:'cover', borderRadius:8 }} />
                        : <div>
                            <div style={{ fontSize:28 }}>📷</div>
                            <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>Tap to add photo</div>
                          </div>
                      }
                    </div>
                    <input ref={newItemPhotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleNewItemPhotoSelect} />
                    {newItemPhotoPreview && (
                      <button
                        onClick={() => { setNewItemPhotoFile(null); setNewItemPhotoPreview(null) }}
                        style={{ marginTop:4, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'Poppins' }}
                      >✕ Remove photo</button>
                    )}
                  </div>

                  {/* Upload progress */}
                  {addingItem && newItemPhotoFile && itemPhotoProgress > 0 && (
                    <div style={{ background:'#f3f4f6', borderRadius:8, overflow:'hidden', height:6 }}>
                      <div style={{ height:'100%', background:'#E24B4A', width:`${itemPhotoProgress}%`, transition:'width 0.3s' }} />
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={handleAddItem}
                      disabled={addingItem}
                      style={{ flex:1, background: addingItem?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:11, borderRadius:8, fontSize:13, cursor: addingItem?'not-allowed':'pointer', fontFamily:'Poppins', fontWeight:500 }}
                    >{addingItem ? 'Adding...' : '✅ Add to Menu'}</button>
                    <button
                      onClick={() => { setShowAddItem(false); setNewItem(EMPTY_ITEM); setNewItemPhotoFile(null); setNewItemPhotoPreview(null); setShowAddCat(false) }}
                      style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:11, borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {menuItems.length === 0 && !showAddItem && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:32, fontSize:13 }}>No items yet. Add your first menu item!</div>
            )}

            {/* ── MENU ITEMS LIST ── */}
            {menuItems.map(item => (
              <div key={item.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>

                {/* Photo — tap to change */}
                <div
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'; input.accept = 'image/*'
                    input.onchange = (e) => handleExistingItemPhoto(e, item.id)
                    input.click()
                  }}
                  style={{
                    width:64, height:64, borderRadius:10, overflow:'hidden',
                    background:'#f3f4f6', flexShrink:0, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative',
                    borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb'
                  }}
                >
                  {item.photo
                    ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:22 }}>📷</span>
                  }
                  {itemPhotoUploading === item.id && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>
                      {itemPhotoProgress}%
                    </div>
                  )}
                </div>

                {/* Item details */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {/* Veg/Non-veg indicator */}
                    <div style={{
                      width:14, height:14, borderRadius:3, flexShrink:0,
                      borderWidth:1.5, borderStyle:'solid',
                      borderColor: item.isVeg===false ? '#dc2626' : '#16a34a',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background: item.isVeg===false ? '#dc2626' : '#16a34a' }} />
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{item.name}</div>
                  </div>
                  {item.description && (
                    <div style={{ fontSize:11, color:'#6b7280', marginTop:2, lineHeight:1.4 }}>{item.description}</div>
                  )}
                  <div style={{ display:'flex', gap:8, marginTop:3, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#E24B4A' }}>₹{item.price}</span>
                    <span style={{ fontSize:10, color:'#9ca3af' }}>·</span>
                    <span style={{ fontSize:11, color:'#9ca3af' }}>{item.category}</span>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center', flexShrink:0 }}>
                  {/* Available toggle */}
                  <div
                    onClick={() => updateMenuItem(user.uid, item.id, { available: !item.available })}
                    style={{ width:40, height:22, background: item.available?'#16a34a':'#d1d5db', borderRadius:11, cursor:'pointer', position:'relative', transition:'background 0.2s' }}
                  >
                    <div style={{ position:'absolute', width:16, height:16, background:'#fff', borderRadius:'50%', top:3, left: item.available?21:3, transition:'left 0.2s' }} />
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => { deleteMenuItem(user.uid, item.id); toast.success('Item deleted') }}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#dc2626', padding:2 }}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── EARNINGS TAB ── */}
        {tab === 'earnings' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:"Today's Sales",  val:`₹${todayRevenue.toLocaleString()}`, sub:`${orders.filter(o=>o.status==='delivered').length} delivered` },
                { label:"Total Orders",   val:orders.length, sub:`${liveOrders.length} active` },
                { label:"COD Collected",  val:`₹${todayRevenue.toLocaleString()}`, sub:"pending settlement" },
                { label:"Menu Items",     val:menuItems.length, sub:`${menuItems.filter(m=>m.available).length} available` }
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
              {orders.filter(o=>o.status==='delivered').length === 0 && (
                <div style={{ fontSize:12, color:'#9ca3af', textAlign:'center', padding:16 }}>No delivered orders yet</div>
              )}
            </div>
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Store Info</div>
              {[
                { label:'Store Name',        val:userData?.storeName },
                { label:'Email',             val:userData?.email },
                { label:'Phone / WhatsApp',  val:userData?.phone },
                { label:'Address',           val:userData?.address },
                { label:'Category',          val:userData?.category },
                { label:'Subscription Plan', val:userData?.plan }
              ].map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#e5e7eb' }}>
                  <span style={{ fontSize:12, color:'#6b7280' }}>{f.label}</span>
                  <span style={{ fontSize:12, fontWeight:500 }}>{f.val || '—'}</span>
                </div>
              ))}
            </div>

            {/* Custom categories list */}
            {customCategories.length > 0 && (
              <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Your Custom Categories</div>
                {customCategories.map(c => (
                  <div key={c} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                    <span style={{ fontSize:13 }}>{c}</span>
                    <button
                      onClick={async () => {
                        const updated = customCategories.filter(x => x !== c)
                        setCustomCategories(updated)
                        await updateVendorStore(user.uid, { customCategories: updated })
                        toast.success(`"${c}" removed`)
                      }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626', fontSize:13 }}
                    >Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* Store Location */}
            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>📍 Store Location</div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>
                {vendorLocation
                  ? <span style={{ color:'#16a34a', fontWeight:500 }}>✅ Location set: {locationName}</span>
                  : <span style={{ color:'#dc2626' }}>⚠️ Location not set — customers cannot see distance</span>
                }
              </div>

              {/* Detect GPS */}
              <button
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'#fff5f5', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', borderRadius:10, cursor:'pointer', marginBottom:8, fontFamily:'Poppins' }}
              >
                <span style={{ fontSize:18 }}>📍</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#E24B4A' }}>{detectingLocation ? 'Detecting...' : 'Use Current GPS Location'}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>Automatically detect store location</div>
                </div>
              </button>

              {/* Manual search */}
              <div style={{ position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, background:'#fff' }}>
                  <span>🔍</span>
                  <input
                    style={{ border:'none', outline:'none', fontSize:13, flex:1, fontFamily:'Poppins' }}
                    placeholder="Search area / city manually..."
                    value={locationSearch}
                    onChange={e => handleLocationSearch(e.target.value)}
                  />
                  {searchingLoc && <span style={{ fontSize:11, color:'#9ca3af' }}>...</span>}
                </div>
                {locationSuggestions.length > 0 && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, zIndex:50, marginTop:4, overflow:'hidden' }}>
                    {locationSuggestions.map((s, i) => (
                      <button key={i} onClick={() => handleSelectLocation(s)} style={{ width:'100%', padding:'10px 14px', border:'none', borderBottomWidth: i < locationSuggestions.length-1 ? 1 : 0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background:'#fff', cursor:'pointer', textAlign:'left', fontFamily:'Poppins', display:'flex', gap:8, alignItems:'center' }}>
                        <span>📍</span>
                        <div>
                          <div style={{ fontSize:13, color:'#1f2937' }}>{s.name.split(",")[0]}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{s.name.split(",").slice(1,3).join(",")}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Delivery Charge + FSSAI + Hours ── */}
            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>🏪 Store Details</div>

              {/* Delivery Charge */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🚴 Delivery Charge (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 20 (0 for free delivery)"
                  value={deliveryCharge}
                  onChange={e => setDeliveryCharge(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }}
                />
              </div>

              {/* FSSAI */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>📋 FSSAI Licence Number</label>
                <input
                  type="text"
                  placeholder="e.g. 10012345000123"
                  value={fssai}
                  onChange={e => setFssai(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }}
                />
              </div>

              {/* Opening Hours */}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🕐 Opening Hours</label>
                <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center' }}>
                  <input
                    type="time"
                    value={openTime}
                    onChange={e => setOpenTime(e.target.value)}
                    style={{ flex:1, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none' }}
                  />
                  <span style={{ fontSize:12, color:'#6b7280' }}>to</span>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={e => setCloseTime(e.target.value)}
                    style={{ flex:1, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none' }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveDetails}
                disabled={savingDetails}
                style={{ width:'100%', background: savingDetails?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:11, borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}
              >
                {savingDetails ? 'Saving...' : '💾 Save Store Details'}
              </button>
            </div>

            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>
              Logout
            </button>
          </div>
        )}

      </div>
    </div>
  )
}