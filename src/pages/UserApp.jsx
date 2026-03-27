import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getAllVendors, getMenuItems, placeOrder, getUserOrders,
  getUserLocation, getDistance, saveUserLocation,
  listenNotifications, markNotificationRead, callVendor, notifyVendorWhatsApp
} from '../firebase/services'
import { db } from '../firebase/config'
import { useNotifications } from '../hooks/useNotifications'
import toast from 'react-hot-toast'

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

export default function UserApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState(() => localStorage.getItem('feedo_tab') || 'home')
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [menuItems, setMenuItems] = useState([])
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

  // Support & Legal states
  const [showSupport, setShowSupport] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [supportMsg, setSupportMsg] = useState('')
  const [supportCategory, setSupportCategory] = useState('General')
  const [sendingSupport, setSendingSupport] = useState(false)
  const [supportSent, setSupportSent] = useState(false)
  const [myTickets, setMyTickets] = useState([])

  // Feedback modal states
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Coupon states
  const [couponInput, setCouponInput] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Vendor menu category filter
  const [menuCatFilter, setMenuCatFilter] = useState('All')

  // Location states
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [locationName, setLocationName] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [searchingLocation, setSearchingLocation] = useState(false)

  // Checkout fields
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryHostel, setDeliveryHostel] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const t = (en, mr) => lang === 'mr' ? mr : en

  // Setup FCM notifications
  useNotifications(user?.uid, 'user')

  // ── ANDROID BACK BUTTON HANDLER ──────────────────────────────────────────
  useEffect(() => {
    window.history.pushState({ tab }, '', window.location.href)

    const handlePopState = (e) => {
      if (tab === 'vendor-menu') {
        setTab('home')
        setSearchQuery('')
      } else if (selectedOrder) {
        setSelectedOrder(null)
      } else if (tab === 'cart') {
        setTab('home')
      } else if (showCheckout) {
        setShowCheckout(false)
      } else if (showVendorInfo) {
        setShowVendorInfo(false)
      } else if (showLocationPicker) {
        setShowLocationPicker(false)
      } else if (orderSuccess) {
        setOrderSuccess(null)
        setTab('orders')
      } else if (tab !== 'home') {
        setTab('home')
      } else {
        window.history.pushState({ tab: 'home' }, '', window.location.href)
        return
      }
      window.history.pushState({ tab }, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [tab, showCheckout, showVendorInfo, showLocationPicker, orderSuccess])

  useEffect(() => {
    if (tab !== 'vendor-menu') localStorage.setItem('feedo_tab', tab)
  }, [tab])

  useEffect(() => { return getAllVendors(setVendors) }, [])
  useEffect(() => { if (!user) return; return getUserOrders(user.uid, setOrders) }, [user])
  useEffect(() => { if (!selectedVendor) return; return getMenuItems(selectedVendor.id, setMenuItems) }, [selectedVendor])

  useEffect(() => {
    if (!user) return
    return listenNotifications(user.uid, (notifs) => {
      setNotifications(notifs)
      notifs.forEach(n => {
        toast(n.body, { icon: '🔔', duration: 4000 })
        markNotificationRead(n.id)
      })
    })
  }, [user])

  useEffect(() => {
    if (userData) {
      setDeliveryName(userData.name || '')
      setDeliveryPhone(userData.mobile || '')
      setDeliveryAddress(userData.address || '')
    }
  }, [userData])

  // ── REVERSE GEOCODE ───────────────────────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Your Location'
    } catch { return 'Your Location' }
  }

  const handleGetLocation = async () => {
    setLocationLoading(true)
    try {
      const { lat, lng } = await getUserLocation()
      setUserLat(lat)
      setUserLng(lng)
      const name = await reverseGeocode(lat, lng)
      setLocationName(name)
      await saveUserLocation(user.uid, lat, lng)
      toast.success(`📍 ${name}`)
      setShowLocationPicker(false)
    } catch (err) {
      toast.error('Could not get location. Enable GPS.')
    }
    setLocationLoading(false)
  }

  const handleLocationSearch = async (q) => {
    setLocationSearch(q)
    if (q.length < 3) { setLocationSuggestions([]); return }
    setSearchingLocation(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocationSuggestions(data.map(d => ({
        name: d.display_name.split(',').slice(0,3).join(', '),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
      })))
    } catch { setLocationSuggestions([]) }
    setSearchingLocation(false)
  }

  const handleSelectLocation = async (suggestion) => {
    setUserLat(suggestion.lat)
    setUserLng(suggestion.lng)
    setLocationName(suggestion.name.split(',')[0])
    await saveUserLocation(user.uid, suggestion.lat, suggestion.lng)
    toast.success(`📍 ${suggestion.name.split(',')[0]}`)
    setShowLocationPicker(false)
    setLocationSearch("")
    setLocationSuggestions([])
  }

  // ── OPEN VENDOR — BLOCKS IF CLOSED ───────────────────────────────────────
  const openVendor = (v) => {
    if (!v.isOpen) {
      toast.error(
        `${v.storeName} is currently closed${v.openTime ? `. Opens at ${v.openTime}` : ''}`,
        { icon: '🔒', duration: 3000 }
      )
      return // ← block navigation entirely
    }
    setSelectedVendor(v)
    setTab('vendor-menu')
    setShowVendorInfo(false)
    loadReviews(v.id)
    setMenuCatFilter('All')
  }

  const addToCart = (item) => {
    // Extra safety: block add if vendor is now closed
    if (!selectedVendor?.isOpen) {
      toast.error('This store is currently closed. You cannot add items.')
      return
    }
    if (cartVendor && cartVendor.id !== selectedVendor.id) {
      toast.error('Clear cart first — items from ' + cartVendor.storeName)
      return
    }
    setCartVendor({
      ...selectedVendor,
      deliveryCharge: Number(selectedVendor.deliveryCharge ?? 0)
    })
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty+1 } : c)
      return [...prev, { ...item, qty:1 }]
    })
    toast.success(item.name + ' added!')
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
  const isRamnavamiOffer = new Date() <= new Date('2026-04-03T23:59:59')
  const isCouponFreeDelivery = couponApplied
  const deliveryFee = isCouponFreeDelivery ? 0 : (Number(cartVendor?.deliveryCharge) ?? 0)

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (isRamnavamiOffer && code === 'RAMNAVAMI') {
      setCouponApplied(true)
      setCouponError('')
      toast.success('🎉 Coupon applied! Free delivery unlocked!')
    } else if (!isRamnavamiOffer && code === 'RAMNAVAMI') {
      setCouponApplied(false)
      setCouponError('This offer has expired')
    } else {
      setCouponApplied(false)
      setCouponError('Invalid coupon code')
    }
  }

  // ── SUPPORT TICKETS ───────────────────────────────────────────────────────
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
        userUid: user.uid,
        userName: userData?.name || 'User',
        userEmail: user.email,
        userPhone: userData?.mobile || '',
        category: supportCategory,
        message: supportMsg.trim(),
        status: 'open',
        founderReply: '',
        createdAt: serverTimestamp()
      })
      setSupportSent(true)
      setSupportMsg('')
      toast.success('Support request sent! We will reply soon. ✅')
    } catch (e) { toast.error('Failed to send. Try again.') }
    setSendingSupport(false)
  }

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return toast.error('Please write your feedback')
    setSendingFeedback(true)
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(db, 'supportTickets'), {
        userUid: user.uid,
        userName: userData?.name || 'User',
        userEmail: user.email,
        userPhone: userData?.mobile || '',
        category: feedbackType === 'suggestion' ? 'Feedback' : feedbackType === 'bug' ? 'App Bug' : 'General',
        message: feedbackText.trim(),
        appRating: feedbackRating,
        status: 'open',
        founderReply: '',
        isFeedback: true,
        createdAt: serverTimestamp()
      })
      setFeedbackSent(true)
      setFeedbackText('')
      toast.success('Thank you for your feedback! 🙏')
    } catch { toast.error('Failed to send. Try again.') }
    setSendingFeedback(false)
  }

  const handlePlaceOrder = async () => {
    if (!deliveryName.trim()) return toast.error('Enter your name')
    if (!deliveryPhone.trim()) return toast.error('Enter phone number')
    if (!deliveryAddress.trim() && !deliveryHostel.trim()) return toast.error('Enter delivery address')
    try {
      const fullAddress = [deliveryHostel.trim(), deliveryAddress.trim(), deliveryNote.trim() ? `Note: ${deliveryNote.trim()}` : ''].filter(Boolean).join(' · ')
      await placeOrder({
        userUid: user.uid,
        userName: deliveryName.trim(),
        userPhone: deliveryPhone.trim(),
        userEmail: user.email,
        vendorUid: cartVendor.id,
        vendorName: cartVendor.storeName,
        items: cart.map(i => ({ id:i.id, name:i.name, price:i.price, qty:i.qty })),
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        total: cartTotal + deliveryFee,
        address: fullAddress,
        paymentMode: 'COD'
      })
      const vendorSnap = await import('firebase/firestore').then(({doc, getDoc}) =>
        getDoc(doc(db, 'vendors', cartVendor.id))
      )
      const vendorInfo = vendorSnap.exists() ? vendorSnap.data() : {}

      setOrderSuccess({
        orderId: Math.random().toString(36).slice(-6).toUpperCase(),
        vendorName: cartVendor.storeName,
        vendorPhone: vendorInfo.phone || '',
        vendorPhoto: vendorInfo.photo || '',
        items: cart.map(i => ({ ...i })),
        total: cartTotal + deliveryFee,
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        address: fullAddress,
        userName: deliveryName.trim(),
        userPhone: deliveryPhone.trim(),
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
        vendorId: reviewVendor.id,
        vendorName: reviewVendor.storeName,
        userId: user.uid,
        userName: userData?.name || 'Anonymous',
        rating: reviewRating,
        text: reviewText.trim(),
        createdAt: serverTimestamp()
      })
      toast.success('Review submitted! ⭐')
      setShowReview(false)
      setReviewText('')
      setReviewRating(5)
    } catch (err) { toast.error('Failed to submit review') }
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

  const filteredVendors = vendors
    .filter(v => {
      const matchCat = catFilter === 'All' || v.category === catFilter || (catFilter !== 'All' && v.customCategories?.includes(catFilter))
      const q = searchQuery.toLowerCase().trim()
      const matchSearch = !q ||
        v.storeName?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    .map(v => ({
      ...v,
      distance: (userLat && userLng && v.location?.lat && v.location?.lng)
        ? getDistance(userLat, userLng, v.location.lat, v.location.lng)
        : null
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance
      if (a.isOpen && !b.isOpen) return -1
      if (!a.isOpen && b.isOpen) return 1
      return 0
    })

  const inp = {
    width:'100%', padding:'11px 13px',
    borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:9, fontSize:13, fontFamily:'Poppins,sans-serif',
    outline:'none', marginTop:6, boxSizing:'border-box', background:'#fff'
  }

  const unreadCount = notifications.length

  return (
    <div style={S.shell}>

      {/* ── HEADER ── */}
      <div style={S.redHdr}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:24, fontWeight:700, letterSpacing:-0.5 }}>{t('Feedo','फिडो')}</div>
            <div
              onClick={() => setShowLocationPicker(true)}
              style={{ marginTop:6, cursor:'pointer', display:'flex', alignItems:'center', gap:8, maxWidth:220 }}
            >
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
            <div onClick={() => setShowNotifs(!showNotifs)} style={{ position:'relative', cursor:'pointer' }}>
              <span style={{ fontSize:20 }}>🔔</span>
              {unreadCount > 0 && (
                <div style={{ position:'absolute', top:-4, right:-4, background:'#fbbf24', color:'#000', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {unreadCount}
                </div>
              )}
            </div>
            <button onClick={() => setLang(l => l==='en'?'mr':'en')} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Poppins' }}>
              {lang==='en'?'मराठी':'English'}
            </button>
          </div>
        </div>

        {/* Location picker modal */}
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
                <input
                  autoFocus
                  style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', background:'transparent', color:'#1f2937' }}
                  placeholder="Search area, colony, city..."
                  value={locationSearch}
                  onChange={e => handleLocationSearch(e.target.value)}
                />
                {searchingLocation && <span style={{ fontSize:12, color:'#9ca3af' }}>...</span>}
              </div>
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#fff5f5', borderWidth:1, borderStyle:'solid', borderColor:'#fecaca', borderRadius:12, cursor:'pointer', marginBottom:14, fontFamily:'Poppins' }}
              >
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
                      <span style={{ fontSize:14 }}>🏘️</span>
                      <span style={{ fontSize:13, color:'#374151' }}>{area}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search bar */}
        {(tab==='home' || tab==='vendor-menu') && (
          <div style={{ background:'#fff', borderRadius:10, display:'flex', alignItems:'center', gap:8, padding:'10px 14px', marginTop:12 }}>
            <span style={{ fontSize:16 }}>🔍</span>
            <input
              style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', color:'#1f2937' }}
              placeholder={t('Search restaurants or food...','रेस्टॉरंट शोधा...')}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (tab==='vendor-menu') setTab('home') }}
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9ca3af', padding:0 }}>✕</button>}
          </div>
        )}

        {tab==='vendor-menu' && selectedVendor && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
            <button onClick={() => { setTab('home'); setSearchQuery('') }} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>← Back</button>
            <span style={{ fontSize:14, fontWeight:600 }}>{selectedVendor.storeName}</span>
            <span style={{ fontSize:11, background: selectedVendor.isOpen?'#16a34a':'#dc2626', color:'#fff', padding:'2px 8px', borderRadius:10 }}>
              {selectedVendor.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={S.pageContent}>

        {/* HOME */}
        {tab==='home' && (
          <div style={{ background:'#fff', minHeight:'100%' }}>

            {/* ── RAMNAVAMI LAUNCH OFFER BANNER ── */}
            {(() => {
              const now = new Date()
              const offerEnd = new Date('2026-04-03T23:59:59')
              if (now > offerEnd) return null
              return (
                <div style={{ position:'relative', overflow:'hidden', cursor:'pointer' }} onClick={() => setTab('cart')}>
                  <div style={{
                    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 160,
                  }}>
                    <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,165,0,0.25) 0%, transparent 65%)' }} />
                    <div style={{ position:'absolute', top:-10, right:60, width:80, height:80, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,100,0,0.2) 0%, transparent 65%)' }} />
                    {[
                      { top:'15%', left:'5%', size:4, opacity:0.6 },
                      { top:'60%', left:'8%', size:3, opacity:0.4 },
                      { top:'25%', left:'45%', size:5, opacity:0.3 },
                      { top:'70%', left:'55%', size:3, opacity:0.5 },
                      { top:'10%', left:'70%', size:4, opacity:0.4 },
                    ].map((p, i) => (
                      <div key={i} style={{ position:'absolute', top:p.top, left:p.left, width:p.size, height:p.size, borderRadius:'50%', background:'#ffd700', opacity:p.opacity }} />
                    ))}
                    <div style={{ padding:'18px 16px 14px', position:'relative', zIndex:2, paddingRight:120 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                        <div style={{ background:'linear-gradient(90deg, #ff6b00, #ff9500)', borderRadius:4, padding:'3px 10px', display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ fontSize:8, fontWeight:900, color:'#fff', letterSpacing:1.5, textTransform:'uppercase' }}>🚀 Grand Launch</span>
                        </div>
                        <div style={{ background:'rgba(255,215,0,0.2)', borderRadius:4, padding:'3px 8px', borderWidth:1, borderStyle:'solid', borderColor:'rgba(255,215,0,0.5)' }}>
                          <span style={{ fontSize:8, fontWeight:800, color:'#ffd700', letterSpacing:1 }}>TODAY ONLY</span>
                        </div>
                      </div>
                      <div style={{ marginBottom:6 }}>
                        <div style={{ fontSize:26, fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:-0.5, textShadow:'0 2px 10px rgba(0,0,0,0.5)' }}>FREE</div>
                        <div style={{ fontSize:26, fontWeight:900, lineHeight:1, letterSpacing:-0.5 }}>
                          <span style={{ background:'linear-gradient(90deg, #ffd700, #ff9500, #ff6b00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>DELIVERY</span>
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', lineHeight:1.5, marginBottom:12 }}>
                        🪔 राम नवमी Special · FeedoZone Grand Launch
                      </div>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', borderWidth:1, borderStyle:'solid', borderColor:'rgba(255,215,0,0.4)', borderRadius:8, padding:'6px 12px', backdropFilter:'blur(10px)' }}>
                        <span style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:600 }}>USE CODE</span>
                        <div style={{ width:1, height:12, background:'rgba(255,255,255,0.2)' }} />
                        <span style={{ fontSize:13, fontWeight:900, color:'#ffd700', letterSpacing:2 }}>RAMNAVAMI</span>
                      </div>
                    </div>
                    <div style={{ position:'absolute', right:0, top:0, bottom:0, width:115, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
                      <div style={{ position:'absolute', width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,165,0,0.35) 0%, transparent 65%)', top:'50%', left:'50%', transform:'translate(-50%,-55%)' }} />
                      <div style={{ fontSize:52, lineHeight:1, filter:'drop-shadow(0 0 12px rgba(255,165,0,0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))', position:'relative', zIndex:1 }}>🪔</div>
                      <div style={{ fontSize:8, fontWeight:800, color:'rgba(255,215,0,0.8)', letterSpacing:2, textAlign:'center', textTransform:'uppercase' }}>Ram Navami</div>
                      <div style={{ display:'flex', gap:6, marginTop:2 }}>
                        <span style={{ fontSize:14, filter:'drop-shadow(0 0 4px rgba(255,165,0,0.7))' }}>🪔</span>
                        <span style={{ fontSize:14, filter:'drop-shadow(0 0 4px rgba(255,165,0,0.7))' }}>🪔</span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(90deg, #ff6b00 0%, #ff9500 50%, #ffb700 100%)',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14 }}>🎊</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:800, color:'#fff', letterSpacing:0.3 }}>FeedoZone is LIVE today!</div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>Apply code at checkout · Ends midnight ⏰</div>
                      </div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.25)', borderRadius:20, padding:'5px 12px', borderWidth:1, borderStyle:'solid', borderColor:'rgba(255,255,255,0.4)' }}>
                      <span style={{ fontSize:11, color:'#fff', fontWeight:800, letterSpacing:0.5 }}>ORDER NOW →</span>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Location prompt banner */}
            {!userLat && !locationLoading && (
              <div
                onClick={() => setShowLocationPicker(true)}
                style={{ background:'#fffbeb', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#fde68a', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
              >
                <span style={{ fontSize:20 }}>📍</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#92400e' }}>Set your delivery location</div>
                  <div style={{ fontSize:11, color:'#a16207' }}>See nearest restaurants first</div>
                </div>
                <span style={{ fontSize:12, color:'#d97706', fontWeight:600 }}>Set →</span>
              </div>
            )}

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
                          <div style={{
                            width:64, height:64, borderRadius:'50%',
                            background: active ? '#E24B4A' : (bgMap[c.id] || '#fff5f5'),
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:28,
                            boxShadow: active ? '0 6px 18px rgba(226,75,74,0.45)' : '0 2px 10px rgba(0,0,0,0.07)',
                            borderWidth:2.5, borderStyle:'solid',
                            borderColor: active ? '#E24B4A' : 'transparent',
                            transform: active ? 'scale(1.08)' : 'scale(1)',
                            transition:'all 0.2s'
                          }}>{c.emoji}</div>
                          <span style={{ fontSize:11, fontWeight:active?700:500, color:active?'#E24B4A':'#374151', whiteSpace:'nowrap', letterSpacing:0.1 }}>{c.label}</span>
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
              {userLat && !searchQuery && <span style={{ fontSize:11, color:'#16a34a', fontWeight:400 }}>· sorted by distance</span>}
            </div>

            {filteredVendors.length===0 && !searchQuery && (
              <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>No restaurants available yet</div>
            )}

            <div style={{ padding:'0 16px' }}>
              {filteredVendors.map(v => (
                <div
                  key={v.id}
                  onClick={() => openVendor(v)}
                  style={{
                    background:'#fff',
                    borderRadius:16,
                    overflow:'hidden',
                    marginBottom:16,
                    // ── KEY CHANGE: closed = not-allowed cursor, reduced opacity ──
                    cursor: v.isOpen ? 'pointer' : 'not-allowed',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.08)',
                    borderWidth:1,
                    borderStyle:'solid',
                    borderColor: v.isOpen ? '#f3f4f6' : '#fecaca',
                    opacity: v.isOpen ? 1 : 0.6,
                  }}
                >
                  <div style={{ height:140, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
                    {v.photo
                      ? <img src={v.photo} alt={v.storeName} style={{ width:'100%', height:'100%', objectFit:'cover', filter: v.isOpen ? 'none' : 'grayscale(70%)' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }}>
                          <span style={{ fontSize:40 }}>🍽️</span>
                          <span style={{ fontSize:11, color:'#E24B4A', fontWeight:500 }}>No photo yet</span>
                        </div>
                    }
                    {/* Closed overlay — stronger, with lock icon */}
                    {!v.isOpen && (
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ background:'rgba(0,0,0,0.8)', borderRadius:20, padding:'8px 20px', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:16 }}>🔒</span>
                          <div>
                            <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>Store Closed</div>
                            {v.openTime && <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:1 }}>Opens at {v.openTime}</div>}
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ position:'absolute', top:10, left:10, background:'#E24B4A', color:'#fff', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:600 }}>{v.category||'Food'}</div>
                    <div style={{ position:'absolute', top:10, right:10, background: v.isOpen?'#16a34a':'#6b7280', color:'#fff', fontSize:10, padding:'3px 8px', borderRadius:20, fontWeight:600 }}>{v.isOpen?'● Open':'● Closed'}</div>
                    {v.distance !== null && (
                      <div style={{ position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:10, padding:'3px 8px', borderRadius:20, fontWeight:500 }}>
                        📍 {v.distance < 1 ? `${Math.round(v.distance*1000)}m` : `${v.distance.toFixed(1)}km`}
                      </div>
                    )}
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ fontSize:15, fontWeight:700, color: v.isOpen ? '#1f2937' : '#6b7280' }}>{v.storeName}</div>
                      <div style={{ background:'#f0fdf4', color:'#16a34a', fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:8 }}>⭐ {v.rating||4.5}</div>
                    </div>
                    <div style={{ fontSize:12, color:'#9ca3af', marginTop:3 }}>{v.category}</div>
                    <div style={{ display:'flex', gap:12, marginTop:8 }}>
                      <span style={{ fontSize:12, color:'#9ca3af' }}>🕐 {v.prepTime||20}-{(v.prepTime||20)+15} min</span>
                      <span style={{ fontSize:12, color: v.isOpen ? '#6b7280' : '#9ca3af' }}>{Number(v.deliveryCharge) === 0 ? '🎉 Free delivery' : ('₹' + (v.deliveryCharge ?? 0) + ' delivery')}</span>
                    </div>
                    {/* Closed notice with open time */}
                    {!v.isOpen && (
                      <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6, background:'#fee2e2', borderRadius:8, padding:'6px 10px' }}>
                        <span style={{ fontSize:12 }}>🔒</span>
                        <span style={{ fontSize:11, color:'#dc2626', fontWeight:600 }}>
                          Currently closed{v.openTime ? ` · Opens at ${v.openTime}` : ''}
                        </span>
                      </div>
                    )}
                    {v.address && <div style={{ fontSize:11, color:'#9ca3af', marginTop:5 }}>📍 {v.address}</div>}
                  </div>
                </div>
              ))}

              {/* COMING SOON BANNER */}
              {!searchQuery.trim() && (
                <div style={{ marginTop:4, marginBottom:24 }}>
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                  <div style={{ background:'linear-gradient(135deg,#f9fafb,#f3f4f6)', borderRadius:16, padding:'18px 20px', borderWidth:1.5, borderStyle:'dashed', borderColor:'#e5e7eb', display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', flexShrink:0 }}>
                      🍽️
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:'#f59e0b', animation:'pulse 1.5s infinite' }} />
                        <span style={{ fontSize:10, fontWeight:700, color:'#d97706', letterSpacing:0.5, textTransform:'uppercase' }}>Coming Soon</span>
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#1f2937', lineHeight:1.4 }}>More restaurants joining FeedoZone!</div>
                      <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>New restaurants will be available here soon 🚀</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VENDOR MENU */}
        {tab==='vendor-menu' && selectedVendor && (
          <div style={{ background:'#fff', minHeight:'100%' }}>
            <div style={{ height:160, position:'relative', background:'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
              {selectedVendor.photo
                ? <img src={selectedVendor.photo} alt={selectedVendor.storeName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:48 }}>🍽️</span></div>
              }
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
              <div style={{ position:'absolute', bottom:12, left:14, color:'#fff' }}>
                <div style={{ fontSize:16, fontWeight:700 }}>{selectedVendor.storeName}</div>
                <div style={{ fontSize:11, opacity:0.9 }}>{selectedVendor.category} · ⭐ {selectedVendor.rating||4.5}</div>
              </div>
            </div>
            <div style={{ padding:'10px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', gap:16 }}>
              <span style={{ fontSize:12, color:'#6b7280' }}>🕐 {selectedVendor.prepTime||20}-{(selectedVendor.prepTime||20)+15} min</span>
              <span style={{ fontSize:12, color:'#6b7280' }}>{!selectedVendor.deliveryCharge ? '🎉 Free delivery' : ('₹' + selectedVendor.deliveryCharge + ' delivery')}</span>
              {selectedVendor.distance !== null && userLat && (
                <span style={{ fontSize:12, color:'#16a34a' }}>📍 {selectedVendor.distance < 1 ? `${Math.round(selectedVendor.distance*1000)}m away` : `${selectedVendor.distance?.toFixed(1)}km away`}</span>
              )}
            </div>

            {/* ── CLOSED BANNER on vendor menu page ── */}
            {!selectedVendor.isOpen && (
              <div style={{ background:'#fee2e2', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', margin:'12px 16px', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🔒</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#991b1b' }}>This restaurant is currently closed</div>
                  <div style={{ fontSize:11, color:'#b91c1c', marginTop:2 }}>
                    {selectedVendor.openTime ? `Opens at ${selectedVendor.openTime} · Come back then!` : 'You cannot order right now'}
                  </div>
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
                    {cats.length > 1 && (
                      <div style={{ overflowX:'auto', paddingBottom:2 }}>
                        <div style={{ display:'flex', gap:8, padding:'8px 16px', width:'max-content' }}>
                          {cats.map(cat => {
                            const isActive = menuCatFilter === cat
                            const count = cat === 'All' ? availableItems.length : availableItems.filter(i => i.category === cat).length
                            return (
                              <button key={cat} onClick={() => setMenuCatFilter(cat)} style={{
                                flexShrink:0, padding:'7px 14px', borderRadius:20,
                                border:'none', cursor:'pointer', fontFamily:'Poppins',
                                fontSize:12, fontWeight: isActive ? 700 : 500,
                                background: isActive ? '#E24B4A' : '#f3f4f6',
                                color: isActive ? '#fff' : '#6b7280',
                                boxShadow: isActive ? '0 4px 12px rgba(226,75,74,0.3)' : 'none',
                                transition:'all 0.2s',
                                whiteSpace:'nowrap',
                              }}>
                                {cat} {count > 0 && <span style={{ opacity: isActive ? 0.8 : 0.6, fontSize:10 }}>({count})</span>}
                              </button>
                            )
                          })}
                        </div>
                        <div style={{ height:1, background:'#f3f4f6', marginTop:4 }} />
                      </div>
                    )}

                    <div style={{ padding:'0 16px' }}>
                      {filteredItems.length === 0 && (
                        <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>
                          {menuItems.length === 0 ? 'No menu items yet' : `No items in ${menuCatFilter}`}
                        </div>
                      )}

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
                  </>
                )

                // ── MENU ITEM CARD — ADD button disabled when closed ──
                function MenuItemCard({ item }) {
                  const inCart = cart.find(c => c.id === item.id)
                  const vendorClosed = !selectedVendor.isOpen

                  return (
                    <div style={{ display:'flex', gap:12, padding:'14px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f7f7f7', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                          <VegDot isVeg={item.isVeg !== false} />
                          <span style={{ fontSize:13, fontWeight:600, color: vendorClosed ? '#9ca3af' : '#1f2937' }}>{item.name}</span>
                        </div>
                        {item.description && <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4, lineHeight:1.5 }}>{item.description}</div>}
                        <div style={{ fontSize:14, fontWeight:700, color: vendorClosed ? '#9ca3af' : '#E24B4A' }}>₹{item.price}</div>
                      </div>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:90, height:90, borderRadius:12, overflow:'hidden', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', filter: vendorClosed ? 'grayscale(60%)' : 'none' }}>
                          {item.photo ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:28 }}>🍛</span>}
                        </div>
                        <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)' }}>
                          {vendorClosed ? (
                            // ── CLOSED: show disabled lock button ──
                            <div style={{
                              display:'flex', alignItems:'center', gap:4,
                              background:'#f3f4f6',
                              borderWidth:1, borderStyle:'solid', borderColor:'#d1d5db',
                              borderRadius:20, padding:'5px 12px',
                              boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
                              cursor:'not-allowed',
                            }}>
                              <span style={{ fontSize:10 }}>🔒</span>
                              <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af' }}>Closed</span>
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

            {/* VENDOR INFO */}
            <div style={{ margin:'20px 0 100px', background:'#fff' }}>
              <div style={{ padding:'0 16px 12px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', letterSpacing:0.2 }}>Restaurant Info</div>
              </div>
              <div style={{ display:'flex', padding:'14px 16px', gap:12, borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div style={{ flex:1, textAlign:'center', padding:'10px 8px', background:'#f9fafb', borderRadius:10 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>⭐ {selectedVendor.rating || 4.5}</div>
                  <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>Rating</div>
                </div>
                <div style={{ flex:1, textAlign:'center', padding:'10px 8px', background:'#f9fafb', borderRadius:10 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>{selectedVendor.prepTime || 20}–{(selectedVendor.prepTime || 20)+15}</div>
                  <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>Min delivery</div>
                </div>
                <div style={{ flex:1, textAlign:'center', padding:'10px 8px', background:'#f9fafb', borderRadius:10 }}>
                  <div style={{ fontSize:16, fontWeight:700, color: !selectedVendor.deliveryCharge ? '#16a34a' : '#1f2937' }}>
                    {!selectedVendor.deliveryCharge ? 'FREE' : ('₹' + selectedVendor.deliveryCharge)}
                  </div>
                  <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>Delivery</div>
                </div>
                <div style={{ flex:1, textAlign:'center', padding:'10px 8px', background:'#f9fafb', borderRadius:10 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: selectedVendor.isOpen ? '#16a34a' : '#dc2626' }}>
                    {selectedVendor.isOpen ? 'Open' : 'Closed'}
                  </div>
                  <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>Status</div>
                </div>
              </div>
              {selectedVendor.address && (
                <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'flex-start' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:17 }}>📍</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>ADDRESS</div>
                    <div style={{ fontSize:13, color:'#1f2937', fontWeight:500, lineHeight:1.4 }}>{selectedVendor.address}</div>
                  </div>
                </div>
              )}
              {selectedVendor.openTime && selectedVendor.closeTime && (
                <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:17 }}>🕐</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>OPENING HOURS</div>
                    <div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>{selectedVendor.openTime} – {selectedVendor.closeTime}</div>
                  </div>
                  <div style={{ background: selectedVendor.isOpen ? '#dcfce7' : '#fee2e2', borderRadius:20, padding:'4px 10px' }}>
                    <span style={{ fontSize:11, fontWeight:600, color: selectedVendor.isOpen ? '#16a34a' : '#dc2626' }}>
                      {selectedVendor.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>
              )}
              {selectedVendor.fssai && (
                <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:17 }}>🏛️</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>FSSAI LICENCE</div>
                    <div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>{selectedVendor.fssai}</div>
                  </div>
                  <div style={{ background:'#dcfce7', borderRadius:20, padding:'4px 10px' }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'#16a34a' }}>✓ Verified</span>
                  </div>
                </div>
              )}
              {selectedVendor.phone && (
                <div style={{ display:'flex', gap:14, padding:'14px 16px', alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:17 }}>📞</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>CONTACT</div>
                    <div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>+91 {selectedVendor.phone}</div>
                  </div>
                  <button
                    onClick={() => callVendor(selectedVendor.phone)}
                    style={{ background:'#E24B4A', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:5 }}
                  >
                    📞 Call
                  </button>
                </div>
              )}
            </div>

            {/* REVIEWS SECTION */}
            <div style={{ background:'#fff', borderTopWidth:8, borderTopStyle:'solid', borderTopColor:'#f7f7f7', marginTop:8 }}>
              <div style={{ padding:'16px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>Ratings & Reviews</div>
                  {reviews.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                      <span style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>
                        {(reviews.reduce((s,r) => s+r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                      <div style={{ display:'flex', gap:1 }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize:13, color: s <= Math.round(reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length) ? '#f59e0b' : '#e5e7eb' }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize:12, color:'#9ca3af' }}>({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setReviewVendor(selectedVendor); setShowReview(true) }}
                  style={{ background:'transparent', color:'#E24B4A', borderWidth:1.5, borderStyle:'solid', borderColor:'#E24B4A', borderRadius:20, padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:5 }}
                >
                  ✍️ Rate Us
                </button>
              </div>
              {reviews.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px 16px 32px' }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>⭐</div>
                  <div style={{ fontSize:13, color:'#9ca3af' }}>No reviews yet</div>
                  <div style={{ fontSize:12, color:'#d1d5db', marginTop:4 }}>Be the first to review this restaurant!</div>
                </div>
              )}
              {reviews.map(r => (
                <div key={r.id} style={{ padding:'14px 16px', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#f7f7f7' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{r.userName?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{r.userName}</div>
                        <div style={{ fontSize:10, color:'#9ca3af' }}>
                          {r.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) || ''}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:2, marginTop:3 }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize:13, color: s<=r.rating?'#f59e0b':'#e5e7eb' }}>★</span>
                        ))}
                        <span style={{ fontSize:11, color:'#9ca3af', marginLeft:4 }}>
                          {['','Poor','Fair','Good','Great','Excellent'][r.rating]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, paddingLeft:46 }}>{r.text}</div>
                </div>
              ))}
              <div style={{ height:100 }} />
            </div>
          </div>
        )}

        {/* CART */}
        {tab==='cart' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>{t('Your Cart','तुमची कार्ट')} {cartVendor && `· ${cartVendor.storeName}`}</div>
            {cart.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>Cart is empty. Browse vendors!</div>}
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>₹{item.price} each</div>
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
                {isRamnavamiOffer && (
                  <div style={{ marginBottom:12 }}>
                    {!couponApplied ? (
                      <div>
                        <div style={{ fontSize:12, color:'#6b7280', fontWeight:500, marginBottom:6 }}>🏷️ Have a coupon code?</div>
                        <div style={{ display:'flex', gap:8 }}>
                          <input
                            value={couponInput}
                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                            placeholder="Enter coupon code"
                            style={{ flex:1, padding:'11px 13px', borderWidth:1.5, borderStyle:'solid', borderColor: couponError ? '#fca5a5' : '#e5e7eb', borderRadius:9, fontSize:13, fontFamily:'Poppins', outline:'none', background:'#fff', letterSpacing:1, fontWeight:600, color:'#1f2937' }}
                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            style={{ background:'#1f2937', color:'#fff', border:'none', padding:'11px 16px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap' }}
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <div style={{ fontSize:11, color:'#dc2626', marginTop:5, display:'flex', alignItems:'center', gap:4 }}>
                            ❌ {couponError}
                          </div>
                        )}
                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:5 }}>
                          🪔 Try <span style={{ fontWeight:700, color:'#f97316' }}>RAMNAVAMI</span> for free delivery today!
                        </div>
                      </div>
                    ) : (
                      <div style={{ background:'#f0fdf4', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderStyle:'solid', borderColor:'#86efac' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:18 }}>🎉</span>
                          <div>
                            <div style={{ fontSize:12, fontWeight:700, color:'#16a34a' }}>Coupon RAMNAVAMI applied!</div>
                            <div style={{ fontSize:11, color:'#15803d' }}>Free delivery unlocked 🚀</div>
                          </div>
                        </div>
                        <button
                          onClick={() => { setCouponApplied(false); setCouponInput(''); setCouponError('') }}
                          style={{ background:'none', border:'none', fontSize:16, cursor:'pointer', color:'#6b7280' }}
                        >✕</button>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, margin:'12px 0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:12, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:12 }}>₹{cartTotal}</span></div>
                  {couponApplied && (
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, color:'#16a34a', fontWeight:500 }}>🏷️ Coupon discount</span>
                      <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>- ₹{Number(cartVendor?.deliveryCharge) || 0}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee</span><span style={{ fontSize:12 }}>{deliveryFee === 0 ? 'Free 🎉' : ('₹' + deliveryFee)}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb', paddingTop:8 }}><span style={{ fontSize:14, fontWeight:600 }}>Total</span><span style={{ fontSize:14, fontWeight:600 }}>{'₹' + (cartTotal + deliveryFee)}</span></div>
                </div>
                <button onClick={() => setShowCheckout(true)} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                  {'Proceed to Checkout · ₹' + (cartTotal + deliveryFee)}
                </button>
              </>
            )}
            {cart.length > 0 && showCheckout && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:14, color:'#1f2937' }}>🚚 Delivery Details</div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Your Name *</label>
                  <input style={inp} placeholder="Full name" value={deliveryName} onChange={e => setDeliveryName(e.target.value)} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Phone Number *</label>
                  <div style={{ position:'relative', marginTop:6 }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#6b7280', pointerEvents:'none' }}>+91</span>
                    <input style={{ ...inp, marginTop:0, paddingLeft:44 }} placeholder="Mobile number" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Hostel / Building</label>
                  <input style={inp} placeholder="e.g. Hostel B, Men's Hostel..." value={deliveryHostel} onChange={e => setDeliveryHostel(e.target.value)} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Room / Address *</label>
                  <input style={inp} placeholder="e.g. Room 204..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Order Note (optional)</label>
                  <textarea style={{ ...inp, minHeight:60, resize:'none', lineHeight:1.5 }} placeholder="e.g. Less spicy, extra roti..." value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} />
                </div>
                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}><span style={{ fontSize:12, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:12 }}>₹{cartTotal}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}><span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee</span><span style={{ fontSize:12 }}>{deliveryFee === 0 ? 'Free 🎉' : ('₹' + deliveryFee)}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb', paddingTop:8 }}><span style={{ fontSize:14, fontWeight:700 }}>Total</span><span style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>{'₹' + (cartTotal + deliveryFee)}</span></div>
                </div>
                <div style={{ background:'#fef3c7', borderRadius:9, padding:'10px 12px', fontSize:12, color:'#78350f', marginBottom:12 }}>💵 Payment: <strong>Cash on Delivery (COD)</strong></div>
                <button onClick={handlePlaceOrder} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:8 }}>{'🎉 Place Order · ₹' + (cartTotal + deliveryFee)}</button>
                <button onClick={() => setShowCheckout(false)} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:11, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>← Back to Cart</button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS LIST */}
        {tab==='orders' && !selectedOrder && (
          <div style={{ background:'#f7f7f7', minHeight:'100%' }}>
            <div style={{ padding:'16px 16px 8px', fontSize:15, fontWeight:700, color:'#1f2937' }}>{t('My Orders','माझे ऑर्डर')}</div>
            {orders.length===0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'#9ca3af' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🛍️</div>
                <div style={{ fontSize:14, fontWeight:600 }}>No orders yet!</div>
                <div style={{ fontSize:12, marginTop:4 }}>Order something delicious 🍽️</div>
              </div>
            )}
            <div style={{ padding:'0 16px 80px' }}>
              {orders.map(o => {
                const isActive = !['delivered','cancelled'].includes(o.status)
                return (
                  <div key={o.id} onClick={() => setSelectedOrder(o)}
                    style={{ background:'#fff', borderRadius:14, padding:14, marginBottom:10, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', borderWidth:1, borderStyle:'solid', borderColor: isActive?'#fecaca':'#f3f4f6' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>{o.vendorName}</div>
                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{o.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})||''}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20,
                        background: o.status==='delivered'?'#d1fae5':o.status==='cancelled'?'#fee2e2':o.status==='out_for_delivery'?'#dbeafe':o.status==='preparing'?'#fef3c7':'#fff7ed',
                        color: o.status==='delivered'?'#065f46':o.status==='cancelled'?'#991b1b':o.status==='out_for_delivery'?'#1e40af':o.status==='preparing'?'#92400e':'#c2410c'
                      }}>{o.status==='out_for_delivery'?'Out for Delivery':o.status?.replace('_',' ').replace(/\w/g,c=>c.toUpperCase())}</span>
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>{o.items?.slice(0,2).map(i=>i.qty+'x '+i.name).join(', ')}{o.items?.length>2?` +${o.items.length-2} more`:''}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#E24B4A' }}>₹{o.total}</span>
                      {isActive
                        ? <span style={{ fontSize:11, color:'#E24B4A', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:'#E24B4A', display:'inline-block' }} />
                            Track Order →
                          </span>
                        : <span style={{ fontSize:11, color:'#9ca3af' }}>Tap for details →</span>
                      }
                    </div>
                    {o.status === 'delivered' && (
                      <div
                        onClick={e => { e.stopPropagation(); const v = vendors.find(x => x.id === o.vendorUid); if(v) { setReviewVendor(v); setReviewRating(5); setShowReview(true) } }}
                        style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(90deg,#fff7ed,#fef3c7)', borderRadius:8, padding:'8px 12px', borderWidth:1, borderStyle:'solid', borderColor:'#fde68a' }}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:14 }}>⭐</span>
                          <span style={{ fontSize:11, fontWeight:600, color:'#92400e' }}>Rate your experience</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:'#d97706' }}>Rate Now →</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ORDER TRACKING PAGE */}
        {tab==='orders' && selectedOrder && (() => {
          const o = selectedOrder
          const STEPS = [
            { key:'pending',          icon:'📋', label:'Order Placed',     sub:'Your order has been placed' },
            { key:'accepted',         icon:'✅', label:'Order Accepted',   sub:'Restaurant accepted your order' },
            { key:'preparing',        icon:'👨‍🍳', label:'Preparing',        sub:'Your food is being prepared' },
            { key:'ready',            icon:'🎉', label:'Ready',             sub:'Your order is ready!' },
            { key:'out_for_delivery', icon:'🚴', label:'Out for Delivery', sub:'On the way to you!' },
            { key:'delivered',        icon:'✅', label:'Delivered',         sub:'Enjoy your meal!' },
          ]
          const stepOrder = ['pending','accepted','preparing','ready','out_for_delivery','delivered']
          const currentIdx = stepOrder.indexOf(o.status)
          const isCancelled = o.status === 'cancelled'

          return (
            <div style={{ background:'#f7f7f7', minHeight:'100%' }}>
              <div style={{
                background: isCancelled ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : o.status==='delivered' ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#E24B4A,#c73232)',
                padding:'20px 16px 32px', color:'#fff'
              }}>
                <button onClick={() => setSelectedOrder(null)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'Poppins', marginBottom:16 }}>
                  ← My Orders
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, border:'2px solid rgba(255,255,255,0.3)', flexShrink:0 }}>
                    {isCancelled ? '❌' : o.status==='delivered' ? '✅' : o.status==='out_for_delivery' ? '🚴' : o.status==='preparing' ? '👨‍🍳' : o.status==='accepted' ? '✅' : '📋'}
                  </div>
                  <div>
                    <div style={{ fontSize:11, opacity:0.8, letterSpacing:0.5, marginBottom:3 }}>ORDER TRACKING</div>
                    <div style={{ fontSize:17, fontWeight:700 }}>{o.vendorName}</div>
                    <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>
                      {o.createdAt?.toDate?.()?.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})||''}
                      {' · '}₹{o.total}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop:14, background:'rgba(255,255,255,0.2)', borderRadius:20, display:'inline-block', padding:'5px 16px' }}>
                  <span style={{ fontSize:12, fontWeight:700 }}>
                    {isCancelled ? '❌ Cancelled' : o.status==='delivered' ? '✅ Delivered!' : o.status==='out_for_delivery' ? '🚴 On the way!' : o.status==='preparing' ? '👨‍🍳 Preparing...' : o.status==='accepted' ? '✅ Accepted!' : '⏳ Order Placed'}
                  </span>
                </div>
              </div>

              <div style={{ padding:'0 16px 100px', marginTop:-8 }}>
                {!isCancelled ? (
                  <div style={{ background:'#fff', borderRadius:16, padding:20, marginBottom:14, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                    <div style={{ textAlign:'center', marginBottom:20 }}>
                      <div style={{ fontSize:40, marginBottom:8 }}>{STEPS[currentIdx]?.icon || '📋'}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>{STEPS[currentIdx]?.label}</div>
                      <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{STEPS[currentIdx]?.sub}</div>
                    </div>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute', left:19, top:20, bottom:20, width:2, background:'#f3f4f6', zIndex:0 }} />
                      <div style={{ position:'absolute', left:19, top:20, width:2, background:'#E24B4A', zIndex:1,
                        height: currentIdx === 0 ? '0%' : (currentIdx / (stepOrder.length-1) * 100) + '%',
                        transition:'height 0.5s ease'
                      }} />
                      {STEPS.map((step, i) => {
                        const done = i <= currentIdx
                        const active = i === currentIdx
                        return (
                          <div key={step.key} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', position:'relative', zIndex:2 }}>
                            <div style={{
                              width:40, height:40, borderRadius:'50%', flexShrink:0,
                              background: done ? '#E24B4A' : '#f3f4f6',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize: active ? 18 : 14,
                              boxShadow: active ? '0 0 0 4px rgba(226,75,74,0.2)' : 'none',
                              transition:'all 0.3s'
                            }}>
                              {done ? (active ? step.icon : '✓') : <span style={{ fontSize:12, color:'#d1d5db' }}>{i+1}</span>}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight: done?700:400, color: done?'#1f2937':'#9ca3af' }}>{step.label}</div>
                              {active && <div style={{ fontSize:11, color:'#E24B4A', marginTop:2, fontWeight:500 }}>{step.sub}</div>}
                            </div>
                            {done && !active && <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>✓</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ background:'#fee2e2', borderRadius:16, padding:20, marginBottom:14, textAlign:'center', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5' }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>❌</div>
                    <div style={{ fontSize:16, fontWeight:700, color:'#dc2626' }}>Order Cancelled</div>
                    {o.cancelledBy === 'vendor' ? (
                      <>
                        <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>This order was cancelled by the restaurant</div>
                        {o.cancellationReason && (
                          <div style={{ marginTop:12, background:'rgba(255,255,255,0.65)', borderRadius:10, padding:'10px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', textAlign:'left' }}>
                            <div style={{ fontSize:10, fontWeight:700, color:'#dc2626', marginBottom:4, letterSpacing:0.5 }}>REASON FROM RESTAURANT</div>
                            <div style={{ fontSize:13, color:'#7f1d1d', fontWeight:500, lineHeight:1.5 }}>{o.cancellationReason}</div>
                          </div>
                        )}
                        <div style={{ marginTop:14, background:'#fff7ed', borderRadius:10, padding:'10px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#fed7aa', textAlign:'left' }}>
                          <div style={{ fontSize:12, color:'#92400e', lineHeight:1.6 }}>💡 You can reorder from this restaurant or try another one nearby.</div>
                        </div>
                        <button
                          onClick={() => { const v = vendors.find(x=>x.id===o.vendorUid); if(v) openVendor(v); setSelectedOrder(null) }}
                          style={{ marginTop:14, background:'#E24B4A', color:'#fff', border:'none', padding:'11px 24px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', display:'inline-flex', alignItems:'center', gap:6 }}
                        >
                          🔄 Reorder from Same Restaurant
                        </button>
                      </>
                    ) : (
                      <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>This order has been cancelled</div>
                    )}
                  </div>
                )}

                <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#9ca3af', marginBottom:12, textTransform:'uppercase', letterSpacing:0.5 }}>Order Details</div>
                  {o.items?.map((item, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f9fafb' }}>
                      <span style={{ fontSize:13, color:'#374151' }}>{item.qty}x {item.name}</span>
                      <span style={{ fontSize:13, fontWeight:600 }}>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f9fafb' }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee</span>
                    <span style={{ fontSize:12 }}>{o.deliveryFee === 0 ? 'Free 🎉' : ('₹' + o.deliveryFee)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10 }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>Total</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>₹{o.total}</span>
                  </div>
                </div>

                {o.address && (
                  <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:18 }}>📍</span>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:3 }}>DELIVERY ADDRESS</div>
                      <div style={{ fontSize:13, color:'#1f2937', fontWeight:500, lineHeight:1.5 }}>{o.address}</div>
                    </div>
                  </div>
                )}

                {o.vendorPhone && !isCancelled && (
                  <div style={{ background:'#fff', borderRadius:14, padding:14, marginBottom:12 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:10 }}>NEED HELP?</div>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => callVendor(o.vendorPhone)}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px 0', background:'#E24B4A', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Poppins' }}>
                        <span style={{ fontSize:16 }}>📞</span>
                        <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Call Restaurant</span>
                      </button>
                      <button onClick={() => notifyVendorWhatsApp(o.vendorPhone, { userName: o.userName, userPhone: o.userPhone || '', address: o.address, items: o.items, subtotal: o.subtotal, deliveryFee: o.deliveryFee, total: o.total })}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px 0', background:'#25D366', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Poppins' }}>
                        <span style={{ fontSize:16 }}>💬</span>
                        <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}

                {o.status === 'delivered' && (
                  <div style={{ background:'linear-gradient(135deg,#fff7ed,#fef3c7)', borderRadius:16, padding:18, marginBottom:12, borderWidth:1.5, borderStyle:'solid', borderColor:'#fde68a' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                      <div style={{ width:46, height:46, borderRadius:12, background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>⭐</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>How was your experience?</div>
                        <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>Your review helps others choose better!</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:14 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => { const vendor = vendors.find(x => x.id === o.vendorUid); if (vendor) { setReviewVendor(vendor); setReviewRating(star); setShowReview(true) } }}
                          style={{ width:44, height:44, borderRadius:12, border:'none', cursor:'pointer', fontSize:22, background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.08)', transition:'all 0.15s' }}>
                          ⭐
                        </button>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        onClick={() => { const vendor = vendors.find(x => x.id === o.vendorUid); if (vendor) { setReviewVendor(vendor); setReviewRating(5); setShowReview(true) } }}
                        style={{ flex:1, background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', border:'none', padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                      >
                        ✍️ Write a Review
                      </button>
                      <button
                        onClick={() => { const v = vendors.find(x=>x.id===o.vendorUid); if(v) openVendor(v); setSelectedOrder(null) }}
                        style={{ flex:1, background:'#fff', color:'#E24B4A', borderWidth:1.5, borderStyle:'solid', borderColor:'#E24B4A', padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                      >
                        🔄 Reorder
                      </button>
                    </div>
                  </div>
                )}

                {o.status === 'delivered' && (
                  <div style={{ marginBottom:12 }}>
                    <button
                      onClick={() => { setShowFeedback(true); setFeedbackSent(false) }}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#f9fafb', borderWidth:1.5, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:14, cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}
                    >
                      <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💡</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#1f2937' }}>Share Feedback or Suggestion</div>
                        <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Help us improve FeedoZone for you</div>
                      </div>
                      <span style={{ fontSize:16, color:'#d1d5db' }}>›</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* PROFILE */}
        {tab==='profile' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', borderRadius:16, padding:'24px 20px', marginBottom:16, textAlign:'center', color:'#fff' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, margin:'0 auto 10px', borderWidth:3, borderStyle:'solid', borderColor:'rgba(255,255,255,0.4)' }}>
                {userData?.name ? userData.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '👤'}
              </div>
              <div style={{ fontSize:18, fontWeight:700 }}>{userData?.name||'FeedoZone User'}</div>
              <div style={{ fontSize:12, opacity:0.85, marginTop:3 }}>{user?.email}</div>
            </div>
            <div style={{ background:'#fafafa', borderRadius:12, padding:'4px 16px', marginBottom:16 }}>
              {[
                { icon:'👤', label:'Full Name',   value: userData?.name },
                { icon:'📧', label:'Email',        value: userData?.email||user?.email },
                { icon:'📱', label:'Mobile',       value: userData?.mobile ? `+91 ${userData.mobile}` : null },
                { icon:'🏠', label:'Address',      value: userData?.address },
                { icon:'📍', label:'City / Area',  value: userData?.city },
                { icon:'🎓', label:'College',      value: userData?.college },
                { icon:'📮', label:'Pincode',      value: userData?.pincode },
                { icon:'📅', label:'Member Since', value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : null },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{row.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:'#9ca3af', marginBottom:1 }}>{row.label}</div>
                    <div style={{ fontSize:13, color: row.value?'#1f2937':'#d1d5db', fontWeight: row.value?500:400 }}>{row.value||'Not added'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#374151' }}>🌐 Language</span>
              <button onClick={() => setLang(l => l==='en'?'mr':'en')} style={{ background:'#FCEBEB', color:'#A32D2D', border:'none', padding:'5px 12px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>
                {lang==='en'?'Switch to Marathi':'English वर जा'}
              </button>
            </div>
            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>Logout</button>

            <div style={{ marginTop:20, marginBottom:4, fontSize:11, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Help & Legal</div>
            <div style={{ background:'#fafafa', borderRadius:12, overflow:'hidden', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6', marginBottom:80 }}>
              {[
                { icon:'💬', label:'Contact Support', sub:'Report issue or ask a question', action: () => { setShowSupport(true); setSupportSent(false) } },
                { icon:'📜', label:'Terms & Conditions', sub:'Our terms of service', action: () => setShowTerms(true) },
                { icon:'🔒', label:'Privacy Policy', sub:'How we handle your data', action: () => setShowPrivacy(true) },
              ].map((item, i, arr) => (
                <button key={item.label} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'transparent', border:'none', borderBottomWidth: i<arr.length-1?1:0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{item.label}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{item.sub}</div>
                  </div>
                  <span style={{ fontSize:14, color:'#d1d5db' }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── REVIEW MODAL ── */}
      {showReview && reviewVendor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:998, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowReview(false) }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <div style={{ width:40, height:4, borderRadius:2, background:'#e5e7eb' }} />
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1f2937', marginBottom:4 }}>Rate your experience</div>
            <div style={{ fontSize:12, color:'#9ca3af', marginBottom:16 }}>{reviewVendor.storeName}</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:18 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:36, color: s<=reviewRating?'#f59e0b':'#e5e7eb', transition:'all 0.15s', transform: s<=reviewRating?'scale(1.15)':'scale(1)' }}>
                  ★
                </button>
              ))}
            </div>
            <div style={{ textAlign:'center', fontSize:13, fontWeight:600, color:'#E24B4A', marginBottom:14 }}>
              {['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'][reviewRating]}
            </div>
            <textarea
              placeholder="Share your experience with other users..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={3}
              style={{ width:'100%', padding:'12px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:14, lineHeight:1.5 }}
            />
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              style={{ width:'100%', background: submittingReview?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}
            >
              {submittingReview ? 'Submitting...' : '⭐ Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* ── ORDER SUCCESS PAGE ── */}
      {orderSuccess && (
        <div style={{ position:'fixed', inset:0, background:'#fff', zIndex:999, overflowY:'auto', fontFamily:'Poppins,sans-serif', maxWidth:430, margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg, #16a34a, #15803d)', padding:'48px 24px 32px', textAlign:'center', color:'#fff' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 16px', border:'3px solid rgba(255,255,255,0.4)' }}>✅</div>
            <div style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Order Placed!</div>
            <div style={{ fontSize:13, opacity:0.9 }}>Your food is being prepared</div>
            <div style={{ marginTop:12, background:'rgba(255,255,255,0.2)', borderRadius:20, display:'inline-block', padding:'6px 18px' }}>
              <span style={{ fontSize:12, fontWeight:600 }}>Order #{orderSuccess.orderId}</span>
            </div>
          </div>
          <div style={{ padding:20 }}>
            <div style={{ background:'#f0fdf4', borderRadius:14, padding:16, marginBottom:16, display:'flex', alignItems:'center', gap:12, borderWidth:1, borderStyle:'solid', borderColor:'#bbf7d0' }}>
              <span style={{ fontSize:28 }}>🕐</span>
              <div>
                <div style={{ fontSize:13, color:'#6b7280' }}>Delivery Status</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#16a34a' }}>🚴 Your delivery is coming shortly!</div>
              </div>
            </div>
            <div style={{ background:'#fafafa', borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Vendor</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:12, overflow:'hidden', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {orderSuccess.vendorPhoto
                    ? <img src={orderSuccess.vendorPhoto} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:22 }}>🏪</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#1f2937' }}>{orderSuccess.vendorName}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>Preparing your order...</div>
                </div>
              </div>
              {orderSuccess.vendorPhone && (
                <div style={{ display:'flex', gap:10 }}>
                  <button
                    onClick={() => notifyVendorWhatsApp(orderSuccess.vendorPhone, { userName: orderSuccess.userName, userPhone: orderSuccess.userPhone || '', address: orderSuccess.address, items: orderSuccess.items, subtotal: orderSuccess.subtotal, deliveryFee: orderSuccess.deliveryFee, total: orderSuccess.total })}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', background:'#25D366', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Poppins' }}
                  >
                    <span style={{ fontSize:18 }}>💬</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => callVendor(orderSuccess.vendorPhone)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', background:'#E24B4A', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Poppins' }}
                  >
                    <span style={{ fontSize:18 }}>📞</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Call</span>
                  </button>
                </div>
              )}
            </div>
            <div style={{ background:'#fafafa', borderRadius:14, padding:16, marginBottom:16, borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb' }}>
              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Order Summary</div>
              {orderSuccess.items.map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottomWidth: i < orderSuccess.items.length-1 ? 1 : 0, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                  <span style={{ fontSize:13, color:'#374151' }}>{item.qty}x {item.name}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb' }}>
                <span style={{ fontSize:14, fontWeight:700 }}>Total Paid</span>
                <span style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>₹{orderSuccess.total}</span>
              </div>
              <div style={{ marginTop:6, fontSize:11, color:'#9ca3af' }}>💵 Cash on Delivery · 📍 {orderSuccess.address}</div>
            </div>
            <button
              onClick={() => { const latestOrder = orders[0]; setOrderSuccess(null); setTab('orders'); if(latestOrder) setTimeout(()=>setSelectedOrder(latestOrder), 100) }}
              style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:10 }}
            >
              📋 Track My Order
            </button>
            <button
              onClick={() => { setOrderSuccess(null); setTab('home') }}
              style={{ width:'100%', background:'transparent', color:'#6b7280', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      )}

      {/* ── SUPPORT MODAL ── */}
      {showSupport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowSupport(false) }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>💬 Contact Support</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>We typically reply within 24 hours</div>
              </div>
              <button onClick={() => setShowSupport(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:20 }}>
              {!supportSent ? (
                <>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:12, color:'#6b7280', fontWeight:500, marginBottom:6 }}>Category</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {['General','Order Issue','Payment','App Bug','Feedback','Other'].map(cat => (
                        <button key={cat} onClick={() => setSupportCategory(cat)}
                          style={{ padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:11, fontWeight:600,
                            background: supportCategory===cat ? '#E24B4A' : '#f3f4f6',
                            color: supportCategory===cat ? '#fff' : '#6b7280'
                          }}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12, color:'#6b7280', fontWeight:500, marginBottom:6 }}>Describe your issue *</div>
                    <textarea
                      value={supportMsg}
                      onChange={e => setSupportMsg(e.target.value)}
                      placeholder="Tell us what's wrong or what you need help with..."
                      rows={5}
                      style={{ width:'100%', padding:'12px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6 }}
                    />
                  </div>
                  <button onClick={handleSendSupport} disabled={sendingSupport}
                    style={{ width:'100%', background: sendingSupport?'#f09595':'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:16 }}>
                    {sendingSupport ? 'Sending...' : '📩 Send Support Request'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#1f2937', marginBottom:6 }}>Request Sent!</div>
                  <div style={{ fontSize:13, color:'#6b7280', marginBottom:20 }}>We'll reply to your email within 24 hours.</div>
                  <button onClick={() => setSupportSent(false)} style={{ background:'#f3f4f6', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', color:'#374151' }}>Send Another</button>
                </div>
              )}
              {myTickets.length > 0 && (
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Your Previous Requests</div>
                  {myTickets.map(ticket => (
                    <div key={ticket.id} style={{ background:'#f9fafb', borderRadius:12, padding:14, marginBottom:10, borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:10,
                          background: ticket.status==='resolved'?'#d1fae5': ticket.status==='replied'?'#dbeafe':'#fef3c7',
                          color: ticket.status==='resolved'?'#065f46': ticket.status==='replied'?'#1e40af':'#92400e'
                        }}>{ticket.status==='resolved'?'✅ Resolved': ticket.status==='replied'?'💬 Replied':'⏳ Open'}</span>
                        <span style={{ fontSize:10, color:'#9ca3af' }}>{ticket.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>📌 {ticket.category}</div>
                      <div style={{ fontSize:12, color:'#6b7280', marginBottom: ticket.founderReply ? 8 : 0 }}>{ticket.message}</div>
                      {ticket.founderReply ? (
                        <div style={{ background:'#eff6ff', borderRadius:8, padding:'10px 12px', borderLeftWidth:3, borderLeftStyle:'solid', borderLeftColor:'#3b82f6' }}>
                          <div style={{ fontSize:10, fontWeight:600, color:'#1e40af', marginBottom:4 }}>👑 FeedoZone Support</div>
                          <div style={{ fontSize:12, color:'#1e3a8a' }}>{ticket.founderReply}</div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TERMS & CONDITIONS MODAL ── */}
      {showTerms && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowTerms(false) }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>📜 Terms & Conditions</div>
              <button onClick={() => setShowTerms(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 40px', fontSize:13, color:'#374151', lineHeight:1.8 }}>
              <div style={{ fontSize:11, color:'#9ca3af', marginBottom:16 }}>Last updated: March 2026</div>
              {[
                { title:'1. Acceptance of Terms', body:'By using FeedoZone, you agree to these terms. If you do not agree, please do not use our platform.' },
                { title:'2. Service Description', body:'FeedoZone is a food ordering platform connecting users with local food vendors in Warananagar and surrounding areas.' },
                { title:'3. User Accounts', body:'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.' },
                { title:'4. Orders & Payment', body:'All orders are subject to vendor acceptance. Payments are currently Cash on Delivery (COD). Prices displayed include all applicable charges.' },
                { title:'5. Cancellation Policy', body:"Orders can be cancelled before the vendor accepts them. Once accepted, cancellations are at the vendor's discretion." },
                { title:'6. User Conduct', body:'You agree not to misuse the platform, place fake orders, or engage in any fraudulent activity. Violations may result in account suspension.' },
                { title:'7. Intellectual Property', body:'All content on FeedoZone including logos, designs, and text is owned by FeedoZone and may not be reproduced without permission.' },
                { title:'8. Limitation of Liability', body:'FeedoZone is not liable for any indirect or consequential damages arising from the use of our service.' },
                { title:'9. Changes to Terms', body:'We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the new terms.' },
                { title:'10. Contact', body:'For any questions about these terms, please contact us through the Support section.' },
              ].map(s => (
                <div key={s.title} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY POLICY MODAL ── */}
      {showPrivacy && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowPrivacy(false) }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ padding:'16px 20px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>🔒 Privacy Policy</div>
              <button onClick={() => setShowPrivacy(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 40px', fontSize:13, color:'#374151', lineHeight:1.8 }}>
              <div style={{ fontSize:11, color:'#9ca3af', marginBottom:16 }}>Last updated: March 2026</div>
              {[
                { title:'1. Information We Collect', body:'We collect your name, email, phone number, address, and order history to provide our food delivery service.' },
                { title:'2. How We Use Your Data', body:'Your data is used to process orders, improve our services, send order updates, and provide customer support.' },
                { title:'3. Data Sharing', body:'We do not sell your personal data. We share your delivery details with vendors only to fulfill your orders.' },
                { title:'4. Data Storage', body:'Your data is securely stored on Firebase (Google Cloud). We use industry-standard security measures to protect your information.' },
                { title:'5. Cookies', body:'We use local storage to remember your preferences such as language and location. No third-party tracking cookies are used.' },
                { title:'6. Your Rights', body:'You can request to view, update, or delete your personal data at any time by contacting our support team.' },
                { title:"7. Children's Privacy", body:'FeedoZone is not intended for children under 13. We do not knowingly collect data from children.' },
                { title:'8. Changes to Policy', body:'We may update this privacy policy from time to time. We will notify you of significant changes through the app.' },
                { title:'9. Contact Us', body:'For privacy-related concerns, reach us through the Contact Support section in the app.' },
              ].map(s => (
                <div key={s.title} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK MODAL ── */}
      {showFeedback && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setShowFeedback(false) }}>
          <div style={{ background:'#fff', borderRadius:'24px 24px 0 0', maxHeight:'90vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
              <div style={{ width:40, height:4, borderRadius:2, background:'#e5e7eb' }} />
            </div>
            <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:'#1f2937' }}>💡 Your Feedback</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>We read every message personally</div>
              </div>
              <button onClick={() => setShowFeedback(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'0 20px 40px' }}>
              {!feedbackSent ? (
                <>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, marginBottom:8 }}>Rate your overall experience</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setFeedbackRating(s)}
                          style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:18, background: s <= feedbackRating ? '#fef3c7' : '#f9fafb', transition:'all 0.15s', transform: s <= feedbackRating ? 'scale(1.1)' : 'scale(1)' }}>
                          {s <= feedbackRating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, marginBottom:8 }}>Type of feedback</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {[
                        { id:'suggestion', label:'💡 Suggestion', color:'#6366f1' },
                        { id:'bug', label:'🐛 Bug Report', color:'#ef4444' },
                        { id:'compliment', label:'❤️ Compliment', color:'#ec4899' },
                      ].map(tp => (
                        <button key={tp.id} onClick={() => setFeedbackType(tp.id)}
                          style={{ flex:1, padding:'8px 4px', borderRadius:10, cursor:'pointer', fontFamily:'Poppins', fontSize:10, fontWeight:700,
                            borderWidth:2, borderStyle:'solid',
                            borderColor: feedbackType===tp.id ? tp.color : '#e5e7eb',
                            background: feedbackType===tp.id ? tp.color + '15' : '#fff',
                            color: feedbackType===tp.id ? tp.color : '#9ca3af',
                          }}>
                          {tp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, marginBottom:8 }}>Your message *</div>
                    <textarea
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder={
                        feedbackType==='suggestion' ? 'What feature would make FeedoZone better for you?' :
                        feedbackType==='bug' ? 'Describe what went wrong...' :
                        'Tell us what you loved! 😊'
                      }
                      rows={4}
                      style={{ width:'100%', padding:'12px 14px', borderWidth:1.5, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6, color:'#1f2937' }}
                    />
                  </div>
                  <button onClick={handleSendFeedback} disabled={sendingFeedback}
                    style={{ width:'100%', background: sendingFeedback ? '#c4b5fd' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', padding:14, borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                    {sendingFeedback ? 'Sending...' : '📩 Send Feedback'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
                  <div style={{ fontSize:56, marginBottom:12 }}>🙏</div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#1f2937', marginBottom:8 }}>Thank You!</div>
                  <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:20 }}>Your feedback means a lot to us. We'll use it to make FeedoZone even better!</div>
                  <button onClick={() => setShowFeedback(false)}
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', padding:'12px 28px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                    Close
                  </button>
                </div>
              )}
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
          { id:'home',    icon:'🏠', label:t('Home','मुख्यपृष्ठ') },
          { id:'orders',  icon:'📋', label:t('Orders','ऑर्डर') },
          { id:'cart',    icon:'🛒', label:`${t('Cart','कार्ट')}${cartCount>0?` (${cartCount})`:''}` },
          { id:'profile', icon:'👤', label:t('Profile','प्रोफाइल') }
        ].map(item => (
          <button key={item.id} style={S.bnItem()} onClick={() => setTab(item.id)}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:10, color: tab===item.id?'#E24B4A':'#6b7280', fontWeight: tab===item.id?600:400 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}