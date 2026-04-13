import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getVendorOrders, getMenuItems, updateOrderStatus,
  updateVendorStore, addMenuItem, updateMenuItem, deleteMenuItem,
  uploadVendorPhoto, uploadMenuItemPhoto,
  getCombos, addCombo, updateCombo, deleteCombo
} from '../firebase/services'
import { useNotifications } from '../hooks/useNotifications'
import { listenNotifications, markNotificationRead } from '../firebase/services'
import toast from 'react-hot-toast'
import { useOrderAlert } from '../hooks/useOrderAlert'
import { usePendingOrderNotifier } from '../hooks/usePendingOrderNotifier'
import VendorBill from '../components/VendorBill'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const STATUS_NEXT  = { pending:'accepted', accepted:'preparing', preparing:'ready', ready:'out_for_delivery', out_for_delivery:'delivered' }
const STATUS_LABEL = { pending:'Accept Order', accepted:'Start Preparing', preparing:'Mark Ready', ready:'Out for Delivery', out_for_delivery:'Mark Delivered' }
const CANCELLABLE_STATUSES = ['accepted', 'preparing', 'ready']
const DEFAULT_CATEGORIES = ['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice']
const EMPTY_ITEM = { name:'', price:'', category:'Thali', description:'', isVeg: true }
const EMPTY_COMBO = { name:'', description:'', comboPrice:'', items:[], isVeg:true, available:true, tag:'' }
const COMBO_TAGS = ['Best Value','Popular','New','Limited','Chef Special','Weekend Only']

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

// ── RIDER LOCATION PANEL ─────────────────────────────────────────────────────
function RiderLocationPanel({ order, onClose }) {
  const [riderName, setRiderName] = useState(order.riderName || '')
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || '')
  const [tracking, setTracking] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [riderSaved, setRiderSaved] = useState(!!(order.riderName && order.riderPhone))
  const watchIdRef = useRef(null)
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
    }
  }, [])

  const saveRiderInfo = async () => {
    if (!riderName.trim()) return toast.error('Enter rider name')
    if (!riderPhone.trim() || riderPhone.length < 10) return toast.error('Enter valid phone number')
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        riderName: riderName.trim(),
        riderPhone: riderPhone.trim(),
      })
      setRiderSaved(true)
      toast.success('Rider info saved! ✅')
    } catch { toast.error('Failed to save rider info') }
  }

  const pushLocation = async (lat, lng) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        riderLocation: { lat, lng },
        riderLocationUpdatedAt: new Date().toISOString(),
      })
      setLastUpdated(new Date())
      setLocationStatus(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } catch { setLocationStatus('⚠️ Failed to update location') }
  }

  const startTracking = () => {
    if (!navigator.geolocation) return toast.error('GPS not supported on this device')
    if (!riderSaved) return toast.error('Save rider info first')
    setTracking(true)
    setLocationStatus('Getting location...')

    // Push immediately then every 15 seconds
    navigator.geolocation.getCurrentPosition(
      (pos) => pushLocation(pos.coords.latitude, pos.coords.longitude),
      () => setLocationStatus('⚠️ Could not get location'),
      { enableHighAccuracy: true, timeout: 10000 }
    )

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => pushLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
    toast.success('🛵 Live tracking started!')
  }

  const stopTracking = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
    watchIdRef.current = null
    setTracking(false)
    setLocationStatus('Tracking stopped')
    toast('Tracking stopped', { icon: '⏹️' })
  }

  const inp = {
    width:'100%', padding:'10px 12px', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box'
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:2000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'22px 22px 0 0', maxHeight:'90vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1a1a1a,#0f3460)', padding:'20px 20px 24px', borderRadius:'22px 22px 0 0', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-10, top:-10, fontSize:70, opacity:0.07 }}>🛵</div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}><div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.3)' }} /></div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:700, letterSpacing:1, marginBottom:4 }}>LIVE TRACKING</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>🛵 Rider Location</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:4 }}>Order #{order.id.slice(-6).toUpperCase()}</div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:34, height:34, borderRadius:'50%', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          {/* Live indicator */}
          {tracking && (
            <div style={{ marginTop:14, background:'rgba(74,222,128,0.2)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, borderWidth:1, borderStyle:'solid', borderColor:'rgba(74,222,128,0.4)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', animation:'livePulse 1s infinite' }} />
              <span style={{ fontSize:12, color:'#4ade80', fontWeight:700 }}>LIVE — Customer can see rider location</span>
            </div>
          )}
        </div>

        <div style={{ padding:'20px 20px 40px' }}>
          {/* How it works */}
          <div style={{ background:'#f0f9ff', borderRadius:12, padding:'12px 14px', marginBottom:18, borderWidth:1, borderStyle:'solid', borderColor:'#bae6fd', display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:20, flexShrink:0 }}>💡</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#0369a1', marginBottom:4 }}>How Live Tracking Works</div>
              <div style={{ fontSize:11, color:'#0c4a6e', lineHeight:1.7 }}>
                1. Save the delivery rider's info below<br/>
                2. Open this panel on the <strong>rider's phone</strong><br/>
                3. Tap <strong>"Start Live Tracking"</strong> — the customer's map updates automatically every few seconds
              </div>
            </div>
          </div>

          {/* Rider Info */}
          <div style={{ background:'#f9fafb', borderRadius:12, padding:14, marginBottom:16, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:12 }}>👤 Rider Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Rider Name *</label>
                <input style={inp} placeholder="e.g. Rahul Patil" value={riderName} onChange={e => setRiderName(e.target.value)} disabled={riderSaved} />
              </div>
              <div>
                <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Rider Phone *</label>
                <input style={inp} type="tel" placeholder="10-digit mobile" value={riderPhone} onChange={e => setRiderPhone(e.target.value)} maxLength={10} disabled={riderSaved} />
              </div>
              {!riderSaved ? (
                <button onClick={saveRiderInfo} style={{ background:'#1a1a1a', color:'#fff', border:'none', padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                  💾 Save Rider Info
                </button>
              ) : (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:11, background:'#d1fae5', color:'#065f46', fontWeight:700, borderRadius:6, padding:'3px 8px' }}>✅ Rider Saved</span>
                  </div>
                  <button onClick={() => setRiderSaved(false)} style={{ background:'none', border:'none', fontSize:11, color:'#6b7280', cursor:'pointer', fontFamily:'Poppins', textDecoration:'underline' }}>Edit</button>
                </div>
              )}
            </div>
          </div>

          {/* Location Status */}
          {locationStatus && (
            <div style={{ background: tracking ? '#f0fdf4' : '#f9fafb', borderRadius:10, padding:'10px 14px', marginBottom:14, borderWidth:1, borderStyle:'solid', borderColor: tracking ? '#bbf7d0' : '#e5e7eb', display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:16 }}>{tracking ? '📡' : '📍'}</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color: tracking ? '#15803d' : '#6b7280' }}>{tracking ? 'Current Location Sent' : 'Location'}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{locationStatus}</div>
                {lastUpdated && <div style={{ fontSize:10, color:'#d1d5db', marginTop:1 }}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}
              </div>
            </div>
          )}

          {/* Start/Stop Tracking Button */}
          {!tracking ? (
            <button
              onClick={startTracking}
              disabled={!riderSaved}
              style={{ width:'100%', background: riderSaved ? 'linear-gradient(135deg,#E24B4A,#c73232)' : '#e5e7eb', color: riderSaved ? '#fff' : '#9ca3af', border:'none', padding:'16px 0', borderRadius:14, fontSize:15, fontWeight:800, cursor: riderSaved ? 'pointer' : 'not-allowed', fontFamily:'Poppins', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow: riderSaved ? '0 6px 20px rgba(226,75,74,0.35)' : 'none', transition:'all 0.2s' }}
            >
              <span style={{ fontSize:22 }}>🛵</span>
              Start Live Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              style={{ width:'100%', background:'linear-gradient(135deg,#dc2626,#991b1b)', color:'#fff', border:'none', padding:'16px 0', borderRadius:14, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:10, animation:'trackPulse 2s infinite' }}
            >
              <span style={{ fontSize:18 }}>⏹️</span>
              Stop Tracking
            </button>
          )}

          {/* Manual Push Button */}
          {riderSaved && (
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => { pushLocation(pos.coords.latitude, pos.coords.longitude); toast.success('Location pushed!') },
                  () => toast.error('Could not get location'),
                  { enableHighAccuracy: true, timeout: 8000 }
                )
              }}
              style={{ width:'100%', background:'#f3f4f6', color:'#374151', border:'none', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            >
              📍 Push Current Location Once
            </button>
          )}

          {/* Warning */}
          <div style={{ marginTop:16, background:'#fffbeb', borderRadius:10, padding:'10px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#fde68a', display:'flex', gap:8, alignItems:'flex-start' }}>
            <span style={{ fontSize:14, flexShrink:0 }}>⚠️</span>
            <div style={{ fontSize:11, color:'#92400e', lineHeight:1.6 }}>
              Keep this panel open on the rider's phone while delivering. The tracking stops if this panel is closed or the browser is backgrounded.
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes trackPulse { 0%,100%{box-shadow:0 6px 20px rgba(220,38,38,0.4)} 50%{box-shadow:0 6px 28px rgba(220,38,38,0.7)} }
      `}</style>
    </div>
  )
}

export default function VendorApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [combos, setCombos] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState(EMPTY_ITEM)
  const [customCategories, setCustomCategories] = useState([])
  const [newCatInput, setNewCatInput] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [selectedVendorOrder, setSelectedVendorOrder] = useState(null)

  const [orderFilter, setOrderFilter] = useState('all')

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancellingOrder, setCancellingOrder] = useState(false)

  const [menuEditMode, setMenuEditMode] = useState(false)
  const [menuCatFilter, setMenuCatFilter] = useState('All')
  const [editingItem, setEditingItem] = useState(null)
  const [editItemData, setEditItemData] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)

  // ── RIDER TRACKING STATE ──────────────────────────────────────────────────
  const [showRiderPanel, setShowRiderPanel] = useState(false)
  const [riderPanelOrder, setRiderPanelOrder] = useState(null)

  // ── COMBO STATES ──────────────────────────────────────────────────────────
  const [showAddCombo, setShowAddCombo] = useState(false)
  const [newCombo, setNewCombo] = useState(EMPTY_COMBO)
  const [addingCombo, setAddingCombo] = useState(false)
  const [editingCombo, setEditingCombo] = useState(null)
  const [editComboData, setEditComboData] = useState({})
  const [savingCombo, setSavingCombo] = useState(false)
  const [comboSearchQuery, setComboSearchQuery] = useState('')

  // ── STORE INFO EDIT STATES ────────────────────────────────────────────────
  const [editingStoreInfo, setEditingStoreInfo] = useState(false)
  const [storeEditData, setStoreEditData] = useState({})
  const [savingStoreInfo, setSavingStoreInfo] = useState(false)

  // ── VENDOR BILL STATES ────────────────────────────────────────────────────
  const [showVendorBill, setShowVendorBill] = useState(false)
  const [vendorBillOrder, setVendorBillOrder] = useState(null)

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
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [fssai, setFssai] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [upiId, setUpiId] = useState('')
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
    if (userData?.minOrderAmount !== undefined) setMinOrderAmount(String(userData.minOrderAmount ?? ''))
    if (userData?.fssai) setFssai(userData.fssai)
    if (userData?.gstNumber !== undefined) setGstNumber(userData.gstNumber || '')
    if (userData?.upiId !== undefined) setUpiId(userData.upiId || '')
    if (userData?.openTime) setOpenTime(userData.openTime)
    if (userData?.closeTime) setCloseTime(userData.closeTime)
    if (userData?.location) { setVendorLocation(userData.location); setLocationName(userData.locationName || '') }

    const u1 = getVendorOrders(user.uid, setOrders)
    const u2 = getMenuItems(user.uid, setMenuItems)
    const u3 = getCombos(user.uid, (fetchedCombos) => { setCombos(fetchedCombos) })
    return () => { u1(); u2(); u3() }
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
    if (gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.trim().toUpperCase())) {
      toast.error('Invalid GST number format. E.g. 22AAAAA0000A1Z5')
      return
    }
    if (upiId.trim() && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
      toast.error('Invalid UPI ID format. E.g. name@upi or 9876543210@paytm')
      return
    }
    setSavingDetails(true)
    try {
      await updateVendorStore(user.uid, {
        deliveryCharge: deliveryCharge === '' ? 0 : Number(deliveryCharge),
        minOrderAmount: minOrderAmount === '' ? 0 : Number(minOrderAmount),
        fssai: fssai.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        upiId: upiId.trim(),
        openTime: openTime.trim(),
        closeTime: closeTime.trim()
      })
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

  // ── COMBO HANDLERS ────────────────────────────────────────────────────────
  const toggleComboItem = (item, comboState, setComboState) => {
    const exists = comboState.items.find(i => i.id === item.id)
    if (exists) {
      setComboState(p => ({ ...p, items: p.items.filter(i => i.id !== item.id) }))
    } else {
      setComboState(p => ({ ...p, items: [...p.items, { id: item.id, name: item.name, price: item.price, qty: 1 }] }))
    }
  }

  const updateComboItemQty = (itemId, qty, comboState, setComboState) => {
    if (qty < 1) return
    setComboState(p => ({ ...p, items: p.items.map(i => i.id === itemId ? { ...i, qty } : i) }))
  }

  const comboOriginalPrice = (items) => items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0)

  const handleAddCombo = async () => {
    if (!newCombo.name.trim()) return toast.error('Enter combo name')
    if (!newCombo.comboPrice || isNaN(newCombo.comboPrice) || Number(newCombo.comboPrice) <= 0) return toast.error('Enter valid combo price')
    if (newCombo.items.length < 2) return toast.error('Select at least 2 items for a combo')
    setAddingCombo(true)
    try {
      await addCombo(user.uid, {
        name: newCombo.name.trim(), description: newCombo.description.trim(),
        comboPrice: Number(newCombo.comboPrice), originalPrice: comboOriginalPrice(newCombo.items),
        items: newCombo.items, isVeg: newCombo.isVeg, available: true, tag: newCombo.tag,
      })
      setNewCombo(EMPTY_COMBO); setShowAddCombo(false); toast.success('Combo created! 🍱')
    } catch (err) { console.error('Add combo error:', err); toast.error('Failed to create combo. Try again.') }
    setAddingCombo(false)
  }

  const handleSaveComboEdit = async (comboId) => {
    if (!editComboData.name?.trim()) return toast.error('Combo name required')
    if (!editComboData.comboPrice || isNaN(editComboData.comboPrice) || Number(editComboData.comboPrice) <= 0) return toast.error('Enter valid price')
    if (editComboData.items?.length < 2) return toast.error('Select at least 2 items')
    setSavingCombo(true)
    try {
      await updateCombo(user.uid, comboId, {
        name: editComboData.name.trim(), description: editComboData.description?.trim() || '',
        comboPrice: Number(editComboData.comboPrice), originalPrice: comboOriginalPrice(editComboData.items),
        items: editComboData.items, isVeg: editComboData.isVeg, available: editComboData.available !== false, tag: editComboData.tag || '',
      })
      toast.success('Combo updated! ✅'); setEditingCombo(null)
    } catch (err) { console.error('Update combo error:', err); toast.error('Failed to update combo.') }
    setSavingCombo(false)
  }

  const handleDeleteCombo = async (comboId) => {
    if (!window.confirm('Delete this combo? This cannot be undone.')) return
    try { await deleteCombo(user.uid, comboId); toast.success('Combo deleted') }
    catch (err) { console.error('Delete combo error:', err); toast.error('Failed to delete combo.') }
  }

  const toggleComboAvailable = async (combo) => {
    try { await updateCombo(user.uid, combo.id, { available: !combo.available }) }
    catch (err) { console.error('Toggle combo error:', err); toast.error('Failed to update combo.') }
  }

  const handleOpenStoreEdit = () => {
    setStoreEditData({ storeName: userData?.storeName || '', phone: userData?.phone || '', address: userData?.address || '', category: userData?.category || '', email: userData?.email || '' })
    setEditingStoreInfo(true)
  }

  const handleSaveStoreInfo = async () => {
    if (!storeEditData.storeName?.trim()) return toast.error('Store name is required')
    setSavingStoreInfo(true)
    try {
      await updateVendorStore(user.uid, { storeName: storeEditData.storeName.trim(), phone: storeEditData.phone.trim(), address: storeEditData.address.trim(), category: storeEditData.category.trim() })
      toast.success('Store info updated! ✅'); setEditingStoreInfo(false)
    } catch { toast.error('Failed to save. Try again.') }
    setSavingStoreInfo(false)
  }

  const liveOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const todayRevenue = orders.filter(o => o.status==='delivered').reduce((s,o) => s+(o.total||0), 0)
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter)

  const menuCategories = ['All', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))]
  const filteredMenuItems = menuCatFilter === 'All' ? menuItems : menuItems.filter(i => i.category === menuCatFilter)

  const filteredMenuForCombo = comboSearchQuery.trim()
    ? menuItems.filter(i => i.name.toLowerCase().includes(comboSearchQuery.toLowerCase()) || i.category?.toLowerCase().includes(comboSearchQuery.toLowerCase()))
    : menuItems

  const inp = {
    width:'100%', padding:'10px 12px', borderWidth:'1px', borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box'
  }

  const statusBadgeStyle = (status) => ({
    fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20,
    background: status==='pending'?'#fef3c7': status==='accepted'?'#dbeafe': status==='preparing'?'#ede9fe': status==='ready'?'#dcfce7': status==='out_for_delivery'?'#e0f2fe': status==='delivered'?'#d1fae5':'#fee2e2',
    color: status==='pending'?'#92400e': status==='accepted'?'#1e40af': status==='preparing'?'#6d28d9': status==='ready'?'#15803d': status==='out_for_delivery'?'#0369a1': status==='delivered'?'#065f46':'#991b1b',
  })

  // ── COMBO ITEM PICKER ─────────────────────────────────────────────────────
  const ComboItemPicker = ({ comboState, setComboState }) => (
    <div>
      <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Select Items for Combo *</label>
      <div style={{ marginTop:6, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'8px 10px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background:'#fafafa', display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:13 }}>🔍</span>
          <input style={{ border:'none', outline:'none', fontSize:12, flex:1, fontFamily:'Poppins', background:'transparent' }} placeholder="Search items..." value={comboSearchQuery} onChange={e => setComboSearchQuery(e.target.value)} />
        </div>
        <div style={{ maxHeight:200, overflowY:'auto' }}>
          {filteredMenuForCombo.length === 0 && <div style={{ padding:'16px', textAlign:'center', fontSize:12, color:'#9ca3af' }}>No items found</div>}
          {filteredMenuForCombo.map(item => {
            const selected = comboState.items.find(i => i.id === item.id)
            return (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f9fafb', background: selected ? '#fff5f5' : '#fff', cursor:'pointer' }} onClick={() => toggleComboItem(item, comboState, setComboState)}>
                <div style={{ width:20, height:20, borderRadius:5, borderWidth:2, borderStyle:'solid', borderColor: selected ? '#E24B4A' : '#d1d5db', background: selected ? '#E24B4A' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {selected && <span style={{ color:'#fff', fontSize:12, fontWeight:900 }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#1f2937' }}>{item.name}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{item.category}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:'#E24B4A' }}>₹{item.price}</div>
              </div>
            )
          })}
        </div>
      </div>
      {comboState.items.length > 0 && (
        <div style={{ marginTop:10, background:'#f9fafb', borderRadius:10, padding:10 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#6b7280', marginBottom:8 }}>SELECTED ITEMS ({comboState.items.length})</div>
          {comboState.items.map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ flex:1, fontSize:12, color:'#374151' }}>{item.name} <span style={{ color:'#9ca3af' }}>× ₹{item.price}</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={(e) => { e.stopPropagation(); updateComboItemQty(item.id, (item.qty||1) - 1, comboState, setComboState) }} style={{ width:24, height:24, borderRadius:6, border:'none', background:'#e5e7eb', cursor:'pointer', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <span style={{ fontSize:12, fontWeight:700, minWidth:16, textAlign:'center' }}>{item.qty||1}</span>
                <button onClick={(e) => { e.stopPropagation(); updateComboItemQty(item.id, (item.qty||1) + 1, comboState, setComboState) }} style={{ width:24, height:24, borderRadius:6, border:'none', background:'#e5e7eb', cursor:'pointer', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                <button onClick={(e) => { e.stopPropagation(); setComboState(p => ({ ...p, items: p.items.filter(i => i.id !== item.id) })) }} style={{ width:24, height:24, borderRadius:6, border:'none', background:'#fee2e2', color:'#dc2626', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTopWidth:1, borderTopStyle:'dashed', borderTopColor:'#e5e7eb', marginTop:4 }}>
            <span style={{ fontSize:11, color:'#6b7280' }}>Original total</span>
            <span style={{ fontSize:12, fontWeight:700, color:'#6b7280', textDecoration:'line-through' }}>₹{comboOriginalPrice(comboState.items)}</span>
          </div>
        </div>
      )}
    </div>
  )

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
          { id:'combos',   label:`Combos${combos.length>0?` (${combos.length})`:''}` },
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
                    <button
                      onClick={() => { setVendorBillOrder(selectedVendorOrder); setShowVendorBill(true) }}
                      style={{ width:'100%', background:'#f9fafb', color:'#1f2937', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                    >
                      🧾 View / Print Bill
                    </button>
                  </div>

                  {/* ── 🛵 LIVE TRACKING CARD — shows for out_for_delivery ── */}
                  {selectedVendorOrder.status === 'out_for_delivery' && (
                    <div style={{ background:'linear-gradient(135deg,#0f3460,#1a1a2e)', borderRadius:14, padding:16, marginBottom:12, boxShadow:'0 4px 20px rgba(15,52,96,0.35)', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', right:-10, top:-10, fontSize:60, opacity:0.08 }}>🛵</div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:700, letterSpacing:1, marginBottom:4 }}>DELIVERY TRACKING</div>
                          <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>🛵 Live Rider Tracking</div>
                        </div>
                        {selectedVendorOrder.riderName && (
                          <div style={{ background:'rgba(74,222,128,0.2)', borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5, borderWidth:1, borderStyle:'solid', borderColor:'rgba(74,222,128,0.3)' }}>
                            <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', animation:'pulse 1s infinite' }} />
                            <span style={{ fontSize:10, color:'#4ade80', fontWeight:700 }}>ACTIVE</span>
                          </div>
                        )}
                      </div>

                      {selectedVendorOrder.riderName ? (
                        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontSize:18 }}>🛵</span>
                            </div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{selectedVendorOrder.riderName}</div>
                              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>📱 {selectedVendorOrder.riderPhone}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>⚠️ No rider assigned yet. Tap below to assign.</div>
                        </div>
                      )}

                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:10, lineHeight:1.5 }}>
                        Customer can see live location on their tracking map. Open this on the rider's phone to stream GPS.
                      </div>

                      <button
                        onClick={() => { setRiderPanelOrder(selectedVendorOrder); setShowRiderPanel(true) }}
                        style={{ width:'100%', background:'linear-gradient(135deg,#E24B4A,#c73232)', color:'#fff', border:'none', padding:'13px 0', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 4px 16px rgba(226,75,74,0.5)' }}
                      >
                        <span style={{ fontSize:20 }}>🛵</span>
                        {selectedVendorOrder.riderName ? 'Manage Rider & Tracking' : 'Assign Rider & Start Tracking'}
                      </button>
                    </div>
                  )}

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

            <div style={{ marginBottom:12 }}>
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
              <div style={{ overflowX:'auto', paddingBottom:4 }}>
                <div style={{ display:'flex', gap:8, width:'max-content' }}>
                  {ORDER_FILTERS.map(f => {
                    const count = f.id === 'all' ? orders.length : orders.filter(o => o.status === f.id).length
                    const isActive = orderFilter === f.id
                    const isLive = ['pending','accepted','preparing','ready','out_for_delivery'].includes(f.id)
                    return (
                      <button key={f.id} onClick={() => setOrderFilter(f.id)} style={{ flexShrink:0, padding:'7px 13px', borderRadius:20, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight: isActive ? 700 : 500, border:'none', whiteSpace:'nowrap', transition:'all 0.18s', background: isActive ? (f.id==='cancelled'?'#fee2e2':f.id==='delivered'?'#d1fae5':f.id==='pending'?'#fef3c7':'#E24B4A') : '#f3f4f6', color: isActive ? (f.id==='cancelled'?'#991b1b':f.id==='delivered'?'#065f46':f.id==='pending'?'#92400e':'#fff') : '#6b7280', boxShadow: isActive ? '0 3px 10px rgba(0,0,0,0.12)' : 'none' }}>
                        {f.emoji} {f.label}
                        {count > 0 && <span style={{ marginLeft:5, fontSize:10, fontWeight:700, background: isActive?'rgba(0,0,0,0.15)':(isLive&&count>0?'#E24B4A':'#e5e7eb'), color: isActive?'inherit':(isLive&&count>0?'#fff':'#6b7280'), borderRadius:10, padding:'1px 6px' }}>{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:'40px 20px', fontSize:13 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>{orderFilter==='delivered'?'✅':orderFilter==='cancelled'?'❌':'📋'}</div>
                <div style={{ fontWeight:600, marginBottom:4 }}>{orderFilter==='all'?'No orders yet':`No ${ORDER_FILTERS.find(f=>f.id===orderFilter)?.label?.toLowerCase()} orders`}</div>
                <div style={{ fontSize:12 }}>{orderFilter==='all'?'Orders will appear here when customers place them':`You have no orders with this status`}</div>
              </div>
            )}

            {filteredOrders.map(order => (
              <div key={order.id} onClick={() => setSelectedVendorOrder(order)} style={{ background:'#fff', borderWidth:1, borderStyle:'solid', borderColor: order.status==='pending'?'#fecaca':order.status==='delivered'?'#bbf7d0':order.status==='cancelled'?'#fecaca': order.status==='out_for_delivery'?'#bfdbfe':'#e5e7eb', borderRadius:12, padding:14, marginBottom:10, cursor:'pointer', opacity:order.status==='cancelled'?0.8:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>#{order.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:2, fontWeight:500 }}>{order.userName} · {order.userPhone}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>📍 {order.address?.slice(0,40)}{order.address?.length>40?'...':''}</div>
                    {order.createdAt && <div style={{ fontSize:10, color:'#d1d5db', marginTop:2 }}>{order.createdAt?.toDate?.()?.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                    <span style={statusBadgeStyle(order.status)}>{order.status?.replace('_',' ').toUpperCase()}</span>
                    {/* 🛵 Live tracking quick badge */}
                    {order.status === 'out_for_delivery' && order.riderName && (
                      <div style={{ display:'flex', alignItems:'center', gap:4, background:'#eff6ff', borderRadius:10, padding:'2px 8px' }}>
                        <div style={{ width:5, height:5, borderRadius:'50%', background:'#3b82f6', animation:'pulse 1s infinite' }} />
                        <span style={{ fontSize:9, color:'#1d4ed8', fontWeight:700 }}>TRACKING ON</span>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>{order.items?.map(i => `${i.qty}x ${i.name}`).join(' · ')}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#E24B4A' }}>₹{order.total} <span style={{ fontSize:11, color:'#9ca3af', fontWeight:400 }}>COD</span></div>
                  {order.status === 'out_for_delivery' ? (
                    <button
                      onClick={e => { e.stopPropagation(); setRiderPanelOrder(order); setShowRiderPanel(true) }}
                      style={{ display:'flex', alignItems:'center', gap:5, background:'#0f3460', color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}
                    >
                      🛵 Track Rider
                    </button>
                  ) : (
                    <span style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>Tap for details →</span>
                  )}
                </div>
                {!['delivered','cancelled'].includes(order.status) && (
                  <div style={{ display:'flex', gap:8, marginTop:10 }} onClick={e => e.stopPropagation()}>
                    {order.status === 'pending' && <button onClick={() => handleReject(order.id)} style={{ background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>Reject</button>}
                    {CANCELLABLE_STATUSES.includes(order.status) && <button onClick={() => openCancelModal(order)} style={{ background:'#fff5f5', color:'#dc2626', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>🚫 Cancel</button>}
                    {STATUS_NEXT[order.status] && <button onClick={() => handleStatus(order.id, order.status, { userUid:order.userUid, vendorName:userData?.storeName||'' })} style={{ flex:1, background:order.status==='pending'?'#E24B4A':'#1a1a1a', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600 }}>{STATUS_LABEL[order.status]}</button>}
                  </div>
                )}
                {order.status === 'cancelled' && order.cancellationReason && <div style={{ marginTop:8, background:'#fff5f5', borderRadius:8, padding:'6px 10px', fontSize:11, color:'#991b1b' }}>🚫 {order.cancellationReason}</div>}
                {order.status === 'delivered' && (
                  <button
                    onClick={e => { e.stopPropagation(); setVendorBillOrder(order); setShowVendorBill(true) }}
                    style={{ marginTop:6, display:'flex', alignItems:'center', gap:6, background:'#f3f4f6', borderRadius:8, padding:'5px 10px', border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:11, fontWeight:600, color:'#374151' }}
                  >
                    🧾 View Bill
                  </button>
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
                <button onClick={() => { setMenuEditMode(e => !e); setEditingItem(null) }} style={{ background:menuEditMode?'#fef3c7':'#f3f4f6', color:menuEditMode?'#92400e':'#6b7280', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:600 }}>{menuEditMode?'✅ Done Editing':'✏️ Edit Menu'}</button>
                <button onClick={() => setShowAddItem(!showAddItem)} style={{ background:'#E24B4A', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>+ Add</button>
              </div>
            </div>

            {menuCategories.length > 1 && (
              <div style={{ overflowX:'auto', marginBottom:12 }}>
                <div style={{ display:'flex', gap:8, width:'max-content', paddingBottom:4 }}>
                  {menuCategories.map(cat => {
                    const count = cat==='All'?menuItems.length:menuItems.filter(i=>i.category===cat).length
                    const isActive = menuCatFilter===cat
                    return <button key={cat} onClick={() => { setMenuCatFilter(cat); setEditingItem(null) }} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:isActive?700:500, background:isActive?'#E24B4A':'#f3f4f6', color:isActive?'#fff':'#6b7280', boxShadow:isActive?'0 4px 12px rgba(226,75,74,0.3)':'none', transition:'all 0.2s', whiteSpace:'nowrap' }}>{cat} <span style={{ opacity:0.7, fontSize:10 }}>({count})</span></button>
                  })}
                </div>
              </div>
            )}

            {showAddItem && (
              <div style={{ background:'#f9fafb', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, padding:14, marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>New Menu Item</div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {[true,false].map(isV => (
                    <button key={String(isV)} onClick={() => setNewItem(p=>({...p,isVeg:isV}))} style={{ flex:1, padding:'8px 0', borderRadius:8, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:600, borderWidth:2, borderStyle:'solid', borderColor:newItem.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#e5e7eb', background:newItem.isVeg===isV?(isV?'#f0fdf4':'#fff5f5'):'#fff', color:newItem.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#9ca3af' }}>
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
                      {newItemPhotoPreview?<img src={newItemPhotoPreview} alt="preview" style={{ maxHeight:120, maxWidth:'100%', objectFit:'cover', borderRadius:8 }} />:<div><div style={{ fontSize:28 }}>📷</div><div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>Tap to add photo</div></div>}
                    </div>
                    <input ref={newItemPhotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleNewItemPhotoSelect} />
                    {newItemPhotoPreview && <button onClick={() => { setNewItemPhotoFile(null); setNewItemPhotoPreview(null) }} style={{ marginTop:4, fontSize:11, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'Poppins' }}>✕ Remove photo</button>}
                  </div>
                  {addingItem && newItemPhotoFile && itemPhotoProgress > 0 && <div style={{ background:'#f3f4f6', borderRadius:8, overflow:'hidden', height:6 }}><div style={{ height:'100%', background:'#E24B4A', width:`${itemPhotoProgress}%`, transition:'width 0.3s' }} /></div>}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleAddItem} disabled={addingItem} style={{ flex:1, background:addingItem?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:11, borderRadius:8, fontSize:13, cursor:addingItem?'not-allowed':'pointer', fontFamily:'Poppins', fontWeight:500 }}>{addingItem?'Adding...':'✅ Add to Menu'}</button>
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
                        <button key={String(isV)} onClick={() => setEditItemData(p=>({...p,isVeg:isV}))} style={{ flex:1, padding:'7px 0', borderRadius:8, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:600, borderWidth:2, borderStyle:'solid', borderColor:editItemData.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#e5e7eb', background:editItemData.isVeg===isV?(isV?'#f0fdf4':'#fff5f5'):'#fff', color:editItemData.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#9ca3af' }}>
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
                        <button onClick={() => handleSaveEdit(item.id)} disabled={savingEdit} style={{ flex:2, background:savingEdit?'#f09595':'#16a34a', color:'#fff', border:'none', padding:'11px 0', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>{savingEdit?'Saving...':'💾 Save Changes'}</button>
                        <button onClick={() => setEditingItem(null)} style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'11px 0', borderRadius:9, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background:menuEditMode?'#fafafa':'transparent', borderRadius:menuEditMode?10:0, paddingLeft:menuEditMode?8:0, marginBottom:menuEditMode?4:0 }}>
                    <div onClick={() => { const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=(e)=>handleExistingItemPhoto(e,item.id); input.click() }} style={{ width:64, height:64, borderRadius:10, overflow:'hidden', background:'#f3f4f6', flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
                      {item.photo?<img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />:<span style={{ fontSize:22 }}>📷</span>}
                      {itemPhotoUploading===item.id && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>{itemPhotoProgress}%</div>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:14, height:14, borderRadius:3, flexShrink:0, borderWidth:1.5, borderStyle:'solid', borderColor:item.isVeg===false?'#dc2626':'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:7, height:7, borderRadius:'50%', background:item.isVeg===false?'#dc2626':'#16a34a' }} /></div>
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
                      <div onClick={() => updateMenuItem(user.uid, item.id, { available: !item.available })} style={{ width:40, height:22, background:item.available?'#16a34a':'#d1d5db', borderRadius:11, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                        <div style={{ position:'absolute', width:16, height:16, background:'#fff', borderRadius:'50%', top:3, left:item.available?21:3, transition:'left 0.2s' }} />
                      </div>
                      <button onClick={() => { deleteMenuItem(user.uid, item.id); toast.success('Item deleted') }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#dc2626', padding:2 }}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── COMBOS TAB ── */}
        {tab === 'combos' && (
          <>
            <div style={{ background:'linear-gradient(135deg,#1a1a1a,#2d1f00)', borderRadius:14, padding:'16px 16px 18px', marginBottom:14, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-10, top:-10, fontSize:60, opacity:0.08 }}>🍱</div>
              <div style={{ fontSize:11, color:'#fbbf24', fontWeight:700, letterSpacing:1, marginBottom:4 }}>COMBO OFFERS</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:4 }}>Create Meal Combos</div>
              <div style={{ fontSize:12, color:'#9ca3af', lineHeight:1.5 }}>Bundle items together at a special price.</div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 12px', flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{combos.length}</div>
                  <div style={{ fontSize:10, color:'#9ca3af' }}>Total Combos</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 12px', flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:800, color:'#4ade80' }}>{combos.filter(c=>c.available).length}</div>
                  <div style={{ fontSize:10, color:'#9ca3af' }}>Active</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 12px', flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:800, color:'#fbbf24' }}>{menuItems.length}</div>
                  <div style={{ fontSize:10, color:'#9ca3af' }}>Items available</div>
                </div>
              </div>
            </div>

            {!showAddCombo && (
              <button onClick={() => { setShowAddCombo(true); setNewCombo(EMPTY_COMBO); setComboSearchQuery('') }} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:'13px 0', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>🍱</span> Create New Combo
              </button>
            )}

            {showAddCombo && (
              <div style={{ background:'#fff', borderWidth:1.5, borderStyle:'solid', borderColor:'#fde68a', borderRadius:14, padding:16, marginBottom:16, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>🍱 New Combo</div>
                  <button onClick={() => { setShowAddCombo(false); setNewCombo(EMPTY_COMBO) }} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', fontSize:14 }}>✕</button>
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  {[true,false].map(isV => (
                    <button key={String(isV)} onClick={() => setNewCombo(p=>({...p,isVeg:isV}))} style={{ flex:1, padding:'8px 0', borderRadius:8, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:600, borderWidth:2, borderStyle:'solid', borderColor:newCombo.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#e5e7eb', background:newCombo.isVeg===isV?(isV?'#f0fdf4':'#fff5f5'):'#fff', color:newCombo.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#9ca3af' }}>
                      {isV?'🟢 Veg':'🔴 Non-Veg'}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Combo Name *</label><input style={inp} placeholder="e.g. Family Thali Combo" value={newCombo.name} onChange={e => setNewCombo(p=>({...p,name:e.target.value}))} /></div>
                  <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Description</label><textarea style={{...inp,minHeight:60,resize:'vertical',lineHeight:1.5}} placeholder="e.g. Dal Tadka + 3 Roti + Rice + Papad" value={newCombo.description} onChange={e => setNewCombo(p=>({...p,description:e.target.value}))} /></div>
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Tag (optional)</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                      {COMBO_TAGS.map(tag => (
                        <button key={tag} onClick={() => setNewCombo(p=>({...p, tag: p.tag===tag?'':tag}))} style={{ padding:'5px 11px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:11, fontWeight:600, background:newCombo.tag===tag?'#fef3c7':'#f3f4f6', color:newCombo.tag===tag?'#92400e':'#6b7280', borderWidth:1.5, borderStyle:'solid', borderColor:newCombo.tag===tag?'#fbbf24':'transparent' }}>{tag}</button>
                      ))}
                    </div>
                  </div>
                  {menuItems.length === 0 ? (
                    <div style={{ background:'#fff5f5', borderRadius:10, padding:14, textAlign:'center', fontSize:12, color:'#dc2626' }}>⚠️ Add menu items first before creating combos</div>
                  ) : (
                    <ComboItemPicker comboState={newCombo} setComboState={setNewCombo} />
                  )}
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Combo Price (₹) *</label>
                    <div style={{ position:'relative' }}>
                      <input style={{...inp, paddingRight:120}} type="number" placeholder="Set a discounted combo price" value={newCombo.comboPrice} onChange={e => setNewCombo(p=>({...p,comboPrice:e.target.value}))} />
                      {newCombo.items.length > 0 && newCombo.comboPrice && Number(newCombo.comboPrice) < comboOriginalPrice(newCombo.items) && (
                        <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-25%)', fontSize:11, fontWeight:700, color:'#16a34a', background:'#d1fae5', borderRadius:6, padding:'3px 8px', whiteSpace:'nowrap' }}>Save ₹{comboOriginalPrice(newCombo.items) - Number(newCombo.comboPrice)}</div>
                      )}
                    </div>
                    {newCombo.items.length > 0 && <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>Original price: ₹{comboOriginalPrice(newCombo.items)}</div>}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleAddCombo} disabled={addingCombo} style={{ flex:2, background:addingCombo?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:'12px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:addingCombo?'not-allowed':'pointer', fontFamily:'Poppins' }}>{addingCombo?'Creating...':'🍱 Create Combo'}</button>
                    <button onClick={() => { setShowAddCombo(false); setNewCombo(EMPTY_COMBO) }} style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'12px 0', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {combos.length === 0 && !showAddCombo && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:'40px 20px' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🍱</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:6 }}>No combos yet</div>
                <div style={{ fontSize:12, lineHeight:1.6 }}>Create meal combos to offer value deals</div>
              </div>
            )}

            {combos.map(combo => (
              <div key={combo.id} style={{ background:'#fff', borderRadius:14, marginBottom:12, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6' }}>
                {editingCombo === combo.id ? (
                  <div style={{ padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#92400e' }}>✏️ Edit Combo</div>
                      <button onClick={() => setEditingCombo(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#9ca3af' }}>✕</button>
                    </div>
                    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                      {[true,false].map(isV => (
                        <button key={String(isV)} onClick={() => setEditComboData(p=>({...p,isVeg:isV}))} style={{ flex:1, padding:'7px 0', borderRadius:8, cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:600, borderWidth:2, borderStyle:'solid', borderColor:editComboData.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#e5e7eb', background:editComboData.isVeg===isV?(isV?'#f0fdf4':'#fff5f5'):'#fff', color:editComboData.isVeg===isV?(isV?'#16a34a':'#dc2626'):'#9ca3af' }}>
                          {isV?'🟢 Veg':'🔴 Non-Veg'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Combo Name *</label><input style={inp} value={editComboData.name||''} onChange={e => setEditComboData(p=>({...p,name:e.target.value}))} /></div>
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Description</label><textarea style={{...inp,minHeight:60,resize:'vertical'}} value={editComboData.description||''} onChange={e => setEditComboData(p=>({...p,description:e.target.value}))} /></div>
                      <div>
                        <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Tag</label>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                          {COMBO_TAGS.map(tag => (
                            <button key={tag} onClick={() => setEditComboData(p=>({...p,tag:p.tag===tag?'':tag}))} style={{ padding:'5px 11px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:11, fontWeight:600, background:editComboData.tag===tag?'#fef3c7':'#f3f4f6', color:editComboData.tag===tag?'#92400e':'#6b7280', borderWidth:1.5, borderStyle:'solid', borderColor:editComboData.tag===tag?'#fbbf24':'transparent' }}>{tag}</button>
                          ))}
                        </div>
                      </div>
                      <ComboItemPicker comboState={editComboData} setComboState={setEditComboData} />
                      <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Combo Price (₹) *</label><input style={inp} type="number" value={editComboData.comboPrice||''} onChange={e => setEditComboData(p=>({...p,comboPrice:e.target.value}))} /></div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => handleSaveComboEdit(combo.id)} disabled={savingCombo} style={{ flex:2, background:savingCombo?'#f09595':'#16a34a', color:'#fff', border:'none', padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>{savingCombo?'Saving...':'💾 Save Changes'}</button>
                        <button onClick={() => setEditingCombo(null)} style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'11px 0', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ background:'linear-gradient(135deg,#1a1a1a,#2d1f00)', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <div style={{ width:14, height:14, borderRadius:3, flexShrink:0, borderWidth:1.5, borderStyle:'solid', borderColor:combo.isVeg===false?'#dc2626':'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:7, height:7, borderRadius:'50%', background:combo.isVeg===false?'#dc2626':'#16a34a' }} /></div>
                          <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{combo.name}</span>
                          {combo.tag && <span style={{ fontSize:10, fontWeight:700, background:'#fbbf24', color:'#78350f', borderRadius:10, padding:'2px 8px' }}>{combo.tag}</span>}
                        </div>
                        {combo.description && <div style={{ fontSize:11, color:'#9ca3af', marginTop:4, lineHeight:1.5 }}>{combo.description}</div>}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}>
                        <div style={{ fontSize:20, fontWeight:900, color:'#fbbf24' }}>₹{combo.comboPrice}</div>
                        {combo.originalPrice > combo.comboPrice && <div style={{ fontSize:10, color:'#9ca3af', textDecoration:'line-through' }}>₹{combo.originalPrice}</div>}
                        {combo.originalPrice > combo.comboPrice && <div style={{ fontSize:10, fontWeight:700, color:'#4ade80' }}>Save ₹{combo.originalPrice - combo.comboPrice}</div>}
                      </div>
                    </div>
                    <div style={{ padding:'10px 14px 0' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:0.5, marginBottom:8 }}>INCLUDES ({combo.items?.length} items)</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                        {combo.items?.map((item, i) => (
                          <div key={i} style={{ background:'#f9fafb', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, color:'#374151', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
                            {item.qty > 1 && <span style={{ color:'#E24B4A', fontWeight:800, marginRight:3 }}>{item.qty}×</span>}{item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding:'0 14px 12px', display:'flex', gap:8, alignItems:'center' }}>
                      <div onClick={() => toggleComboAvailable(combo)} style={{ width:40, height:22, background:combo.available?'#16a34a':'#d1d5db', borderRadius:11, cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                        <div style={{ position:'absolute', width:16, height:16, background:'#fff', borderRadius:'50%', top:3, left:combo.available?21:3, transition:'left 0.2s' }} />
                      </div>
                      <span style={{ fontSize:11, color:combo.available?'#16a34a':'#9ca3af', fontWeight:600 }}>{combo.available?'Available':'Hidden'}</span>
                      <div style={{ flex:1 }} />
                      <button onClick={() => { setEditingCombo(combo.id); setEditComboData({ name:combo.name, description:combo.description||'', comboPrice:String(combo.comboPrice), items:[...(combo.items||[])], isVeg:combo.isVeg!==false, tag:combo.tag||'' }); setComboSearchQuery('') }} style={{ background:'#f3f4f6', border:'none', borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', color:'#374151' }}>✏️ Edit</button>
                      <button onClick={() => handleDeleteCombo(combo.id)} style={{ background:'#fff5f5', border:'none', borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', color:'#dc2626' }}>🗑️</button>
                    </div>
                  </>
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
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:700 }}>Store Info</div>
                {!editingStoreInfo && (
                  <button onClick={handleOpenStoreEdit} style={{ display:'flex', alignItems:'center', gap:5, background:'#E24B4A', color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                    ✏️ Edit Info
                  </button>
                )}
              </div>

              {!editingStoreInfo ? (
                <>
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
                </>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ background:'#fff5f5', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#991b1b', marginBottom:4 }}>
                    ⚠️ Email and subscription plan cannot be changed here.
                  </div>
                  <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Store Name *</label><input style={inp} placeholder="Your store name" value={storeEditData.storeName||''} onChange={e => setStoreEditData(p=>({...p,storeName:e.target.value}))} /></div>
                  <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Phone / WhatsApp</label><input style={inp} type="tel" placeholder="10-digit mobile number" value={storeEditData.phone||''} onChange={e => setStoreEditData(p=>({...p,phone:e.target.value}))} maxLength={10} /></div>
                  <div><label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Store Address</label><textarea style={{...inp,minHeight:70,resize:'vertical',lineHeight:1.5}} placeholder="Full address with landmark" value={storeEditData.address||''} onChange={e => setStoreEditData(p=>({...p,address:e.target.value}))} /></div>
                  <div>
                    <label style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>Food Category</label>
                    <select style={{...inp,cursor:'pointer'}} value={storeEditData.category||''} onChange={e => setStoreEditData(p=>({...p,category:e.target.value}))}>
                      <option value="">Select category</option>
                      {['Home Food','Tiffin Service','Restaurant','Cloud Kitchen','Bakery','Sweets & Snacks','Beverages','Biryani House','Fast Food','Healthy Food','South Indian','North Indian','Chinese','Multi-cuisine'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <button onClick={handleSaveStoreInfo} disabled={savingStoreInfo} style={{ flex:2, background:savingStoreInfo?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:'12px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:savingStoreInfo?'not-allowed':'pointer', fontFamily:'Poppins' }}>{savingStoreInfo?'Saving...':'💾 Save Store Info'}</button>
                    <button onClick={() => setEditingStoreInfo(false)} style={{ flex:1, background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'12px 0', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                  </div>
                </div>
              )}
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
                      <button key={i} onClick={() => handleSelectLocation(s)} style={{ width:'100%', padding:'10px 14px', border:'none', borderBottomWidth:i<locationSuggestions.length-1?1:0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', background:'#fff', cursor:'pointer', textAlign:'left', fontFamily:'Poppins', display:'flex', gap:8, alignItems:'center' }}>
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
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🚴 Delivery Charge (₹)</label>
                <input type="number" placeholder="e.g. 20 (0 for free delivery)" value={deliveryCharge} onChange={e => setDeliveryCharge(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🛒 Minimum Order Amount (₹)</label>
                <input type="number" placeholder="e.g. 100 (0 for no minimum)" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }} />
                <div style={{ marginTop:6, display:'flex', alignItems:'flex-start', gap:6 }}>
                  <span style={{ fontSize:12, flexShrink:0 }}>💡</span>
                  <p style={{ margin:0, fontSize:11, color:'#9ca3af', lineHeight:1.5 }}>If set, customers must add at least ₹{minOrderAmount || '0'} worth of items before checkout. Set to 0 to remove.</p>
                </div>
              </div>
              {Number(minOrderAmount) > 0 && (
                <div style={{ marginBottom:14, background:'#eff6ff', borderRadius:10, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#bfdbfe', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:15 }}>👁️</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#1e40af', marginBottom:2 }}>How users will see it:</div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontSize:11, background:'#dbeafe', color:'#1e40af', fontWeight:700, borderRadius:6, padding:'2px 8px' }}>🛒 Min. ₹{minOrderAmount}</span>
                      <span style={{ fontSize:11, color:'#6b7280' }}>shown on restaurant card & menu</span>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>📋 FSSAI Licence Number</label>
                <input type="text" placeholder="e.g. 10012345000123" value={fssai} onChange={e => setFssai(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🏛️ GST Number</label>
                <input type="text" placeholder="e.g. 22AAAAA0000A1Z5" value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())} maxLength={15} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box', letterSpacing:1 }} />
                {gstNumber && (
                  <div style={{ marginTop:6 }}>
                    <span style={{ fontSize:11, background: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber) ? '#d1fae5':'#fee2e2', color: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber) ? '#065f46':'#991b1b', fontWeight:700, borderRadius:6, padding:'2px 8px' }}>
                      {/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber) ? '✅ Valid format' : `${gstNumber.length}/15 chars`}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>💳 UPI ID</label>
                <input type="text" placeholder="e.g. storename@paytm or 9876543210@upi" value={upiId} onChange={e => setUpiId(e.target.value.trim())} style={{ width:'100%', padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4, boxSizing:'border-box' }} />
                {upiId && (
                  <div style={{ marginTop:8, background:'#f0fdf4', borderRadius:10, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#bbf7d0', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:22 }}>📱</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'#15803d', marginBottom:2 }}>UPI Payment Preview on Bill</div>
                      <div style={{ fontSize:12, color:'#166534', fontWeight:600 }}>{upiId}</div>
                      <div style={{ fontSize:10, color:'#6b7280', marginTop:1 }}>Pay via PhonePe · GPay · Paytm · BHIM</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>🕐 Opening Hours</label>
                <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center' }}>
                  <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={{ flex:1, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none' }} />
                  <span style={{ fontSize:12, color:'#6b7280' }}>to</span>
                  <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={{ flex:1, padding:'10px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none' }} />
                </div>
              </div>
              <button onClick={handleSaveDetails} disabled={savingDetails} style={{ width:'100%', background:savingDetails?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:11, borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                {savingDetails?'Saving...':'💾 Save Store Details'}
              </button>
            </div>

            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>Logout</button>
          </div>
        )}
      </div>

      {/* ── CANCEL ORDER MODAL ── */}
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
                  {['Delivery location too far','Out of stock / ingredients unavailable','Store closing early today','Unable to prepare on time','Customer unreachable','Other'].map(reason => (
                    <button key={reason} onClick={() => setCancelReason(reason==='Other'?'':reason)} style={{ width:'100%', padding:'11px 14px', borderRadius:10, cursor:'pointer', fontFamily:'Poppins', fontSize:13, fontWeight:500, textAlign:'left', display:'flex', alignItems:'center', gap:10, borderWidth:1.5, borderStyle:'solid', borderColor:cancelReason===reason?'#E24B4A':'#e5e7eb', background:cancelReason===reason?'#fff5f5':'#fff', color:'#374151', transition:'all 0.15s' }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, borderWidth:2, borderStyle:'solid', borderColor:cancelReason===reason?'#E24B4A':'#d1d5db', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {cancelReason===reason && <div style={{ width:8, height:8, borderRadius:'50%', background:'#E24B4A' }} />}
                      </div>
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              {(cancelReason==='' || !['Delivery location too far','Out of stock / ingredients unavailable','Store closing early today','Unable to prepare on time','Customer unreachable'].includes(cancelReason)) && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:6 }}>{cancelReason===''?'Or type a custom reason:':'Custom reason:'}</div>
                  <textarea value={!['Delivery location too far','Out of stock / ingredients unavailable','Store closing early today','Unable to prepare on time','Customer unreachable'].includes(cancelReason)?cancelReason:''} onChange={e => setCancelReason(e.target.value)} placeholder="Describe why you are cancelling..." rows={3} style={{ width:'100%', padding:'10px 12px', borderWidth:1.5, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:10, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6 }} />
                </div>
              )}
              <button onClick={handleVendorCancelOrder} disabled={cancellingOrder || !cancelReason.trim()} style={{ width:'100%', background:(cancellingOrder||!cancelReason.trim())?'#fca5a5':'#dc2626', color:'#fff', border:'none', padding:'14px 0', borderRadius:12, fontSize:14, fontWeight:700, cursor:(cancellingOrder||!cancelReason.trim())?'not-allowed':'pointer', fontFamily:'Poppins', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {cancellingOrder?'⏳ Cancelling...':'🚫 Confirm Cancel Order'}
              </button>
              <button onClick={() => setShowCancelModal(false)} style={{ width:'100%', background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:'12px 0', borderRadius:12, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Keep Order Active</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VENDOR BILL MODAL ── */}
      {showVendorBill && vendorBillOrder && (
        <VendorBill
          order={vendorBillOrder}
          vendorData={userData}
          onClose={() => { setShowVendorBill(false); setVendorBillOrder(null) }}
        />
      )}

      {/* ── 🛵 RIDER LOCATION PANEL ── */}
      {showRiderPanel && riderPanelOrder && (
        <RiderLocationPanel
          order={riderPanelOrder}
          onClose={() => { setShowRiderPanel(false); setRiderPanelOrder(null) }}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}