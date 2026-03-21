// scripts/createFounder.js
// Run this ONCE to create the founder account in Firebase
// Usage: node scripts/createFounder.js

// ─────────────────────────────────────────
// CHANGE THESE BEFORE RUNNING
// ─────────────────────────────────────────
const FOUNDER_EMAIL = "feedozone2030@gmail.com"
const FOUNDER_PASSWORD = "YourStrongPass123"  // change this!
// ─────────────────────────────────────────

const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, doc, setDoc } = require('firebase/firestore')

// Paste your firebaseConfig here
const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  // ... rest of config
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createFounder() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, FOUNDER_EMAIL, FOUNDER_PASSWORD)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      role: 'founder',
      email: FOUNDER_EMAIL,
      name: 'Santosh Sangnod',
      createdAt: new Date()
    })
    console.log('✅ Founder account created!')
    console.log('Email:', FOUNDER_EMAIL)
    console.log('UID:', cred.user.uid)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

createFounder()
