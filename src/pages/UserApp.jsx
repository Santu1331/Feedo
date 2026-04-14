import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getAllVendors, getMenuItems, placeOrder, getUserOrders,
  getUserLocation, getDistance, saveUserLocation,
  listenNotifications, markNotificationRead, callVendor, notifyVendorWhatsApp,
  getCombos, saveExpoPushToken
} from '../firebase/services'
import { db } from '../firebase/config'
import { useNotifications } from '../hooks/useNotifications'
import UserBill from '../components/UserBill'
import LiveOrderTracking from '../components/LiveOrderTracking'
import toast from 'react-hot-toast'

// ─── Distance-based delivery charge (per km slab, max 4km) ───────────────────
function calcDeliveryCharge(distanceKm, vendorBaseCharge) {
  if (distanceKm === null || distanceKm === undefined) return Number(vendorBaseCharge ?? 0)
  const km = parseFloat(distanceKm)
  if (km <= 1) return 10
  if (km <= 2) return 20
  if (km <= 3) return 30
  if (km <= 4) return 40
  return 40 // should never reach — vendors beyond 4km are hidden
}

const MAX_DELIVERY_KM = 4

const S = {
  shell: { maxWidth:430, margin:'0 auto', background:'#f7f7f7', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' },
  redHdr: { background:'#E24B4A', color:'#fff', padding:'16px', flexShrink:0 },
  pageContent: { flex:1, overflowY:'auto', paddingBottom:60 },
  bottomNav: { display:'flex', borderTop:'1px solid #e5e7eb', background:'#fff', flexShrink:0, position:'sticky', bottom:0, zIndex:100 },
  bnItem: () => ({ flex:1, padding:'10px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', border:'none', background:'transparent', fontFamily:'Poppins,sans-serif' }),
}

const CATEGORIES = [
  { id:'All',     emoji:'🍽️',  label:'All' },
  { id:'Thali',   emoji:'🥘',  label:'Thali' },
  { id:'Biryani', emoji:'🍚',  label:'Biryani' },
  { id:'Pizza',   emoji:'🍕',  label:'Pizza' },
  { id:'Chinese', emoji:'🍜',  label:'Chinese' },
  { id:'Snacks',  emoji:'🍟',  label:'Snacks' },
  { id:'Juice',   emoji:'🥤',  label:'Juice' },
  { id:'Sweets',  emoji:'🍮',  label:'Sweets' },
  { id:'Roti',    emoji:'🫓',  label:'Roti' },
  { id:'Rice',    emoji:'🍛',  label:'Rice' },
]

const VegDot = ({ isVeg }) => (
  <div style={{
    width:14, height:14, borderRadius:3, flexShrink:0, display:'inline-flex',
    alignItems:'center', justifyContent:'center',
    borderWidth:1.5, borderStyle:'solid',
    borderColor: isVeg===false ? '#dc2626' : '#16a34a',
  }}>
    <div style={{ width:7, height:7, borderRadius:'50%', background: isVeg===false ? '#dc2626' : '#16a34a' }} />
  </div>
)

function getCancelSecondsLeft(order) {
  if (!order?.createdAt) return 0
  const placedMs = order.createdAt?.toDate
    ? order.createdAt.toDate().getTime()
    : order.createdAt?.seconds
      ? order.createdAt.seconds * 1000
      : null
  if (!placedMs) return 0
  const elapsed = (Date.now() - placedMs) / 1000
  return Math.max(0, 300 - elapsed)
}

function useCancelCountdown(order) {
  const [secondsLeft, setSecondsLeft] = useState(() => getCancelSecondsLeft(order))
  useEffect(() => {
    if (!order) return
    const tick = () => setSecondsLeft(getCancelSecondsLeft(order))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [order])
  return secondsLeft
}

// ─── Location Permission Gate ─────────────────────────────────────────────────
function LocationPermissionGate({ onGranted }) {
  const [requesting, setRequesting] = useState(false)

  const handleRequest = async () => {
    setRequesting(true)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
      )
      onGranted(pos.coords.latitude, pos.coords.longitude)
    } catch {
      toast.error('Location access denied. Please enable GPS to order food.', { duration: 5000 })
    }
    setRequesting(false)
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'#fff', zIndex:2000,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      fontFamily:'Poppins,sans-serif', padding:24, maxWidth:430, margin:'0 auto'
    }}>
      {/* Animated pin */}
      <div style={{ position:'relative', width:120, height:120, marginBottom:28 }}>
        <div style={{
          width:80, height:80, borderRadius:'50%', background:'#fee2e2',
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          animation:'locationPulse 2s ease-in-out infinite'
        }} />
        <div style={{
          width:56, height:56, borderRadius:'50%', background:'#fecaca',
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          animation:'locationPulse 2s ease-in-out infinite 0.3s'
        }} />
        <div style={{
          width:52, height:52, borderRadius:'50%', background:'#E24B4A',
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:26
        }}>📍</div>
      </div>
      <style>{`
        @keyframes locationPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1} 50%{transform:translate(-50%,-50%) scale(1.15);opacity:0.6} }
      `}</style>
      <div style={{ fontSize:22, fontWeight:800, color:'#1f2937', marginBottom:8, textAlign:'center', lineHeight:1.3 }}>
        Enable Location to Order
      </div>
      <div style={{ fontSize:13, color:'#6b7280', textAlign:'center', lineHeight:1.7, marginBottom:8 }}>
        FeedoZone uses your location to show nearby restaurants and calculate accurate delivery charges.
      </div>
      <div style={{ background:'#f9fafb', borderRadius:12, padding:'12px 16px', marginBottom:24, width:'100%', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
        {[
          { icon:'🏪', text:'See restaurants within 4 km' },
          { icon:'💰', text:'Auto-calculate delivery charges' },
          { icon:'🛵', text:'Accurate delivery estimates' },
        ].map(row => (
          <div key={row.text} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0' }}>
            <span style={{ fontSize:18 }}>{row.icon}</span>
            <span style={{ fontSize:13, color:'#374151' }}>{row.text}</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleRequest}
        disabled={requesting}
        style={{
          width:'100%', background:requesting?'#f09595':'#E24B4A', color:'#fff',
          border:'none', padding:'15px 0', borderRadius:14, fontSize:15, fontWeight:700,
          cursor:requesting?'not-allowed':'pointer', fontFamily:'Poppins',
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          boxShadow:'0 6px 20px rgba(226,75,74,0.35)'
        }}
      >
        <span style={{ fontSize:20 }}>📍</span>
        {requesting ? 'Detecting location...' : 'Allow Location Access'}
      </button>
      <div style={{ fontSize:11, color:'#9ca3af', marginTop:14, textAlign:'center', lineHeight:1.6 }}>
        Your location is only used to find nearby restaurants.<br/>We never track you in background.
      </div>
    </div>
  )
}

// ─── Map Modal ────────────────────────────────────────────────────────────────
function MapModal({ userLat, userLng, vendors, onClose }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    // Load Leaflet dynamically
    if (mapInstance.current) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => {
      if (!mapRef.current || mapInstance.current) return
      const L = window.L
      const map = L.map(mapRef.current, { zoomControl:true }).setView([userLat, userLng], 14)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:'© OpenStreetMap contributors'
      }).addTo(map)

      // User marker
      const userIcon = L.divIcon({
        html:`<div style="width:36px;height:36px;border-radius:50%;background:#E24B4A;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 12px rgba(226,75,74,0.5)">👤</div>`,
        className:'', iconSize:[36,36], iconAnchor:[18,18]
      })
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>📍 You are here</b>')
        .openPopup()

      // 4km radius circle
      L.circle([userLat, userLng], {
        radius: MAX_DELIVERY_KM * 1000,
        color:'#E24B4A', fillColor:'#fee2e2', fillOpacity:0.08,
        weight:2, dashArray:'6,6'
      }).addTo(map)

      // Vendor markers
      vendors.forEach(v => {
        if (!v.location?.lat || !v.location?.lng) return
        const dist = getDistance(userLat, userLng, v.location.lat, v.location.lng)
        if (dist > MAX_DELIVERY_KM) return
        const charge = calcDeliveryCharge(dist)
        const color = v.isOpen ? '#16a34a' : '#6b7280'
        const vendorIcon = L.divIcon({
          html:`<div style="background:${color};border:2.5px solid #fff;border-radius:10px;padding:5px 8px;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.2);font-family:Poppins,sans-serif">
            ${v.isOpen?'🟢':'🔴'} ${v.storeName?.split(' ')[0]||'Vendor'}
          </div>`,
          className:'', iconSize:[null,null], iconAnchor:[0,0]
        })
        L.marker([v.location.lat, v.location.lng], { icon: vendorIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Poppins,sans-serif;min-width:160px">
              <b style="font-size:13px">${v.storeName}</b><br/>
              <span style="font-size:11px;color:#6b7280">${v.category}</span><br/>
              <span style="font-size:11px;color:${v.isOpen?'#16a34a':'#dc2626'};font-weight:600">${v.isOpen?'● Open':'● Closed'}</span><br/>
              <span style="font-size:11px">📍 ${dist.toFixed(1)} km · 🚚 ₹${charge} delivery</span>
            </div>
          `)
      })
    }
    document.head.appendChild(script)
  }, [userLat, userLng, vendors])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1500, display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'#fff', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:'#1f2937' }}>🗺️ Nearby Restaurants</div>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Showing within {MAX_DELIVERY_KM}km radius</div>
        </div>
        <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:34, height:34, fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ flex:1, position:'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
      </div>
      {/* Legend */}
      <div style={{ background:'#fff', padding:'12px 16px', display:'flex', gap:16, flexWrap:'wrap', flexShrink:0 }}>
        {[
          { color:'#E24B4A', label:'You' },
          { color:'#16a34a', label:'Open' },
          { color:'#6b7280', label:'Closed' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:l.color }} />
            <span style={{ fontSize:11, color:'#374151' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:16, height:2, background:'#E24B4A', borderStyle:'dashed' }} />
          <span style={{ fontSize:11, color:'#374151' }}>{MAX_DELIVERY_KM}km limit</span>
        </div>
        <div style={{ marginLeft:'auto', fontSize:11, color:'#6b7280' }}>
          🚚 1km=₹10 · 2km=₹20 · 3km=₹30 · 4km=₹40
        </div>
      </div>
    </div>
  )
}

export default function UserApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState(() => localStorage.getItem('feedo_tab') || 'home')
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [vendorCombos, setVendorCombos] = useState([])
  const [cart, setCart] = useState([])
  const [cartVendor, setCartVendor] = useState(null)
  const [orders, setOrders] = useState([])
  const [catFilter, setCatFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [lang, setLang] = useState('en')
  const [showCheckout, setShowCheckout] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [showVendorInfo, setShowVendorInfo] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [reviewVendor, setReviewVendor] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviews, setReviews] = useState([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [billOrder, setBillOrder] = useState(null)
  const [showSupport, setShowSupport] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [supportMsg, setSupportMsg] = useState('')
  const [supportCategory, setSupportCategory] = useState('General')
  const [sendingSupport, setSendingSupport] = useState(false)
  const [supportSent, setSupportSent] = useState(false)
  const [myTickets, setMyTickets] = useState([])

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  const [menuCatFilter, setMenuCatFilter] = useState('All')

  // ── Location state ──
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [locationName, setLocationName] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [searchingLocation, setSearchingLocation] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)  // NEW
  const [showMap, setShowMap] = useState(false)                  // NEW

  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryHostel, setDeliveryHostel] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const [cancellingOrder, setCancellingOrder] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)

  const t = (en, mr) => lang === 'mr' ? mr : en

  useNotifications(user?.uid, 'user')

useEffect(() => {
  if (!user?.uid) return  // wait until user is actually loaded

  const saveToken = async (token) => {
    if (token && typeof token === 'string' && token.startsWith('ExponentPushToken')) {
      console.log('✅ Saving expo token for user:', user.uid)
      await saveExpoPushToken(user.uid, token, 'user')
    }
  }

  // Check if token already available in window
  if (window.expoPushToken) {
    saveToken(window.expoPushToken)
  }

  // Also listen for future token events
  const handleToken = (e) => saveToken(e.detail)
  window.addEventListener('expoPushToken', handleToken)
  return () => window.removeEventListener('expoPushToken', handleToken)
}, [user?.uid])  // ← depends on user.uid only, not full user object

  // ── Check if location already in localStorage ──
  useEffect(() => {
    const cached = localStorage.getItem('feedo_location')
    if (cached) {
      try {
        const { lat, lng, name } = JSON.parse(cached)
        setUserLat(lat); setUserLng(lng); setLocationName(name); setLocationGranted(true)
      } catch {}
    }
  }, [])

  useEffect(() => {
    window.history.pushState({ tab }, '', window.location.href)
    const handlePopState = () => {
      if (tab === 'vendor-menu') { setTab('home'); setSearchQuery('') }
      else if (selectedOrder) { setSelectedOrder(null) }
      else if (tab === 'cart') { setTab('home') }
      else if (showCheckout) { setShowCheckout(false) }
      else if (showVendorInfo) { setShowVendorInfo(false) }
      else if (showLocationPicker) { setShowLocationPicker(false) }
      else if (orderSuccess) { setOrderSuccess(null); setTab('orders') }
      else if (tab !== 'home') { setTab('home') }
      else { window.history.pushState({ tab: 'home' }, '', window.location.href); return }
      window.history.pushState({ tab }, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [tab, showCheckout, showVendorInfo, showLocationPicker, orderSuccess])

  useEffect(() => { if (tab !== 'vendor-menu') localStorage.setItem('feedo_tab', tab) }, [tab])
  useEffect(() => { return getAllVendors(setVendors) }, [])
  useEffect(() => { if (!user) return; return getUserOrders(user.uid, setOrders) }, [user])

  useEffect(() => {
    if (!selectedVendor) return
    setMenuItems([]); setVendorCombos([])
    const u1 = getMenuItems(selectedVendor.id, setMenuItems)
    const u2 = getCombos(selectedVendor.id, (combos) => {
      setVendorCombos(combos.filter(c => c.available !== false && c.items?.length >= 2))
    })
    return () => { u1(); u2() }
  }, [selectedVendor])

  useEffect(() => {
    if (!user) return
    return listenNotifications(user.uid, (notifs) => {
      setNotifications(notifs)
      notifs.forEach(n => { toast(n.body, { icon: '🔔', duration: 4000 }); markNotificationRead(n.id) })
    })
  }, [user])

  useEffect(() => {
    if (userData) {
      setDeliveryName(userData.name || '')
      setDeliveryPhone(userData.mobile || '')
      setDeliveryAddress(userData.address || '')
    }
  }, [userData])

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Your Location'
    } catch { return 'Your Location' }
  }

  // ── Called when location permission granted ──
  const handleLocationGranted = async (lat, lng) => {
    setUserLat(lat); setUserLng(lng); setLocationGranted(true)
    const name = await reverseGeocode(lat, lng)
    setLocationName(name)
    localStorage.setItem('feedo_location', JSON.stringify({ lat, lng, name }))
    if (user) await saveUserLocation(user.uid, lat, lng)
    toast.success(`📍 Location set to ${name}`)
    setShowLocationPicker(false)
  }

  const handleGetLocation = async () => {
    setLocationLoading(true)
    try {
      const { lat, lng } = await getUserLocation()
      await handleLocationGranted(lat, lng)
    } catch { toast.error('Could not get location. Enable GPS.') }
    setLocationLoading(false)
  }

  const handleLocationSearch = async (q) => {
    setLocationSearch(q)
    if (q.length < 3) { setLocationSuggestions([]); return }
    setSearchingLocation(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocationSuggestions(data.map(d => ({ name: d.display_name.split(',').slice(0,3).join(', '), lat: parseFloat(d.lat), lng: parseFloat(d.lon) })))
    } catch { setLocationSuggestions([]) }
    setSearchingLocation(false)
  }

  const handleSelectLocation = async (suggestion) => {
    await handleLocationGranted(suggestion.lat, suggestion.lng)
    setLocationSearch(''); setLocationSuggestions([])
  }

  const openVendor = (v) => {
    if (!locationGranted) {
      toast.error('Please enable location first to browse restaurants', { icon: '📍', duration: 3000 })
      return
    }
    if (!v.isOpen) {
      toast.error(`${v.storeName} is currently closed${v.openTime ? `. Opens at ${v.openTime}` : ''}`, { icon: '🔒', duration: 3000 })
      return
    }
    setSelectedVendor(v); setTab('vendor-menu'); setShowVendorInfo(false)
    loadReviews(v.id); setMenuCatFilter('All'); setVendorCombos([])
  }

  const addToCart = (item) => {
    if (!locationGranted) { toast.error('Enable location to place orders', { icon: '📍' }); return }
    if (!selectedVendor?.isOpen) { toast.error('This store is currently closed.'); return }
    if (cartVendor && cartVendor.id !== selectedVendor.id) { toast.error('Clear cart first — items from ' + cartVendor.storeName); return }

    // Compute distance-based delivery charge
    const dist = (userLat && userLng && selectedVendor.location?.lat && selectedVendor.location?.lng)
      ? getDistance(userLat, userLng, selectedVendor.location.lat, selectedVendor.location.lng)
      : null
    const dynamicCharge = calcDeliveryCharge(dist, selectedVendor.deliveryCharge)

    setCartVendor({ ...selectedVendor, deliveryCharge: dynamicCharge, distanceKm: dist })
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty+1 } : c)
      return [...prev, { ...item, qty:1 }]
    })
    toast.success(item.name + ' added!')
  }

  const addComboToCart = (combo) => {
    if (!locationGranted) { toast.error('Enable location to place orders', { icon: '📍' }); return }
    if (!selectedVendor?.isOpen) { toast.error('This store is currently closed.'); return }
    if (cartVendor && cartVendor.id !== selectedVendor.id) { toast.error('Clear cart first — items from ' + cartVendor.storeName); return }

    const dist = (userLat && userLng && selectedVendor.location?.lat && selectedVendor.location?.lng)
      ? getDistance(userLat, userLng, selectedVendor.location.lat, selectedVendor.location.lng)
      : null
    const dynamicCharge = calcDeliveryCharge(dist, selectedVendor.deliveryCharge)

    setCartVendor({ ...selectedVendor, deliveryCharge: dynamicCharge, distanceKm: dist })
    const comboCartId = 'combo_' + combo.id
    setCart(prev => {
      const ex = prev.find(c => c.id === comboCartId)
      if (ex) return prev.map(c => c.id === comboCartId ? { ...c, qty: c.qty+1 } : c)
      return [...prev, { id: comboCartId, name: '🍱 ' + combo.name, price: combo.comboPrice, qty: 1, isCombo: true, comboItems: combo.items }]
    })
    toast.success(`🍱 ${combo.name} added!`)
  }

  const updateQty = (itemId, delta) => {
    setCart(prev => {
      const updated = prev.map(c => c.id===itemId ? { ...c, qty:c.qty+delta } : c).filter(c => c.qty > 0)
      if (updated.length === 0) setCartVendor(null)
      return updated
    })
  }

  const cartTotal = cart.reduce((s,c) => s + c.price*c.qty, 0)
  const cartCount = cart.reduce((s,c) => s + c.qty, 0)
  const deliveryFee = Number(cartVendor?.deliveryCharge ?? 0)
  const minOrder = Number(cartVendor?.minOrderAmount ?? 0)
  const minOrderShortfall = minOrder > 0 ? Math.max(0, minOrder - cartTotal) : 0
  const meetsMinOrder = minOrderShortfall === 0

  const handleCancelOrder = async (order) => {
    if (cancellingOrder) return
    setCancellingOrder(true)
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'cancelled',
        cancelledBy: 'user',
        cancellationReason: 'Cancelled by customer within 5 minutes',
        cancelledAt: serverTimestamp(),
      })
      toast.success('Order cancelled successfully.')
      setShowCancelConfirm(false)
      setOrderToCancel(null)
      if (selectedOrder?.id === order.id) setSelectedOrder(null)
    } catch (e) {
      console.error(e)
      toast.error('Failed to cancel. Please try again.')
    }
    setCancellingOrder(false)
  }

  useEffect(() => {
    if (!user) return
    let unsub
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      const q = query(collection(db, 'supportTickets'), where('userUid', '==', user.uid))
      unsub = onSnapshot(q, snap => {
        const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        tickets.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
        setMyTickets(tickets)
      })
    })
    return () => unsub?.()
  }, [user])

  const handleSendSupport = async () => {
    if (!supportMsg.trim()) return toast.error('Please describe your issue')
    setSendingSupport(true)
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(db, 'supportTickets'), {
        userUid: user.uid, userName: userData?.name || 'User', userEmail: user.email,
        userPhone: userData?.mobile || '', category: supportCategory,
        message: supportMsg.trim(), status: 'open', founderReply: '', createdAt: serverTimestamp()
      })
      setSupportSent(true); setSupportMsg(''); toast.success('Support request sent! ✅')
    } catch { toast.error('Failed to send. Try again.') }
    setSendingSupport(false)
  }

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return toast.error('Please write your feedback')
    setSendingFeedback(true)
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(db, 'supportTickets'), {
        userUid: user.uid, userName: userData?.name || 'User', userEmail: user.email,
        userPhone: userData?.mobile || '',
        category: feedbackType==='suggestion'?'Feedback':feedbackType==='bug'?'App Bug':'General',
        message: feedbackText.trim(), appRating: feedbackRating,
        status: 'open', founderReply: '', isFeedback: true, createdAt: serverTimestamp()
      })
      setFeedbackSent(true); setFeedbackText(''); toast.success('Thank you for your feedback! 🙏')
    } catch { toast.error('Failed to send. Try again.') }
    setSendingFeedback(false)
  }

  const handlePlaceOrder = async () => {
    if (!locationGranted) return toast.error('Enable your location to place an order', { icon: '📍' })
    if (!deliveryName.trim()) return toast.error('Enter your name')
    if (!deliveryPhone.trim()) return toast.error('Enter phone number')
    if (!deliveryAddress.trim() && !deliveryHostel.trim()) return toast.error('Enter delivery address')
    if (minOrder > 0 && cartTotal < minOrder) {
      return toast.error(`Minimum order is ₹${minOrder}. Add ₹${minOrderShortfall} more to checkout.`, { duration: 4000, icon: '🛒' })
    }
    try {
      const fullAddress = [deliveryHostel.trim(), deliveryAddress.trim(), deliveryNote.trim() ? `Note: ${deliveryNote.trim()}` : ''].filter(Boolean).join(' · ')
      const billNo = 'FZ-' + Date.now().toString(36).slice(-6).toUpperCase()
      await placeOrder({
        userUid: user.uid, userName: deliveryName.trim(), userPhone: deliveryPhone.trim(),
        userEmail: user.email, vendorUid: cartVendor.id, vendorName: cartVendor.storeName,
        items: cart.map(i => ({ id:i.id, name:i.name, price:i.price, qty:i.qty, isCombo: i.isCombo||false })),
        subtotal: cartTotal, deliveryFee: deliveryFee, total: cartTotal + deliveryFee,
        address: fullAddress, paymentMode: 'COD',
        billNo,
        userLat, userLng,
        distanceKm: cartVendor.distanceKm || null,
      })
      const vendorSnap = await import('firebase/firestore').then(({doc, getDoc}) => getDoc(doc(db, 'vendors', cartVendor.id)))
      const vendorInfo = vendorSnap.exists() ? vendorSnap.data() : {}
      setOrderSuccess({
        orderId: Math.random().toString(36).slice(-6).toUpperCase(),
        billNo,
        vendorName: cartVendor.storeName, vendorPhone: vendorInfo.phone || '',
        vendorPhoto: vendorInfo.photo || '', items: cart.map(i => ({ ...i })),
        total: cartTotal + deliveryFee, subtotal: cartTotal, deliveryFee: deliveryFee,
        address: fullAddress, userName: deliveryName.trim(), userPhone: deliveryPhone.trim(),
        prepTime: vendorInfo.prepTime || 20,
      })
      setCart([]); setCartVendor(null); setShowCheckout(false)
      setDeliveryNote(''); setDeliveryHostel('')
    } catch (e) { console.error(e); toast.error('Failed to place order. Try again.') }
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return toast.error('Please write a review!')
    setSubmittingReview(true)
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(db, 'reviews'), {
        vendorId: reviewVendor.id, vendorName: reviewVendor.storeName,
        userId: user.uid, userName: userData?.name || 'Anonymous',
        rating: reviewRating, text: reviewText.trim(), createdAt: serverTimestamp()
      })
      toast.success('Review submitted! ⭐'); setShowReview(false); setReviewText(''); setReviewRating(5)
    } catch { toast.error('Failed to submit review') }
    setSubmittingReview(false)
  }

  const loadReviews = async (vendorId) => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const q = query(collection(db, 'reviews'), where('vendorId', '==', vendorId))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      setReviews(data)
    } catch { setReviews([]) }
  }

  // ── Filter vendors: only within 4km if location is set ──
  const filteredVendors = vendors
    .filter(v => {
      const matchCat = catFilter === 'All' || v.category === catFilter || (catFilter !== 'All' && v.customCategories?.includes(catFilter))
      const q = searchQuery.toLowerCase().trim()
      const matchSearch = !q || v.storeName?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q) || v.address?.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    .map(v => ({
      ...v,
      distance: (userLat && userLng && v.location?.lat && v.location?.lng)
        ? getDistance(userLat, userLng, v.location.lat, v.location.lng)
        : null,
    }))
    // ── HIDE vendors beyond 4km (Zomato-style) ──
    .filter(v => {
      if (!locationGranted) return true  // if no location, show all (until gated)
      if (v.distance === null) return true  // vendor has no coords, still show
      return v.distance <= MAX_DELIVERY_KM
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance
      if (a.isOpen && !b.isOpen) return -1
      if (!a.isOpen && b.isOpen) return 1
      return 0
    })

  const inp = {
    width:'100%', padding:'11px 13px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:9, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:6, boxSizing:'border-box', background:'#fff'
  }

  const unreadCount = notifications.length

  // ── If location not granted, show permission gate BEFORE the app ──
  if (!locationGranted) {
    return (
      <div style={S.shell}>
        <LocationPermissionGate onGranted={handleLocationGranted} />
      </div>
    )
  }

  const CancelConfirmModal = ({ order, onConfirm, onClose, loading }) => {
    const secs = useCancelCountdown(order)
    const mm = String(Math.floor(secs / 60)).padStart(2,'0')
    const ss = String(Math.floor(secs % 60)).padStart(2,'0')
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
        onClick={e => { if(e.target===e.currentTarget) onClose() }}>
        <div style={{ background:'#fff', borderRadius:20, padding:24, maxWidth:380, width:'100%', fontFamily:'Poppins,sans-serif', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1f2937', marginBottom:6 }}>Cancel this order?</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:16, lineHeight:1.6 }}>
            Are you sure you want to cancel your order from <strong>{order?.vendorName}</strong>? This action cannot be undone.
          </div>
          {secs > 0 && (
            <div style={{ background:'#fff7ed', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'inline-block', borderWidth:1, borderStyle:'solid', borderColor:'#fed7aa' }}>
              <span style={{ fontSize:11, color:'#c2410c', fontWeight:600 }}>⏱ Cancel window closes in {mm}:{ss}</span>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, background:'#f3f4f6', color:'#374151', border:'none', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>Keep Order</button>
            <button onClick={() => onConfirm(order)} disabled={loading} style={{ flex:1, background:loading?'#fca5a5':'#dc2626', color:'#fff', border:'none', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:'Poppins' }}>
              {loading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const CancelOrderButton = ({ order, style = {} }) => {
    const [secs, setSecs] = useState(() => getCancelSecondsLeft(order))
    useEffect(() => {
      const tick = () => setSecs(getCancelSecondsLeft(order))
      tick()
      const id = setInterval(tick, 1000)
      return () => clearInterval(id)
    }, [order])
    const isCancellable = secs > 0 && !['delivered','cancelled'].includes(order.status)
    if (!isCancellable) return null
    const mm = String(Math.floor(secs / 60)).padStart(2,'0')
    const ss = String(Math.floor(secs % 60)).padStart(2,'0')
    return (
      <button
        onClick={e => { e.stopPropagation(); setOrderToCancel(order); setShowCancelConfirm(true) }}
        style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:5,
          background:'#fee2e2', borderRadius:8, padding:'6px 0', flex:1,
          borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', cursor:'pointer',
          fontFamily:'Poppins', ...style
        }}
      >
        <span style={{ fontSize:13 }}>❌</span>
        <span style={{ fontSize:11, fontWeight:600, color:'#dc2626' }}>Cancel ({mm}:{ss})</span>
      </button>
    )
  }

  const ComboCard = ({ combo }) => {
    const inCart = cart.find(c => c.id === 'combo_' + combo.id)
    const vendorClosed = !selectedVendor?.isOpen
    const savings = (combo.originalPrice || 0) - combo.comboPrice
    const savingsPct = combo.originalPrice > 0 ? Math.round(savings / combo.originalPrice * 100) : 0
    return (
      <div style={{ background:'linear-gradient(135deg,#1a1a1a,#2d1f00)', borderRadius:14, marginBottom:12, overflow:'hidden', boxShadow:'0 4px 14px rgba(0,0,0,0.15)', opacity:vendorClosed?0.6:1 }}>
        <div style={{ padding:'12px 14px 10px', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            <div style={{ width:12, height:12, borderRadius:2, flexShrink:0, borderWidth:1.5, borderStyle:'solid', borderColor:combo.isVeg===false?'#dc2626':'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:combo.isVeg===false?'#dc2626':'#16a34a' }} />
            </div>
            {combo.tag && <span style={{ fontSize:9, fontWeight:800, background:'#fbbf24', color:'#78350f', borderRadius:10, padding:'2px 8px', letterSpacing:0.3 }}>{combo.tag}</span>}
            {savingsPct > 0 && <span style={{ fontSize:9, fontWeight:800, background:'#16a34a', color:'#fff', borderRadius:10, padding:'2px 8px' }}>{savingsPct}% OFF</span>}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:4 }}>{combo.name}</div>
              {combo.description && <div style={{ fontSize:11, color:'#9ca3af', lineHeight:1.5 }}>{combo.description}</div>}
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:900, color:'#fbbf24' }}>₹{combo.comboPrice}</div>
              {combo.originalPrice > combo.comboPrice && <>
                <div style={{ fontSize:10, color:'#6b7280', textDecoration:'line-through' }}>₹{combo.originalPrice}</div>
                <div style={{ fontSize:10, color:'#4ade80', fontWeight:700 }}>Save ₹{savings}</div>
              </>}
            </div>
          </div>
        </div>
        <div style={{ padding:'0 14px 12px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
            {combo.items?.map((item, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:6, padding:'4px 9px', fontSize:11, color:'rgba(255,255,255,0.85)', fontWeight:500 }}>
                {item.qty > 1 && <span style={{ color:'#fbbf24', fontWeight:800, marginRight:2 }}>{item.qty}×</span>}{item.name}
              </div>
            ))}
          </div>
          {vendorClosed ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 0' }}>
              <span style={{ fontSize:12 }}>🔒</span><span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>Store Closed</span>
            </div>
          ) : inCart ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,187,0,0.15)', borderRadius:10, padding:'8px 14px', borderWidth:1, borderStyle:'solid', borderColor:'rgba(251,191,36,0.3)' }}>
              <span style={{ fontSize:12, color:'#fbbf24', fontWeight:600 }}>🍱 In Cart</span>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={() => updateQty('combo_'+combo.id,-1)} style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,0.15)', color:'#fbbf24', cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <span style={{ fontSize:13, fontWeight:800, color:'#fff', minWidth:16, textAlign:'center' }}>{inCart.qty}</span>
                <button onClick={() => addComboToCart(combo)} style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,0.15)', color:'#fbbf24', cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
            </div>
          ) : (
            <button onClick={() => addComboToCart(combo)} style={{ width:'100%', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#1a1a1a', border:'none', padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span>🍱</span> Add Combo · ₹{combo.comboPrice}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={S.shell}>

      {/* ── HEADER ── */}
      <div style={S.redHdr}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:24, fontWeight:700, letterSpacing:-0.5 }}>{t('Feedo','फिडो')}</div>
            <div onClick={() => setShowLocationPicker(true)} style={{ marginTop:6, cursor:'pointer', display:'flex', alignItems:'center', gap:8, maxWidth:220 }}>
              <div style={{ position:'relative', width:22, height:26, flexShrink:0 }}>
                <div style={{ width:18, height:18, borderRadius:'50% 50% 50% 0', background:'#fff', transform:'rotate(-45deg)', position:'absolute', top:0, left:2, boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#E24B4A', position:'absolute', top:5, left:7 }} />
                <div style={{ width:2, height:10, background:'rgba(255,255,255,0.8)', position:'absolute', bottom:0, left:10, borderRadius:2 }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                <span style={{ fontSize:10, opacity:0.75, lineHeight:1, letterSpacing:0.3 }}>DELIVERING TO</span>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, lineHeight:1.4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160 }}>
                    {locationLoading ? 'Detecting...' : locationName || 'Select Location'}
                  </span>
                  <span style={{ fontSize:10, opacity:0.8 }}>▾</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* Map button */}
            <button onClick={() => setShowMap(true)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:14, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:4 }}>
              🗺️
            </button>
            <div onClick={() => setShowNotifs(!showNotifs)} style={{ position:'relative', cursor:'pointer' }}>
              <span style={{ fontSize:20 }}>🔔</span>
              {unreadCount > 0 && <div style={{ position:'absolute', top:-4, right:-4, background:'#fbbf24', color:'#000', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unreadCount}</div>}
            </div>
            <button onClick={() => setLang(l => l==='en'?'mr':'en')} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Poppins' }}>
              {lang==='en'?'मराठी':'English'}
            </button>
          </div>
        </div>

        {/* Location picker */}
        {showLocationPicker && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', flexDirection:'column', justifyContent:'flex-start' }}
            onClick={(e) => { if(e.target===e.currentTarget) setShowLocationPicker(false) }}>
            <div style={{ background:'#fff', borderRadius:'0 0 20px 20px', padding:20, maxWidth:430, width:'100%', margin:'0 auto', maxHeight:'80vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>Select Location</div>
                <button onClick={() => setShowLocationPicker(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>✕</button>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderWidth:1.5, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, marginBottom:14, background:'#f9fafb' }}>
                <span style={{ fontSize:16 }}>🔍</span>
                <input autoFocus style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', background:'transparent', color:'#1f2937' }} placeholder="Search area, colony, city..." value={locationSearch} onChange={e => handleLocationSearch(e.target.value)} />
                {searchingLocation && <span style={{ fontSize:12, color:'#9ca3af' }}>...</span>}
              </div>
              <button onClick={handleGetLocation} disabled={locationLoading} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#fff5f5', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', borderRadius:12, cursor:'pointer', marginBottom:14, fontFamily:'Poppins' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>📍</div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#E24B4A' }}>{locationLoading ? 'Detecting...' : 'Use Current Location'}</div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>Using GPS</div>
                </div>
              </button>
              {locationSuggestions.length > 0 && (
                <div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Search Results</div>
                  {locationSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSelectLocation(s)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6', borderRadius:10, cursor:'pointer', marginBottom:8, fontFamily:'Poppins', textAlign:'left' }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>📍</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'#1f2937' }}>{s.name.split(',')[0]}</div>
                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{s.name.split(',').slice(1,3).join(',')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!locationSearch && (
                <div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Popular in Warananagar</div>
                  {['Warananagar', 'Kolhapur', 'Sangli', 'Ichalkaranji', 'Miraj'].map(area => (
                    <button key={area} onClick={() => handleLocationSearch(area)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#fafafa', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6', borderRadius:10, cursor:'pointer', marginBottom:6, fontFamily:'Poppins' }}>
                      <span style={{ fontSize:14 }}>🏘️</span><span style={{ fontSize:13, color:'#374151' }}>{area}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(tab==='home' || tab==='vendor-menu') && (
          <div style={{ background:'#fff', borderRadius:10, display:'flex', alignItems:'center', gap:8, padding:'10px 14px', marginTop:12 }}>
            <span style={{ fontSize:16 }}>🔍</span>
            <input style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', color:'#1f2937' }} placeholder={t('Search restaurants or food...','रेस्टॉरंट शोधा...')} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if (tab==='vendor-menu') setTab('home') }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9ca3af', padding:0 }}>✕</button>}
          </div>
        )}

        {tab==='vendor-menu' && selectedVendor && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
            <button onClick={() => { setTab('home'); setSearchQuery('') }} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>← Back</button>
            <span style={{ fontSize:14, fontWeight:600 }}>{selectedVendor.storeName}</span>
            <span style={{ fontSize:11, background:selectedVendor.isOpen?'#16a34a':'#dc2626', color:'#fff', padding:'2px 8px', borderRadius:10 }}>{selectedVendor.isOpen ? 'Open' : 'Closed'}</span>
          </div>
        )}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={S.pageContent}>

        {/* ── HOME ── */}
        {tab==='home' && (
          <div style={{ background:'#fff', minHeight:'100%' }}>

            {/* ── Delivery charge info banner ── */}
            <div style={{ background:'linear-gradient(90deg,#fff7ed,#fef3c7)', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#fed7aa', padding:'8px 16px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:16 }}>🚚</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#92400e' }}>Distance-based delivery charges</div>
                <div style={{ fontSize:10, color:'#a16207' }}>1km=₹10 · 2km=₹20 · 3km=₹30 · 4km=₹40 · Max {MAX_DELIVERY_KM}km</div>
              </div>
              <button onClick={() => setShowMap(true)} style={{ background:'#E24B4A', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap' }}>
                🗺️ Map
              </button>
            </div>

            {searchQuery.trim() && (
              <div style={{ padding:'10px 16px 0', fontSize:12, color:'#6b7280' }}>
                {filteredVendors.length===0 ? `No results for "${searchQuery}"` : `${filteredVendors.length} result${filteredVendors.length>1?'s':''} for "${searchQuery}"`}
              </div>
            )}

            {!searchQuery.trim() && (
              <div style={{ background:'#fff', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div style={{ overflowX:'auto', padding:'16px 16px 12px' }}>
                  <div style={{ display:'flex', gap:18, width:'max-content' }}>
                    {CATEGORIES.map(c => {
                      const active = catFilter === c.id
                      const bgMap = { All:'#fff0f0', Thali:'#fef3c7', Biryani:'#fef9c3', Pizza:'#fff1f2', Chinese:'#f0f9ff', Snacks:'#fff7ed', Juice:'#f0fdf4', Sweets:'#fdf4ff', Roti:'#fefce8', Rice:'#f0fdf4' }
                      return (
                        <div key={c.id} onClick={() => setCatFilter(c.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, cursor:'pointer', flexShrink:0 }}>
                          <div style={{ width:64, height:64, borderRadius:'50%', background:active?'#E24B4A':(bgMap[c.id]||'#fff5f5'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:active?'0 6px 18px rgba(226,75,74,0.45)':'0 2px 10px rgba(0,0,0,0.07)', borderWidth:2.5, borderStyle:'solid', borderColor:active?'#E24B4A':'transparent', transform:active?'scale(1.08)':'scale(1)', transition:'all 0.2s' }}>{c.emoji}</div>
                          <span style={{ fontSize:11, fontWeight:active?700:500, color:active?'#E24B4A':'#374151', whiteSpace:'nowrap' }}>{c.label}</span>
                          {active && <div style={{ width:18, height:3, background:'#E24B4A', borderRadius:2 }} />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding:'12px 16px 6px', fontSize:15, fontWeight:600, color:'#1f2937', display:'flex', alignItems:'center', gap:6 }}>
              {searchQuery.trim() ? '🔍 Search Results' : t('Restaurants Near You','तुमच्या जवळची रेस्टॉरंट')}
              <span style={{ fontSize:11, color:'#16a34a', fontWeight:400 }}>· within {MAX_DELIVERY_KM}km · sorted by distance</span>
            </div>

            {filteredVendors.length===0 && !searchQuery && (
              <div style={{ textAlign:'center', padding:'40px 24px', color:'#9ca3af' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🗺️</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:6 }}>No restaurants within {MAX_DELIVERY_KM}km</div>
                <div style={{ fontSize:12, lineHeight:1.6 }}>Try changing your location or expanding your search area</div>
                <button onClick={() => setShowLocationPicker(true)} style={{ marginTop:14, background:'#E24B4A', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>📍 Change Location</button>
              </div>
            )}

            <div style={{ padding:'0 16px' }}>
              {filteredVendors.map(v => {
                const vMinOrder = Number(v.minOrderAmount ?? 0)
                const dynamicCharge = calcDeliveryCharge(v.distance, v.deliveryCharge)
                return (
                  <div key={v.id} onClick={() => openVendor(v)}
                    style={{ background:'#fff', borderRadius:16, overflow:'hidden', marginBottom:16, cursor:v.isOpen?'pointer':'not-allowed', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', borderWidth:1, borderStyle:'solid', borderColor:v.isOpen?'#f3f4f6':'#fecaca', opacity:v.isOpen?1:0.6 }}>
                    <div style={{ height:140, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
                      {v.photo ? <img src={v.photo} alt={v.storeName} style={{ width:'100%', height:'100%', objectFit:'cover', filter:v.isOpen?'none':'grayscale(70%)' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }}><span style={{ fontSize:40 }}>🍽️</span></div>}
                      {!v.isOpen && (
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <div style={{ background:'rgba(0,0,0,0.8)', borderRadius:20, padding:'8px 20px', display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:16 }}>🔒</span>
                            <div>
                              <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>Store Closed</div>
                              {v.openTime && <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:1 }}>Opens at {v.openTime}</div>}
                            </div>
                          </div>
                        </div>
                      )}
                      <div style={{ position:'absolute', top:10, left:10, background:'#E24B4A', color:'#fff', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:600 }}>{v.category||'Food'}</div>
                      <div style={{ position:'absolute', top:10, right:10, background:v.isOpen?'#16a34a':'#6b7280', color:'#fff', fontSize:10, padding:'3px 8px', borderRadius:20, fontWeight:600 }}>{v.isOpen?'● Open':'● Closed'}</div>
                      {v.distance !== null && (
                        <div style={{ position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.7)', color:'#fff', fontSize:10, padding:'4px 10px', borderRadius:20, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                          <span>📍</span>
                          <span>{v.distance < 1 ? `${Math.round(v.distance*1000)}m` : `${v.distance.toFixed(1)}km`}</span>
                          <span style={{ opacity:0.6 }}>·</span>
                          <span style={{ color:'#fbbf24' }}>₹{dynamicCharge} delivery</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ fontSize:15, fontWeight:700, color:v.isOpen?'#1f2937':'#6b7280' }}>{v.storeName}</div>
                        <div style={{ background:'#f0fdf4', color:'#16a34a', fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:8 }}>⭐ {v.rating||4.5}</div>
                      </div>
                      <div style={{ fontSize:12, color:'#9ca3af', marginTop:3 }}>{v.category}</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:8, alignItems:'center' }}>
                        <span style={{ fontSize:12, color:'#9ca3af' }}>🕐 {v.prepTime||20}-{(v.prepTime||20)+15} min</span>
                        {/* Dynamic delivery charge badge */}
                        <span style={{ fontSize:12, fontWeight:700, background:dynamicCharge===0?'#dcfce7':'#fef3c7', color:dynamicCharge===0?'#16a34a':'#92400e', borderRadius:6, padding:'2px 8px' }}>
                          {dynamicCharge===0 ? '🎉 Free delivery' : `🚚 ₹${dynamicCharge} delivery`}
                        </span>
                        {vMinOrder > 0 && (
                          <span style={{ fontSize:11, fontWeight:700, background:'#dbeafe', color:'#1e40af', borderRadius:6, padding:'2px 7px', display:'inline-flex', alignItems:'center', gap:3 }}>
                            🛒 Min. ₹{vMinOrder}
                          </span>
                        )}
                      </div>
                      {!v.isOpen && (
                        <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, background:'#fee2e2', borderRadius:8, padding:'6px 10px' }}>
                          <span style={{ fontSize:12 }}>🔒</span>
                          <span style={{ fontSize:11, color:'#dc2626', fontWeight:600 }}>Currently closed{v.openTime?` · Opens at ${v.openTime}`:''}</span>
                        </div>
                      )}
                      {v.address && <div style={{ fontSize:11, color:'#9ca3af', marginTop:5 }}>📍 {v.address}</div>}
                    </div>
                  </div>
                )
              })}

              {!searchQuery.trim() && filteredVendors.length > 0 && (
                <div style={{ marginTop:4, marginBottom:24 }}>
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                  <div style={{ background:'linear-gradient(135deg,#f9fafb,#f3f4f6)', borderRadius:16, padding:'18px 20px', borderWidth:1.5, borderStyle:'dashed', borderColor:'#e5e7eb', display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', flexShrink:0 }}>🍽️</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}><div style={{ width:7, height:7, borderRadius:'50%', background:'#f59e0b', animation:'pulse 1.5s infinite' }} /><span style={{ fontSize:10, fontWeight:700, color:'#d97706', letterSpacing:0.5, textTransform:'uppercase' }}>Coming Soon</span></div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#1f2937', lineHeight:1.4 }}>More restaurants joining FeedoZone!</div>
                      <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>New restaurants will be available here soon 🚀</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VENDOR MENU ── */}
        {tab==='vendor-menu' && selectedVendor && (() => {
          const vendorDist = (userLat && userLng && selectedVendor.location?.lat && selectedVendor.location?.lng)
            ? getDistance(userLat, userLng, selectedVendor.location.lat, selectedVendor.location.lng)
            : null
          const dynamicCharge = calcDeliveryCharge(vendorDist, selectedVendor.deliveryCharge)

          return (
            <div style={{ background:'#fff', minHeight:'100%' }}>
              <div style={{ height:160, position:'relative', background:'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
                {selectedVendor.photo ? <img src={selectedVendor.photo} alt={selectedVendor.storeName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:48 }}>🍽️</span></div>}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                <div style={{ position:'absolute', bottom:12, left:14, color:'#fff' }}>
                  <div style={{ fontSize:16, fontWeight:700 }}>{selectedVendor.storeName}</div>
                  <div style={{ fontSize:11, opacity:0.9 }}>{selectedVendor.category} · ⭐ {selectedVendor.rating||4.5}</div>
                </div>
              </div>

              <div style={{ padding:'10px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#6b7280' }}>🕐 {selectedVendor.prepTime||20}-{(selectedVendor.prepTime||20)+15} min</span>
                {/* Dynamic delivery charge */}
                <span style={{ fontSize:12, fontWeight:700, background:'#fef3c7', color:'#92400e', borderRadius:6, padding:'2px 8px' }}>
                  🚚 {dynamicCharge === 0 ? 'Free delivery 🎉' : `₹${dynamicCharge} delivery`}
                </span>
                {vendorDist !== null && (
                  <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>
                    📍 {vendorDist < 1 ? `${Math.round(vendorDist*1000)}m away` : `${vendorDist.toFixed(1)}km away`}
                  </span>
                )}
                {Number(selectedVendor.minOrderAmount) > 0 && (
                  <span style={{ fontSize:11, fontWeight:700, background:'#dbeafe', color:'#1e40af', borderRadius:6, padding:'3px 8px', display:'inline-flex', alignItems:'center', gap:3 }}>
                    🛒 Min. order ₹{selectedVendor.minOrderAmount}
                  </span>
                )}
              </div>

              {!selectedVendor.isOpen && (
                <div style={{ background:'#fee2e2', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', margin:'12px 16px', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🔒</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#991b1b' }}>This restaurant is currently closed</div>
                    <div style={{ fontSize:11, color:'#b91c1c', marginTop:2 }}>{selectedVendor.openTime?`Opens at ${selectedVendor.openTime} · Come back then!`:'You cannot order right now'}</div>
                  </div>
                </div>
              )}

              <div style={{ padding:'8px 0' }}>
                {(() => {
                  const availableItems = menuItems.filter(i => i.available !== false)
                  const cats = ['All', ...Array.from(new Set(availableItems.map(i => i.category).filter(Boolean)))]
                  const filteredItems = menuCatFilter === 'All' ? availableItems : availableItems.filter(i => i.category === menuCatFilter)

                  return (
                    <>
                      {vendorCombos.length > 0 && menuCatFilter === 'All' && (
                        <div style={{ padding:'0 16px', marginBottom:4 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0 10px' }}>
                            <div style={{ background:'linear-gradient(135deg,#1a1a1a,#2d1f00)', borderRadius:8, padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}>
                              <span style={{ fontSize:13 }}>🍱</span>
                              <span style={{ fontSize:11, fontWeight:800, color:'#fbbf24', letterSpacing:0.3 }}>COMBO OFFERS</span>
                            </div>
                            <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
                            <span style={{ fontSize:10, color:'#9ca3af', fontWeight:600 }}>{vendorCombos.length} combo{vendorCombos.length>1?'s':''}</span>
                          </div>
                          {vendorCombos.map(combo => <ComboCard key={combo.id} combo={combo} />)}
                        </div>
                      )}

                      {cats.length > 1 && (
                        <div style={{ overflowX:'auto', paddingBottom:2 }}>
                          <div style={{ display:'flex', gap:8, padding:'8px 16px', width:'max-content' }}>
                            {vendorCombos.length > 0 && (
                              <button onClick={() => setMenuCatFilter('__combos__')} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:menuCatFilter==='__combos__'?700:500, background:menuCatFilter==='__combos__'?'#1a1a1a':'#f3f4f6', color:menuCatFilter==='__combos__'?'#fbbf24':'#6b7280', whiteSpace:'nowrap', transition:'all 0.2s' }}>
                                🍱 Combos <span style={{ opacity:0.7, fontSize:10 }}>({vendorCombos.length})</span>
                              </button>
                            )}
                            {cats.map(cat => {
                              const isActive = menuCatFilter === cat
                              const count = cat==='All' ? availableItems.length : availableItems.filter(i => i.category===cat).length
                              return (
                                <button key={cat} onClick={() => setMenuCatFilter(cat)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:isActive?700:500, background:isActive?'#E24B4A':'#f3f4f6', color:isActive?'#fff':'#6b7280', boxShadow:isActive?'0 4px 12px rgba(226,75,74,0.3)':'none', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                                  {cat} {count > 0 && <span style={{ opacity:isActive?0.8:0.6, fontSize:10 }}>({count})</span>}
                                </button>
                              )
                            })}
                          </div>
                          <div style={{ height:1, background:'#f3f4f6', marginTop:4 }} />
                        </div>
                      )}

                      {menuCatFilter === '__combos__' && (
                        <div style={{ padding:'0 16px' }}>
                          <div style={{ padding:'14px 0 10px', fontSize:13, fontWeight:700, color:'#1f2937' }}>🍱 All Combo Offers</div>
                          {vendorCombos.map(combo => <ComboCard key={combo.id} combo={combo} />)}
                        </div>
                      )}

                      {menuCatFilter !== '__combos__' && (
                        <div style={{ padding:'0 16px' }}>
                          {filteredItems.length === 0 && <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>{menuItems.length === 0 ? 'No menu items yet' : `No items in ${menuCatFilter}`}</div>}
                          {menuCatFilter === 'All' && cats.length > 2 ? (
                            cats.filter(c => c !== 'All').map(cat => {
                              const catItems = availableItems.filter(i => i.category === cat)
                              if (catItems.length === 0) return null
                              return (
                                <div key={cat}>
                                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'16px 0 8px' }}>
                                    <div style={{ fontSize:13, fontWeight:800, color:'#1f2937', letterSpacing:0.2 }}>{cat}</div>
                                    <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
                                    <span style={{ fontSize:10, color:'#9ca3af', fontWeight:500 }}>{catItems.length} item{catItems.length>1?'s':''}</span>
                                  </div>
                                  {catItems.map(item => <MenuItemCard key={item.id} item={item} />)}
                                </div>
                              )
                            })
                          ) : (
                            filteredItems.map(item => <MenuItemCard key={item.id} item={item} />)
                          )}
                        </div>
                      )}
                    </>
                  )

                  function MenuItemCard({ item }) {
                    const inCart = cart.find(c => c.id === item.id)
                    const vendorClosed = !selectedVendor.isOpen
                    return (
                      <div style={{ display:'flex', gap:12, padding:'14px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f7f7f7', alignItems:'flex-start' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                            <VegDot isVeg={item.isVeg !== false} />
                            <span style={{ fontSize:13, fontWeight:600, color:vendorClosed?'#9ca3af':'#1f2937' }}>{item.name}</span>
                          </div>
                          {item.description && <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4, lineHeight:1.5 }}>{item.description}</div>}
                          <div style={{ fontSize:14, fontWeight:700, color:vendorClosed?'#9ca3af':'#E24B4A' }}>₹{item.price}</div>
                        </div>
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <div style={{ width:90, height:90, borderRadius:12, overflow:'hidden', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', filter:vendorClosed?'grayscale(60%)':'none' }}>
                            {item.photo ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:28 }}>🍛</span>}
                          </div>
                          <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)' }}>
                            {vendorClosed ? (
                              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#f3f4f6', borderWidth:1, borderStyle:'solid', borderColor:'#d1d5db', borderRadius:20, padding:'5px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', cursor:'not-allowed' }}>
                                <span style={{ fontSize:10 }}>🔒</span><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af' }}>Closed</span>
                              </div>
                            ) : inCart ? (
                              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', borderRadius:20, padding:'4px 10px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                                <button onClick={() => updateQty(item.id,-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16, fontWeight:700, padding:0, lineHeight:1 }}>−</button>
                                <span style={{ fontSize:12, fontWeight:700, color:'#E24B4A', minWidth:14, textAlign:'center' }}>{inCart.qty}</span>
                                <button onClick={() => addToCart(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16, fontWeight:700, padding:0, lineHeight:1 }}>+</button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(item)} style={{ background:'#fff', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:'5px 18px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>ADD</button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                })()}
              </div>

              {/* ── VENDOR INFO ── */}
              <div style={{ margin:'20px 0 100px', background:'#fff' }}>
                <div style={{ padding:'0 16px 12px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', letterSpacing:0.2 }}>Restaurant Info</div>
                </div>
                <div style={{ display:'flex', padding:'14px 16px', gap:12, borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', flexWrap:'wrap' }}>
                  {[
                    { val:`⭐ ${selectedVendor.rating||4.5}`, sub:'Rating' },
                    { val:`${selectedVendor.prepTime||20}–${(selectedVendor.prepTime||20)+15}`, sub:'Min delivery' },
                    { val:dynamicCharge===0?'FREE':('₹'+dynamicCharge), sub:'Delivery fee', color:dynamicCharge===0?'#16a34a':'#1f2937' },
                    { val:selectedVendor.isOpen?'Open':'Closed', sub:'Status', color:selectedVendor.isOpen?'#16a34a':'#dc2626' },
                  ].map(s => (
                    <div key={s.sub} style={{ flex:1, minWidth:70, textAlign:'center', padding:'10px 8px', background:'#f9fafb', borderRadius:10 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:s.color||'#1f2937' }}>{s.val}</div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{s.sub}</div>
                    </div>
                  ))}
                  {vendorDist !== null && (
                    <div style={{ flex:1, minWidth:70, textAlign:'center', padding:'10px 8px', background:'#f0fdf4', borderRadius:10 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#16a34a' }}>{vendorDist < 1 ? `${Math.round(vendorDist*1000)}m` : `${vendorDist.toFixed(1)}km`}</div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>Distance</div>
                    </div>
                  )}
                  {Number(selectedVendor.minOrderAmount) > 0 && (
                    <div style={{ flex:1, minWidth:70, textAlign:'center', padding:'10px 8px', background:'#eff6ff', borderRadius:10, borderWidth:1, borderStyle:'solid', borderColor:'#bfdbfe' }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1e40af' }}>₹{selectedVendor.minOrderAmount}</div>
                      <div style={{ fontSize:10, color:'#3b82f6', marginTop:3 }}>Min. order</div>
                    </div>
                  )}
                </div>

                {selectedVendor.address && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'flex-start' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>📍</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>ADDRESS</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500, lineHeight:1.4 }}>{selectedVendor.address}</div></div>
                  </div>
                )}

                {selectedVendor.openTime && selectedVendor.closeTime && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🕐</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>OPENING HOURS</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>{selectedVendor.openTime} – {selectedVendor.closeTime}</div></div>
                    <div style={{ background:selectedVendor.isOpen?'#dcfce7':'#fee2e2', borderRadius:20, padding:'4px 10px' }}><span style={{ fontSize:11, fontWeight:600, color:selectedVendor.isOpen?'#16a34a':'#dc2626' }}>{selectedVendor.isOpen?'Open Now':'Closed'}</span></div>
                  </div>
                )}

                {selectedVendor.gstNo && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🏛️</span></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>GST NUMBER</div>
                      <div style={{ fontSize:13, color:'#1f2937', fontWeight:600, letterSpacing:0.5 }}>{selectedVendor.gstNo}</div>
                    </div>
                    <div style={{ background:'#fef9c3', borderRadius:20, padding:'4px 10px', borderWidth:1, borderStyle:'solid', borderColor:'#fde047' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#854d0e' }}>GST Registered</span>
                    </div>
                  </div>
                )}

                {selectedVendor.upiId && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>💳</span></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>UPI ID</div>
                      <div style={{ fontSize:13, color:'#1f2937', fontWeight:600 }}>{selectedVendor.upiId}</div>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(selectedVendor.upiId).then(() => toast.success('UPI ID copied!')).catch(() => {}) }}
                      style={{ background:'#dcfce7', border:'none', borderRadius:20, padding:'6px 12px', fontSize:11, fontWeight:600, color:'#16a34a', cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:4 }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}

                {selectedVendor.fssai && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🏛️</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>FSSAI LICENCE</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>{selectedVendor.fssai}</div></div>
                    <div style={{ background:'#dcfce7', borderRadius:20, padding:'4px 10px' }}><span style={{ fontSize:11, fontWeight:600, color:'#16a34a' }}>✓ Verified</span></div>
                  </div>
                )}

                {selectedVendor.phone && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>📞</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>CONTACT</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>+91 {selectedVendor.phone}</div></div>
                    <button onClick={() => callVendor(selectedVendor.phone)} style={{ background:'#E24B4A', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:5 }}>📞 Call</button>
                  </div>
                )}
              </div>

              {/* REVIEWS */}
              <div style={{ background:'#fff', borderTopWidth:8, borderTopStyle:'solid', borderTopColor:'#f7f7f7', marginTop:8 }}>
                <div style={{ padding:'16px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>Ratings & Reviews</div>
                    {reviews.length > 0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                        <span style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>{(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)}</span>
                        <div style={{ display:'flex', gap:1 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:13, color:s<=Math.round(reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length)?'#f59e0b':'#e5e7eb' }}>★</span>)}</div>
                        <span style={{ fontSize:12, color:'#9ca3af' }}>({reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setReviewVendor(selectedVendor); setShowReview(true) }} style={{ background:'transparent', color:'#E24B4A', borderWidth:1.5, borderStyle:'solid', borderColor:'#E24B4A', borderRadius:20, padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>✍️ Rate Us</button>
                </div>
                {reviews.length === 0 && <div style={{ textAlign:'center', padding:'24px 16px 32px' }}><div style={{ fontSize:36, marginBottom:8 }}>⭐</div><div style={{ fontSize:13, color:'#9ca3af' }}>No reviews yet</div><div style={{ fontSize:12, color:'#d1d5db', marginTop:4 }}>Be the first to review!</div></div>}
                {reviews.map(r => (
                  <div key={r.id} style={{ padding:'14px 16px', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#f7f7f7' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{r.userName?.[0]?.toUpperCase()||'U'}</span></div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{r.userName}</div>
                          <div style={{ fontSize:10, color:'#9ca3af' }}>{r.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})||''}</div>
                        </div>
                        <div style={{ display:'flex', gap:2, marginTop:3 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:13, color:s<=r.rating?'#f59e0b':'#e5e7eb' }}>★</span>)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, paddingLeft:46 }}>{r.text}</div>
                  </div>
                ))}
                <div style={{ height:100 }} />
              </div>
            </div>
          )
        })()}

        {/* ── CART ── */}
        {tab==='cart' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>{t('Your Cart','तुमची कार्ट')} {cartVendor && `· ${cartVendor.storeName}`}</div>

            {/* Distance-based delivery info in cart */}
            {cartVendor && cartVendor.distanceKm !== null && cartVendor.distanceKm !== undefined && (
              <div style={{ background:'#fef3c7', borderRadius:10, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:10, borderWidth:1, borderStyle:'solid', borderColor:'#fde68a' }}>
                <span style={{ fontSize:16 }}>🚚</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>Distance-based delivery charge</div>
                  <div style={{ fontSize:11, color:'#a16207' }}>
                    {cartVendor.distanceKm.toFixed(1)}km away · ₹{deliveryFee} delivery charge
                  </div>
                </div>
              </div>
            )}

            {cart.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>Cart is empty. Browse vendors!</div>}

            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>₹{item.price} each</div>
                  {item.isCombo && item.comboItems && (
                    <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{item.comboItems.map(ci => `${ci.qty > 1 ? ci.qty+'× ' : ''}${ci.name}`).join(' · ')}</div>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => updateQty(item.id,-1)} style={{ width:28, height:28, borderRadius:'50%', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', background:'transparent', color:'#E24B4A', cursor:'pointer', fontSize:16 }}>-</button>
                  <span style={{ fontSize:13, fontWeight:600, minWidth:16, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id,1)} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'#E24B4A', color:'#fff', cursor:'pointer', fontSize:16 }}>+</button>
                </div>
                <div style={{ fontSize:13, fontWeight:600, minWidth:48, textAlign:'right' }}>₹{item.price*item.qty}</div>
              </div>
            ))}

            {cart.length > 0 && !showCheckout && (
              <>
                {minOrder > 0 && (
                  <div style={{ margin:'14px 0 10px', background: meetsMinOrder ? '#f0fdf4' : '#eff6ff', borderRadius:12, padding:'12px 14px', borderWidth:1, borderStyle:'solid', borderColor: meetsMinOrder ? '#86efac' : '#bfdbfe' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:14 }}>{meetsMinOrder ? '✅' : '🛒'}</span>
                        <span style={{ fontSize:12, fontWeight:700, color: meetsMinOrder ? '#16a34a' : '#1e40af' }}>
                          {meetsMinOrder ? 'Minimum order met!' : `Add ₹${minOrderShortfall} more to checkout`}
                        </span>
                      </div>
                      <span style={{ fontSize:11, color:'#6b7280', fontWeight:600 }}>₹{cartTotal} / ₹{minOrder}</span>
                    </div>
                    <div style={{ height:6, background: meetsMinOrder ? '#bbf7d0' : '#dbeafe', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(100, Math.round(cartTotal / minOrder * 100))}%`, background: meetsMinOrder ? '#16a34a' : '#3b82f6', borderRadius:99, transition:'width 0.4s ease' }} />
                    </div>
                    {!meetsMinOrder && <div style={{ fontSize:11, color:'#6b7280', marginTop:6 }}>This restaurant requires a minimum order of <strong>₹{minOrder}</strong></div>}
                  </div>
                )}

                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, margin:'12px 0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:12, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:12 }}>₹{cartTotal}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee {cartVendor?.distanceKm ? `(${cartVendor.distanceKm.toFixed(1)}km)` : ''}</span>
                    <span style={{ fontSize:12 }}>{deliveryFee===0?'Free 🎉':('₹'+deliveryFee)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb', paddingTop:8 }}><span style={{ fontSize:14, fontWeight:600 }}>Total</span><span style={{ fontSize:14, fontWeight:600 }}>₹{cartTotal+deliveryFee}</span></div>
                </div>

                <button
                  onClick={() => {
                    if (!meetsMinOrder) { toast.error(`Add ₹${minOrderShortfall} more to meet the ₹${minOrder} minimum order`, { icon: '🛒', duration: 3000 }); return }
                    setShowCheckout(true)
                  }}
                  style={{ width:'100%', background: meetsMinOrder ? '#E24B4A' : '#9ca3af', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor: meetsMinOrder ? 'pointer' : 'not-allowed', fontFamily:'Poppins', opacity: meetsMinOrder ? 1 : 0.75 }}
                >
                  {meetsMinOrder ? `Proceed to Checkout · ₹${cartTotal+deliveryFee}` : `Add ₹${minOrderShortfall} more to checkout`}
                </button>
              </>
            )}

            {cart.length > 0 && showCheckout && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:14, color:'#1f2937' }}>🚚 Delivery Details</div>
                <div style={{ marginBottom:10 }}><label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Your Name *</label><input style={inp} placeholder="Full name" value={deliveryName} onChange={e => setDeliveryName(e.target.value)} /></div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Phone Number *</label>
                  <div style={{ position:'relative', marginTop:6 }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#6b7280', pointerEvents:'none' }}>+91</span>
                    <input style={{ ...inp, marginTop:0, paddingLeft:44 }} placeholder="Mobile number" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
                  </div>
                </div>
                <div style={{ marginBottom:10 }}><label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Hostel / Building</label><input style={inp} placeholder="e.g. Hostel B, Men's Hostel..." value={deliveryHostel} onChange={e => setDeliveryHostel(e.target.value)} /></div>
                <div style={{ marginBottom:10 }}><label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Room / Address *</label><input style={inp} placeholder="e.g. Room 204..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} /></div>
                <div style={{ marginBottom:10 }}><label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Order Note (optional)</label><textarea style={{ ...inp, minHeight:60, resize:'none', lineHeight:1.5 }} placeholder="e.g. Less spicy, extra roti..." value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} /></div>
                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}><span style={{ fontSize:12, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:12 }}>₹{cartTotal}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee {cartVendor?.distanceKm ? `(${cartVendor.distanceKm.toFixed(1)}km)` : ''}</span>
                    <span style={{ fontSize:12 }}>{deliveryFee===0?'Free 🎉':('₹'+deliveryFee)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb', paddingTop:8 }}><span style={{ fontSize:14, fontWeight:700 }}>Total</span><span style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>₹{cartTotal+deliveryFee}</span></div>
                </div>
                <div style={{ background:'#fef3c7', borderRadius:9, padding:'10px 12px', fontSize:12, color:'#78350f', marginBottom:12 }}>💵 Payment: <strong>Cash on Delivery (COD)</strong></div>
                <button onClick={handlePlaceOrder} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:8 }}>🎉 Place Order · ₹{cartTotal+deliveryFee}</button>
                <button onClick={() => setShowCheckout(false)} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:11, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>← Back to Cart</button>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS LIST ── */}
        {tab==='orders' && !selectedOrder && (
          <div style={{ background:'#f7f7f7', minHeight:'100%' }}>
            <div style={{ padding:'16px 16px 8px', fontSize:15, fontWeight:700, color:'#1f2937' }}>{t('My Orders','माझे ऑर्डर')}</div>
            {orders.length===0 && <div style={{ textAlign:'center', padding:'60px 20px', color:'#9ca3af' }}><div style={{ fontSize:48, marginBottom:12 }}>🛍️</div><div style={{ fontSize:14, fontWeight:600 }}>No orders yet!</div><div style={{ fontSize:12, marginTop:4 }}>Order something delicious 🍽️</div></div>}
            <div style={{ padding:'0 16px 80px' }}>
              {orders.map(o => {
                const isActive = !['delivered','cancelled'].includes(o.status)
                return (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ background:'#fff', borderRadius:14, padding:14, marginBottom:10, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', borderWidth:1, borderStyle:'solid', borderColor:isActive?'#fecaca':'#f3f4f6' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>{o.vendorName}</div>
                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{o.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})||''}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20, background:o.status==='delivered'?'#d1fae5':o.status==='cancelled'?'#fee2e2':o.status==='out_for_delivery'?'#dbeafe':o.status==='preparing'?'#fef3c7':'#fff7ed', color:o.status==='delivered'?'#065f46':o.status==='cancelled'?'#991b1b':o.status==='out_for_delivery'?'#1e40af':o.status==='preparing'?'#92400e':'#c2410c' }}>
                        {o.status==='out_for_delivery'?'🛵 Out for Delivery':o.status?.replace('_',' ').replace(/\w/g,c=>c.toUpperCase())}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>{o.items?.slice(0,2).map(i=>i.qty+'x '+i.name).join(', ')}{o.items?.length>2?` +${o.items.length-2} more`:''}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#E24B4A' }}>₹{o.total}</span>
                      {isActive
                        ? <span style={{ fontSize:11, color:'#E24B4A', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                            {o.status === 'out_for_delivery' && <span style={{ width:6, height:6, borderRadius:'50%', background:'#E24B4A', display:'inline-block', animation:'livePulse 1s infinite' }} />}
                            {o.status === 'out_for_delivery' ? 'Live Track →' : 'Track Order →'}
                          </span>
                        : <span style={{ fontSize:11, color:'#9ca3af' }}>Tap for details →</span>
                      }
                    </div>
                    <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

                    <div style={{ display:'flex', gap:8, marginTop:8 }}>
                      <div
                        onClick={e => { e.stopPropagation(); setBillOrder(o); setShowBill(true) }}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:'#f9fafb', borderRadius:8, padding:'6px 0', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', cursor:'pointer' }}
                      >
                        <span style={{ fontSize:13 }}>🧾</span>
                        <span style={{ fontSize:11, fontWeight:600, color:'#374151' }}>View Bill</span>
                      </div>
                      {o.status === 'delivered' && (
                        <div onClick={e => { e.stopPropagation(); const v=vendors.find(x=>x.id===o.vendorUid); if(v){setReviewVendor(v);setReviewRating(5);setShowReview(true)} }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:'linear-gradient(90deg,#fff7ed,#fef3c7)', borderRadius:8, padding:'6px 0', borderWidth:1, borderStyle:'solid', borderColor:'#fde68a', cursor:'pointer' }}>
                          <span style={{ fontSize:13 }}>⭐</span><span style={{ fontSize:11, fontWeight:600, color:'#92400e' }}>Rate Now</span>
                        </div>
                      )}
                      <CancelOrderButton order={o} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ORDER TRACKING ── */}
        {tab==='orders' && selectedOrder && (
          <LiveOrderTracking
            order={selectedOrder}
            userLat={userLat}
            userLng={userLng}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {/* ── PROFILE ── */}
        {tab==='profile' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', borderRadius:16, padding:'24px 20px', marginBottom:16, textAlign:'center', color:'#fff' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, margin:'0 auto 10px', borderWidth:3, borderStyle:'solid', borderColor:'rgba(255,255,255,0.4)' }}>
                {userData?.name ? userData.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '👤'}
              </div>
              <div style={{ fontSize:18, fontWeight:700 }}>{userData?.name||'FeedoZone User'}</div>
              <div style={{ fontSize:12, opacity:0.85, marginTop:3 }}>{user?.email}</div>
              {locationName && (
                <div style={{ fontSize:11, opacity:0.8, marginTop:4 }}>📍 {locationName}</div>
              )}
            </div>
            <div style={{ background:'#fafafa', borderRadius:12, padding:'4px 16px', marginBottom:16 }}>
              {[{icon:'👤',label:'Full Name',value:userData?.name},{icon:'📧',label:'Email',value:userData?.email||user?.email},{icon:'📱',label:'Mobile',value:userData?.mobile?`+91 ${userData.mobile}`:null},{icon:'🏠',label:'Address',value:userData?.address},{icon:'📍',label:'Delivery Location',value:locationName},{icon:'📅',label:'Member Since',value:userData?.createdAt?new Date(userData.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):null}].map(row=>(
                <div key={row.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{row.icon}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:10, color:'#9ca3af', marginBottom:1 }}>{row.label}</div><div style={{ fontSize:13, color:row.value?'#1f2937':'#d1d5db', fontWeight:row.value?500:400 }}>{row.value||'Not added'}</div></div>
                </div>
              ))}
            </div>

            {/* Location & Map section */}
            <div style={{ background:'#fff5f5', borderRadius:12, padding:'12px 14px', marginBottom:10, borderWidth:1, borderStyle:'solid', borderColor:'#fecaca' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#991b1b', marginBottom:8 }}>📍 Delivery Location</div>
              <div style={{ fontSize:12, color:'#374151', marginBottom:10 }}>{locationName || 'Not set'}</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setShowLocationPicker(true)} style={{ flex:1, background:'#E24B4A', color:'#fff', border:'none', padding:'9px 0', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>📍 Change Location</button>
                <button onClick={() => setShowMap(true)} style={{ flex:1, background:'#fff', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', padding:'9px 0', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>🗺️ View Map</button>
              </div>
            </div>

            <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#374151' }}>🌐 Language</span>
              <button onClick={() => setLang(l=>l==='en'?'mr':'en')} style={{ background:'#FCEBEB', color:'#A32D2D', border:'none', padding:'5px 12px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>{lang==='en'?'Switch to Marathi':'English वर जा'}</button>
            </div>
            <button onClick={() => { localStorage.removeItem('feedo_location'); logoutUser() }} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500, marginBottom:16 }}>Logout</button>
            <div style={{ marginBottom:4, fontSize:11, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Help & Legal</div>
            <div style={{ background:'#fafafa', borderRadius:12, overflow:'hidden', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6', marginBottom:80 }}>
              {[
                {icon:'💬',label:'Contact Support',sub:'Report issue or ask a question',action:()=>{setShowSupport(true);setSupportSent(false)}},
                {icon:'📜',label:'Terms & Conditions',sub:'Our terms of service',action:()=>setShowTerms(true)},
                {icon:'🔒',label:'Privacy Policy',sub:'How we handle your data',action:()=>setShowPrivacy(true)}
              ].map((item,i,arr)=>(
                <button key={item.label} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'transparent', border:'none', borderBottomWidth:i<arr.length-1?1:0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.icon}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{item.label}</div><div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{item.sub}</div></div>
                  <span style={{ fontSize:14, color:'#d1d5db' }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── REVIEW MODAL ── */}
      {showReview && reviewVendor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:998, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget)setShowReview(false)}}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}><div style={{ width:40, height:4, borderRadius:2, background:'#e5e7eb' }} /></div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1f2937', marginBottom:4 }}>Rate your experience</div>
            <div style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>{reviewVendor.storeName}</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:18 }}>
              {[1,2,3,4,5].map(s=><button key={s} onClick={()=>setReviewRating(s)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:36, color:s<=reviewRating?'#f59e0b':'#e5e7eb', transition:'all 0.15s', transform:s<=reviewRating?'scale(1.15)':'scale(1)' }}>★</button>)}
            </div>
            <div style={{ textAlign:'center', fontSize:13, fontWeight:600, color:'#E24B4A', marginBottom:14 }}>{['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'][reviewRating]}</div>
            <textarea placeholder="Share your experience..." value={reviewText} onChange={e=>setReviewText(e.target.value)} rows={3} style={{ width:'100%', padding:'12px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:14, lineHeight:1.5 }} />
            <button onClick={handleSubmitReview} disabled={submittingReview} style={{ width:'100%', background:submittingReview?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>{submittingReview?'Submitting...':'⭐ Submit Review'}</button>
          </div>
        </div>
      )}

      {/* ── ORDER SUCCESS ── */}
      {orderSuccess && (
        <div style={{ position:'fixed', inset:0, background:'#fff', zIndex:999, overflowY:'auto', fontFamily:'Poppins,sans-serif', maxWidth:430, margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg, #16a34a, #15803d)', padding:'48px 24px 32px', textAlign:'center', color:'#fff' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 16px', border:'3px solid rgba(255,255,255,0.4)' }}>✅</div>
            <div style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Order Placed!</div>
            <div style={{ fontSize:13, opacity:0.9 }}>Your food is being prepared</div>
            <div style={{ marginTop:12, background:'rgba(255,255,255,0.2)', borderRadius:20, display:'inline-block', padding:'6px 18px' }}><span style={{ fontSize:12, fontWeight:600 }}>Order #{orderSuccess.orderId}</span></div>
          </div>
          <div style={{ padding:20 }}>
            {orderSuccess.vendorPhone && (
              <div style={{ background:'#fafafa', borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>notifyVendorWhatsApp(orderSuccess.vendorPhone,{userName:orderSuccess.userName,userPhone:orderSuccess.userPhone||'',address:orderSuccess.address,items:orderSuccess.items,subtotal:orderSuccess.subtotal,deliveryFee:orderSuccess.deliveryFee,total:orderSuccess.total})} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', background:'#25D366', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Poppins' }}><span style={{ fontSize:18 }}>💬</span><span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>WhatsApp</span></button>
                  <button onClick={()=>callVendor(orderSuccess.vendorPhone)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', background:'#E24B4A', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Poppins' }}><span style={{ fontSize:18 }}>📞</span><span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Call</span></button>
                </div>
              </div>
            )}
            <button
              onClick={() => { setBillOrder(orderSuccess); setShowBill(true) }}
              style={{ width:'100%', background:'#1f2937', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            >
              🧾 View Digital Bill
            </button>
            <button onClick={()=>{const latestOrder=orders[0];setOrderSuccess(null);setTab('orders');if(latestOrder)setTimeout(()=>setSelectedOrder(latestOrder),100)}} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:10 }}>📋 Track My Order</button>
            <button onClick={()=>{setOrderSuccess(null);setTab('home')}} style={{ width:'100%', background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>🏠 Back to Home</button>
          </div>
        </div>
      )}

      {/* ── SUPPORT MODAL ── */}
      {showSupport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget)setShowSupport(false)}}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
              <div><div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>💬 Contact Support</div><div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>We typically reply within 24 hours</div></div>
              <button onClick={()=>setShowSupport(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:20 }}>
              {!supportSent ? (
                <>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:12, color:'#6b7280', fontWeight:500, marginBottom:6 }}>Category</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {['General','Order Issue','Payment','App Bug','Feedback','Other'].map(cat=>(
                        <button key={cat} onClick={()=>setSupportCategory(cat)} style={{ padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:11, fontWeight:600, background:supportCategory===cat?'#E24B4A':'#f3f4f6', color:supportCategory===cat?'#fff':'#6b7280' }}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={supportMsg} onChange={e=>setSupportMsg(e.target.value)} placeholder="Tell us what's wrong..." rows={5} style={{ width:'100%', padding:'12px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6, marginBottom:14 }} />
                  <button onClick={handleSendSupport} disabled={sendingSupport} style={{ width:'100%', background:sendingSupport?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>{sendingSupport?'Sending...':'📩 Send Support Request'}</button>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#1f2937', marginBottom:6 }}>Request Sent!</div>
                  <button onClick={()=>setSupportSent(false)} style={{ background:'#f3f4f6', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', color:'#374151' }}>Send Another</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TERMS ── */}
      {showTerms && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget)setShowTerms(false)}}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'88vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
              <div><div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>📜 Terms & Conditions</div><div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Please read carefully</div></div>
              <button onClick={()=>setShowTerms(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 48px' }}>
              {[
                { title:'1. Acceptance of Terms', body:'By using FeedoZone, you agree to be bound by these terms and conditions. If you do not agree, please do not use the platform.' },
                { title:'2. Eligibility', body:'You must be 18 years or older, or have parental / guardian consent to use FeedoZone.' },
                { title:'3. Location Requirement', body:'FeedoZone requires location access to show nearby restaurants and calculate delivery charges. Restaurants beyond 4km are not available for delivery.' },
                { title:'4. Orders & Payments', body:'All orders placed are subject to restaurant availability and acceptance. Payment is currently Cash on Delivery (COD) only.' },
                { title:'5. Delivery Charges', body:'Delivery charges are distance-based: ₹10 up to 1km, ₹20 up to 2km, ₹30 up to 3km, ₹40 up to 4km.' },
                { title:'6. Cancellation Policy', body:'Users may cancel orders within 5 minutes of placing them. Cancellations after 5 minutes are not permitted through the app.' },
                { title:'7. User Responsibilities', body:'You are responsible for providing accurate delivery details, including address and contact number.' },
                { title:'8. Prohibited Conduct', body:'Users must not misuse the platform, place fraudulent orders, or abuse vendors or delivery personnel.' },
                { title:'9. Intellectual Property', body:'All content, logos, and branding on FeedoZone are the property of FeedoZone.' },
                { title:'10. Changes to Terms', body:'FeedoZone reserves the right to update these terms at any time without prior notice.' },
              ].map((section, i) => (
                <div key={i} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:5 }}>{section.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.8 }}>{section.body}</div>
                </div>
              ))}
              <div style={{ marginTop:10, padding:'12px 14px', background:'#f9fafb', borderRadius:10, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
                <div style={{ fontSize:11, color:'#9ca3af', lineHeight:1.6 }}>Last updated: June 2025 · FeedoZone, Warananagar, Kolhapur, Maharashtra, India</div>
              </div>
              <button onClick={()=>setShowTerms(false)} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:13, borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginTop:16 }}>I Understand ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY ── */}
      {showPrivacy && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget)setShowPrivacy(false)}}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'88vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
              <div><div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>🔒 Privacy Policy</div><div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>How we handle your data</div></div>
              <button onClick={()=>setShowPrivacy(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 48px' }}>
              {[
                { title:'1. Information We Collect', body:'We collect your name, email address, phone number, delivery address, and GPS location when you register or place an order.' },
                { title:'2. Location Data', body:'Location access is required to use FeedoZone. It is used to show nearby restaurants within 4km and calculate delivery charges. Location is not tracked continuously or in the background.' },
                { title:'3. How We Use Your Data', body:'Your data is used solely to process orders, facilitate food delivery, improve your experience on FeedoZone, and send you relevant notifications.' },
                { title:'4. Data Storage & Security', body:'Your data is securely stored using Google Firebase. We follow industry-standard encryption and security practices.' },
                { title:'5. Push Notifications', body:'With your permission, we send push notifications for order status updates. You can disable notifications at any time.' },
                { title:'6. Sharing of Information', body:'We may share your order details with the restaurant vendor solely to fulfill your order.' },
                { title:'7. Data Retention', body:'We retain your account data for as long as your account is active. You may request deletion at any time via Support.' },
                { title:'8. Your Rights', body:'You have the right to access, correct, or delete your personal data. Contact us through the Support section.' },
                { title:'9. Changes to This Policy', body:'We may update this Privacy Policy from time to time. Continued use constitutes acceptance of the revised policy.' },
              ].map((section, i) => (
                <div key={i} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:5 }}>{section.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.8 }}>{section.body}</div>
                </div>
              ))}
              <div style={{ marginTop:10, padding:'12px 14px', background:'#f0fdf4', borderRadius:10, borderWidth:1, borderStyle:'solid', borderColor:'#bbf7d0', display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>🔐</span>
                <div style={{ fontSize:11, color:'#166534', lineHeight:1.6 }}>Your privacy matters to us. FeedoZone will never sell your data.</div>
              </div>
              <button onClick={()=>setShowPrivacy(false)} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:13, borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginTop:16 }}>Got It ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart bar */}
      {cart.length > 0 && (tab==='home' || tab==='vendor-menu') && (
        <div onClick={() => setTab('cart')} style={{ background:'#E24B4A', color:'#fff', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', flexShrink:0 }}>
          <span style={{ fontSize:13 }}>{cartCount} item{cartCount>1?'s':''} · ₹{cartTotal}</span>
          <strong style={{ fontSize:14 }}>View Cart →</strong>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={S.bottomNav}>
        {[
          {id:'home', icon:'🏠', label:t('Home','मुख्यपृष्ठ')},
          {id:'orders', icon:'📋', label:t('Orders','ऑर्डर')},
          {id:'cart', icon:'🛒', label:`${t('Cart','कार्ट')}${cartCount>0?` (${cartCount})`:''}`},
          {id:'profile', icon:'👤', label:t('Profile','प्रोफाइल')}
        ].map(item=>(
          <button key={item.id} style={S.bnItem()} onClick={() => setTab(item.id)}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:10, color:tab===item.id?'#E24B4A':'#6b7280', fontWeight:tab===item.id?600:400 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* UserBill Modal */}
      {showBill && billOrder && (
        <UserBill
          order={billOrder}
          onClose={() => { setShowBill(false); setBillOrder(null) }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && orderToCancel && (
        <CancelConfirmModal
          order={orderToCancel}
          onConfirm={handleCancelOrder}
          onClose={() => { setShowCancelConfirm(false); setOrderToCancel(null) }}
          loading={cancellingOrder}
        />
      )}

      {/* Map Modal */}
      {showMap && userLat && userLng && (
        <MapModal
          userLat={userLat}
          userLng={userLng}
          vendors={vendors}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  )
}