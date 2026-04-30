import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getAllOrders, getAllVendors, founderCreateVendor,
  uploadPhoto, updateVendorStore, getBroadcastHistory
} from '../firebase/services'
import {
  doc, deleteDoc, getDocs, query, where, collection, addDoc,
  serverTimestamp, orderBy, limit, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'
import { useOrderAlert } from '../hooks/useOrderAlert'
import { usePendingOrderNotifier } from '../hooks/usePendingOrderNotifier'
import FounderBill from '../components/FounderBill'

// ─── EXPO PUSH HELPER (with FCM fallback) ────────────────────────────────────
// Uses your Vercel proxy which must forward to https://exp.host/--/api/v2/push/send
const PUSH_URL = 'https://feedo-ruddy.vercel.app/api/send-push'

async function sendPushBatch(notifications) {
  const res = await fetch(PUSH_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ notifications })
  })
  if (!res.ok) throw new Error(`Push proxy returned ${res.status}`)
  return res.json()
}

export default function FounderApp() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    storeName: '', email: '', phone: '', password: '',
    confirmPass: '', address: '', category: 'Thali',
    plan: '₹500/month', deliveryCharge: 30, town: ''
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newOrderAlert, setNewOrderAlert] = useState(null)
  const prevOrderCountRef = useRef(0)
  const { playNotifSound, startAlarm, stopAlarm, unlockAudio } = useOrderAlert()
  usePendingOrderNotifier(true)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  useEffect(() => {
    const unlock = () => { unlockAudio(); setAudioUnlocked(true) }
    document.addEventListener('click', unlock, { once: true })
    document.addEventListener('touchstart', unlock, { once: true })
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  const [analyticsTab, setAnalyticsTab] = useState('overview')
  const [orderFilter, setOrderFilter] = useState('all')
  const [users, setUsers] = useState([])

  // ── LOCATION FILTER STATE ─────────────────────────────────────────────
  const [selectedTown, setSelectedTown] = useState('all')

  // Support ticket states
  const [supportTickets, setSupportTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const [showFounderBill, setShowFounderBill] = useState(false)
  const [founderBillOrder, setFounderBillOrder] = useState(null)

  const [exportMonth, setExportMonth] = useState(new Date().getMonth())
  const [exportYear, setExportYear] = useState(new Date().getFullYear())

  // Photo states
  const [vendorPhotoFile, setVendorPhotoFile] = useState(null)
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState(null)
  const [photoProgress, setPhotoProgress] = useState(0)
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState(null)
  const [existingProgress, setExistingProgress] = useState(0)
  const photoRef = useRef()

  // Location for new vendor
  const [newVendorLoc, setNewVendorLoc] = useState(null)
  const [newVendorLocName, setNewVendorLocName] = useState('')
  const [locSearch, setLocSearch] = useState('')
  const [locSuggestions, setLocSuggestions] = useState([])
  const [searchingLoc, setSearchingLoc] = useState(false)
  const [detectingLoc, setDetectingLoc] = useState(false)

  // ── BROADCAST STATES ──────────────────────────────────────────────────
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastType, setBroadcastType] = useState('both')
  const [broadcastTarget, setBroadcastTarget] = useState('all')
  const [broadcastTemplate, setBroadcastTemplate] = useState('')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [broadcastProgress, setBroadcastProgress] = useState(0)
  const [broadcastDone, setBroadcastDone] = useState(null)
  const [broadcastHistory, setBroadcastHistory] = useState([])
  const [previewMode, setPreviewMode] = useState(false)

  // ── PUSH NOTIFICATION STATES ──────────────────────────────────────────
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushTarget, setPushTarget] = useState('all')
  const [pushTown, setPushTown] = useState('all')  // ← NEW: town-targeted push
  const [sendingPush, setSendingPush] = useState(false)
  const [pushDone, setPushDone] = useState(null)
  const [pushHistory, setPushHistory] = useState([])
  const [pushProgress, setPushProgress] = useState(0)
  const [pushTestMode, setPushTestMode] = useState(false) // ← NEW: test single push

  const PUSH_PRESETS = [
    { icon: '🌞', label: 'Lunch Time', title: '🍛 Hungry? Lunch Time!', body: 'Your favourite food is ready to order on FeedoZone! Order now 🚀' },
    { icon: '🌙', label: 'Dinner Time', title: '🌙 Dinner Time on FeedoZone!', body: 'Skip cooking tonight! Your favourite vendors are open. Order now 🍽️' },
    { icon: '🔥', label: 'Special Offer', title: '🔥 Special Offer Just for You!', body: "Check out today's deals on FeedoZone. Limited time only! 🎁" },
    { icon: '🎊', label: 'Weekend', title: '🎊 Happy Weekend!', body: 'Treat yourself this weekend! Order delicious food on FeedoZone 😋' },
    { icon: '🆕', label: 'New Vendor', title: '🆕 New Restaurant on FeedoZone!', body: 'A new restaurant just joined us! Explore their menu and order today 🍽️' },
    { icon: '⭐', label: 'Rate Us', title: '⭐ Enjoying FeedoZone?', body: 'Rate us on the Play Store and help us grow! It takes just 10 seconds 🙏' },
  ]

  const TEMPLATES = [
    { id: 'new_restaurant', label: '🍽️ New Restaurant', title: '🎉 New Restaurant on FeedoZone!', msg: `Hi {name}! 👋\n\nGreat news! A brand new restaurant has just joined FeedoZone near you! 🍽️\n\nExplore their fresh menu and place your first order today.\n\n👉 Open the FeedoZone app now!\n\nHappy eating! 😋\n— FeedoZone Team` },
    { id: 'order_more', label: '🛒 Order More', title: '😋 We Miss You!', msg: `Hi {name}! 🙏\n\nIt's been a while since your last order on FeedoZone! 😢\n\nYour favourite restaurants are waiting. Order now! 🚴\n\n— FeedoZone Team` },
    { id: 'offer', label: '🎁 Special Offer', title: '🎁 Special Offer Just For You!', msg: `Hi {name}! 🎉\n\nWe have a special offer waiting just for you on FeedoZone!\n\nOpen the app now! 🍕🍚🥘\n\n— FeedoZone Team 🔥` },
    { id: 'weekend', label: '🎊 Weekend Special', title: '🎊 Weekend is Here!', msg: `Hi {name}! 😄\n\nHappy Weekend! 🎉\n\nSkip the cooking! Open the app and order now! 🚀\n\n— FeedoZone Team` },
    { id: 'custom', label: '✏️ Custom', title: '', msg: '' }
  ]

  // ── FIRESTORE LISTENERS ───────────────────────────────────────────────
  useEffect(() => {
    const u1 = getAllOrders(setOrders)
    const u2 = getAllVendors(setVendors)

    const unsubUsers = onSnapshot(collection(db, 'users'), snap =>
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    const unsubTickets = onSnapshot(collection(db, 'supportTickets'), snap => {
      const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      tickets.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setSupportTickets(tickets)
    })

    try {
      const bq = query(collection(db, 'broadcastHistory'), orderBy('sentAt', 'desc'), limit(20))
      onSnapshot(bq, snap => setBroadcastHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    } catch (e) {}

    try {
      const pq = query(collection(db, 'pushHistory'), orderBy('sentAt', 'desc'), limit(20))
      onSnapshot(pq, snap => setPushHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    } catch (e) {}

    return () => { u1(); u2(); unsubUsers(); unsubTickets() }
  }, [])

  // ── NEW ORDER ALARM ───────────────────────────────────────────────────
  useEffect(() => {
    if (orders.length === 0) { prevOrderCountRef.current = 0; return }
    if (orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
      const latest = orders[0]
      setNewOrderAlert(latest)
      startAlarm()
      toast('🔔 New order from ' + latest.userName + ' — ₹' + latest.total, {
        duration: 8000, icon: '🍽️',
        style: { background: '#1f2937', color: '#fff', fontFamily: 'Poppins' }
      })
      setTimeout(() => stopAlarm(), 15000)
    }
    prevOrderCountRef.current = orders.length
  }, [orders])

  // ── DERIVED DATA ──────────────────────────────────────────────────────
  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  })
  const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
  const subRevenue = vendors.length * 500

  // ── TOWN HELPERS ──────────────────────────────────────────────────────
  // Extract unique towns from vendors
  const allTowns = [...new Set(
    vendors
      .map(v => v.town || v.locationName || null)
      .filter(Boolean)
  )].sort()

  // Filter vendors by selected town
  const filteredVendors = selectedTown === 'all'
    ? vendors
    : vendors.filter(v => (v.town || v.locationName) === selectedTown)

  // ── PUSH NOTIFICATION: get target users ──────────────────────────────
  const getPushTargetUsers = (target, town) => {
    let targetUsers = users
    if (target === 'active') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
      targetUsers = users.filter(u => activeUids.has(u.id))
    } else if (target === 'inactive') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
      targetUsers = users.filter(u => !activeUids.has(u.id))
    }
    // Town filter — users who ordered from vendors in that town
    if (town && town !== 'all') {
      const townVendorIds = new Set(vendors.filter(v => (v.town || v.locationName) === town).map(v => v.id))
      const townUserUids = new Set(orders.filter(o => townVendorIds.has(o.vendorUid)).map(o => o.userUid))
      targetUsers = targetUsers.filter(u => townUserUids.has(u.id))
    }
    return targetUsers
  }

  const getPushTargetCount = (t) => getPushTargetUsers(t, pushTown).length
  const usersWithTokenCount = users.filter(u => u.expoPushToken && u.expoPushToken.startsWith('ExponentPushToken')).length

  // ── PUSH SEND HANDLER ─────────────────────────────────────────────────
  // KEY FIX: proper Expo push payload with android channel and sound
  const handleSendPush = async () => {
    if (!pushTitle.trim()) return toast.error('Enter a notification title')
    if (!pushBody.trim()) return toast.error('Enter a notification message')

    setSendingPush(true)
    setPushProgress(0)
    setPushDone(null)

    try {
      const targetUsers = getPushTargetUsers(pushTarget, pushTown)
      const usersWithTokens = targetUsers.filter(u =>
        u.expoPushToken && u.expoPushToken.startsWith('ExponentPushToken')
      )
      const noToken = targetUsers.length - usersWithTokens.length

      if (usersWithTokens.length === 0) {
        toast.error('No users have push tokens! Ask them to install & open the app.')
        setSendingPush(false)
        return
      }

      const tokens = usersWithTokens.map(u => u.expoPushToken)
      // Batch into groups of 100 (Expo limit)
      const batches = []
      for (let i = 0; i < tokens.length; i += 100) batches.push(tokens.slice(i, i + 100))

      let sent = 0, failed = 0

      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi]
        try {
          // ✅ CORRECT EXPO PUSH PAYLOAD — this is what makes it work on killed apps
          const notifications = batch.map(token => ({
            to: token,
            title: pushTitle.trim(),
            body: pushBody.trim(),
            sound: 'default',          // required for iOS
            priority: 'high',          // required for Android background
            channelId: 'default',      // must match your app's notification channel
            badge: 1,
            data: {                    // extra data your app can use
              type: 'broadcast',
              screen: 'Home',
            },
            // Android-specific — makes it show even when app is killed
            android: {
              channelId: 'default',
              priority: 'high',
              sound: 'default',
            },
          }))

          const result = await sendPushBatch(notifications)

          if (result?.data) {
            result.data.forEach(r => {
              if (r.status === 'ok') sent++
              else {
                failed++
                // Log Expo push errors to console for debugging
                console.warn('Push error for token:', r.details || r.message)
              }
            })
          } else {
            sent += batch.length
          }
        } catch (batchErr) {
          console.error('Batch failed:', batchErr)
          failed += batch.length
        }

        setPushProgress(Math.round(((bi + 1) / batches.length) * 100))
      }

      // Save history
      await addDoc(collection(db, 'pushHistory'), {
        title: pushTitle, body: pushBody,
        target: pushTarget,
        town: pushTown !== 'all' ? pushTown : 'all',
        totalUsers: targetUsers.length,
        sent, failed, noToken,
        sentAt: serverTimestamp(),
        sentBy: user?.email || 'founder'
      })

      setPushDone({ sent, failed, noToken, total: targetUsers.length })
      toast.success(`✅ Push sent to ${sent} users!`)

    } catch (err) {
      console.error('Push broadcast failed:', err)
      toast.error('Push failed: ' + err.message)
    }

    setSendingPush(false)
  }

  // ── TEST PUSH to yourself ─────────────────────────────────────────────
  const handleTestPush = async () => {
    const myUser = users.find(u => u.email === user?.email)
    if (!myUser?.expoPushToken) {
      toast.error("You don't have a push token. Install the app and log in first.")
      return
    }
    try {
      const result = await sendPushBatch([{
        to: myUser.expoPushToken,
        title: pushTitle || '🧪 Test Push from FeedoZone',
        body: pushBody || 'If you see this, push notifications are working! ✅',
        sound: 'default',
        priority: 'high',
        channelId: 'default',
        data: { type: 'test' },
        android: { channelId: 'default', priority: 'high', sound: 'default' },
      }])
      if (result?.data?.[0]?.status === 'ok') toast.success('✅ Test push sent to your device!')
      else toast.error('Test push error: ' + JSON.stringify(result?.data?.[0]))
    } catch (err) {
      toast.error('Test failed: ' + err.message)
    }
  }

  // ── BROADCAST HELPERS ─────────────────────────────────────────────────
  const getBroadcastUsers = () => {
    if (broadcastTarget === 'all') return users
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
    if (broadcastTarget === 'active') return users.filter(u => activeUids.has(u.id))
    return users.filter(u => !activeUids.has(u.id))
  }

  const sendWhatsAppToUser = (phone, name, message) => {
    const personalised = message.replace(/{name}/g, name || 'there')
    const encoded = encodeURIComponent(personalised)
    const number = phone.replace(/\D/g, '')
    const fullNumber = number.startsWith('91') ? number : '91' + number
    return `https://wa.me/${fullNumber}?text=${encoded}`
  }

  const handleBroadcast = async () => {
    const targetUsers = getBroadcastUsers()
    if (!broadcastMsg.trim()) return toast.error('Please write a message first')
    if (targetUsers.length === 0) return toast.error('No users found to send to')
    const sendViaWP = broadcastType === 'whatsapp' || broadcastType === 'both'
    const sendViaEmail = broadcastType === 'email' || broadcastType === 'both'
    setSendingBroadcast(true); setBroadcastProgress(0); setBroadcastDone(null)
    let sent = 0
    try {
      await addDoc(collection(db, 'broadcastHistory'), {
        title: broadcastTitle || 'Broadcast', message: broadcastMsg,
        type: broadcastType, target: broadcastTarget,
        totalUsers: targetUsers.length, sentAt: serverTimestamp(), sentBy: user?.email || 'founder'
      })
      if (sendViaWP) {
        const wpUsers = targetUsers.filter(u => u.mobile || u.phone)
        if (wpUsers.length === 0) { toast.error('No users have WhatsApp numbers saved') }
        else {
          wpUsers.slice(0, 3).forEach((u, i) => {
            setTimeout(() => window.open(sendWhatsAppToUser(u.mobile || u.phone, u.name, broadcastMsg), '_blank'), i * 800)
          })
          sent += wpUsers.length
          if (wpUsers.length > 3) toast(`📱 Opened 3 chats. ${wpUsers.length - 3} more in list below.`, { duration: 5000 })
        }
      }
      if (sendViaEmail) {
        const emUsers = targetUsers.filter(u => u.email)
        if (emUsers.length === 0) { toast.error('No users have email addresses') }
        else {
          const bccList = emUsers.slice(0, 50).map(u => u.email).join(',')
          const personalised = broadcastMsg.replace(/{name}/g, 'there')
          window.open(`mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(broadcastTitle || 'Message from FeedoZone')}&body=${encodeURIComponent(personalised)}`, '_blank')
          sent += emUsers.length
        }
      }
      setBroadcastProgress(100)
      setBroadcastDone({ sent, wpCount: sendViaWP ? targetUsers.filter(u => u.mobile || u.phone).length : 0, emailCount: sendViaEmail ? targetUsers.filter(u => u.email).length : 0 })
      toast.success(`✅ Broadcast sent to ${sent} users!`)
    } catch (err) { toast.error('Broadcast failed: ' + err.message) }
    setSendingBroadcast(false)
  }

  // ── LOCATION HELPERS ──────────────────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || 'Location'
    } catch { return 'Location' }
  }

  const handleDetectVendorLoc = async () => {
    setDetectingLoc(true)
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }))
      const lat = pos.coords.latitude, lng = pos.coords.longitude
      const name = await reverseGeocode(lat, lng)
      setNewVendorLoc({ lat, lng })
      setNewVendorLocName(name)
      toast.success(`📍 ${name}`)
    } catch { toast.error('Could not detect location') }
    setDetectingLoc(false)
  }

  const handleLocSearch = async (q) => {
    setLocSearch(q)
    if (q.length < 3) { setLocSuggestions([]); return }
    setSearchingLoc(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocSuggestions(data.map(d => ({ name: d.display_name.split(',').slice(0, 3).join(', '), lat: parseFloat(d.lat), lng: parseFloat(d.lon) })))
    } catch { setLocSuggestions([]) }
    setSearchingLoc(false)
  }

  const handleSelectVendorLoc = (s) => {
    setNewVendorLoc({ lat: s.lat, lng: s.lng })
    const town = s.name.split(',')[0]
    setNewVendorLocName(town)
    setForm(p => ({ ...p, town }))
    setLocSearch(''); setLocSuggestions([])
    toast.success(`📍 ${town}`)
  }

  // ── PHOTO HANDLERS ────────────────────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setVendorPhotoFile(file)
    setVendorPhotoPreview(URL.createObjectURL(file))
  }

  const handleExistingVendorPhoto = async (e, vendorId) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setUploadingPhotoFor(vendorId); setExistingProgress(0)
    try {
      const url = await uploadPhoto(file, setExistingProgress)
      await updateVendorStore(vendorId, { photo: url })
      toast.success('Vendor photo updated! ✅')
    } catch { toast.error('Upload failed.') }
    setUploadingPhotoFor(null); setExistingProgress(0); e.target.value = ''
  }

  // ── CREATE VENDOR ─────────────────────────────────────────────────────
  const f = field => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  const handleCreate = async () => {
    const { storeName, email, password, confirmPass, plan, category, address, phone, town } = form
    if (!storeName) return toast.error('Store name required')
    if (!email) return toast.error('Email required')
    if (!password) return toast.error('Password required')
    if (password.length < 6) return toast.error('Password must be 6+ characters')
    if (password !== confirmPass) return toast.error('Passwords do not match')
    setCreating(true)
    try {
      const vendorUid = await founderCreateVendor(user.uid, {
        email, password, storeName, address, phone, plan, category,
        location: newVendorLoc,
        locationName: newVendorLocName,
        town: town || newVendorLocName || '',   // ← save town for filter
        deliveryCharge: Number(form.deliveryCharge) || 30
      })
      if (vendorPhotoFile && vendorUid) {
        setPhotoProgress(0)
        const photoUrl = await uploadPhoto(vendorPhotoFile, setPhotoProgress)
        await updateVendorStore(vendorUid, { photo: photoUrl })
      }
      toast.success(`✅ Vendor "${storeName}" created!`)
      setForm({ storeName: '', email: '', phone: '', password: '', confirmPass: '', address: '', category: 'Thali', plan: '₹500/month', deliveryCharge: '30', town: '' })
      setVendorPhotoFile(null); setVendorPhotoPreview(null); setPhotoProgress(0)
      setNewVendorLoc(null); setNewVendorLocName(''); setLocSearch(''); setLocSuggestions([])
      setTab('vendors')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'This email is already registered'
        : err.code === 'auth/invalid-email' ? 'Invalid email format'
        : err.message || 'Failed to create vendor'
      toast.error(msg)
    } finally { setCreating(false) }
  }

  // ── SUPPORT TICKETS ───────────────────────────────────────────────────
  const handleReplyTicket = async (ticketId, status = 'replied') => {
    if (!replyText.trim()) return toast.error('Enter your reply')
    setSendingReply(true)
    try {
      const { doc: fDoc, updateDoc: fUpdate, serverTimestamp: fTs } = await import('firebase/firestore')
      await fUpdate(fDoc(db, 'supportTickets', ticketId), { founderReply: replyText.trim(), status, repliedAt: fTs() })
      setReplyText(''); setSelectedTicket(null)
      toast.success('Reply sent! ✅')
    } catch { toast.error('Failed to send reply') }
    setSendingReply(false)
  }

  // ── ORDERS ────────────────────────────────────────────────────────────
  const handleDeleteOrder = async (orderId, e) => {
    e?.stopPropagation()
    if (!window.confirm('Delete this order? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'orders', orderId))
      if (selectedOrder?.id === orderId) setSelectedOrder(null)
      toast.success('Order deleted ✅')
    } catch { toast.error('Failed to delete order') }
  }

  const handleDeleteVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Delete "${vendorName}"? This cannot be undone!`)) return
    try {
      await deleteDoc(doc(db, 'vendors', vendorId))
      await deleteDoc(doc(db, 'users', vendorId))
      toast.success(`"${vendorName}" deleted!`)
    } catch (err) { toast.error('Delete failed: ' + err.message) }
  }

  // ── EXPORT ────────────────────────────────────────────────────────────
  const exportToExcel = (type) => {
    let data = []
    let filename = ''
    const formatDate = (o) => o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || ''
    const formatTime = (o) => o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || ''
    if (type === 'monthly') {
      data = orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && d.getMonth() === exportMonth && d.getFullYear() === exportYear })
      const monthName = new Date(exportYear, exportMonth).toLocaleString('en-IN', { month: 'long' })
      filename = `FeedoZone_Orders_${monthName}_${exportYear}.csv`
    } else if (type === 'today') {
      const today = new Date()
      data = orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() })
      filename = `FeedoZone_Orders_Today_${today.toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`
    } else { data = [...orders]; filename = 'FeedoZone_All_Orders.csv' }
    if (data.length === 0) return toast.error('No orders found for selected period!')
    const headers = ['Bill No', 'Order Date', 'Order Time', 'Customer Name', 'Customer Phone', 'Vendor', 'Items', 'Subtotal', 'Delivery Fee', 'Total', 'Payment', 'Status', 'Address']
    const rows = data.map(o => [
      (o.billNo || 'FZ-' + (o.id?.slice(-6) || '').toUpperCase()),
      formatDate(o), formatTime(o), o.userName || '', o.userPhone || '', o.vendorName || '',
      o.items?.map(i => i.qty + 'x ' + i.name).join(' | ') || '',
      o.subtotal || '', o.deliveryFee || '', o.total || '', o.paymentMode || 'COD', o.status || '',
      (o.address || '').replace(/,/g, ';')
    ])
    const totalRevenue = data.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
    rows.push([], ['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Total Orders', data.length, '', '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Delivered', data.filter(o => o.status === 'delivered').length, '', '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Cancelled', data.filter(o => o.status === 'cancelled').length, '', '', '', '', '', '', '', '', '', '', ''])
    rows.push(['Total Revenue (Delivered)', '', '', '', '', '', '', '', '', '₹' + totalRevenue, '', '', ''])
    const csvContent = [headers, ...rows].map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    toast.success(`✅ Downloaded: ${filename}`)
  }

  const exportVendorWise = () => {
    if (vendors.length === 0) return toast.error('No vendors found!')
    const rows = [['Vendor Name', 'Email', 'Phone', 'Category', 'Plan', 'Town', 'Total Orders', 'Delivered', 'Revenue', 'Status']]
    vendors.forEach(v => {
      const vOrders = orders.filter(o => o.vendorUid === v.id)
      const delivered = vOrders.filter(o => o.status === 'delivered')
      const revenue = delivered.reduce((s, o) => s + (o.total || 0), 0)
      rows.push([v.storeName || '', v.email || '', v.phone || '', v.category || '', v.plan || '', v.town || v.locationName || '', vOrders.length, delivered.length, '₹' + revenue, v.isOpen ? 'Open' : 'Closed'])
    })
    const csvContent = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'FeedoZone_Vendor_Report.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('✅ Vendor report downloaded!')
  }

  const getMostOrdered = () => {
    const counts = {}
    orders.forEach(o => { o.items?.forEach(item => { counts[item.name] = (counts[item.name] || 0) + item.qty }) })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }))
  }

  // ── STYLES ────────────────────────────────────────────────────────────
  const inp = {
    width: '100%', padding: '11px 13px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb',
    borderRadius: 9, fontSize: 13, fontFamily: 'Poppins,sans-serif',
    outline: 'none', marginTop: 4, boxSizing: 'border-box'
  }

  const targetUsers = getBroadcastUsers()

  // ── TOWN STATS (for vendor list header) ──────────────────────────────
  const townStats = allTowns.map(town => {
    const tvs = vendors.filter(v => (v.town || v.locationName) === town)
    return { town, count: tvs.length, open: tvs.filter(v => v.isOpen).length }
  })

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins,sans-serif' }}>

      {/* ── NEW ORDER ALERT ── */}
      {newOrderAlert && (
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '100%', maxWidth: 430, padding: '12px 16px', background: 'linear-gradient(135deg,#E24B4A,#c73232)', fontFamily: 'Poppins,sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>New Order — ₹{newOrderAlert.total}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{newOrderAlert.userName} · {newOrderAlert.vendorName}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { stopAlarm(); setTab('orders'); setSelectedOrder(newOrderAlert); setNewOrderAlert(null) }} style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>View</button>
              <button onClick={() => { stopAlarm(); setNewOrderAlert(null) }} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ background: '#111', padding: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, background: '#E24B4A', borderRadius: '50%' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>FeedoZone</span>
          <span style={{ fontSize: 11, color: '#555' }}>👑 Founder</span>
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Warananagar, Kolhapur</div>
      </div>

      {/* ── NAV ── */}
      <div style={{ display: 'flex', background: '#0a0a0a', overflowX: 'auto', flexShrink: 0 }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'orders', label: `Orders (${todayOrders.length})` },
          { id: 'vendors', label: `Vendors (${vendors.length})` },
          { id: 'addvendor', label: '+ Add Vendor' },
          { id: 'push', label: `🔔 Push${usersWithTokenCount > 0 ? ` (${usersWithTokenCount})` : ''}` },
          { id: 'broadcast', label: `📣 Broadcast${users.length > 0 ? ` (${users.length})` : ''}` },
          { id: 'support', label: `💬 Support${supportTickets.filter(t => t.status === 'open').length > 0 ? ` (${supportTickets.filter(t => t.status === 'open').length})` : ''}` },
          { id: 'analytics', label: '📊 Analytics' }
        ].map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{
            flexShrink: 0, padding: '11px 14px', fontSize: 12, fontWeight: 500,
            color: tab === t2.id ? '#E24B4A' : '#666',
            borderBottomWidth: 2, borderBottomStyle: 'solid',
            borderBottomColor: tab === t2.id ? '#E24B4A' : 'transparent',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            background: 'transparent', cursor: 'pointer',
            fontFamily: 'Poppins', whiteSpace: 'nowrap'
          }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {/* ════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#E24B4A', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Today Orders</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>{todayOrders.length}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>live updates</div>
              </div>
              {[
                { label: 'Today Revenue', val: `₹${todayRevenue.toLocaleString()}`, sub: `avg ₹${todayOrders.length ? Math.round(todayRevenue / todayOrders.length) : 0}` },
                { label: 'Subscriptions', val: `₹${subRevenue.toLocaleString()}`, sub: 'this month' },
                { label: 'Active Vendors', val: `${vendors.filter(v => v.isOpen).length}/${vendors.length}`, sub: `${vendors.length - vendors.filter(v => v.isOpen).length} offline` }
              ].map(s => (
                <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Town-wise summary */}
            {allTowns.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>📍 Vendors by Town</div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {townStats.map(ts => (
                    <div key={ts.town} onClick={() => { setTab('vendors'); setSelectedTown(ts.town) }}
                      style={{ flexShrink: 0, background: '#fff', borderRadius: 10, padding: '10px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', cursor: 'pointer', minWidth: 100, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{ts.count}</div>
                      <div style={{ fontSize: 11, color: '#374151', fontWeight: 500, marginBottom: 2 }}>{ts.town}</div>
                      <div style={{ fontSize: 10, color: '#16a34a' }}>● {ts.open} open</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => logoutUser()} style={{ width: '100%', background: 'transparent', color: '#E24B4A', borderWidth: 1, borderStyle: 'solid', borderColor: '#E24B4A', padding: 11, borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>Logout</button>

            {/* Excel Export */}
            <div style={{ marginTop: 16, background: '#f9fafb', borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>📊</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>Export to Excel</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {[
                  { icon: '📅', label: "Today's Orders", sub: `${todayOrders.length} orders · ₹${todayRevenue}`, fn: () => exportToExcel('today') },
                  { icon: '📦', label: 'All Orders', sub: `${orders.length} total orders`, fn: () => exportToExcel('all') },
                  { icon: '🏪', label: 'Vendor-wise Report', sub: `${vendors.length} vendors`, fn: exportVendorWise },
                ].map(b => (
                  <button key={b.label} onClick={b.fn} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', textAlign: 'left' }}>
                    <span style={{ fontSize: 18 }}>{b.icon}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{b.label}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{b.sub}</div></div>
                    <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>↓ Download</span>
                  </button>
                ))}
              </div>
              <div style={{ background: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>📆 Monthly Export</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <select value={exportMonth} onChange={e => setExportMonth(Number(e.target.value))} style={{ flex: 1, padding: '9px 10px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 8, fontSize: 12, fontFamily: 'Poppins', outline: 'none', background: '#fff' }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={exportYear} onChange={e => setExportYear(Number(e.target.value))} style={{ width: 90, padding: '9px 10px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 8, fontSize: 12, fontFamily: 'Poppins', outline: 'none', background: '#fff' }}>
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button onClick={() => exportToExcel('monthly')} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                  📊 Download Monthly Report
                </button>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: PUSH NOTIFICATIONS  (FIXED)
        ════════════════════════════════════════════════════════ */}
        {tab === 'push' && (
          <>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 14, padding: 16, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 60, opacity: 0.08 }}>🔔</div>
              <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>Zomato-style Notifications</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Push Notifications</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>Send instant push to users' phones — even when app is closed.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[
                  { val: users.length, label: 'Total Users', color: '#fff' },
                  { val: usersWithTokenCount, label: 'Can Receive', color: '#34d399' },
                  { val: users.length - usersWithTokenCount, label: 'No Token Yet', color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FCM SETUP WARNING ── */}
            <div style={{ background: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>⚙️ For Background Notifications to Work</div>
              <div style={{ fontSize: 11, color: '#78350f', lineHeight: 1.7 }}>
                1. Go to <strong>expo.dev → your project → Credentials → Android</strong><br />
                2. Upload your <strong>google-services.json</strong> FCM key there<br />
                3. Rebuild your APK with <strong>eas build -p android</strong><br />
                4. Make sure your app has <strong>notification channel "default"</strong> configured<br />
                5. Test with the button below ↓
              </div>
            </div>

            {/* Test Push Button */}
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>🧪 Test Push to Yourself First</div>
              <div style={{ fontSize: 11, color: '#166534', marginBottom: 10, lineHeight: 1.5 }}>
                Send a test notification to your own phone to verify everything works before mass sending.
              </div>
              <button onClick={handleTestPush} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>
                🧪 Send Test Push to My Phone
              </button>
            </div>

            {/* No token warning */}
            {usersWithTokenCount === 0 && (
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>⚠️ No Push Tokens Yet</div>
                <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>
                  Users need to install your APK and allow notifications. Once they open the app, their token is saved automatically.
                </div>
              </div>
            )}

            {/* Success result */}
            {pushDone && (
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10 }}>✅ Push Notification Sent!</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>{pushDone.sent}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Delivered</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{pushDone.noToken}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>No Token</div>
                  </div>
                  {pushDone.failed > 0 && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}>{pushDone.failed}</div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>Failed</div>
                    </div>
                  )}
                </div>
                <button onClick={() => setPushDone(null)} style={{ width: '100%', background: 'transparent', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 10 }}>
                  Send Another
                </button>
              </div>
            )}

            {/* Step 1: Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>1</span>
                Quick Presets
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {PUSH_PRESETS.map(p => (
                  <button key={p.label} onClick={() => { setPushTitle(p.title); setPushBody(p.body) }}
                    style={{ padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: pushTitle === p.title ? '#E24B4A' : '#e5e7eb', background: pushTitle === p.title ? '#fff5f5' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 3 }}>{p.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: pushTitle === p.title ? '#E24B4A' : '#374151' }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Target Audience */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>2</span>
                Target Audience
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {[
                  { id: 'all', label: 'All Users', icon: '👥' },
                  { id: 'active', label: 'Active (30d)', icon: '🔥' },
                  { id: 'inactive', label: 'Inactive', icon: '😴' },
                ].map(t => (
                  <button key={t.id} onClick={() => setPushTarget(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: pushTarget === t.id ? '#E24B4A' : '#e5e7eb', background: pushTarget === t.id ? '#fff5f5' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: pushTarget === t.id ? '#E24B4A' : '#1f2937' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{getPushTargetCount(t.id)} users</div>
                  </button>
                ))}
              </div>

              {/* Town filter for push */}
              {allTowns.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>📍 Filter by Town (optional)</div>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                    <button onClick={() => setPushTown('all')} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: pushTown === 'all' ? '#E24B4A' : '#f3f4f6', color: pushTown === 'all' ? '#fff' : '#6b7280' }}>
                      All Towns
                    </button>
                    {allTowns.map(town => (
                      <button key={town} onClick={() => setPushTown(town)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: pushTown === town ? '#E24B4A' : '#f3f4f6', color: pushTown === town ? '#fff' : '#6b7280' }}>
                        📍 {town}
                      </button>
                    ))}
                  </div>
                  {pushTown !== 'all' && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280', background: '#f9fafb', borderRadius: 8, padding: '6px 10px' }}>
                      Targeting users who ordered from <strong>{pushTown}</strong> vendors
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Write Message */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>3</span>
                Write Notification
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Title (bold text users see first)</label>
                <input style={inp} placeholder="e.g. 🍛 Lunch Time! Order now on FeedoZone" value={pushTitle} onChange={e => setPushTitle(e.target.value)} />
                <div style={{ fontSize: 10, color: pushTitle.length > 65 ? '#dc2626' : '#9ca3af', textAlign: 'right', marginTop: 2 }}>
                  {pushTitle.length}/65 {pushTitle.length > 65 ? '— too long!' : ''}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Message body</label>
                <textarea value={pushBody} onChange={e => setPushBody(e.target.value)}
                  placeholder="e.g. Your favourite vendors are waiting. Order now! 🚀"
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, color: '#1f2937', marginTop: 4 }}
                />
                <div style={{ fontSize: 10, color: pushBody.length > 200 ? '#dc2626' : '#9ca3af', textAlign: 'right', marginTop: 2 }}>
                  {pushBody.length}/200 {pushBody.length > 200 ? '— keep it short!' : ''}
                </div>
              </div>
            </div>

            {/* Phone Preview */}
            {(pushTitle || pushBody) && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>📱 Phone Preview</div>
                <div style={{ background: '#1f2937', borderRadius: 16, padding: 14 }}>
                  <div style={{ background: '#374151', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, background: '#E24B4A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 14 }}>🍽️</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>FeedoZone</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>now</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{pushTitle || 'Your notification title'}</div>
                    <div style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.4 }}>{pushBody || 'Your notification message...'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>Ready to push?</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    Sending to <strong>{getPushTargetCount(pushTarget)} users</strong>
                    {pushTown !== 'all' && <span style={{ color: '#E24B4A' }}> in {pushTown}</span>}
                    {' · '}<strong style={{ color: '#34d399' }}>{Math.min(usersWithTokenCount, getPushTargetCount(pushTarget))} can receive</strong>
                  </div>
                </div>
                <div style={{ background: '#dbeafe', borderRadius: 20, padding: '4px 10px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af' }}>Instant delivery</span>
                </div>
              </div>

              {sendingPush && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: '#e5e7eb', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 6 }}>
                    <div style={{ height: '100%', background: '#E24B4A', width: `${pushProgress}%`, transition: 'width 0.3s', borderRadius: 8 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>Sending... {pushProgress}%</div>
                </div>
              )}

              <button
                onClick={handleSendPush}
                disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px 0',
                  background: (sendingPush || !pushTitle.trim() || !pushBody.trim()) ? '#d1d5db' : 'linear-gradient(135deg,#E24B4A,#c73232)',
                  color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700,
                  cursor: (sendingPush || !pushTitle.trim() || !pushBody.trim()) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins'
                }}
              >
                <span style={{ fontSize: 20 }}>🔔</span>
                {sendingPush ? `Sending... ${pushProgress}%` : `Send Push to ${getPushTargetCount(pushTarget)} Users`}
              </button>

              <div style={{ marginTop: 10, padding: '8px 12px', background: '#eff6ff', borderRadius: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#bfdbfe' }}>
                <div style={{ fontSize: 11, color: '#1e40af', lineHeight: 1.7 }}>
                  ✅ <strong>Instant:</strong> Delivered in seconds, even when app is closed<br />
                  ✅ <strong>Free:</strong> Uses Expo push service, no cost<br />
                  ✅ <strong>Town filter:</strong> Target users by specific town/area
                </div>
              </div>
            </div>

            {/* Push History */}
            {pushHistory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>📋 Recent Push Notifications</div>
                {pushHistory.slice(0, 8).map(p => (
                  <div key={p.id} style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', flex: 1, marginRight: 8 }}>{p.title}</div>
                      <div style={{ background: '#dcfce7', borderRadius: 10, padding: '2px 8px', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>✅ {p.sent || 0} sent</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{p.body}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>
                      {p.target}{p.town && p.town !== 'all' ? ` · 📍 ${p.town}` : ''} users · {p.sentAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: BROADCAST (WhatsApp / Email)
        ════════════════════════════════════════════════════════ */}
        {tab === 'broadcast' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#2d1a00)', borderRadius: 14, padding: '16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 60, opacity: 0.08 }}>📣</div>
              <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>Customer Retention</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Broadcast Message</div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>Send WhatsApp or Email to all your users at once.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[
                  { val: users.length, label: 'Total Users', color: '#fff' },
                  { val: users.filter(u => u.mobile || u.phone).length, label: 'Have WhatsApp', color: '#4ade80' },
                  { val: users.filter(u => u.email).length, label: 'Have Email', color: '#60a5fa' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {broadcastDone && (
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Broadcast Sent!</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {broadcastDone.wpCount > 0 && <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#25D366' }}>{broadcastDone.wpCount}</div><div style={{ fontSize: 10, color: '#6b7280' }}>WhatsApp</div></div>}
                  {broadcastDone.emailCount > 0 && <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{broadcastDone.emailCount}</div><div style={{ fontSize: 10, color: '#6b7280' }}>Email</div></div>}
                </div>
                <button onClick={() => setBroadcastDone(null)} style={{ width: '100%', background: 'transparent', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 10 }}>Send Another</button>
              </div>
            )}

            {/* Template */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>1</span>
                Choose a Template
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id}
                    onClick={() => { setBroadcastTemplate(t.id); if (t.id !== 'custom') { setBroadcastMsg(t.msg); setBroadcastTitle(t.title) } else { setBroadcastMsg(''); setBroadcastTitle('') } }}
                    style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', borderWidth: 1.5, borderStyle: 'solid', borderColor: broadcastTemplate === t.id ? '#E24B4A' : '#e5e7eb', background: broadcastTemplate === t.id ? '#fff5f5' : '#fff', color: broadcastTemplate === t.id ? '#E24B4A' : '#6b7280' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>2</span>
                Target Audience
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'all', label: 'All Users', count: users.length, icon: '👥' }, { id: 'active', label: 'Active (30d)', count: getPushTargetCount('active'), icon: '🔥' }, { id: 'inactive', label: 'Inactive', count: getPushTargetCount('inactive'), icon: '😴' }].map(t => (
                  <button key={t.id} onClick={() => setBroadcastTarget(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: broadcastTarget === t.id ? '#E24B4A' : '#e5e7eb', background: broadcastTarget === t.id ? '#fff5f5' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: broadcastTarget === t.id ? '#E24B4A' : '#1f2937' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginTop: 1 }}>{t.count} users</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Send Via */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>3</span>
                Send Via
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366', count: users.filter(u => u.mobile || u.phone).length }, { id: 'email', label: 'Email', icon: '📧', color: '#3b82f6', count: users.filter(u => u.email).length }, { id: 'both', label: 'Both', icon: '🚀', color: '#E24B4A', count: users.length }].map(t => (
                  <button key={t.id} onClick={() => setBroadcastType(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: broadcastType === t.id ? t.color : '#e5e7eb', background: broadcastType === t.id ? t.color + '15' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: broadcastType === t.id ? t.color : '#1f2937' }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{t.count} users</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Write Message */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#E24B4A', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>4</span>
                Write Your Message
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Subject / Title</label>
                <input style={inp} placeholder="e.g. 🎉 New restaurant on FeedoZone!" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
              </div>
              <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                placeholder={`Write your message here...\n\nTip: Use {name} to personalise!`}
                rows={8}
                style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, color: '#1f2937' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '7px 10px', background: '#fef3c7', borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>💡</span>
                <span style={{ fontSize: 11, color: '#92400e' }}>Write <strong>{'{name}'}</strong> — replaced with each user's real name!</span>
              </div>
            </div>

            {broadcastMsg && (
              <div style={{ marginBottom: 14 }}>
                <button onClick={() => setPreviewMode(p => !p)} style={{ width: '100%', padding: '9px 0', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: previewMode ? 8 : 0 }}>
                  {previewMode ? '▲ Hide Preview' : '👁️ Preview Message'}
                </button>
                {previewMode && (
                  <div style={{ background: '#dcfce7', borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', marginBottom: 8, letterSpacing: 0.5 }}>PREVIEW</div>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#1f2937', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {broadcastMsg.replace(/{name}/g, users[0]?.name || 'Arjun')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>Ready to send?</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    Sending to <strong>{targetUsers.length} users</strong> via <strong>{broadcastType === 'both' ? 'WhatsApp + Email' : broadcastType}</strong>
                  </div>
                </div>
                <div style={{ background: targetUsers.length > 0 ? '#dcfce7' : '#fee2e2', borderRadius: 20, padding: '4px 10px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: targetUsers.length > 0 ? '#16a34a' : '#dc2626' }}>{targetUsers.length} recipients</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(broadcastType === 'whatsapp' || broadcastType === 'both') && (
                  <button onClick={handleBroadcast} disabled={sendingBroadcast || !broadcastMsg.trim() || targetUsers.length === 0}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: (!broadcastMsg.trim() || sendingBroadcast) ? '#d1d5db' : '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: (!broadcastMsg.trim() || sendingBroadcast) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                    <span style={{ fontSize: 16 }}>💬</span>
                    {sendingBroadcast ? 'Sending...' : `WhatsApp (${targetUsers.filter(u => u.mobile || u.phone).length})`}
                  </button>
                )}
                {(broadcastType === 'email' || broadcastType === 'both') && (
                  <button onClick={handleBroadcast} disabled={sendingBroadcast || !broadcastMsg.trim() || targetUsers.length === 0}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: (!broadcastMsg.trim() || sendingBroadcast) ? '#d1d5db' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: (!broadcastMsg.trim() || sendingBroadcast) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                    <span style={{ fontSize: 16 }}>📧</span>
                    {sendingBroadcast ? 'Sending...' : `Email (${targetUsers.filter(u => u.email).length})`}
                  </button>
                )}
              </div>
            </div>

            {broadcastHistory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>📋 Recent Broadcasts</div>
                {broadcastHistory.slice(0, 5).map(b => (
                  <div key={b.id} style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', flex: 1, marginRight: 8 }}>{b.title || 'Broadcast'}</div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {(b.type === 'whatsapp' || b.type === 'both') && <span style={{ fontSize: 9, background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>WA</span>}
                        {(b.type === 'email' || b.type === 'both') && <span style={{ fontSize: 9, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>Email</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Sent to {b.totalUsers} users · {b.target} · {b.sentAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''}</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#374151', lineHeight: 1.5, background: '#fff', borderRadius: 6, padding: '6px 8px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
                      {b.message?.slice(0, 80)}{b.message?.length > 80 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>📱 All User Contacts ({users.length})</div>
              <button onClick={() => {
                const nums = users.filter(u => u.mobile || u.phone).map(u => '91' + (u.mobile || u.phone).replace(/\D/g, '')).join('\n')
                navigator.clipboard?.writeText(nums).then(() => toast.success('All numbers copied!')).catch(() => toast.error('Copy failed'))
              }} style={{ width: '100%', padding: '9px 0', background: '#fff', color: '#25D366', borderWidth: 1.5, borderStyle: 'solid', borderColor: '#86efac', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 10 }}>
                📋 Copy All WhatsApp Numbers
              </button>
              {users.slice(0, 20).map((u, i) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottomWidth: i < Math.min(users.length, 20) - 1 ? 1 : 0, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{u.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{u.name || '—'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{u.mobile || u.phone || 'No number'}</div>
                  </div>
                  {(u.mobile || u.phone) && (
                    <a href={`https://wa.me/91${(u.mobile || u.phone).replace(/\D/g, '')}?text=${encodeURIComponent(broadcastMsg.replace(/{name}/g, u.name || 'there') || 'Hi ' + u.name + '! Order from FeedoZone today 🍽️')}`}
                      target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#25D366', borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}>
                      <span style={{ fontSize: 13 }}>💬</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'Poppins' }}>WA</span>
                    </a>
                  )}
                  {u.email && (
                    <a href={`mailto:${u.email}?subject=${encodeURIComponent(broadcastTitle || 'Message from FeedoZone')}&body=${encodeURIComponent(broadcastMsg.replace(/{name}/g, u.name || 'there') || 'Hi from FeedoZone!')}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#3b82f6', borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}>
                      <span style={{ fontSize: 13 }}>📧</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'Poppins' }}>Email</span>
                    </a>
                  )}
                </div>
              ))}
              {users.length > 20 && <div style={{ textAlign: 'center', paddingTop: 10, fontSize: 11, color: '#9ca3af' }}>+{users.length - 20} more users</div>}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: ORDERS
        ════════════════════════════════════════════════════════ */}
        {tab === 'orders' && (
          <>
            {selectedOrder && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null) }}>
                <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 430, maxHeight: '80vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Order Details</div>
                    <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    {[['Customer', selectedOrder.userName], ['Phone', selectedOrder.userPhone || '—'], ['Vendor', selectedOrder.vendorName], ['Address', selectedOrder.address || '—'], ['Date', selectedOrder.createdAt?.toDate?.()?.toLocaleString('en-IN') || '—']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{k}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, maxWidth: 200, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Status</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: selectedOrder.status === 'delivered' ? '#d1fae5' : selectedOrder.status === 'cancelled' ? '#fee2e2' : '#fef3c7', color: selectedOrder.status === 'delivered' ? '#065f46' : selectedOrder.status === 'cancelled' ? '#991b1b' : '#92400e' }}>{selectedOrder.status?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>Items Ordered</div>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6' }}>
                      <span style={{ fontSize: 13 }}>{item.qty}x {item.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopStyle: 'solid', borderTopColor: '#e5e7eb' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E24B4A' }}>₹{selectedOrder.total}</span>
                  </div>
                  <button onClick={() => { setFounderBillOrder(selectedOrder); setShowFounderBill(true) }}
                    style={{ width: '100%', marginTop: 8, background: '#111', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    🧾 View Full Bill
                  </button>
                  <button onClick={(e) => handleDeleteOrder(selectedOrder.id, e)} style={{ width: '100%', marginTop: 6, background: '#fee2e2', color: '#dc2626', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    🗑️ Delete This Order
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { id: 'all', label: 'All', count: orders.length },
                { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length },
                { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
              ].map(f2 => (
                <button key={f2.id} onClick={() => setOrderFilter(f2.id)}
                  style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: orderFilter === f2.id ? '#E24B4A' : '#f3f4f6', color: orderFilter === f2.id ? '#fff' : '#6b7280' }}>
                  {f2.label} ({f2.count})
                </button>
              ))}
            </div>
            {orders.filter(o => {
              if (orderFilter === 'all') return true
              if (orderFilter === 'preparing') return o.status === 'preparing' || o.status === 'accepted'
              return o.status === orderFilter
            }).slice(0, 50).map(o => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 0', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', cursor: 'pointer' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 42, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || '--'}</div>
                  <button onClick={e => { e.stopPropagation(); setFounderBillOrder(o); setShowFounderBill(true) }}
                    style={{ fontSize: 10, fontWeight: 700, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontFamily: 'Poppins', flexShrink: 0 }}>
                    🧾 {'FZ-' + (o.billNo?.slice(-6) || o.id?.slice(-6).toUpperCase())}
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{o.userName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{o.vendorName} · {o.items?.length} item(s)</div>
                  {o.address && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>📍 {o.address?.slice(0, 35)}{o.address?.length > 35 ? '...' : ''}</div>}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>₹{o.total}</div>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: o.status === 'delivered' ? '#d1fae5' : o.status === 'cancelled' ? '#fee2e2' : o.status === 'preparing' ? '#dbeafe' : '#fef3c7', color: o.status === 'delivered' ? '#065f46' : o.status === 'cancelled' ? '#991b1b' : o.status === 'preparing' ? '#1e40af' : '#92400e' }}>{o.status?.replace('_', ' ')}</span>
                  <button onClick={(e) => handleDeleteOrder(o.id, e)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: SUPPORT
        ════════════════════════════════════════════════════════ */}
        {tab === 'support' && (
          <>
            {selectedTicket && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                onClick={e => { if (e.target === e.currentTarget) { setSelectedTicket(null); setReplyText('') } }}>
                <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Support Ticket</div>
                    <button onClick={() => { setSelectedTicket(null); setReplyText('') }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    {[['From', selectedTicket.userName], ['Email', selectedTicket.userEmail], ['Category', selectedTicket.category]].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: '#6b7280' }}>{k}</span><span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span></div>
                    ))}
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{selectedTicket.message}</div>
                  {selectedTicket.founderReply && (
                    <div style={{ background: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: '#3b82f6' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>👑 Your Previous Reply</div>
                      <div style={{ fontSize: 13, color: '#1e3a8a' }}>{selectedTicket.founderReply}</div>
                    </div>
                  )}
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={4} style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 10, lineHeight: 1.6 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleReplyTicket(selectedTicket.id, 'replied')} disabled={sendingReply} style={{ flex: 1, background: sendingReply ? '#f09595' : '#E24B4A', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>{sendingReply ? 'Sending...' : '📩 Send Reply'}</button>
                    <button onClick={() => handleReplyTicket(selectedTicket.id, 'resolved')} disabled={sendingReply} style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>✅ Resolve</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[{ id: 'open', label: 'Open', count: supportTickets.filter(t => t.status === 'open').length }, { id: 'replied', label: 'Replied', count: supportTickets.filter(t => t.status === 'replied').length }, { id: 'resolved', label: 'Resolved', count: supportTickets.filter(t => t.status === 'resolved').length }, { id: 'all_support', label: 'All', count: supportTickets.length }].map(f2 => (
                <button key={f2.id} onClick={() => setOrderFilter(f2.id)}
                  style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: orderFilter === f2.id ? '#E24B4A' : '#f3f4f6', color: orderFilter === f2.id ? '#fff' : '#6b7280' }}>
                  {f2.label} ({f2.count})
                </button>
              ))}
            </div>
            {supportTickets
              .filter(t => orderFilter === 'all_support' ? true : t.status === (orderFilter === 'open' ? 'open' : orderFilter === 'replied' ? 'replied' : 'resolved'))
              .map(ticket => (
                <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.founderReply || '') }}
                  style={{ background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: ticket.status === 'open' ? '#fecaca' : '#f3f4f6', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{ticket.userName}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{ticket.userEmail}</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: ticket.status === 'resolved' ? '#d1fae5' : ticket.status === 'replied' ? '#dbeafe' : '#fee2e2', color: ticket.status === 'resolved' ? '#065f46' : ticket.status === 'replied' ? '#1e40af' : '#991b1b' }}>
                      {ticket.status === 'resolved' ? '✅ Resolved' : ticket.status === 'replied' ? '💬 Replied' : '🔴 Open'}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#92400e', display: 'inline-block', marginBottom: 6 }}>{ticket.category}</span>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{ticket.message.slice(0, 80)}{ticket.message.length > 80 ? '...' : ''}</div>
                </div>
              ))}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: VENDORS  (with LOCATION FILTER)
        ════════════════════════════════════════════════════════ */}
        {tab === 'vendors' && (
          <>
            {/* ── TOWN FILTER BAR ── */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>📍 Filter by Town</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                <button onClick={() => setSelectedTown('all')}
                  style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 12, fontWeight: 600, background: selectedTown === 'all' ? '#E24B4A' : '#f3f4f6', color: selectedTown === 'all' ? '#fff' : '#6b7280' }}>
                  All ({vendors.length})
                </button>
                {allTowns.map(town => {
                  const count = vendors.filter(v => (v.town || v.locationName) === town).length
                  const openCount = vendors.filter(v => (v.town || v.locationName) === town && v.isOpen).length
                  return (
                    <button key={town} onClick={() => setSelectedTown(town)}
                      style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 12, fontWeight: 600, background: selectedTown === town ? '#E24B4A' : '#f3f4f6', color: selectedTown === town ? '#fff' : '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📍 {town}
                      <span style={{ background: selectedTown === town ? 'rgba(255,255,255,0.3)' : '#e5e7eb', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: selectedTown === town ? '#fff' : '#6b7280' }}>{count}</span>
                    </button>
                  )
                })}
              </div>
              {/* Town summary row */}
              {selectedTown !== 'all' && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>📍 {selectedTown}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{filteredVendors.length} vendors total</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{filteredVendors.filter(v => v.isOpen).length} open</div>
                      <div style={{ fontSize: 11, color: '#dc2626' }}>{filteredVendors.filter(v => !v.isOpen).length} closed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
              {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}{selectedTown !== 'all' ? ` in ${selectedTown}` : ' total'}
            </div>

            {filteredVendors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>No vendors in {selectedTown}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Add a vendor with this town to see them here</div>
                <button onClick={() => setTab('addvendor')} style={{ marginTop: 14, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>+ Add Vendor</button>
              </div>
            )}

            {filteredVendors.map(v => (
              <div key={v.id} style={{ background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: 100, position: 'relative', background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.photo ? <img src={v.photo} alt={v.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🏪</span>}
                  <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => handleExistingVendorPhoto(e, v.id); input.click() }}
                    style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                    {uploadingPhotoFor === v.id ? `${existingProgress}%` : '📷 Change Photo'}
                  </button>
                  <div style={{ position: 'absolute', top: 8, left: 8, background: v.isOpen ? '#16a34a' : '#dc2626', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>
                    {v.isOpen ? '● Open' : '● Closed'}
                  </div>
                  {(v.town || v.locationName) && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>
                      📍 {v.town || v.locationName}
                    </div>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{v.storeName}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: v.subscriptionStatus === 'active' ? '#d1fae5' : '#fee2e2', color: v.subscriptionStatus === 'active' ? '#065f46' : '#991b1b' }}>{v.subscriptionStatus === 'active' ? 'Paid' : 'Due'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{v.email} · {v.category}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>🚴 Delivery: {v.deliveryCharge === 0 ? 'Free' : ('₹' + (v.deliveryCharge ?? 30))} · 📞 {v.phone || '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.expoPushToken ? '#16a34a' : '#d1d5db' }} />
                    <span style={{ fontSize: 11, color: v.expoPushToken ? '#16a34a' : '#9ca3af' }}>
                      {v.expoPushToken ? '✅ Push token saved' : 'No push token yet'}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteVendor(v.id, v.storeName)} style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️ Delete Vendor</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: ANALYTICS
        ════════════════════════════════════════════════════════ */}
        {tab === 'analytics' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📊 Analytics</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {[{ id: 'overview', label: '📊 Overview' }, { id: 'monthly', label: '📅 Monthly' }, { id: 'items', label: '🍽️ Items' }, { id: 'vendors', label: '🏪 Vendors' }, { id: 'users', label: '👤 Users' }, { id: 'towns', label: '📍 Towns' }].map(t => (
                <button key={t.id} onClick={() => setAnalyticsTab(t.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: analyticsTab === t.id ? '#E24B4A' : '#f3f4f6', color: analyticsTab === t.id ? '#fff' : '#6b7280' }}>{t.label}</button>
              ))}
            </div>

            {analyticsTab === 'overview' && (() => {
              const totalRev = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
              const activeUsers = [...new Set(orders.filter(o => { const d = o.createdAt?.toDate?.(); const now = new Date(); return d && (now - d) < 30 * 24 * 60 * 60 * 1000 }).map(o => o.userUid))].length
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { icon: '📦', label: 'Total Orders', val: orders.length, bg: '#fff5f5' },
                    { icon: '💰', label: 'Total Revenue', val: '₹' + totalRev.toLocaleString(), bg: '#f0fdf4' },
                    { icon: '✅', label: 'Delivered', val: orders.filter(o => o.status === 'delivered').length, bg: '#f0fdf4' },
                    { icon: '❌', label: 'Cancelled', val: orders.filter(o => o.status === 'cancelled').length, bg: '#fff5f5' },
                    { icon: '⏳', label: 'Pending', val: orders.filter(o => o.status === 'pending').length, bg: '#fffbeb' },
                    { icon: '👥', label: 'Total Users', val: users.length, bg: '#eff6ff' },
                    { icon: '🔥', label: 'Active (30d)', val: activeUsers, bg: '#fff7ed' },
                    { icon: '🔔', label: 'Push Enabled', val: usersWithTokenCount, bg: '#f0fdf4' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6' }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {analyticsTab === 'monthly' && (() => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              const year = new Date().getFullYear()
              const monthlyData = months.map((m, i) => {
                const mo = orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && d.getMonth() === i && d.getFullYear() === year })
                return { month: m, orders: mo.length, revenue: mo.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0), delivered: mo.filter(o => o.status === 'delivered').length, cancelled: mo.filter(o => o.status === 'cancelled').length }
              })
              const maxRev = Math.max(...monthlyData.map(m => m.revenue), 1)
              const totalYearRev = monthlyData.reduce((s, m) => s + m.revenue, 0)
              const totalYearOrders = monthlyData.reduce((s, m) => s + m.orders, 0)
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 14 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{year} TOTAL REVENUE</div><div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>₹{totalYearRev.toLocaleString()}</div></div>
                    <div style={{ background: '#fff5f5', borderRadius: 12, padding: 14 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{year} TOTAL ORDERS</div><div style={{ fontSize: 20, fontWeight: 700, color: '#E24B4A' }}>{totalYearOrders}</div></div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 700 }}>📅 Monthly Revenue — {year}</div>
                    {monthlyData.map(m => (
                      <div key={m.month} style={{ padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <div><span style={{ fontSize: 13, fontWeight: 600 }}>{m.month}</span><span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{m.orders} orders</span></div>
                          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: m.revenue > 0 ? '#16a34a' : '#9ca3af' }}>₹{m.revenue.toLocaleString()}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>✅{m.delivered} ❌{m.cancelled}</div></div>
                        </div>
                        <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}><div style={{ height: '100%', background: m.revenue > 0 ? '#16a34a' : '#e5e7eb', width: ((m.revenue / maxRev) * 100) + '%', borderRadius: 4 }} /></div>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}

            {analyticsTab === 'items' && (
              <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>TOP 10 MOST ORDERED ITEMS</div>
                {getMostOrdered().map((item, i) => {
                  const max = getMostOrdered()[0]?.qty || 1
                  return (
                    <div key={item.name} style={{ padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 16, fontWeight: 700, color: '#E24B4A', minWidth: 22 }}>#{i + 1}</span><span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span></div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#E24B4A' }}>{item.qty} orders</span>
                      </div>
                      <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}><div style={{ height: '100%', background: '#E24B4A', width: ((item.qty / max) * 100) + '%', borderRadius: 4 }} /></div>
                    </div>
                  )
                })}
              </div>
            )}

            {analyticsTab === 'vendors' && (
              <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>TOP VENDORS BY ORDERS</div>
                {vendors.map(v => {
                  const vOrders = orders.filter(o => o.vendorUid === v.id)
                  const vRevenue = vOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
                  return (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', background: '#fee2e2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.photo ? <img src={v.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span>🏪</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{v.storeName}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{vOrders.length} orders · ₹{vRevenue.toLocaleString()}{v.town ? ` · 📍${v.town}` : ''}</div>
                      </div>
                      <div style={{ background: v.isOpen ? '#dcfce7' : '#fee2e2', borderRadius: 20, padding: '3px 8px' }}><span style={{ fontSize: 10, fontWeight: 600, color: v.isOpen ? '#16a34a' : '#dc2626' }}>{v.isOpen ? 'Open' : 'Closed'}</span></div>
                    </div>
                  )
                })}
              </div>
            )}

            {analyticsTab === 'users' && (
              <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>TOP USERS BY ORDERS</div>
                {(() => {
                  const userMap = {}
                  orders.forEach(o => {
                    if (!userMap[o.userUid]) userMap[o.userUid] = { name: o.userName, phone: o.userPhone, count: 0, spent: 0 }
                    userMap[o.userUid].count++
                    if (o.status === 'delivered') userMap[o.userUid].spent += o.total || 0
                  })
                  return Object.values(userMap).sort((a, b) => b.count - a.count).slice(0, 10).map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E24B4A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>#{i + 1}</span></div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{u.phone || '—'} · ₹{u.spent.toLocaleString()} spent</div></div>
                      <div style={{ background: '#fef3c7', borderRadius: 20, padding: '3px 10px' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>{u.count} orders</span></div>
                    </div>
                  ))
                })()}
              </div>
            )}

            {/* ── TOWNS ANALYTICS (NEW) ── */}
            {analyticsTab === 'towns' && (
              <>
                {allTowns.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📍</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No town data yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Set town/location when adding vendors</div>
                  </div>
                ) : (
                  allTowns.map(town => {
                    const tvs = vendors.filter(v => (v.town || v.locationName) === town)
                    const townOrderIds = new Set(orders.filter(o => tvs.some(v => v.id === o.vendorUid)).map(o => o.id))
                    const townOrders = orders.filter(o => townOrderIds.has(o.id))
                    const townRevenue = townOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
                    return (
                      <div key={town} style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', padding: 14, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>📍</span>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{town}</div>
                              <div style={{ fontSize: 11, color: '#9ca3af' }}>{tvs.length} vendors · {tvs.filter(v => v.isOpen).length} open</div>
                            </div>
                          </div>
                          <button onClick={() => { setSelectedTown(town); setTab('vendors') }} style={{ background: '#fff5f5', color: '#E24B4A', borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            View Vendors →
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                          <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#E24B4A' }}>{townOrders.length}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>Orders</div>
                          </div>
                          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>₹{townRevenue.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>Revenue</div>
                          </div>
                          <div style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{tvs.length}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>Vendors</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: ADD VENDOR
        ════════════════════════════════════════════════════════ */}
        {tab === 'addvendor' && (
          <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Create Vendor Account</span>
              <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Founder Only</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Store Photo (optional)</label>
                <div onClick={() => photoRef.current?.click()} style={{ marginTop: 6, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                  {vendorPhotoPreview ? <img src={vendorPhotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>🏪</div><div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Tap to add store photo</div></div>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
                {vendorPhotoPreview && <button onClick={() => { setVendorPhotoFile(null); setVendorPhotoPreview(null) }} style={{ marginTop: 4, fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins' }}>✕ Remove photo</button>}
              </div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Store / Vendor Name *</label><input style={inp} placeholder="e.g. Shree Ganesh Thali" {...f('storeName')} /></div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Vendor Email * (used for login)</label><input style={inp} type="email" placeholder="vendor@example.com" {...f('email')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Password *</label><input style={inp} type="password" placeholder="Min 6 chars" {...f('password')} /></div>
                <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Confirm *</label><input style={inp} type="password" placeholder="Repeat" {...f('confirmPass')} /></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Phone / WhatsApp</label><input style={inp} placeholder="+91 98765 43210" {...f('phone')} /></div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Store Address</label><input style={inp} placeholder="Near college gate, Warananagar..." {...f('address')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Category</label><select style={{ ...inp, cursor: 'pointer', marginTop: 4 }} {...f('category')}>{['Thali', 'Biryani', 'Chinese', 'Snacks', 'Drinks', 'Sweets', 'Roti', 'Rice'].map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Plan</label><select style={{ ...inp, cursor: 'pointer', marginTop: 4 }} {...f('plan')}><option>₹500/month</option><option>₹1000/month</option><option>Free Trial</option></select></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>🚴 Delivery Charge (₹)</label><input style={inp} type="number" placeholder="e.g. 30 (enter 0 for free)" {...f('deliveryCharge')} /></div>
              {/* Town field */}
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>🏘️ Town / Area Name *</label>
                <input style={inp} placeholder="e.g. Warananagar, Kolhapur, Sangli..." {...f('town')} />
                {allTowns.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Quick pick:</span>
                    {allTowns.map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({ ...p, town: t }))}
                        style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, border: 'none', background: form.town === t ? '#E24B4A' : '#f3f4f6', color: form.town === t ? '#fff' : '#374151', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>📍 Store GPS Location (optional)</label>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {newVendorLocName && <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, padding: '6px 10px', background: '#f0fdf4', borderRadius: 8 }}>✅ {newVendorLocName}</div>}
                  <button type="button" onClick={handleDetectVendorLoc} disabled={detectingLoc} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#fff5f5', borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca', borderRadius: 9, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    <span>📍</span><span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{detectingLoc ? 'Detecting...' : 'Use Current GPS'}</span>
                  </button>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inp, marginTop: 0 }} placeholder="Or search: Warananagar, Kolhapur..." value={locSearch} onChange={e => handleLocSearch(e.target.value)} />
                    {locSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 9, zIndex: 50, marginTop: 2, overflow: 'hidden' }}>
                        {locSuggestions.map((s, i) => (
                          <button key={i} type="button" onClick={() => handleSelectVendorLoc(s)} style={{ width: '100%', padding: '9px 12px', border: 'none', borderBottomWidth: i < locSuggestions.length - 1 ? 1 : 0, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'Poppins', fontSize: 12, color: '#1f2937' }}>📍 {s.name.split(',')[0]}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {creating && vendorPhotoFile && photoProgress > 0 && (
                <div><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Uploading photo... {photoProgress}%</div><div style={{ background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', height: 6 }}><div style={{ height: '100%', background: '#E24B4A', width: `${photoProgress}%`, transition: 'width 0.3s' }} /></div></div>
              )}
              <button onClick={handleCreate} disabled={creating} style={{ width: '100%', background: creating ? '#f09595' : '#E24B4A', color: '#fff', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', marginTop: 4 }}>
                {creating ? 'Creating Account...' : '✅ Create Vendor Account'}
              </button>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: '#f0fdf4', borderRadius: 10, fontSize: 12, color: '#166534' }}>
              💡 After creating, share the email + password with the vendor. Town name is used for location filtering in the dashboard.
            </div>
          </div>
        )}

      </div>

      {/* FounderBill modal */}
      {showFounderBill && founderBillOrder && (
        <FounderBill
          order={founderBillOrder}
          vendors={vendors}
          onClose={() => { setShowFounderBill(false); setFounderBillOrder(null) }}
        />
      )}

    </div>
  )
}