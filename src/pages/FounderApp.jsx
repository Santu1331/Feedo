import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getAllOrders, getAllVendors, founderCreateVendor,
  uploadPhoto, updateVendorStore, sendBroadcastNotification, getBroadcastHistory
} from '../firebase/services'
import {
  doc, deleteDoc, collection, addDoc, serverTimestamp,
  orderBy, limit, onSnapshot, updateDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'
import { useOrderAlert } from '../hooks/useOrderAlert'
import { usePendingOrderNotifier } from '../hooks/usePendingOrderNotifier'
import FounderBill from '../components/FounderBill'

export default function FounderApp() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    storeName: '', email: '', phone: '', password: '',
    confirmPass: '', address: '', category: 'Thali', plan: '₹500/month', deliveryCharge: 30
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
  // ✅ FIX 1: Separate filter states for orders and support tabs
  const [orderFilter, setOrderFilter] = useState('all')
  const [supportFilter, setSupportFilter] = useState('open')
  const [users, setUsers] = useState([])

  // Support ticket states
  const [supportTickets, setSupportTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const [showFounderBill, setShowFounderBill] = useState(false)
  const [founderBillOrder, setFounderBillOrder] = useState(null)

  // Excel export states
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
  const [detectingLoc, setDetectingLoc] = useState(false)

  // Broadcast states
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

  // Push notification states
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushTarget, setPushTarget] = useState('all')
  const [sendingPush, setSendingPush] = useState(false)
  const [pushDone, setPushDone] = useState(null)
  const [pushHistory, setPushHistory] = useState([])
  const [pushProgress, setPushProgress] = useState(0)

  const PUSH_PRESETS = [
    { icon: '🌞', label: 'Lunch Time', title: '🍛 Hungry? It\'s Lunch Time!', body: 'Your favourite food is ready to order on FeedoZone! Order now 🚀' },
    { icon: '🌙', label: 'Dinner Time', title: '🌙 Dinner Time on FeedoZone!', body: 'Skip cooking tonight! Your favourite vendors are open. Order now 🍽️' },
    { icon: '🔥', label: 'Special Offer', title: '🔥 Special Offer Just for You!', body: 'Check out today\'s deals on FeedoZone. Limited time only! 🎁' },
    { icon: '🎊', label: 'Weekend', title: '🎊 Happy Weekend!', body: 'Treat yourself this weekend! Order delicious food on FeedoZone 😋' },
    { icon: '🆕', label: 'New Vendor', title: '🆕 New Restaurant on FeedoZone!', body: 'A new restaurant just joined us! Explore their menu and order today 🍽️' },
    { icon: '⭐', label: 'Rate Us', title: '⭐ Enjoying FeedoZone?', body: 'Rate us on the Play Store and help us grow! It takes just 10 seconds 🙏' },
  ]

  const TEMPLATES = [
    { id: 'new_restaurant', label: '🍽️ New Restaurant', title: '🎉 New Restaurant Just Added on FeedoZone!', msg: `Hi {name}! 👋\n\nGreat news! A brand new restaurant has just joined FeedoZone near you! 🍽️\n\nExplore their fresh menu and place your first order today.\n\n👉 Open the FeedoZone app now and discover what's new!\n\nHappy eating! 😋\n— FeedoZone Team` },
    { id: 'order_more', label: '🛒 Order More', title: '😋 We Miss You! Order Your Favourite Food Today', msg: `Hi {name}! 🙏\n\nIt's been a while since your last order on FeedoZone! 😢\n\nYour favourite restaurants are waiting for you. Order now and enjoy delicious food delivered right to your door! 🚴\n\n🍱 Open FeedoZone and place an order today!\n\n— FeedoZone Team` },
    { id: 'offer', label: '🎁 Special Offer', title: '🎁 Special Offer Just For You!', msg: `Hi {name}! 🎉\n\nWe have a special offer waiting just for you on FeedoZone!\n\nDon't miss out — open the app now to see what's available near you! 🍕🍚🥘\n\nOrder today and enjoy the best food from Warananagar!\n\n— FeedoZone Team 🔥` },
    { id: 'weekend', label: '🎊 Weekend Special', title: '🎊 Weekend is Here! Time to Order!', msg: `Hi {name}! 😄\n\nHappy Weekend! 🎉\n\nSkip the cooking and treat yourself to something delicious from FeedoZone! 🍛\n\nNew dishes, same great taste. Open the app and order now! 🚀\n\n— FeedoZone Team` },
    { id: 'custom', label: '✏️ Custom Message', title: '', msg: '' }
  ]

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

  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  })
  const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
  const subRevenue = vendors.length * 500

  // ✅ FIX 2: f() helper now properly works for all input types
  const f = field => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value }))
  })

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
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      )
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
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
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocSuggestions(data.map(d => ({
        name: d.display_name.split(',').slice(0, 3).join(', '),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
      })))
    } catch { setLocSuggestions([]) }
  }

  const handleSelectVendorLoc = (s) => {
    setNewVendorLoc({ lat: s.lat, lng: s.lng })
    setNewVendorLocName(s.name.split(',')[0])
    setLocSearch('')
    setLocSuggestions([])
    toast.success(`📍 ${s.name.split(',')[0]}`)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setVendorPhotoFile(file)
    setVendorPhotoPreview(URL.createObjectURL(file))
  }

  // ✅ FIX 3: handleCreate now correctly uses err.message from service.js
  // (service.js already throws readable messages — no need for duplicate err.code checks here)
  const handleCreate = async () => {
    const { storeName, email, password, confirmPass, plan, category, address, phone } = form
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
        deliveryCharge: Number(form.deliveryCharge) || 30
      })

      if (vendorPhotoFile && vendorUid) {
        setPhotoProgress(0)
        const photoUrl = await uploadPhoto(vendorPhotoFile, setPhotoProgress)
        await updateVendorStore(vendorUid, { photo: photoUrl })
      }

      toast.success(`✅ Vendor "${storeName}" created!`)
      setForm({
        storeName: '', email: '', phone: '', password: '',
        confirmPass: '', address: '', category: 'Thali', plan: '₹500/month', deliveryCharge: 30
      })
      setVendorPhotoFile(null)
      setVendorPhotoPreview(null)
      setPhotoProgress(0)
      setNewVendorLoc(null)
      setNewVendorLocName('')
      setLocSearch('')
      setLocSuggestions([])
      setTab('vendors')
    } catch (err) {
      // ✅ FIX 3: service.js now throws readable messages — just use err.message directly
      toast.error(err.message || 'Failed to create vendor')
    } finally {
      setCreating(false)
    }
  }

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
    } catch { toast.error('Upload failed. Try again.') }
    setUploadingPhotoFor(null)
    setExistingProgress(0)
    e.target.value = ''
  }

  // ✅ FIX 4: Removed dynamic import of firebase/firestore — use top-level imports instead
  const handleReplyTicket = async (ticketId, status = 'replied') => {
    if (!replyText.trim()) return toast.error('Enter your reply')
    setSendingReply(true)
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        founderReply: replyText.trim(),
        status,
        repliedAt: serverTimestamp()
      })
      setReplyText('')
      setSelectedTicket(null)
      toast.success('Reply sent! ✅')
    } catch { toast.error('Failed to send reply') }
    setSendingReply(false)
  }

  const handleDeleteOrder = async (orderId, e) => {
    e?.stopPropagation()
    if (!window.confirm('Delete this order? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'orders', orderId))
      if (selectedOrder?.id === orderId) setSelectedOrder(null)
      toast.success('Order deleted ✅')
    } catch { toast.error('Failed to delete order') }
  }

  // ✅ FIX 5: Push notifications — calls Expo directly (no proxy needed for web)
  const handleSendPush = async () => {
    if (!pushTitle.trim()) return toast.error('Enter a notification title')
    if (!pushBody.trim()) return toast.error('Enter a notification message')

    setSendingPush(true)
    setPushProgress(0)
    setPushDone(null)

    try {
      let targetUsers = users
      if (pushTarget === 'active') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
        targetUsers = users.filter(u => activeUids.has(u.id))
      } else if (pushTarget === 'inactive') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
        targetUsers = users.filter(u => !activeUids.has(u.id))
      }

      const usersWithTokens = targetUsers.filter(u => u.expoPushToken?.startsWith('ExponentPushToken'))
      const noToken = targetUsers.length - usersWithTokens.length

      if (usersWithTokens.length === 0) {
        toast.error('No users have push tokens yet!')
        setSendingPush(false)
        return
      }

      const tokens = usersWithTokens.map(u => u.expoPushToken)
      const batches = []
      for (let i = 0; i < tokens.length; i += 100) batches.push(tokens.slice(i, i + 100))

      let sent = 0
      let failed = 0

      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi]
        try {
          // ✅ FIX 5: Call Expo directly — works from browser without CORS issues
          const res = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(batch.map(token => ({
              to: token,
              title: pushTitle,
              body: pushBody,
              sound: 'default',
              priority: 'high',
              channelId: 'default',
              badge: 1,
            })))
          })
          const result = await res.json()
          if (result.data) {
            result.data.forEach(r => { if (r.status === 'ok') sent++; else failed++ })
          } else {
            sent += batch.length
          }
        } catch {
          failed += batch.length
        }
        setPushProgress(Math.round(((bi + 1) / batches.length) * 100))
      }

      await addDoc(collection(db, 'pushHistory'), {
        title: pushTitle,
        body: pushBody,
        target: pushTarget,
        totalUsers: targetUsers.length,
        sent,
        failed,
        noToken,
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

  const getBroadcastUsers = () => {
    if (broadcastTarget === 'all') return users
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
    if (broadcastTarget === 'active') return users.filter(u => activeUids.has(u.id))
    return users.filter(u => !activeUids.has(u.id))
  }

  const sendWhatsAppToUser = (phone, name, message) => {
    const personalised = message.replace(/{name}/g, name || 'there')
    const number = phone.replace(/\D/g, '')
    const fullNumber = number.startsWith('91') ? number : '91' + number
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(personalised)}`
  }

  const handleBroadcast = async () => {
    const targetUsers = getBroadcastUsers()
    if (!broadcastMsg.trim()) return toast.error('Please write a message first')
    if (targetUsers.length === 0) return toast.error('No users found to send to')

    const sendViaWP = broadcastType === 'whatsapp' || broadcastType === 'both'
    const sendViaEmail = broadcastType === 'email' || broadcastType === 'both'

    setSendingBroadcast(true)
    setBroadcastProgress(0)
    setBroadcastDone(null)

    let sent = 0

    try {
      await addDoc(collection(db, 'broadcastHistory'), {
        title: broadcastTitle || 'Broadcast',
        message: broadcastMsg,
        type: broadcastType,
        target: broadcastTarget,
        totalUsers: targetUsers.length,
        sentAt: serverTimestamp(),
        sentBy: user?.email || 'founder'
      })

      if (sendViaWP) {
        const wpUsers = targetUsers.filter(u => u.mobile || u.phone)
        if (wpUsers.length === 0) {
          toast.error('No users have WhatsApp numbers saved')
        } else {
          wpUsers.slice(0, 3).forEach((u, i) => {
            setTimeout(() => {
              const phone = u.mobile || u.phone
              window.open(sendWhatsAppToUser(phone, u.name, broadcastMsg), '_blank')
            }, i * 800)
          })
          sent += wpUsers.length
          if (wpUsers.length > 3) toast(`📱 Opened 3 WhatsApp chats. ${wpUsers.length - 3} more below.`, { duration: 5000 })
        }
      }

      if (sendViaEmail) {
        const emUsers = targetUsers.filter(u => u.email)
        if (emUsers.length === 0) {
          toast.error('No users have email addresses saved')
        } else {
          const bccList = emUsers.slice(0, 50).map(u => u.email).join(',')
          const personalised = broadcastMsg.replace(/{name}/g, 'there')
          window.open(`mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(broadcastTitle || 'Message from FeedoZone')}&body=${encodeURIComponent(personalised)}`, '_blank')
          sent += emUsers.length
        }
      }

      setBroadcastProgress(100)
      setBroadcastDone({
        sent,
        wpCount: sendViaWP ? targetUsers.filter(u => u.mobile || u.phone).length : 0,
        emailCount: sendViaEmail ? targetUsers.filter(u => u.email).length : 0,
      })
      toast.success(`✅ Broadcast sent to ${sent} users!`)
    } catch (err) {
      console.error(err)
      toast.error('Broadcast failed: ' + err.message)
    }

    setSendingBroadcast(false)
  }

  const exportToExcel = (type) => {
    let data = []
    let filename = ''
    const formatDate = (o) => o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || ''
    const formatTime = (o) => o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || ''

    if (type === 'monthly') {
      data = orders.filter(o => {
        const d = o.createdAt?.toDate?.()
        return d && d.getMonth() === exportMonth && d.getFullYear() === exportYear
      })
      const monthName = new Date(exportYear, exportMonth).toLocaleString('en-IN', { month: 'long' })
      filename = `FeedoZone_Orders_${monthName}_${exportYear}.csv`
    } else if (type === 'today') {
      const today = new Date()
      data = orders.filter(o => {
        const d = o.createdAt?.toDate?.()
        return d && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      })
      filename = `FeedoZone_Orders_Today_${today.toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`
    } else {
      data = [...orders]
      filename = 'FeedoZone_All_Orders.csv'
    }

    if (data.length === 0) return toast.error('No orders found for selected period!')

    const headers = ['Bill No', 'Order Date', 'Order Time', 'Customer Name', 'Customer Phone', 'Vendor', 'Items', 'Subtotal', 'Delivery Fee', 'Total', 'Payment', 'Status', 'Address']
    const rows = data.map(o => [
      ('FZ-' + (o.billNo?.slice(-6) || o.id?.slice(-6) || '').toUpperCase()),
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
    const rows = [['Vendor Name', 'Email', 'Phone', 'Category', 'Plan', 'Total Orders', 'Delivered Orders', 'Total Revenue', 'Status']]
    vendors.forEach(v => {
      const vOrders = orders.filter(o => o.vendorUid === v.id)
      const delivered = vOrders.filter(o => o.status === 'delivered')
      const revenue = delivered.reduce((s, o) => s + (o.total || 0), 0)
      rows.push([v.storeName || '', v.email || '', v.phone || '', v.category || '', v.plan || '', vOrders.length, delivered.length, '₹' + revenue, v.isOpen ? 'Open' : 'Closed'])
    })
    const csvContent = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'FeedoZone_Vendor_Report.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('✅ Vendor report downloaded!')
  }

  const handleDeleteVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Delete "${vendorName}"? This cannot be undone!`)) return
    try {
      await deleteDoc(doc(db, 'vendors', vendorId))
      await deleteDoc(doc(db, 'users', vendorId))
      toast.success(`"${vendorName}" deleted!`)
    } catch (err) { toast.error('Delete failed: ' + err.message) }
  }

  const getMostOrdered = () => {
    const counts = {}
    orders.forEach(o => { o.items?.forEach(item => { counts[item.name] = (counts[item.name] || 0) + item.qty }) })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }))
  }

  const inp = {
    width: '100%', padding: '11px 13px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb',
    borderRadius: 9, fontSize: 13, fontFamily: 'Poppins,sans-serif',
    outline: 'none', marginTop: 4, boxSizing: 'border-box'
  }

  const targetUsers = getBroadcastUsers()

  const getPushTargetCount = (t) => {
    if (t === 'all') return users.length
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyDaysAgo).map(o => o.userUid))
    if (t === 'active') return users.filter(u => activeUids.has(u.id)).length
    return users.filter(u => !activeUids.has(u.id)).length
  }

  const usersWithTokenCount = users.filter(u => u.expoPushToken?.startsWith('ExponentPushToken')).length

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins,sans-serif' }}>

      {/* NEW ORDER ALERT */}
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

      {/* HEADER */}
      <div style={{ background: '#111', padding: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, background: '#E24B4A', borderRadius: '50%' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>FeedoZone</span>
          <span style={{ fontSize: 11, color: '#555' }}>👑 Founder</span>
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Warananagar, Kolhapur</div>
      </div>

      {/* NAV */}
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

        {/* OVERVIEW */}
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

        {/* PUSH NOTIFICATIONS */}
        {tab === 'push' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 14, padding: 16, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 60, opacity: 0.08 }}>🔔</div>
              <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>Zomato-style Notifications</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Push Notifications</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>Send instant push notifications directly to users' phones — even when the app is closed.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[
                  { label: 'Total Users', val: users.length, color: '#fff' },
                  { label: 'Can Receive', val: usersWithTokenCount, color: '#34d399' },
                  { label: 'No Token Yet', val: users.length - usersWithTokenCount, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {usersWithTokenCount === 0 && (
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>⚠️ No Push Tokens Yet</div>
                <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>Users need to install your APK and allow notifications. Once they do, their token saves automatically!</div>
              </div>
            )}

            {pushDone && (
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10 }}>✅ Push Notification Sent!</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>{pushDone.sent}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Delivered</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{pushDone.noToken}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>No Token</div>
                  </div>
                  {pushDone.failed > 0 && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}>{pushDone.failed}</div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>Failed</div>
                    </div>
                  )}
                </div>
                <button onClick={() => setPushDone(null)} style={{ width: '100%', background: 'transparent', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 10 }}>Send Another</button>
              </div>
            )}

            {/* Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>① Quick Presets</div>
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

            {/* Target */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>② Target Audience</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'all', label: 'All Users', icon: '👥' }, { id: 'active', label: 'Active (30d)', icon: '🔥' }, { id: 'inactive', label: 'Inactive', icon: '😴' }].map(t => (
                  <button key={t.id} onClick={() => setPushTarget(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: pushTarget === t.id ? '#E24B4A' : '#e5e7eb', background: pushTarget === t.id ? '#fff5f5' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: pushTarget === t.id ? '#E24B4A' : '#1f2937' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{getPushTargetCount(t.id)} users</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Write */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>③ Write Notification</div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Title</label>
                <input style={inp} placeholder="e.g. 🍛 Lunch Time!" value={pushTitle} onChange={e => setPushTitle(e.target.value)} />
                <div style={{ fontSize: 10, color: pushTitle.length > 65 ? '#dc2626' : '#9ca3af', textAlign: 'right', marginTop: 2 }}>{pushTitle.length}/65</div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Message body</label>
                <textarea value={pushBody} onChange={e => setPushBody(e.target.value)} rows={3} placeholder="Your notification message..." style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, color: '#1f2937', marginTop: 4 }} />
                <div style={{ fontSize: 10, color: pushBody.length > 200 ? '#dc2626' : '#9ca3af', textAlign: 'right', marginTop: 2 }}>{pushBody.length}/200</div>
              </div>
            </div>

            {/* Phone Preview */}
            {(pushTitle || pushBody) && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>📱 Phone Preview</div>
                <div style={{ background: '#1f2937', borderRadius: 16, padding: 14 }}>
                  <div style={{ background: '#374151', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, background: '#E24B4A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 14 }}>🍽️</span></div>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>FeedoZone</div><div style={{ fontSize: 10, color: '#9ca3af' }}>now</div></div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{pushTitle || 'Notification title'}</div>
                    <div style={{ fontSize: 11, color: '#d1d5db', lineHeight: 1.4 }}>{pushBody || 'Notification message...'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Send */}
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>Ready to push?</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
                Sending to <strong>{getPushTargetCount(pushTarget)} users</strong> · <strong style={{ color: '#34d399' }}>{Math.min(usersWithTokenCount, getPushTargetCount(pushTarget))} can receive</strong>
              </div>
              {sendingPush && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: '#e5e7eb', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 6 }}>
                    <div style={{ height: '100%', background: '#E24B4A', width: `${pushProgress}%`, transition: 'width 0.3s', borderRadius: 8 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>Sending... {pushProgress}%</div>
                </div>
              )}
              <button onClick={handleSendPush} disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 0', background: (sendingPush || !pushTitle.trim() || !pushBody.trim()) ? '#d1d5db' : 'linear-gradient(135deg,#E24B4A,#c73232)', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: (sendingPush || !pushTitle.trim() || !pushBody.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                <span style={{ fontSize: 20 }}>🔔</span>
                {sendingPush ? `Sending... ${pushProgress}%` : `Send to ${getPushTargetCount(pushTarget)} Users`}
              </button>
            </div>

            {/* Push History */}
            {pushHistory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>📋 Recent Push Notifications</div>
                {pushHistory.slice(0, 8).map(p => (
                  <div key={p.id} style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', flex: 1, marginRight: 8 }}>{p.title}</div>
                      <div style={{ background: '#dcfce7', borderRadius: 10, padding: '2px 8px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>✅ {p.sent || 0} sent</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{p.body}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{p.target} · {p.sentAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* BROADCAST */}
        {tab === 'broadcast' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#2d1a00)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>📣 Broadcast Message</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Send WhatsApp or Email to all users at once.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[{ label: 'Total Users', val: users.length }, { label: 'Have WhatsApp', val: users.filter(u => u.mobile || u.phone).length }, { label: 'Have Email', val: users.filter(u => u.email).length }].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {broadcastDone && (
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 8 }}>✅ Broadcast Sent!</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {broadcastDone.wpCount > 0 && <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#25D366' }}>{broadcastDone.wpCount}</div><div style={{ fontSize: 10, color: '#6b7280' }}>WhatsApp</div></div>}
                  {broadcastDone.emailCount > 0 && <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{broadcastDone.emailCount}</div><div style={{ fontSize: 10, color: '#6b7280' }}>Email</div></div>}
                </div>
                <button onClick={() => setBroadcastDone(null)} style={{ width: '100%', background: 'transparent', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 10 }}>Send Another</button>
              </div>
            )}

            {/* Template */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>① Choose Template</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => { setBroadcastTemplate(t.id); if (t.id !== 'custom') { setBroadcastMsg(t.msg); setBroadcastTitle(t.title) } else { setBroadcastMsg(''); setBroadcastTitle('') } }}
                    style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', borderWidth: 1.5, borderStyle: 'solid', borderColor: broadcastTemplate === t.id ? '#E24B4A' : '#e5e7eb', background: broadcastTemplate === t.id ? '#fff5f5' : '#fff', color: broadcastTemplate === t.id ? '#E24B4A' : '#6b7280' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>② Target Audience</div>
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
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>③ Send Via</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' }, { id: 'email', label: 'Email', icon: '📧', color: '#3b82f6' }, { id: 'both', label: 'Both', icon: '🚀', color: '#E24B4A' }].map(t => (
                  <button key={t.id} onClick={() => setBroadcastType(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: broadcastType === t.id ? t.color : '#e5e7eb', background: broadcastType === t.id ? t.color + '15' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: broadcastType === t.id ? t.color : '#1f2937' }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>④ Write Message</div>
              <input style={inp} placeholder="Subject / Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
              <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Write your message... Use {name} to personalize!" rows={8}
                style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, color: '#1f2937', marginTop: 8 }} />
            </div>

            {/* Preview */}
            {broadcastMsg && (
              <div style={{ marginBottom: 14 }}>
                <button onClick={() => setPreviewMode(p => !p)} style={{ width: '100%', padding: '9px 0', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: previewMode ? 8 : 0 }}>
                  {previewMode ? '▲ Hide Preview' : '👁️ Preview Message'}
                </button>
                {previewMode && (
                  <div style={{ background: '#dcfce7', borderRadius: 12, padding: 14 }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#1f2937', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {broadcastMsg.replace(/{name}/g, users[0]?.name || 'Arjun')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Send buttons */}
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>Ready to send?</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>Sending to <strong>{targetUsers.length} users</strong> via <strong>{broadcastType === 'both' ? 'WhatsApp + Email' : broadcastType}</strong></div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(broadcastType === 'whatsapp' || broadcastType === 'both') && (
                  <button onClick={handleBroadcast} disabled={sendingBroadcast || !broadcastMsg.trim()}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: (!broadcastMsg.trim() || sendingBroadcast) ? '#d1d5db' : '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: (!broadcastMsg.trim() || sendingBroadcast) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                    💬 WhatsApp ({targetUsers.filter(u => u.mobile || u.phone).length})
                  </button>
                )}
                {(broadcastType === 'email' || broadcastType === 'both') && (
                  <button onClick={handleBroadcast} disabled={sendingBroadcast || !broadcastMsg.trim()}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: (!broadcastMsg.trim() || sendingBroadcast) ? '#d1d5db' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: (!broadcastMsg.trim() || sendingBroadcast) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                    📧 Email ({targetUsers.filter(u => u.email).length})
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ORDERS */}
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
                  <button onClick={() => { setFounderBillOrder(selectedOrder); setShowFounderBill(true) }} style={{ width: '100%', marginTop: 8, background: '#111', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 8 }}>🧾 View Full Bill</button>
                  <button onClick={e => handleDeleteOrder(selectedOrder.id, e)} style={{ width: '100%', marginTop: 6, background: '#fee2e2', color: '#dc2626', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️ Delete This Order</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {[{ id: 'all', label: 'All', count: orders.length }, { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length }, { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length }, { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }, { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }].map(fl => (
                // ✅ FIX 1: Use orderFilter + setOrderFilter (not shared with support)
                <button key={fl.id} onClick={() => setOrderFilter(fl.id)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: orderFilter === fl.id ? '#E24B4A' : '#f3f4f6', color: orderFilter === fl.id ? '#fff' : '#6b7280' }}>
                  {fl.label} ({fl.count})
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
                  <button onClick={e => { e.stopPropagation(); setFounderBillOrder(o); setShowFounderBill(true) }} style={{ fontSize: 10, fontWeight: 700, background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontFamily: 'Poppins' }}>🧾 {'FZ-' + (o.billNo?.slice(-6) || o.id?.slice(-6).toUpperCase())}</button>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{o.userName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{o.vendorName} · {o.items?.length} item(s)</div>
                  {o.address && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>📍 {o.address?.slice(0, 35)}{o.address?.length > 35 ? '...' : ''}</div>}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>₹{o.total}</div>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: o.status === 'delivered' ? '#d1fae5' : o.status === 'cancelled' ? '#fee2e2' : o.status === 'preparing' ? '#dbeafe' : '#fef3c7', color: o.status === 'delivered' ? '#065f46' : o.status === 'cancelled' ? '#991b1b' : o.status === 'preparing' ? '#1e40af' : '#92400e' }}>{o.status?.replace('_', ' ')}</span>
                  <button onClick={e => handleDeleteOrder(o.id, e)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* SUPPORT */}
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
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{k}</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
                      </div>
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

            {/* ✅ FIX 1: Support uses supportFilter state, not orderFilter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[{ id: 'open', label: 'Open', count: supportTickets.filter(t => t.status === 'open').length }, { id: 'replied', label: 'Replied', count: supportTickets.filter(t => t.status === 'replied').length }, { id: 'resolved', label: 'Resolved', count: supportTickets.filter(t => t.status === 'resolved').length }, { id: 'all', label: 'All', count: supportTickets.length }].map(fl => (
                <button key={fl.id} onClick={() => setSupportFilter(fl.id)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: supportFilter === fl.id ? '#E24B4A' : '#f3f4f6', color: supportFilter === fl.id ? '#fff' : '#6b7280' }}>
                  {fl.label} ({fl.count})
                </button>
              ))}
            </div>

            {supportTickets
              .filter(t => supportFilter === 'all' ? true : t.status === supportFilter)
              .map(ticket => (
                <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.founderReply || '') }}
                  style={{ background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: ticket.status === 'open' ? '#fecaca' : '#f3f4f6', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{ticket.userName}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{ticket.userEmail}</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: ticket.status === 'resolved' ? '#d1fae5' : ticket.status === 'replied' ? '#dbeafe' : '#fee2e2', color: ticket.status === 'resolved' ? '#065f46' : ticket.status === 'replied' ? '#1e40af' : '#991b1b' }}>{ticket.status === 'resolved' ? '✅ Resolved' : ticket.status === 'replied' ? '💬 Replied' : '🔴 Open'}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#92400e', display: 'inline-block', marginBottom: 6 }}>{ticket.category}</span>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{ticket.message.slice(0, 80)}{ticket.message.length > 80 ? '...' : ''}</div>
                </div>
              ))}
          </>
        )}

        {/* VENDORS */}
        {tab === 'vendors' && (
          <>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{vendors.length} registered vendors</div>
            {vendors.map(v => (
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
                    <span style={{ fontSize: 11, color: v.expoPushToken ? '#16a34a' : '#9ca3af' }}>{v.expoPushToken ? '✅ Push token saved' : 'No push token yet'}</span>
                  </div>
                  <button onClick={() => handleDeleteVendor(v.id, v.storeName)} style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️ Delete Vendor</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📊 Analytics</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {[{ id: 'overview', label: '📊 Overview' }, { id: 'monthly', label: '📅 Monthly' }, { id: 'items', label: '🍽️ Items' }, { id: 'vendors', label: '🏪 Vendors' }, { id: 'users', label: '👤 Users' }].map(t => (
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
                    <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 14 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{year} REVENUE</div><div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>₹{totalYearRev.toLocaleString()}</div></div>
                    <div style={{ background: '#fff5f5', borderRadius: 12, padding: 14 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{year} ORDERS</div><div style={{ fontSize: 20, fontWeight: 700, color: '#E24B4A' }}>{totalYearOrders}</div></div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                    {monthlyData.map(m => (
                      <div key={m.month} style={{ padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <div><span style={{ fontSize: 13, fontWeight: 600 }}>{m.month}</span><span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{m.orders} orders</span></div>
                          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: m.revenue > 0 ? '#16a34a' : '#9ca3af' }}>₹{m.revenue.toLocaleString()}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>✅{m.delivered} ❌{m.cancelled}</div></div>
                        </div>
                        <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: m.revenue > 0 ? '#16a34a' : '#e5e7eb', width: ((m.revenue / maxRev) * 100) + '%', borderRadius: 4 }} />
                        </div>
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
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{v.storeName}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{vOrders.length} orders · ₹{vRevenue.toLocaleString()}</div></div>
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
          </>
        )}

        {/* ADD VENDOR */}
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
                <div>
                  <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Category</label>
                  <select style={{ ...inp, cursor: 'pointer', marginTop: 4 }} {...f('category')}>
                    {['Thali', 'Biryani', 'Chinese', 'Snacks', 'Drinks', 'Sweets', 'Roti', 'Rice'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Plan</label>
                  <select style={{ ...inp, cursor: 'pointer', marginTop: 4 }} {...f('plan')}>
                    <option>₹500/month</option><option>₹1000/month</option><option>Free Trial</option>
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>🚴 Delivery Charge (₹)</label><input style={inp} type="number" placeholder="e.g. 30" {...f('deliveryCharge')} /></div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>📍 Store Location</label>
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
              💡 After creating, share the email + password with the vendor.
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