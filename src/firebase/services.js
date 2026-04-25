import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, getAuth
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, collection, updateDoc,
  query, where, onSnapshot, serverTimestamp,
  addDoc, deleteDoc, getDocs, orderBy, limit
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { auth, db } from './config'

// ── CLOUDINARY CONFIG ─────────────────────────────────────────────────────
const CLOUDINARY_CLOUD  = 'dqlwojavr'
const CLOUDINARY_PRESET = 'feedozone'
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`

export const uploadPhoto = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_PRESET)
    formData.append('folder', 'feedozone')
    const xhr = new XMLHttpRequest()
    xhr.open('POST', CLOUDINARY_URL)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url)
      else reject(new Error('Upload failed'))
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

export const uploadVendorPhoto = async (vendorUid, file, type = 'photo', onProgress) => {
  const url = await uploadPhoto(file, onProgress)
  await updateDoc(doc(db, 'vendors', vendorUid), { [type]: url })
  try { await updateDoc(doc(db, 'users', vendorUid), { [type]: url }) } catch(e) {}
  return url
}

export const uploadMenuItemPhoto = async (vendorUid, itemId, file, onProgress) => {
  const url = await uploadPhoto(file, onProgress)
  await updateDoc(doc(db, 'vendors', vendorUid, 'menu', itemId), { photo: url })
  return url
}

// ── WHATSAPP NOTIFICATION ─────────────────────────────────────────────────
export const notifyVendorWhatsApp = (vendorPhone, orderData) => {
  if (!vendorPhone) return
  const cleanPhone = vendorPhone.replace(/[\s\-\+]/g, '')
  const phone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
  const itemsList = orderData.items?.map(i => `  • ${i.qty}x ${i.name} — ₹${i.price * i.qty}`).join('\n') || ''
  const message = `🔔 *New FeedoZone Order!*

👤 *Customer:* ${orderData.userName}
📱 *Phone:* +91 ${orderData.userPhone || 'Not shared'}
📍 *Delivery:* ${orderData.address}

🍽️ *Items:*
${itemsList}

💰 *Subtotal:* ₹${orderData.subtotal}
🚴 *Delivery:* ₹${orderData.deliveryFee}
✅ *Total:* ₹${orderData.total}

💵 Payment: Cash on Delivery

_Please accept the order on FeedoZone app_
_feedo-ruddy.vercel.app/vendor_`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}

// ── CALL VENDOR ───────────────────────────────────────────────────────────
export const callVendor = (vendorPhone) => {
  if (!vendorPhone) return
  const cleanPhone = vendorPhone.replace(/[\s\-\+]/g, '')
  const phone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`
  window.open(`tel:${phone}`)
}

// ── LOCATION UTILS ────────────────────────────────────────────────────────
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000, enableHighAccuracy: true }
    )
  })
}

export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export const saveUserLocation = async (uid, lat, lng) => {
  await updateDoc(doc(db, 'users', uid), { location: { lat, lng } })
}

// ── EXPO PUSH NOTIFICATIONS ───────────────────────────────────────────────
export const sendExpoPushNotification = async ({ expoPushToken, title, body, data = {} }) => {
  if (!expoPushToken) return
  if (!expoPushToken.startsWith('ExponentPushToken')) return
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
        channelId: 'default',
        badge: 1,
      }),
    })
  } catch (err) {
    console.error('Expo push failed:', err)
  }
}

export const saveExpoPushToken = async (uid, token, role = 'user') => {
  if (!uid || !token) return
  try {
    const col = role === 'vendor' ? 'vendors' : 'users'
    await setDoc(doc(db, col, uid), {
      expoPushToken: token,
      tokenUpdatedAt: serverTimestamp()
    }, { merge: true })
  } catch (err) {
    console.error('Failed to save push token:', err)
  }
}

export const getExpoPushToken = async (uid, role = 'user') => {
  if (!uid) return null
  try {
    const col = role === 'vendor' ? 'vendors' : 'users'
    const snap = await getDoc(doc(db, col, uid))
    return snap.exists() ? (snap.data()?.expoPushToken || null) : null
  } catch {
    return null
  }
}

// ── FIRESTORE NOTIFICATIONS (in-app bell) ────────────────────────────────
export const sendNotification = async (toUid, { title, body, data = {} }) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      toUid, title, body, data, read: false, createdAt: serverTimestamp()
    })
  } catch (err) {
    console.error('Notification send error:', err)
  }
}

export const listenNotifications = (uid, callback) =>
  onSnapshot(
    query(collection(db, 'notifications'), where('toUid', '==', uid), where('read', '==', false)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error('Notifications error:', err)
  )

export const markNotificationRead = (notifId) =>
  updateDoc(doc(db, 'notifications', notifId), { read: true })

// ── AUTH ──────────────────────────────────────────────────────────────────
export const loginUser   = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const logoutUser  = () => signOut(auth)
export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── FOUNDER: CREATE VENDOR ────────────────────────────────────────────────
export const founderCreateVendor = async (founderUid, vendorData) => {
  const { email, password, storeName, address, phone, plan, category } = vendorData
  const secondaryApp  = initializeApp(auth.app.options, 'secondary-' + Date.now())
  const secondaryAuth = getAuth(secondaryApp)
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
  const vendorUid = cred.user.uid
  await updateProfile(cred.user, { displayName: storeName })
  await signOut(secondaryAuth)

  const vendorDoc = {
    uid: vendorUid, role: 'vendor', email, storeName,
    address: address || '', phone: phone || '',
    plan: plan || '₹500/month', category: category || 'Thali',
    isOpen: false, prepTime: 20, subscriptionStatus: 'active',
    rating: 4.5, totalOrders: 0, totalReviews: 0, photo: '', banner: '',
    location: vendorData.location || null,
    locationName: vendorData.locationName || '',
    deliveryCharge: vendorData.deliveryCharge ?? 0,
    fssai: vendorData.fssai || '',
    openTime: vendorData.openTime || '',
    closeTime: vendorData.closeTime || '',
    createdBy: founderUid, createdAt: serverTimestamp()
  }
  await setDoc(doc(db, 'users', vendorUid), vendorDoc)
  await setDoc(doc(db, 'vendors', vendorUid), vendorDoc)
  return vendorUid
}

// ── VENDORS ───────────────────────────────────────────────────────────────
export const getAllVendors = (callback) =>
  onSnapshot(collection(db, 'vendors'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Restaurants error:', err.code); callback([]) }
  )

export const updateVendorStore = async (uid, data) => {
  await updateDoc(doc(db, 'vendors', uid), data)
  try { await updateDoc(doc(db, 'users', uid), data) } catch(e) {}
}

// ── MENU ──────────────────────────────────────────────────────────────────
export const getMenuItems = (vendorUid, callback) =>
  onSnapshot(collection(db, 'vendors', vendorUid, 'menu'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Menu error:', err.code); callback([]) }
  )

export const addMenuItem = (vendorUid, item) =>
  addDoc(collection(db, 'vendors', vendorUid, 'menu'), {
    ...item, available: true, photo: '', createdAt: serverTimestamp()
  })

export const updateMenuItem = (vendorUid, itemId, data) =>
  updateDoc(doc(db, 'vendors', vendorUid, 'menu', itemId), data)

export const deleteMenuItem = (vendorUid, itemId) =>
  deleteDoc(doc(db, 'vendors', vendorUid, 'menu', itemId))

// ── COMBOS ────────────────────────────────────────────────────────────────
export const getCombos = (vendorUid, callback) =>
  onSnapshot(
    collection(db, 'vendors', vendorUid, 'combos'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Combos error:', err.code); callback([]) }
  )

export const addCombo = (vendorUid, comboData) =>
  addDoc(collection(db, 'vendors', vendorUid, 'combos'), {
    ...comboData, available: true, createdAt: serverTimestamp()
  })

export const updateCombo = (vendorUid, comboId, data) =>
  updateDoc(doc(db, 'vendors', vendorUid, 'combos', comboId), data)

export const deleteCombo = (vendorUid, comboId) =>
  deleteDoc(doc(db, 'vendors', vendorUid, 'combos', comboId))

// ── ORDERS ────────────────────────────────────────────────────────────────
export const placeOrder = async (orderData) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData, status: 'pending', reviewed: false, createdAt: serverTimestamp()
  })

  // 🔔 In-app bell notification to vendor
  await sendNotification(orderData.vendorUid, {
    title: '🔔 New Order!',
    body: `${orderData.userName} ordered ₹${orderData.total} — ${orderData.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}`,
    data: { orderId: ref.id, type: 'new_order' }
  })

  // 🔔 Expo push notification to vendor's phone
  try {
    const vendorToken = await getExpoPushToken(orderData.vendorUid, 'vendor')
    if (vendorToken) {
      const itemsSummary = orderData.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || ''
      await sendExpoPushNotification({
        expoPushToken: vendorToken,
        title: '🔔 New Order Received!',
        body: `₹${orderData.total} · ${itemsSummary.slice(0, 80)}`,
        data: { orderId: ref.id, type: 'new_order', url: '/vendor' }
      })
    }
  } catch (err) {
    console.error('Vendor push notification failed:', err)
  }

  return ref
}

export const getVendorOrders = (vendorUid, callback) =>
  onSnapshot(
    query(collection(db, 'orders'), where('vendorUid', '==', vendorUid)),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      orders.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      callback(orders)
    },
    err => { console.error('Restaurant orders error:', err.code); callback([]) }
  )

export const getUserOrders = (userUid, callback) =>
  onSnapshot(
    query(collection(db, 'orders'), where('userUid', '==', userUid)),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      orders.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      callback(orders)
    },
    err => { console.error('User orders error:', err.code); callback([]) }
  )

export const getAllOrders = (callback) =>
  onSnapshot(collection(db, 'orders'),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      orders.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      callback(orders)
    },
    err => { console.error('All orders error:', err.code); callback([]) }
  )

export const updateOrderStatus = async (orderId, status, orderData = {}) => {
  await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() })

  const statusMessages = {
    accepted:         { title: '✅ Order Accepted!',      body: `${orderData.vendorName} accepted your order 🎉` },
    preparing:        { title: '👨‍🍳 Being Prepared!',     body: `${orderData.vendorName} is cooking your food 🍳` },
    ready:            { title: '🎉 Order Ready!',          body: 'Your order is packed and ready for pickup!' },
    out_for_delivery: { title: '🛵 Out for Delivery!',     body: 'Your order is on the way! Stay ready 🔔' },
    delivered:        { title: '✅ Order Delivered!',      body: `Enjoy your meal! Rate ${orderData.vendorName} ⭐` },
    cancelled:        { title: '❌ Order Cancelled',       body: orderData.cancellationReason || 'Your order was cancelled' },
  }

  if (orderData.userUid) {
    const msg = statusMessages[status]
    if (msg) {
      // 🔔 In-app bell notification
      await sendNotification(orderData.userUid, {
        ...msg,
        data: { orderId, type: 'order_status' }
      })

      // 🔔 Expo push notification to user's phone
      try {
        const userToken = await getExpoPushToken(orderData.userUid, 'user')
        if (userToken) {
          await sendExpoPushNotification({
            expoPushToken: userToken,
            title: msg.title,
            body: msg.body,
            data: { orderId, type: 'order_status', url: '/orders' }
          })
        }
      } catch (err) {
        console.error('User push notification failed:', err)
      }
    }
  }
}

// ── REVIEWS ───────────────────────────────────────────────────────────────

/**
 * Submit a review for a delivered order.
 * - Saves review under vendors/{vendorUid}/reviews/{orderId}
 *   (using orderId as doc ID prevents duplicate reviews for same order)
 * - Marks the order as reviewed so "Rate Now" button hides
 * - Recalculates vendor's average rating and totalReviews count
 */
export const submitReview = async (orderId, vendorUid, userUid, userName, rating, comment = '') => {
  try {
    // 1. Save review — use orderId as document ID to prevent duplicates
    await setDoc(doc(db, 'vendors', vendorUid, 'reviews', orderId), {
      orderId,
      userUid,
      userName: userName || 'Anonymous',
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: serverTimestamp(),
    })

    // 2. Mark order as reviewed — hides "Rate Now" button
    await updateDoc(doc(db, 'orders', orderId), {
      reviewed: true,
      reviewedAt: serverTimestamp(),
    })

    // 3. Recalculate vendor average rating from all reviews
    const reviewsSnap = await getDocs(collection(db, 'vendors', vendorUid, 'reviews'))
    const allRatings = reviewsSnap.docs.map(d => Number(d.data().rating)).filter(r => !isNaN(r))
    const avgRating = allRatings.length
      ? parseFloat((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1))
      : 0

    // 4. Update vendor's rating and totalReviews in both collections
    const ratingUpdate = { rating: avgRating, totalReviews: allRatings.length }
    await updateDoc(doc(db, 'vendors', vendorUid), ratingUpdate)
    try { await updateDoc(doc(db, 'users', vendorUid), ratingUpdate) } catch(e) {}

    return true
  } catch (err) {
    console.error('Submit review error:', err)
    throw err  // re-throw so UI can catch and show error message
  }
}

/**
 * Listen to all reviews for a vendor in real-time (newest first).
 * Use this on vendor profile/detail page to show star ratings.
 */
export const getVendorReviews = (vendorUid, callback) =>
  onSnapshot(
    query(
      collection(db, 'vendors', vendorUid, 'reviews'),
      orderBy('createdAt', 'desc')
    ),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Reviews listen error:', err); callback([]) }
  )

/**
 * Fetch reviews once (non-realtime). Useful for summary stats.
 */
export const fetchVendorReviews = async (vendorUid) => {
  try {
    const snap = await getDocs(
      query(collection(db, 'vendors', vendorUid, 'reviews'), orderBy('createdAt', 'desc'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('Fetch reviews error:', err)
    return []
  }
}

/**
 * Check if a specific order has already been reviewed.
 * Use this to show/hide the "Rate Now" button.
 */
export const hasReviewed = async (orderId, vendorUid) => {
  try {
    const snap = await getDoc(doc(db, 'vendors', vendorUid, 'reviews', orderId))
    return snap.exists()
  } catch {
    return false
  }
}

// ── BROADCAST NOTIFICATIONS (Founder → All Users) ─────────────────────────
export const sendBroadcastNotification = async (title, body) => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    const tokens = []
    snap.forEach(docSnap => {
      const token = docSnap.data().expoPushToken
      if (token && token.startsWith('ExponentPushToken')) {
        tokens.push(token)
      }
    })

    if (tokens.length === 0) {
      console.warn('No user tokens found')
      return 0
    }

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        tokens.map(token => ({
          to: token,
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
          badge: 1,
        }))
      )
    })

    await addDoc(collection(db, 'broadcastHistory'), {
      title,
      body,
      sentTo: tokens.length,
      sentAt: serverTimestamp()
    })

    console.log(`✅ Broadcast sent to ${tokens.length} users`)
    return tokens.length

  } catch (err) {
    console.error('Broadcast failed:', err)
    return 0
  }
}

export const getBroadcastHistory = (callback) =>
  onSnapshot(
    query(collection(db, 'broadcastHistory'), orderBy('sentAt', 'desc'), limit(20)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Broadcast history error:', err); callback([]) }
  )