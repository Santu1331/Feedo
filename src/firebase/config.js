import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyB2Q-qfQADa6FWrXnv5wFQrU4i9fdt3BQU",
  authDomain: "feedozone.firebaseapp.com",
  projectId: "feedozone",
  storageBucket: "feedozone.firebasestorage.app",
  messagingSenderId: "203132079474",
  appId: "1:203132079474:web:97886d0ca3fce961fea1eb"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
