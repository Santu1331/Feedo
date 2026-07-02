import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, getAuth
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, collection, updateDoc,
  query, where, onSnapshot, serverTimestamp,
  addDoc, deleteDoc, getDocs, orderBy, limit
} from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'   // ✅ FIX 1: added deleteApp
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
  if (!expoPushToken || typeof expoPushToken !== 'string' || expoPushToken.trim() === '') return
  try {
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : ''
    await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        notifications: [{
          to: expoPushToken,
          title,
          body,
          data,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
          badge: 1,
        }]
      }),
    })
  } catch (err) {
    console.error('Expo push failed:', err)
  }
}

// ── WEB BROWSER PUSH (FCM) ────────────────────────────────────────────────
// Sends a notification to a browser via Firebase Cloud Messaging. Fires even
// when the tab is closed/backgrounded — the service worker shows the banner
// with sound + vibration. Pass a single fcmToken or an array.
export const sendWebPushNotification = async ({ fcmToken, fcmTokens, title, body, data = {} }) => {
  const tokens = Array.isArray(fcmTokens)
    ? fcmTokens
    : (fcmToken ? [fcmToken] : [])
  const clean = tokens.filter(t => typeof t === 'string' && t.trim().length > 0)
  if (clean.length === 0) return
  try {
    await fetch('/api/send-fcm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens: clean, title, body, data }),
    })
  } catch (err) {
    console.error('Web push failed:', err)
  }
}

// ── Read FCM web token from Firestore ─────────────────────────────────────
export const getFcmToken = async (uid, role = 'user') => {
  if (!uid) return null
  try {
    const col = role === 'vendor' ? 'vendors' : 'users'
    const snap = await getDoc(doc(db, col, uid))
    return snap.exists() ? (snap.data()?.fcmToken || null) : null
  } catch {
    return null
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
// ✅ FIX 2: Full error handling + deleteApp to prevent memory leak
// ✅ FIX 3: Friendly error messages for all Firebase Auth error codes
// ✅ FIX 4: secondaryApp is always cleaned up even if something fails
export const founderCreateVendor = async (founderUid, vendorData) => {
  const { email, password, storeName, address, phone, plan, category } = vendorData

  // ✅ Validate required fields before hitting Firebase
  if (!email || !password || !storeName) {
    throw new Error('Email, password, and store name are required.')
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  const secondaryApp  = initializeApp(auth.app.options, 'secondary-' + Date.now())
  const secondaryAuth = getAuth(secondaryApp)

  let vendorUid
  try {
    // ✅ FIX: Wrapped in try/catch to handle EMAIL_EXISTS and other auth errors
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    vendorUid = cred.user.uid
    await updateProfile(cred.user, { displayName: storeName })
    await signOut(secondaryAuth)
  } catch (err) {
    // ✅ FIX: Always clean up secondary app even on failure
    try { await deleteApp(secondaryApp) } catch (_) {}

    // ✅ FIX: Map Firebase error codes to human-readable messages
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or delete the existing account from Firebase Console.',
      'auth/invalid-email':        'The email address is not valid. Please check and try again.',
      'auth/weak-password':        'Password is too weak. Use at least 6 characters.',
      'auth/operation-not-allowed':'Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    }
    throw new Error(errorMessages[err.code] || `Failed to create vendor account: ${err.message}`)
  }

  // ✅ FIX: Clean up secondary app after successful auth creation
  try { await deleteApp(secondaryApp) } catch (_) {}

  // ✅ Write Firestore docs for vendor
  const vendorDoc = {
    uid: vendorUid,
    role: 'vendor',
    email,
    storeName,
    address:          address || '',
    phone:            phone || '',
    plan:             plan || '₹500/month',
    category:         category || 'Thali',
    isOpen:           false,
    prepTime:         20,
    subscriptionStatus: 'active',
    rating:           4.5,
    totalOrders:      0,
    photo:            '',
    banner:           '',
    location:         vendorData.location || null,
    locationName:     vendorData.locationName || '',
    town:             vendorData.town || vendorData.locationName || '',
    deliveryCharge:   vendorData.deliveryCharge ?? 0,
    fssai:            vendorData.fssai || '',
    openTime:         vendorData.openTime || '',
    closeTime:        vendorData.closeTime || '',
    sortOrder:        vendorData.sortOrder ?? 9999,
    createdBy:        founderUid,
    createdAt:        serverTimestamp(),
    ...(vendorData.createdByManager ? { createdByManager: vendorData.createdByManager } : {}),
    ...(vendorData.managerCity ? { managerCity: vendorData.managerCity } : {}),
  }

  try {
    await setDoc(doc(db, 'users', vendorUid), vendorDoc)
    await setDoc(doc(db, 'vendors', vendorUid), vendorDoc)
  } catch (err) {
    // ✅ FIX: Catch Firestore write failures separately with clear message
    throw new Error(`Vendor account created in Auth but failed to save to database: ${err.message}. Please contact support.`)
  }

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
    ...orderData,
    vendorId: orderData.vendorUid,
    customerName: orderData.userName,
    status: 'pending',
    createdAt: serverTimestamp()
  })

  // 🔔 In-app bell notification to vendor (non-blocking)
  sendNotification(orderData.vendorUid, {
    title: '🔔 New Order!',
    body: `${orderData.userName} ordered ₹${orderData.total} — ${orderData.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}`,
    data: { orderId: ref.id, type: 'new_order' }
  }).catch(err => console.error('Vendor bell notification failed:', err))

  // 🔔 Expo push notification to vendor's phone (non-blocking)
  // Use token passed directly from UserApp (avoids Firestore permission error)
  const vendorExpoToken = orderData.vendorExpoPushToken || null
  if (vendorExpoToken) {
    const itemsSummary = orderData.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || ''
    sendExpoPushNotification({
      expoPushToken: vendorExpoToken,
      title: '🔔 New Order Received!',
      body: `₹${orderData.total} · ${itemsSummary.slice(0, 80)}`,
      data: { orderId: ref.id, type: 'new_order', url: '/vendor' }
    }).catch(err => console.error('Vendor expo push failed:', err))
  } else {
    // Fallback: try reading from Firestore
    getExpoPushToken(orderData.vendorUid, 'vendor')
      .then(token => {
        if (token) {
          const itemsSummary = orderData.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || ''
          sendExpoPushNotification({
            expoPushToken: token,
            title: '🔔 New Order Received!',
            body: `₹${orderData.total} · ${itemsSummary.slice(0, 80)}`,
            data: { orderId: ref.id, type: 'new_order', url: '/vendor' }
          }).catch(() => {})
        }
      }).catch(() => {})
  }

  // 🔔 Web browser push (FCM) — fires even when vendor tab is CLOSED
  // Use token passed directly from UserApp (avoids Firestore permission error)
  const vendorFcmToken = orderData.vendorFcmToken || null
  if (vendorFcmToken) {
    const itemsSummary = orderData.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || ''
    sendWebPushNotification({
      fcmToken: vendorFcmToken,
      title: `🛎️ New Order — ₹${orderData.total}`,
      body: `${orderData.userName} · ${itemsSummary.slice(0, 80)}`,
      data: {
        orderId: ref.id, type: 'new_order', url: '/vendor',
        customerName: orderData.userName || '',
        total: String(orderData.total || ''),
      },
    }).catch(err => console.error('Vendor FCM push failed:', err))
  } else {
    // Fallback: try reading from Firestore
    getFcmToken(orderData.vendorUid, 'vendor')
      .then(token => {
        if (token) {
          const itemsSummary = orderData.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || ''
          sendWebPushNotification({
            fcmToken: token,
            title: `🛎️ New Order — ₹${orderData.total}`,
            body: `${orderData.userName} · ${itemsSummary.slice(0, 80)}`,
            data: { orderId: ref.id, type: 'new_order', url: '/vendor', customerName: orderData.userName || '', total: String(orderData.total || '') },
          }).catch(() => {})
        }
      }).catch(() => {})
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
  // Build the update payload — always update status + timestamp
  const updatePayload = { status, updatedAt: serverTimestamp() }

  // When the order is being cancelled, also persist the reason + actor so
  // both the user and founder dashboards can show *why* it was cancelled.
  if (status === 'cancelled') {
    if (orderData.cancellationReason) updatePayload.cancellationReason = orderData.cancellationReason
    if (orderData.cancelledBy)        updatePayload.cancelledBy = orderData.cancelledBy
    if (orderData.rejectionType)      updatePayload.rejectionType = orderData.rejectionType
    updatePayload.cancelledAt = serverTimestamp()
  }

  await updateDoc(doc(db, 'orders', orderId), updatePayload)

  const statusMessages = {
    accepted:         {
      title: '✅ Order Accepted!',
      body:  `${orderData.vendorName} accepted your order and will start preparing soon 🎉`,
    },
    preparing:        {
      title: '👨‍🍳 Chef is Cooking!',
      body:  `${orderData.vendorName} has started preparing your food. Fresh & hot coming up! 🍳`,
    },
    ready:            {
      title: '🎉 Your Order is Ready!',
      body:  `Your food is packed and ready. Delivery partner will pick it up shortly 📦`,
    },
    out_for_delivery: {
      title: '🛵 Out for Delivery!',
      body:  `Your order is on the way! Stay ready — it will arrive soon 🔔`,
    },
    delivered:        {
      title: '🎊 Order Delivered! Enjoy!',
      body:  `Your food from ${orderData.vendorName} has arrived. Rate your experience & order again! ⭐`,
    },
    cancelled:        {
      title: '❌ Order Cancelled',
      body:  orderData.cancellationReason || `Your order from ${orderData.vendorName} was cancelled`,
    },
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

      // 🔔 Web browser push (FCM) to user — fires even if tab is closed
      try {
        const userFcm = await getFcmToken(orderData.userUid, 'user')
        if (userFcm) {
          await sendWebPushNotification({
            fcmToken: userFcm,
            title: msg.title,
            body: msg.body,
            data: { orderId, type: 'order_status', url: '/home', status },
          })
        }
      } catch (err) {
        console.error('User FCM push failed:', err)
      }
    }
  }
}

// ── BROADCAST NOTIFICATIONS (Founder → All Users) ─────────────────────────
export const sendBroadcastNotification = async (title, body) => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    const tokens = []
    snap.forEach(docSnap => {
      const token = docSnap.data().expoPushToken
      if (token && typeof token === 'string' && token.trim() !== '') {
        tokens.push(token)
      }
    })

    if (tokens.length === 0) {
      console.warn('No user tokens found')
      return 0
    }

    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : ''
    await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        notifications: tokens.map(token => ({
          to: token,
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
          badge: 1,
        }))
      })
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

// ── FOUNDER: CREATE MANAGER ───────────────────────────────────────────────
export const founderCreateManager = async (founderUid, managerData) => {
  const { email, password, name, phone, city, district, assignedTalukas } = managerData

  if (!email || !password || !name || !city) {
    throw new Error('Email, password, name and city are required.')
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  const secondaryApp  = initializeApp(auth.app.options, 'mgr-' + Date.now())
  const secondaryAuth = getAuth(secondaryApp)

  let managerUid
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    managerUid = cred.user.uid
    await updateProfile(cred.user, { displayName: name })
    await signOut(secondaryAuth)
  } catch (err) {
    try { await deleteApp(secondaryApp) } catch (_) {}
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email':        'Invalid email address.',
      'auth/weak-password':        'Password is too weak (min 6 chars).',
    }
    throw new Error(errorMessages[err.code] || `Failed to create manager: ${err.message}`)
  }

  try { await deleteApp(secondaryApp) } catch (_) {}

  const managerDoc = {
    uid: managerUid,
    role: 'manager',
    name,
    email,
    phone:            phone || '',
    city,
    district:         district || city,
    assignedTalukas:  assignedTalukas || [],
    isActive:         true,
    createdBy:        founderUid,
    createdAt:        serverTimestamp(),
  }

  await setDoc(doc(db, 'users', managerUid), managerDoc)
  await setDoc(doc(db, 'managers', managerUid), managerDoc)

  return managerUid
}

// ── MANAGER DATA ──────────────────────────────────────────────────────────
export const getAllManagers = (callback) =>
  onSnapshot(collection(db, 'managers'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Managers error:', err.code); callback([]) }
  )
