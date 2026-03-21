import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, getAuth
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, collection, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  addDoc, deleteDoc, limit, getDocs
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { auth, db } from './config'

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logoutUser = () => signOut(auth)

export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── FOUNDER: CREATE VENDOR ────────────────────────
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
    createdBy: founderUid,
    createdAt: serverTimestamp()
  }

  await setDoc(doc(db, 'users', vendorUid), vendorDoc)
  await setDoc(doc(db, 'vendors', vendorUid), vendorDoc)
  return vendorUid
}

// ── VENDORS — simple collection read, no index needed ──
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

// ── MENU ──────────────────────────────────────────
export const getMenuItems = (vendorUid, callback) =>
  onSnapshot(
    collection(db, 'vendors', vendorUid, 'menu'),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error('Menu error:', err.code); callback([]) }
  )

export const addMenuItem = (vendorUid, item) =>
  addDoc(collection(db, 'vendors', vendorUid, 'menu'), {
    ...item, available: true, createdAt: serverTimestamp()
  })

export const updateMenuItem = (vendorUid, itemId, data) =>
  updateDoc(doc(db, 'vendors', vendorUid, 'menu', itemId), data)

export const deleteMenuItem = (vendorUid, itemId) =>
  deleteDoc(doc(db, 'vendors', vendorUid, 'menu', itemId))

// ── ORDERS — no orderBy to avoid index requirement ──
export const placeOrder = (orderData) =>
  addDoc(collection(db, 'orders'), {
    ...orderData, status: 'pending', createdAt: serverTimestamp()
  })

export const getVendorOrders = (vendorUid, callback) =>
  onSnapshot(
    query(collection(db, 'orders'), where('vendorUid', '==', vendorUid)),
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort client-side instead of Firestore orderBy
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
