# FeedoZone — Full Stack Setup Guide
**React 18 + Firebase (Spark Plan) | Warananagar, Kolhapur**

---

## 🔥 STEP 1 — Firebase Project Setup

1. Go to https://console.firebase.google.com
2. Click "Add project" → name it `feedozone`
3. Disable Google Analytics (not needed) → Create project

### Enable Firebase Services:

#### Authentication
- Go to **Build → Authentication → Get Started**
- Click **Sign-in method** tab
- Enable **Email/Password** → Save

#### Firestore Database
- Go to **Build → Firestore Database → Create database**
- Choose **Start in test mode** (we'll add rules later)
- Select region: **asia-south1 (Mumbai)** → Enable

#### Realtime Database
- Go to **Build → Realtime Database → Create database**
- Choose **Start in test mode**
- Select region: **asia-south1** → Done

---

## 🔧 STEP 2 — Get Your Firebase Config

1. Go to **Project Settings** (gear icon) → **General tab**
2. Scroll to **"Your apps"** → Click **Web app icon (</>)**
3. Register app as `feedozone-web` → Copy the `firebaseConfig` object

Paste it in: `src/firebase/config.js`

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "feedozone.firebaseapp.com",
  databaseURL: "https://feedozone-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "feedozone",
  storageBucket: "feedozone.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123..."
}
```

> ⚠️ **Important**: `databaseURL` is required for Realtime DB. Find it in **Realtime Database → Copy the URL** shown at the top.

---

## 📦 STEP 3 — Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open: http://localhost:5173

---

## 👤 STEP 4 — Create Founder Account (One Time)

**Option A — Via Firebase Console (easiest):**
1. Go to **Authentication → Users → Add user**
2. Enter: `feedozone2030@gmail.com` + your password → Add user
3. Copy the **UID** shown
4. Go to **Firestore → feedozone → users collection → Add document**
5. Document ID = the UID you copied
6. Add fields:
   - `uid` (string) = same UID
   - `role` (string) = `founder`
   - `email` (string) = `feedozone2030@gmail.com`
   - `name` (string) = `Santosh Sangnod`

**Option B — Via script:**
```bash
# Edit scripts/createFounder.js with your config + credentials
node scripts/createFounder.js
```

---

## 🔒 STEP 5 — Set Security Rules

### Firestore Rules
- Go to **Firestore → Rules tab**
- Copy content from `firestore.rules` and paste → Publish

### Realtime DB Rules
- Go to **Realtime Database → Rules tab**
- Copy content from `database.rules.json` and paste → Publish

---

## 🚀 STEP 6 — Deploy to Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting + Firestore + Database)
firebase init

# Build the app
npm run build

# Deploy
firebase deploy
```

Your app will be live at: `https://feedozone.web.app`

---

## 📱 How the 3-Role System Works

| Role | Login | Dashboard |
|------|-------|-----------|
| **Founder** | feedozone2030@gmail.com | Overview, Orders, Vendors, Add Vendor |
| **Vendor** | Email/phone created by founder | Orders, Menu, Earnings, Settings |
| **User** | Self-register (coming soon) or any email | Browse, Cart, Orders, Profile |

### Adding a Vendor (Founder Flow):
1. Login as Founder
2. Go to **"+ Add Vendor"** tab
3. Choose Email+Pass or Phone+Pass
4. Fill store name, credentials, plan
5. Click **Create Vendor Account**
6. Share the email+password with the vendor
7. Vendor opens app → selects "Vendor" → logs in → dashboard opens!

---

## 📁 Project Structure

```
feedozone/
├── src/
│   ├── firebase/
│   │   ├── config.js          ← Your Firebase config goes here
│   │   └── services.js        ← All Firebase read/write functions
│   ├── hooks/
│   │   └── useAuth.jsx        ← Auth context (role detection)
│   ├── pages/
│   │   ├── LoginPage.jsx      ← Login with role selector
│   │   ├── UserApp.jsx        ← User dashboard (home, cart, orders)
│   │   ├── VendorApp.jsx      ← Vendor dashboard (orders, menu, earnings)
│   │   └── FounderApp.jsx     ← Founder dashboard (analytics + add vendor)
│   ├── App.jsx                ← Router + role-based redirects
│   ├── main.jsx               ← Entry point
│   └── index.css              ← Global styles (Zomato red theme)
├── firestore.rules            ← Firestore security rules
├── database.rules.json        ← Realtime DB security rules
├── scripts/
│   └── createFounder.js       ← One-time founder account creator
└── README.md
```

---

## ⚡ Spark Plan Limits (Free Tier)

| Service | Free Limit |
|---------|-----------|
| Auth users | 10,000/month |
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Realtime DB storage | 1 GB |
| Realtime DB transfer | 10 GB/month |
| Hosting bandwidth | 10 GB/month |

> ✅ More than enough for FeedoZone MVP across 40+ colleges!

---

## 🆘 Common Errors

| Error | Fix |
|-------|-----|
| `auth/invalid-credential` | Wrong email/password |
| `Missing databaseURL` | Add `databaseURL` to config.js |
| `Permission denied` | Deploy Firestore + RTDB rules |
| `auth/email-already-in-use` | Vendor email already registered |
| Vendor can't login | Make sure role='vendor' was saved in Firestore users collection |

---

*FeedoZone © 2025 — feedozone2030@gmail.com*
