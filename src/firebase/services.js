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
const CLOUDINARY_CLOUD = 'dqlwojavr'
const CLOUDINARY_PRESET = 'feedozone'
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`

/**
 * Upload image to Cloudinary (free, no Firebase Storage needed)
 * @param {File} file
 * @param {function} onProgress - optional callback(percent)
 * @returns {Promise<string>} secure image URL
 */
export const uploadPhoto = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_PRESET)
    formData.append('folder', 'feedozone')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', CLOUDINARY_URL)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText)
        resolve(res.secure_url)
      } else {
        reject(new Error('Cloudinary upload failed: ' + xhr.responseText))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}

/**
 * Upload vendor store photo → save URL to Firestore
 */
export const uploadVendorPhoto = async (vendorUid, file, type = 'photo', onProgress) => {
  const url = await uploadPhoto(file, onProgress)
  await updateDoc(doc(db, 'vendors', vendorUid), { [type]: url })
  try { await updateDoc(doc(db, 'users', vendorUid), { [type]: url }) } catch(e) {}
  return url
}

/**
 * Upload menu item photo → save URL to Firestore
 */
export const uploadMenuItemPhoto = async (vendorUid, itemId, file, onProgress) => {
  const url = await uploadPhoto(file, onProgress)
  await updateDoc(doc(db, 'vendors', vendorUid, 'menu', itemId), { photo: url })
  return url
}

// ── AUTH ──────────────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logoutUser = () => signOut(auth)

export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── FOUNDER: CREATE VENDOR ────────────────────────────────────────────────
export const founderCreateVendor = async (founderUid, vendorData) => {
  const { email, password, storeName, address, phone, plan, category } = vendorData

  const currentApp = auth.app
  const config = currentApp.options
  const secondaryApp = initializeApp(config, 'secondary-' + Date.now())
  const secondaryAuth = getAuth(secondaryApp)

  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
  const vendorUid = cred.user.uid
  await updateProfile(cred.user, { displayName: storeName })
  await signOut(secondaryAuth)

  const vendorDoc = {
    uid: vendorUid,
    role: 'vendor',
    email,
    storeName,
    address: address || '',
    phone: phone || '',
    plan: plan || '₹500/month',
    category: category || 'Thali',
    isOpen: false,
    prepTime: 20,
    subscriptionStatus: 'active',
    rating: 4.5,
    totalOrders: 0,
    photo: '',
    banner: '',
    createdBy: founderUid,
    createdAt: serverTimestamp()
  }

  await setDoc(doc(db, 'users', vendorUid), vendorDoc)
  await setDoc(doc(db, 'vendors', vendorUid), vendorDoc)
  return vendorUid
}

// ── VENDORS ───────────────────────────────────────────────────────────────
export const getAllVendors = (callback) =>
  onSnapshot(
    collection(db, 'vendors'),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (err) => { console.error('Vendors error:', err.code); callback([]) }
  )

export const updateVendorStore = async (uid, data) => {
  await updateDoc(doc(db, 'vendors', uid), data)
  try { await updateDoc(doc(db, 'users', uid), data) } catch(e) {}
}

// ── MENU ──────────────────────────────────────────────────────────────────
export const getMenuItems = (vendorUid, callback) =>
  onSnapshot(
    collection(db, 'vendors', vendorUid, 'menu'),
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

// ── ORDERS ────────────────────────────────────────────────────────────────
export const placeOrder = (orderData) =>
  addDoc(collection(db, 'orders'), {
    ...orderData, status: 'pending', createdAt: serverTimestamp()
  })

export const getVendorOrders = (vendorUid, callback) =>
  onSnapshot(
    query(collection(db, 'orders'), where('vendorUid', '==', vendorUid)),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      callback(orders)
    },
    err => { console.error('Vendor orders error:', err.code); callback([]) }
  )

export const getUserOrders = (userUid, callback) =>
  onSnapshot(
    query(collection(db, 'orders'), where('userUid', '==', userUid)),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      callback(orders)
    },
    err => { console.error('User orders error:', err.code); callback([]) }
  )

export const getAllOrders = (callback) =>
  onSnapshot(
    collection(db, 'orders'),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      callback(orders)
    },
    err => { console.error('All orders error:', err.code); callback([]) }
  )

export const updateOrderStatus = (orderId, status) =>
  updateDoc(doc(db, 'orders', orderId), {
    status, updatedAt: serverTimestamp()
  })