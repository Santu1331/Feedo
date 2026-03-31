import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, getAuth
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, collection, updateDoc,
  query, where, onSnapshot, serverTimestamp,
  addDoc, deleteDoc
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

// ── FCM NOTIFICATIONS ─────────────────────────────────────────────────────
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
    rating: 4.5, totalOrders: 0, photo: '', banner: '',
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
// Stored at: vendors/{vendorUid}/combos/{comboId}
// Each combo has: name, description, comboPrice, originalPrice,
//                 items (array of {id, name, price, qty}),
//                 isVeg, available, tag, createdAt

/**
 * Listen to all combos for a vendor in real-time.
 * Use this in useEffect the same way getMenuItems is used.
 * Returns an unsubscribe function — call it on cleanup.
 */
export const getCombos = (vendorUid, callback) =>
  onSnapshot(
    collection(db, 'vendors', vendorUid, 'combos'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Combos error:', err.code); callback([]) }
  )

/**
 * Add a new combo under this vendor.
 * Returns the new doc ref (use ref.id if you need the new combo's ID).
 */
export const addCombo = (vendorUid, comboData) =>
  addDoc(collection(db, 'vendors', vendorUid, 'combos'), {
    ...comboData,
    available: true,
    createdAt: serverTimestamp()
  })

/**
 * Update any fields on an existing combo.
 */
export const updateCombo = (vendorUid, comboId, data) =>
  updateDoc(doc(db, 'vendors', vendorUid, 'combos', comboId), data)

/**
 * Permanently delete a combo.
 */
export const deleteCombo = (vendorUid, comboId) =>
  deleteDoc(doc(db, 'vendors', vendorUid, 'combos', comboId))

// ── ORDERS ────────────────────────────────────────────────────────────────
export const placeOrder = async (orderData) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData, status: 'pending', createdAt: serverTimestamp()
  })
  await sendNotification(orderData.vendorUid, {
    title: '🔔 New Order!',
    body: `${orderData.userName} ordered ₹${orderData.total} — ${orderData.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}`,
    data: { orderId: ref.id, type: 'new_order' }
  })
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
  if (orderData.userUid) {
    const statusMessages = {
      accepted:         { title: '✅ Order Accepted!',        body: `${orderData.vendorName} accepted your order` },
      preparing:        { title: '👨‍🍳 Preparing Your Order',  body: `${orderData.vendorName} is preparing your food` },
      ready:            { title: '🎉 Order Ready!',            body: 'Your order is ready for delivery' },
      out_for_delivery: { title: '🚴 Out for Delivery!',       body: 'Your order is on the way!' },
      delivered:        { title: '✅ Order Delivered!',        body: `Enjoy your meal! Rate ${orderData.vendorName}` },
      cancelled:        { title: '❌ Order Cancelled',         body: orderData.cancellationReason
                            ? `Cancelled: ${orderData.cancellationReason}`
                            : 'Your order was cancelled' },
    }
    const msg = statusMessages[status]
    if (msg) {
      await sendNotification(orderData.userUid, { ...msg, data: { orderId, type: 'order_status' } })
    }
  }
}