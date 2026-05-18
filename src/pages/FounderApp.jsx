import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getAllOrders, getAllVendors, founderCreateVendor,
  uploadPhoto, updateVendorStore, getBroadcastHistory
} from '../firebase/services'
import {
  doc, deleteDoc, getDocs, query, where, collection, addDoc,
  serverTimestamp, orderBy, limit, onSnapshot, updateDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'
import { useOrderAlert } from '../hooks/useOrderAlert'
import { usePendingOrderNotifier } from '../hooks/usePendingOrderNotifier'
import FounderBill from '../components/FounderBill'

const PUSH_URL = 'https://feedo-ruddy.vercel.app/api/send-push'

// ── SUBSCRIPTION CONFIG ────────────────────────────────────────────────────────
// Hardcoded onboarding dates for the 10 existing vendors (matched by storeName)
const VENDOR_ONBOARDING_DATES = {
  'Datt Cafe':         '2025-04-30',
  'Khandoli Canteen':  '2025-05-10',
  'Cafe Nisa':         '2025-05-07',
  'Sai Swad':          '2025-04-01',
  'Cafe Corner':       '2025-05-11',
  'Cafe Nonstop':      '2025-05-10',
  'Black Pearl':       '2025-03-25',
  'Kolhapuri Spice':   '2025-04-29',
  'Star Biryani':      '2025-03-30',
  'Super Heroes':      '2025-05-18',
}

const SUBSCRIPTION_PLANS = [
  { id: 'month1', label: '1st Month Intro', price: 99,  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { id: 'month2', label: '2nd Month+',      price: 149, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'free',   label: 'Free Trial',      price: 0,   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
]

// Returns { status, daysLeft, daysOverdue, planPrice, onboardedAt, subscriptionEnd }
function getSubscriptionStatus(vendor) {
  const storeName = vendor.storeName || ''
  const hardcodedDate = VENDOR_ONBOARDING_DATES[storeName]
  const onboardedAt = vendor.onboardedAt || hardcodedDate || vendor.createdAt?.toDate?.()?.toISOString?.()?.slice(0, 10) || null

  if (!onboardedAt) return { status: 'unknown', daysLeft: null, daysOverdue: null, planPrice: 99, onboardedAt: null, subscriptionEnd: null }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Use manual subscription end if founder has set one
  if (vendor.subscriptionEnd) {
    const end = new Date(vendor.subscriptionEnd)
    const diff = Math.floor((end - today) / 86400000)
    if (diff >= 0) return { status: 'active', daysLeft: diff, daysOverdue: 0, planPrice: vendor.planPrice || 99, onboardedAt, subscriptionEnd: vendor.subscriptionEnd }
    return { status: 'expired', daysLeft: 0, daysOverdue: Math.abs(diff), planPrice: vendor.planPrice || 149, onboardedAt, subscriptionEnd: vendor.subscriptionEnd }
  }

  // Calculate from onboarding date: 1 month = 30 days
  const onboarded = new Date(onboardedAt)
  const end = new Date(onboarded)
  end.setDate(end.getDate() + 30)
  const diff = Math.floor((end - today) / 86400000)

  if (diff >= 0) {
    return { status: 'active', daysLeft: diff, daysOverdue: 0, planPrice: 99, onboardedAt, subscriptionEnd: end.toISOString().slice(0, 10) }
  }
  return { status: 'expired', daysLeft: 0, daysOverdue: Math.abs(diff), planPrice: 149, onboardedAt, subscriptionEnd: end.toISOString().slice(0, 10) }
}

async function sendPushBatch(notifications) {
  const res = await fetch(PUSH_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ notifications })
  })
  if (!res.ok) throw new Error(`Push proxy returned ${res.status}`)
  return res.json()
}

// ── SUBSCRIPTION MANAGEMENT MODAL ─────────────────────────────────────────────
function SubscriptionModal({ vendor, onClose, onActivate, onDeactivate, onExtend }) {
  const sub = getSubscriptionStatus(vendor)
  const [extendMonths, setExtendMonths] = useState(1)
  const [customPrice, setCustomPrice] = useState(sub.planPrice || 149)
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const handleActivate = async () => {
    setActivating(true)
    const today = new Date()
    const end = new Date(today)
    end.setDate(end.getDate() + extendMonths * 30)
    await onActivate(vendor.id, end.toISOString().slice(0, 10), Number(customPrice))
    setActivating(false)
    onClose()
  }

  const handleDeactivate = async () => {
    setDeactivating(true)
    await onDeactivate(vendor.id)
    setDeactivating(false)
    onClose()
  }

  const isActive = vendor.subscriptionActive !== false && sub.status === 'active'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ background: isActive ? 'linear-gradient(135deg,#15803d,#16a34a)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', padding: '20px 20px 24px', borderRadius: '20px 20px 0 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 70, opacity: 0.08 }}>💳</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>SUBSCRIPTION</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{vendor.storeName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
                {isActive ? `✅ Active · ${sub.daysLeft} days left` : `🔴 Expired · ${sub.daysOverdue} days overdue`}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '20px 20px 40px' }}>
          {/* Status card */}
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 18, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>📋 Subscription Details</div>
            {[
              ['Onboarded', sub.onboardedAt || '—'],
              ['Subscription end', sub.subscriptionEnd || '—'],
              ['Current plan price', sub.planPrice ? `₹${sub.planPrice}/month` : '—'],
              ['Status', vendor.subscriptionActive === false ? '🔴 Manually Deactivated' : sub.status === 'active' ? '✅ Active' : '⚠️ Expired'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6b7280' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Activate / Extend */}
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 12 }}>✅ Activate / Extend Subscription</div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Extend by (months)</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {[1, 2, 3, 6].map(m => (
                  <button key={m} onClick={() => setExtendMonths(m)}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 12, fontWeight: 700, background: extendMonths === m ? '#16a34a' : '#fff', color: extendMonths === m ? '#fff' : '#374151', borderWidth: 1, borderStyle: 'solid', borderColor: extendMonths === m ? '#16a34a' : '#e5e7eb' }}>
                    {m}M
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Plan price (₹)</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {[99, 149].map(p => (
                  <button key={p} onClick={() => setCustomPrice(p)}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 12, fontWeight: 700, background: customPrice === p ? '#16a34a' : '#fff', color: customPrice === p ? '#fff' : '#374151', borderWidth: 1, borderStyle: 'solid', borderColor: customPrice === p ? '#16a34a' : '#e5e7eb' }}>
                    ₹{p}
                  </button>
                ))}
                <input type="number" value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', fontSize: 12, fontFamily: 'Poppins', outline: 'none', textAlign: 'center' }} />
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', marginBottom: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#15803d' }}>
                🗓️ New end date: <strong>{(() => {
                  const d = new Date()
                  d.setDate(d.getDate() + extendMonths * 30)
                  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                })()}</strong>
              </div>
            </div>
            <button onClick={handleActivate} disabled={activating}
              style={{ width: '100%', background: activating ? '#86efac' : '#16a34a', color: '#fff', border: 'none', padding: '13px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: activating ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {activating ? '⏳ Activating...' : `✅ Activate for ${extendMonths} Month${extendMonths > 1 ? 's' : ''} (₹${customPrice})`}
            </button>
          </div>

          {/* Deactivate */}
          <div style={{ background: '#fff5f5', borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>🔴 Deactivate Access</div>
            <div style={{ fontSize: 11, color: '#991b1b', marginBottom: 12, lineHeight: 1.6 }}>
              The vendor will see a payment lockout screen. They cannot access orders, menu, or settings until you reactivate.
            </div>
            <button onClick={handleDeactivate} disabled={deactivating}
              style={{ width: '100%', background: deactivating ? '#fca5a5' : '#dc2626', color: '#fff', border: 'none', padding: '12px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: deactivating ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
              {deactivating ? '⏳ Deactivating...' : '🔴 Deactivate Vendor Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CUSTOMER PROFILE MODAL ───────────────────────────────────────────────────
function CustomerProfileModal({ customer, orders, onClose, broadcastMsg, broadcastTitle }) {
  if (!customer) return null
  const userOrders = orders.filter(o => o.userUid === customer.id || o.userPhone === customer.phone || o.userPhone === customer.mobile)
  const delivered = userOrders.filter(o => o.status === 'delivered')
  const totalSpent = delivered.reduce((s, o) => s + (o.total || 0), 0)
  const cancelled = userOrders.filter(o => o.status === 'cancelled')

  const vendorCount = {}
  userOrders.forEach(o => { vendorCount[o.vendorName] = (vendorCount[o.vendorName] || 0) + 1 })
  const favVendor = Object.entries(vendorCount).sort((a, b) => b[1] - a[1])[0]

  const itemCount = {}
  userOrders.forEach(o => { o.items?.forEach(i => { itemCount[i.name] = (itemCount[i.name] || 0) + i.qty }) })
  const favItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0]

  const weeklyData = []
  for (let w = 7; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7)
    const end = new Date(); end.setDate(end.getDate() - w * 7)
    const count = userOrders.filter(o => {
      const d = o.createdAt?.toDate?.()
      return d && d >= start && d < end
    }).length
    weeklyData.push({ week: `W${8 - w}`, count })
  }

  const maxWeek = Math.max(...weeklyData.map(w => w.count), 1)
  const lastOrder = userOrders[0]?.createdAt?.toDate?.()
  const daysSince = lastOrder ? Math.floor((Date.now() - lastOrder) / 86400000) : null
  const phone = customer.mobile || customer.phone || ''
  const wa91 = '91' + phone.replace(/\D/g, '')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 430, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{customer.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{customer.name || 'Unknown'}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{customer.email || '—'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Orders', val: userOrders.length, color: '#E24B4A', bg: '#fff5f5' },
            { label: 'Spent', val: '₹' + totalSpent.toLocaleString(), color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Cancelled', val: cancelled.length, color: '#f59e0b', bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 12 }}>
          {[
            ['📞 Phone', phone || '—'],
            ['📧 Email', customer.email || '—'],
            ['📅 Joined', customer.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '—'],
            ['🕐 Last Order', daysSince !== null ? (daysSince === 0 ? 'Today' : `${daysSince} days ago`) : '—'],
            ['❤️ Fav Vendor', favVendor ? `${favVendor[0]} (${favVendor[1]}x)` : '—'],
            ['🍽️ Fav Item', favItem ? `${favItem[0]} (${favItem[1]}x)` : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, color: '#6b7280', flexShrink: 0, marginRight: 8 }}>{k}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1f2937', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>📊 Weekly Order History</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, background: '#f9fafb', borderRadius: 10, padding: '10px 10px 6px' }}>
            {weeklyData.map(w => (
              <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', background: w.count > 0 ? '#E24B4A' : '#e5e7eb', borderRadius: '3px 3px 0 0', height: Math.max((w.count / maxWeek) * 40, w.count > 0 ? 6 : 3) }} />
                <div style={{ fontSize: 8, color: '#9ca3af' }}>{w.week}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {phone && (
            <a href={`https://wa.me/${wa91}?text=${encodeURIComponent(broadcastMsg?.replace(/{name}/g, customer.name || 'there') || `Hi ${customer.name || 'there'}! 🍽️ Order from FeedoZone today!`)}`}
              target="_blank" rel="noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', background: '#25D366', borderRadius: 10, textDecoration: 'none' }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Poppins' }}>WhatsApp</span>
            </a>
          )}
          {customer.email && (
            <a href={`mailto:${customer.email}?subject=${encodeURIComponent(broadcastTitle || 'Message from FeedoZone')}&body=${encodeURIComponent(broadcastMsg?.replace(/{name}/g, customer.name || 'there') || 'Hi from FeedoZone!')}`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', background: '#3b82f6', borderRadius: 10, textDecoration: 'none' }}>
              <span style={{ fontSize: 16 }}>📧</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Poppins' }}>Email</span>
            </a>
          )}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>🧾 Recent Orders</div>
        {userOrders.slice(0, 8).map((o, i) => (
          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{o.vendorName}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{o.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>₹{o.total}</div>
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, fontWeight: 600, background: o.status === 'delivered' ? '#d1fae5' : o.status === 'cancelled' ? '#fee2e2' : '#fef3c7', color: o.status === 'delivered' ? '#065f46' : o.status === 'cancelled' ? '#991b1b' : '#92400e' }}>{o.status}</span>
            </div>
          </div>
        ))}
        {userOrders.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No orders yet</div>}
      </div>
    </div>
  )
}

// ── VENDOR REORDER MODAL ─────────────────────────────────────────────────────
function VendorReorderModal({ vendors, onClose, onSave }) {
  const [list, setList] = useState(() =>
    [...vendors].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999))
  )
  const [saving, setSaving] = useState(false)
  const dragIdx = useRef(null)
  const dragOverIdx = useRef(null)

  const moveUp = (i) => { if (i === 0) return; const next = [...list]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setList(next) }
  const moveDown = (i) => { if (i === list.length - 1) return; const next = [...list]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; setList(next) }
  const moveToTop = (i) => { if (i === 0) return; const next = [...list]; const [item] = next.splice(i, 1); next.unshift(item); setList(next) }
  const moveToBottom = (i) => { if (i === list.length - 1) return; const next = [...list]; const [item] = next.splice(i, 1); next.push(item); setList(next) }
  const handleDragStart = (i) => { dragIdx.current = i }
  const handleDragOver = (e, i) => { e.preventDefault(); dragOverIdx.current = i }
  const handleDrop = () => {
    const from = dragIdx.current; const to = dragOverIdx.current
    if (from === null || to === null || from === to) return
    const next = [...list]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setList(next)
    dragIdx.current = null; dragOverIdx.current = null
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(list.map((v, i) => updateDoc(doc(db, 'vendors', v.id), { sortOrder: i })))
      toast.success('✅ Vendor order saved!'); onSave(list); onClose()
    } catch (err) { toast.error('Failed to save order: ' + err.message) }
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 430, maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ padding: '16px 16px 12px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>🔢 Set Vendor Display Order</div>
            <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Drag vendors or use arrows · #1 appears first for customers</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {list.map((v, i) => (
            <div key={v.id} draggable onDragStart={() => handleDragStart(i)} onDragOver={(e) => handleDragOver(e, i)} onDrop={handleDrop}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 12, padding: '10px 12px', marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', cursor: 'grab', userSelect: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: i === 0 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : i === 1 ? '#d1d5db' : i === 2 ? '#f97316' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i < 3 ? '#fff' : '#6b7280' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {v.photo ? <img src={v.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18 }}>🏪</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.storeName}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{v.category}{v.town ? ` · 📍${v.town}` : ''}<span style={{ marginLeft: 6, color: v.isOpen ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{v.isOpen ? '● Open' : '● Closed'}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  <button onClick={() => moveToTop(i)} disabled={i === 0} style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: i === 0 ? '#f9fafb' : '#fff5f5', color: i === 0 ? '#d1d5db' : '#E24B4A', cursor: i === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700 }}>⏫</button>
                  <button onClick={() => moveUp(i)} disabled={i === 0} style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: i === 0 ? '#f9fafb' : '#fff5f5', color: i === 0 ? '#d1d5db' : '#E24B4A', cursor: i === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}>↑</button>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  <button onClick={() => moveToBottom(i)} disabled={i === list.length - 1} style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: i === list.length - 1 ? '#f9fafb' : '#fff5f5', color: i === list.length - 1 ? '#d1d5db' : '#E24B4A', cursor: i === list.length - 1 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700 }}>⏬</button>
                  <button onClick={() => moveDown(i)} disabled={i === list.length - 1} style={{ width: 26, height: 22, borderRadius: 5, border: 'none', background: i === list.length - 1 ? '#f9fafb' : '#fff5f5', color: i === list.length - 1 ? '#d1d5db' : '#E24B4A', cursor: i === list.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}>↓</button>
                </div>
              </div>
              <div style={{ color: '#d1d5db', fontSize: 16, cursor: 'grab', paddingLeft: 4 }}>⠿</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f3f4f6', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10, textAlign: 'center' }}>💡 This order is shown to customers on the home screen</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: saving ? '#f09595' : '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>{saving ? 'Saving...' : '✅ Save Order'}</button>
          </div>
        </div>
      </div>
    </div>
  )
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
    return () => { document.removeEventListener('click', unlock); document.removeEventListener('touchstart', unlock) }
  }, [])

  const [analyticsTab, setAnalyticsTab] = useState('overview')
  const [orderFilter, setOrderFilter] = useState('all')
  const [users, setUsers] = useState([])
  const [selectedTown, setSelectedTown] = useState('all')

  const [supportTickets, setSupportTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const [showFounderBill, setShowFounderBill] = useState(false)
  const [founderBillOrder, setFounderBillOrder] = useState(null)

  const [exportMonth, setExportMonth] = useState(new Date().getMonth())
  const [exportYear, setExportYear] = useState(new Date().getFullYear())

  const [vendorPhotoFile, setVendorPhotoFile] = useState(null)
  const [vendorPhotoPreview, setVendorPhotoPreview] = useState(null)
  const [photoProgress, setPhotoProgress] = useState(0)
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState(null)
  const [existingProgress, setExistingProgress] = useState(0)
  const photoRef = useRef()

  const [newVendorLoc, setNewVendorLoc] = useState(null)
  const [newVendorLocName, setNewVendorLocName] = useState('')
  const [locSearch, setLocSearch] = useState('')
  const [locSuggestions, setLocSuggestions] = useState([])
  const [searchingLoc, setSearchingLoc] = useState(false)
  const [detectingLoc, setDetectingLoc] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerFilter, setCustomerFilter] = useState('all')
  const [customerSearch, setCustomerSearch] = useState('')

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

  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushTarget, setPushTarget] = useState('all')
  const [pushTown, setPushTown] = useState('all')
  const [sendingPush, setSendingPush] = useState(false)
  const [pushDone, setPushDone] = useState(null)
  const [pushHistory, setPushHistory] = useState([])
  const [pushProgress, setPushProgress] = useState(0)

  const [showReorderModal, setShowReorderModal] = useState(false)
  const [togglingVendor, setTogglingVendor] = useState(null)
  const [userExportFilter, setUserExportFilter] = useState('all')

  // ── SUBSCRIPTION STATE ─────────────────────────────────────────────────────
  const [subscriptionTab, setSubscriptionTab] = useState('all')
  const [selectedSubVendor, setSelectedSubVendor] = useState(null)
  const [subSearchQuery, setSubSearchQuery] = useState('')

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

  useEffect(() => {
    const u1 = getAllOrders(setOrders)
    const u2 = getAllVendors(setVendors)
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    const unsubTickets = onSnapshot(collection(db, 'supportTickets'), snap => {
      const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      tickets.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setSupportTickets(tickets)
    })
    try { const bq = query(collection(db, 'broadcastHistory'), orderBy('sentAt', 'desc'), limit(20)); onSnapshot(bq, snap => setBroadcastHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))) } catch (e) {}
    try { const pq = query(collection(db, 'pushHistory'), orderBy('sentAt', 'desc'), limit(20)); onSnapshot(pq, snap => setPushHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))) } catch (e) {}
    return () => { u1(); u2(); unsubUsers(); unsubTickets() }
  }, [])

  useEffect(() => {
    if (orders.length === 0) { prevOrderCountRef.current = 0; return }
    if (orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
      const latest = orders[0]; setNewOrderAlert(latest); startAlarm()
      toast('🔔 New order from ' + latest.userName + ' — ₹' + latest.total, { duration: 8000, icon: '🍽️', style: { background: '#1f2937', color: '#fff', fontFamily: 'Poppins' } })
      setTimeout(() => stopAlarm(), 15000)
    }
    prevOrderCountRef.current = orders.length
  }, [orders])

  // ── SUBSCRIPTION HANDLERS ──────────────────────────────────────────────────
  const handleActivateSubscription = async (vendorId, subscriptionEnd, planPrice) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        subscriptionActive: true,
        subscriptionEnd,
        planPrice,
        subscriptionActivatedAt: new Date().toISOString(),
        subscriptionActivatedBy: user?.email || 'founder'
      })
      toast.success('✅ Subscription activated!')
    } catch (err) { toast.error('Failed to activate: ' + err.message) }
  }

  const handleDeactivateSubscription = async (vendorId) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), {
        subscriptionActive: false,
        subscriptionDeactivatedAt: new Date().toISOString(),
        subscriptionDeactivatedBy: user?.email || 'founder'
      })
      toast.success('🔴 Vendor deactivated')
    } catch (err) { toast.error('Failed to deactivate: ' + err.message) }
  }

  // ── DERIVED DATA ──────────────────────────────────────────────────────────
  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate?.()
    if (!d) return false
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  })
  const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
  const subRevenue = vendors.length * 500
  const allTowns = [...new Set(vendors.map(v => v.town || v.locationName || null).filter(Boolean))].sort()
  const sortedVendors = [...vendors].sort((a, b) => {
    const sa = a.sortOrder ?? 9999; const sb = b.sortOrder ?? 9999
    if (sa !== sb) return sa - sb
    return (a.storeName || '').localeCompare(b.storeName || '')
  })
  const filteredVendors = selectedTown === 'all' ? sortedVendors : sortedVendors.filter(v => (v.town || v.locationName) === selectedTown)

  // Subscription stats
  const subStats = {
    total: vendors.length,
    active: vendors.filter(v => {
      const sub = getSubscriptionStatus(v)
      return v.subscriptionActive !== false && sub.status === 'active'
    }).length,
    expired: vendors.filter(v => {
      const sub = getSubscriptionStatus(v)
      return sub.status === 'expired' && v.subscriptionActive !== false
    }).length,
    deactivated: vendors.filter(v => v.subscriptionActive === false).length,
    expiringSoon: vendors.filter(v => {
      const sub = getSubscriptionStatus(v)
      return v.subscriptionActive !== false && sub.status === 'active' && sub.daysLeft <= 7
    }).length,
    monthlyRevenue: vendors.filter(v => {
      const sub = getSubscriptionStatus(v)
      return v.subscriptionActive !== false && sub.status === 'active'
    }).reduce((s, v) => s + (getSubscriptionStatus(v).planPrice || 99), 0)
  }

  // ── CUSTOMER ANALYTICS ────────────────────────────────────────────────────
  const buildCustomerMap = () => {
    const map = {}
    users.forEach(u => { map[u.id] = { id: u.id, name: u.name || u.displayName || 'Unknown', email: u.email || '', phone: u.mobile || u.phone || '', mobile: u.mobile || u.phone || '', expoPushToken: u.expoPushToken || null, createdAt: u.createdAt || null, orders: [], totalSpent: 0, deliveredCount: 0, cancelledCount: 0, lastOrderDate: null, firstOrderDate: null, weeklyOrders: {} } })
    orders.forEach(o => {
      const uid = o.userUid; if (!uid) return
      if (!map[uid]) { map[uid] = { id: uid, name: o.userName || 'Unknown', email: o.userEmail || '', phone: o.userPhone || '', mobile: o.userPhone || '', expoPushToken: null, createdAt: null, orders: [], totalSpent: 0, deliveredCount: 0, cancelledCount: 0, lastOrderDate: null, firstOrderDate: null, weeklyOrders: {} } }
      const c = map[uid]
      if (!c.name || c.name === 'Unknown') c.name = o.userName || 'Unknown'
      if (!c.phone) c.phone = o.userPhone || ''
      if (!c.mobile) c.mobile = o.userPhone || ''
      c.orders.push(o)
      const d = o.createdAt?.toDate?.()
      if (d) {
        if (!c.lastOrderDate || d > c.lastOrderDate) c.lastOrderDate = d
        if (!c.firstOrderDate || d < c.firstOrderDate) c.firstOrderDate = d
      }
      if (o.status === 'delivered') { c.deliveredCount++; c.totalSpent += o.total || 0 }
      if (o.status === 'cancelled') c.cancelledCount++
    })
    return Object.values(map).filter(c => c.orders.length > 0 || users.find(u => u.id === c.id))
  }

  const allCustomers = buildCustomerMap()
  const now = new Date()
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - now.getDay()); thisWeekStart.setHours(0, 0, 0, 0)
  const thirtyAgo = new Date(Date.now() - 30 * 86400000)
  const sevenAgo = new Date(Date.now() - 7 * 86400000)

  const getFilteredCustomers = () => {
    let list = [...allCustomers]
    switch (customerFilter) {
      case 'repeat': list = list.filter(c => c.deliveredCount >= 2); break
      case 'weekly': list = list.filter(c => c.lastOrderDate && c.lastOrderDate >= thisWeekStart); break
      case 'top': list = list.sort((a, b) => b.deliveredCount - a.deliveredCount).slice(0, 20); break
      case 'inactive': list = list.filter(c => c.orders.length > 0 && (!c.lastOrderDate || c.lastOrderDate < thirtyAgo)); break
      case 'new': list = list.filter(c => c.firstOrderDate && c.firstOrderDate >= sevenAgo); break
      case 'highspend': list = list.filter(c => c.totalSpent >= 500).sort((a, b) => b.totalSpent - a.totalSpent); break
      default: list = list.filter(c => c.orders.length > 0); break
    }
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase()
      list = list.filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q))
    }
    if (customerFilter !== 'top' && customerFilter !== 'highspend') list = list.sort((a, b) => b.orders.length - a.orders.length)
    return list
  }

  const filteredCustomers = getFilteredCustomers()
  const customerStats = {
    total: allCustomers.filter(c => c.orders.length > 0).length,
    repeat: allCustomers.filter(c => c.deliveredCount >= 2).length,
    thisWeek: allCustomers.filter(c => c.lastOrderDate && c.lastOrderDate >= thisWeekStart).length,
    inactive: allCustomers.filter(c => c.orders.length > 0 && (!c.lastOrderDate || c.lastOrderDate < thirtyAgo)).length,
    newThisWeek: allCustomers.filter(c => c.firstOrderDate && c.firstOrderDate >= sevenAgo).length,
    withPhone: allCustomers.filter(c => c.phone).length,
    withEmail: allCustomers.filter(c => c.email).length,
    withToken: allCustomers.filter(c => c.expoPushToken).length,
  }

  const copyAllWhatsApp = (list) => {
    const nums = list.filter(c => c.phone).map(c => '91' + c.phone.replace(/\D/g, '')).join('\n')
    if (!nums) return toast.error('No phone numbers found')
    navigator.clipboard?.writeText(nums).then(() => toast.success(`✅ Copied ${list.filter(c => c.phone).length} numbers!`)).catch(() => {
      const ta = document.createElement('textarea'); ta.value = nums; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
      toast.success(`✅ Copied ${list.filter(c => c.phone).length} numbers!`)
    })
  }

  const sendBulkEmail = (list, title, body) => {
    const emails = list.filter(c => c.email).map(c => c.email)
    if (!emails.length) return toast.error('No email addresses found')
    const batchSize = 50; const batches = []
    for (let i = 0; i < emails.length; i += batchSize) batches.push(emails.slice(i, i + batchSize))
    toast(`📧 Opening ${batches.length} mail window(s) for ${emails.length} recipients`, { duration: 5000 })
    batches.forEach((batch, i) => { setTimeout(() => { window.open(`mailto:?bcc=${encodeURIComponent(batch.join(','))}&subject=${encodeURIComponent(title || 'Message from FeedoZone')}&body=${encodeURIComponent(body?.replace(/{name}/g, 'there') || 'Hi from FeedoZone!')}`, '_blank') }, i * 600) })
  }

  const exportUserDatabase = (filterType = 'all') => {
    let list = [...users]
    if (filterType === 'with_phone') list = list.filter(u => u.mobile || u.phone)
    else if (filterType === 'with_email') list = list.filter(u => u.email)
    else if (filterType === 'with_token') list = list.filter(u => u.expoPushToken && u.expoPushToken.startsWith('ExponentPushToken'))
    else if (filterType === 'active') { const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyAgo).map(o => o.userUid)); list = list.filter(u => activeUids.has(u.id)) }
    else if (filterType === 'inactive') { const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyAgo).map(o => o.userUid)); list = list.filter(u => !activeUids.has(u.id)) }
    if (!list.length) return toast.error('No users found for this filter!')
    const customerMap = {}; allCustomers.forEach(c => { customerMap[c.id] = c })
    const headers = ['Sr No', 'Name', 'WhatsApp Number', 'Email', 'WhatsApp Link', 'Total Orders', 'Delivered Orders', 'Cancelled Orders', 'Total Spent (₹)', 'Last Order Date', 'First Order Date', 'Days Since Last Order', 'Customer Type', 'Push Token', 'Has App', 'Joined Date', 'User ID']
    const rows = list.map((u, idx) => {
      const c = customerMap[u.id]; const phone = u.mobile || u.phone || ''; const cleanPhone = phone.replace(/\D/g, ''); const waNumber = cleanPhone ? '91' + cleanPhone : ''; const waLink = waNumber ? `https://wa.me/${waNumber}` : ''; const daysSince = c?.lastOrderDate ? Math.floor((Date.now() - c.lastOrderDate) / 86400000) : ''
      const isRepeat = (c?.deliveredCount || 0) >= 2; const isNew = c?.firstOrderDate && c.firstOrderDate >= sevenAgo; const isInactive = c?.orders?.length > 0 && (!c?.lastOrderDate || c.lastOrderDate < thirtyAgo)
      let customerType = 'New User'
      if (isRepeat) customerType = 'Repeat Customer'
      else if (isInactive) customerType = 'Inactive'
      else if (isNew) customerType = 'New Customer'
      else if ((c?.orders?.length || 0) > 0) customerType = 'One-time'
      return [idx + 1, u.name || u.displayName || '—', phone || '—', u.email || '—', waLink || '—', c?.orders?.length || 0, c?.deliveredCount || 0, c?.cancelledCount || 0, c?.totalSpent || 0, c?.lastOrderDate?.toLocaleDateString('en-IN') || '—', c?.firstOrderDate?.toLocaleDateString('en-IN') || '—', daysSince !== '' ? (daysSince === 0 ? 'Today' : daysSince + ' days') : '—', customerType, u.expoPushToken ? u.expoPushToken : '—', u.expoPushToken ? 'Yes' : 'No', u.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || '—', u.id]
    })
    const withPhone = list.filter(u => u.mobile || u.phone).length; const withEmail = list.filter(u => u.email).length; const withToken = list.filter(u => u.expoPushToken).length; const totalRevenue = list.reduce((s, u) => s + (customerMap[u.id]?.totalSpent || 0), 0)
    rows.push([], ['=== SUMMARY ==='], ['Total Users Exported', list.length], ['Users with WhatsApp', withPhone], ['Users with Email', withEmail], ['Users with App (Push Token)', withToken], ['Total Revenue from these users', '₹' + totalRevenue.toLocaleString()], ['Exported on', new Date().toLocaleString('en-IN')], ['Exported by', user?.email || 'Founder'])
    const filterLabel = filterType === 'all' ? 'All' : filterType === 'with_phone' ? 'WithPhone' : filterType === 'with_email' ? 'WithEmail' : filterType === 'with_token' ? 'WithApp' : filterType === 'active' ? 'Active' : 'Inactive'
    const filename = `FeedoZone_Users_${filterLabel}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`
    const csvContent = [headers, ...rows].map(row => row.map(cell => '"' + String(cell ?? '').replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
    toast.success(`✅ Downloaded ${list.length} users — ${filename}`)
  }

  const handleToggleVendor = async (vendorId, currentStatus) => {
    setTogglingVendor(vendorId)
    try { await updateDoc(doc(db, 'vendors', vendorId), { isOpen: !currentStatus }); toast.success(!currentStatus ? '✅ Vendor is now OPEN' : '🔴 Vendor is now CLOSED') }
    catch (err) { toast.error('Failed to update vendor: ' + err.message) }
    setTogglingVendor(null)
  }

  const getPushTargetUsers = (target, town) => {
    let targetUsers = users
    if (target === 'active') { const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyAgo).map(o => o.userUid)); targetUsers = users.filter(u => activeUids.has(u.id)) }
    else if (target === 'inactive') { const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyAgo).map(o => o.userUid)); targetUsers = users.filter(u => !activeUids.has(u.id)) }
    if (town && town !== 'all') { const townVendorIds = new Set(vendors.filter(v => (v.town || v.locationName) === town).map(v => v.id)); const townUserUids = new Set(orders.filter(o => townVendorIds.has(o.vendorUid)).map(o => o.userUid)); targetUsers = targetUsers.filter(u => townUserUids.has(u.id)) }
    return targetUsers
  }

  const getPushTargetCount = (t) => getPushTargetUsers(t, pushTown).length
  const usersWithTokenCount = users.filter(u => u.expoPushToken && u.expoPushToken.startsWith('ExponentPushToken')).length

  const handleSendPush = async () => {
    if (!pushTitle.trim()) return toast.error('Enter a notification title')
    if (!pushBody.trim()) return toast.error('Enter a notification message')
    setSendingPush(true); setPushProgress(0); setPushDone(null)
    try {
      const targetUsers = getPushTargetUsers(pushTarget, pushTown)
      const usersWithTokens = targetUsers.filter(u => u.expoPushToken && u.expoPushToken.startsWith('ExponentPushToken'))
      const noToken = targetUsers.length - usersWithTokens.length
      if (usersWithTokens.length === 0) { toast.error('No users have push tokens!'); setSendingPush(false); return }
      const tokens = usersWithTokens.map(u => u.expoPushToken)
      const batches = []; for (let i = 0; i < tokens.length; i += 100) batches.push(tokens.slice(i, i + 100))
      let sent = 0, failed = 0
      for (let bi = 0; bi < batches.length; bi++) {
        try {
          const notifications = batches[bi].map(token => ({ to: token, title: pushTitle.trim(), body: pushBody.trim(), sound: 'default', priority: 'high', channelId: 'default', badge: 1, data: { type: 'broadcast', screen: 'Home' }, android: { channelId: 'default', priority: 'high', sound: 'default' } }))
          const result = await sendPushBatch(notifications)
          if (result?.data) result.data.forEach(r => r.status === 'ok' ? sent++ : failed++)
          else sent += batches[bi].length
        } catch { failed += batches[bi].length }
        setPushProgress(Math.round(((bi + 1) / batches.length) * 100))
      }
      await addDoc(collection(db, 'pushHistory'), { title: pushTitle, body: pushBody, target: pushTarget, town: pushTown !== 'all' ? pushTown : 'all', totalUsers: targetUsers.length, sent, failed, noToken, sentAt: serverTimestamp(), sentBy: user?.email || 'founder' })
      setPushDone({ sent, failed, noToken, total: targetUsers.length }); toast.success(`✅ Push sent to ${sent} users!`)
    } catch (err) { toast.error('Push failed: ' + err.message) }
    setSendingPush(false)
  }

  const handleTestPush = async () => {
    const myUser = users.find(u => u.email === user?.email)
    if (!myUser?.expoPushToken) { toast.error("You don't have a push token. Install the app first."); return }
    try {
      const result = await sendPushBatch([{ to: myUser.expoPushToken, title: pushTitle || '🧪 Test Push from FeedoZone', body: pushBody || 'If you see this, push notifications are working! ✅', sound: 'default', priority: 'high', channelId: 'default', data: { type: 'test' }, android: { channelId: 'default', priority: 'high', sound: 'default' } }])
      if (result?.data?.[0]?.status === 'ok') toast.success('✅ Test push sent!')
      else toast.error('Test push error: ' + JSON.stringify(result?.data?.[0]))
    } catch (err) { toast.error('Test failed: ' + err.message) }
  }

  const getBroadcastUsers = () => {
    if (broadcastTarget === 'all') return users
    const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyAgo).map(o => o.userUid))
    if (broadcastTarget === 'active') return users.filter(u => activeUids.has(u.id))
    return users.filter(u => !activeUids.has(u.id))
  }

  const sendWhatsAppToUser = (phone, name, message) => {
    const personalised = message.replace(/{name}/g, name || 'there')
    const number = phone.replace(/\D/g, ''); const fullNumber = number.startsWith('91') ? number : '91' + number
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(personalised)}`
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
      await addDoc(collection(db, 'broadcastHistory'), { title: broadcastTitle || 'Broadcast', message: broadcastMsg, type: broadcastType, target: broadcastTarget, totalUsers: targetUsers.length, sentAt: serverTimestamp(), sentBy: user?.email || 'founder' })
      if (sendViaWP) {
        const wpUsers = targetUsers.filter(u => u.mobile || u.phone)
        if (wpUsers.length === 0) { toast.error('No users have WhatsApp numbers saved') }
        else { wpUsers.slice(0, 3).forEach((u, i) => { setTimeout(() => window.open(sendWhatsAppToUser(u.mobile || u.phone, u.name, broadcastMsg), '_blank'), i * 800) }); sent += wpUsers.length }
      }
      if (sendViaEmail) {
        const emUsers = targetUsers.filter(u => u.email)
        if (emUsers.length === 0) { toast.error('No users have email addresses') }
        else {
          const batchSize = 50; const emailBatches = []; for (let i = 0; i < emUsers.length; i += batchSize) emailBatches.push(emUsers.slice(i, i + batchSize))
          emailBatches.forEach((batch, idx) => { setTimeout(() => { const bccList = batch.map(u => u.email).join(','); window.open(`mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(broadcastTitle || 'Message from FeedoZone')}&body=${encodeURIComponent(broadcastMsg.replace(/{name}/g, 'there'))}`, '_blank') }, idx * 600) })
          sent += emUsers.length
        }
      }
      setBroadcastProgress(100); setBroadcastDone({ sent, wpCount: sendViaWP ? targetUsers.filter(u => u.mobile || u.phone).length : 0, emailCount: sendViaEmail ? targetUsers.filter(u => u.email).length : 0 })
      toast.success(`✅ Broadcast sent to ${sent} users!`)
    } catch (err) { toast.error('Broadcast failed: ' + err.message) }
    setSendingBroadcast(false)
  }

  const reverseGeocode = async (lat, lng) => {
    try { const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`); const data = await res.json(); const addr = data.address || {}; return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || 'Location' } catch { return 'Location' }
  }

  const handleDetectVendorLoc = async () => {
    setDetectingLoc(true)
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }))
      const lat = pos.coords.latitude, lng = pos.coords.longitude; const name = await reverseGeocode(lat, lng)
      setNewVendorLoc({ lat, lng }); setNewVendorLocName(name); toast.success(`📍 ${name}`)
    } catch { toast.error('Could not detect location') }
    setDetectingLoc(false)
  }

  const handleLocSearch = async (q) => {
    setLocSearch(q); if (q.length < 3) { setLocSuggestions([]); return }
    setSearchingLoc(true)
    try { const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`); const data = await res.json(); setLocSuggestions(data.map(d => ({ name: d.display_name.split(',').slice(0, 3).join(', '), lat: parseFloat(d.lat), lng: parseFloat(d.lon) }))) }
    catch { setLocSuggestions([]) }
    setSearchingLoc(false)
  }

  const handleSelectVendorLoc = (s) => {
    setNewVendorLoc({ lat: s.lat, lng: s.lng }); const town = s.name.split(',')[0]; setNewVendorLocName(town); setForm(p => ({ ...p, town }))
    setLocSearch(''); setLocSuggestions([]); toast.success(`📍 ${town}`)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setVendorPhotoFile(file); setVendorPhotoPreview(URL.createObjectURL(file))
  }

  const handleExistingVendorPhoto = async (e, vendorId) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    setUploadingPhotoFor(vendorId); setExistingProgress(0)
    try { const url = await uploadPhoto(file, setExistingProgress); await updateVendorStore(vendorId, { photo: url }); toast.success('Vendor photo updated! ✅') }
    catch { toast.error('Upload failed.') }
    setUploadingPhotoFor(null); setExistingProgress(0); e.target.value = ''
  }

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
      const maxOrder = vendors.reduce((m, v) => Math.max(m, v.sortOrder ?? 0), 0)
      const today = new Date().toISOString().slice(0, 10)
      const vendorUid = await founderCreateVendor(user.uid, {
        email, password, storeName, address, phone, plan, category,
        location: newVendorLoc, locationName: newVendorLocName,
        town: town || newVendorLocName || '',
        deliveryCharge: Number(form.deliveryCharge) || 30,
        sortOrder: maxOrder + 1,
        onboardedAt: today,
        subscriptionActive: true,
        subscriptionEnd: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10) })(),
        planPrice: 99,
      })
      if (vendorPhotoFile && vendorUid) { setPhotoProgress(0); const photoUrl = await uploadPhoto(vendorPhotoFile, setPhotoProgress); await updateVendorStore(vendorUid, { photo: photoUrl }) }
      toast.success(`✅ Vendor "${storeName}" created! Subscription starts today.`)
      setForm({ storeName: '', email: '', phone: '', password: '', confirmPass: '', address: '', category: 'Thali', plan: '₹500/month', deliveryCharge: '30', town: '' })
      setVendorPhotoFile(null); setVendorPhotoPreview(null); setPhotoProgress(0)
      setNewVendorLoc(null); setNewVendorLocName(''); setLocSearch(''); setLocSuggestions([])
      setTab('subscriptions')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'This email is already registered' : err.code === 'auth/invalid-email' ? 'Invalid email format' : err.message || 'Failed to create vendor'
      toast.error(msg)
    } finally { setCreating(false) }
  }

  const handleReplyTicket = async (ticketId, status = 'replied') => {
    if (!replyText.trim()) return toast.error('Enter your reply')
    setSendingReply(true)
    try {
      const { doc: fDoc, updateDoc: fUpdate, serverTimestamp: fTs } = await import('firebase/firestore')
      await fUpdate(fDoc(db, 'supportTickets', ticketId), { founderReply: replyText.trim(), status, repliedAt: fTs() })
      setReplyText(''); setSelectedTicket(null); toast.success('Reply sent! ✅')
    } catch { toast.error('Failed to send reply') }
    setSendingReply(false)
  }

  const handleDeleteOrder = async (orderId, e) => {
    e?.stopPropagation()
    if (!window.confirm('Delete this order? This cannot be undone.')) return
    try { await deleteDoc(doc(db, 'orders', orderId)); if (selectedOrder?.id === orderId) setSelectedOrder(null); toast.success('Order deleted ✅') }
    catch { toast.error('Failed to delete order') }
  }

  const handleDeleteVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Delete "${vendorName}"? This cannot be undone!`)) return
    try { await deleteDoc(doc(db, 'vendors', vendorId)); await deleteDoc(doc(db, 'users', vendorId)); toast.success(`"${vendorName}" deleted!`) }
    catch (err) { toast.error('Delete failed: ' + err.message) }
  }

  const handleInlineMoveUp = async (vendorId) => {
    const idx = filteredVendors.findIndex(v => v.id === vendorId); if (idx <= 0) return
    const prev = filteredVendors[idx - 1]; const curr = filteredVendors[idx]
    try { await Promise.all([updateDoc(doc(db, 'vendors', curr.id), { sortOrder: prev.sortOrder ?? idx - 1 }), updateDoc(doc(db, 'vendors', prev.id), { sortOrder: curr.sortOrder ?? idx })]); toast.success('✅ Moved up!') }
    catch { toast.error('Failed to reorder') }
  }

  const handleInlineMoveDown = async (vendorId) => {
    const idx = filteredVendors.findIndex(v => v.id === vendorId); if (idx >= filteredVendors.length - 1) return
    const next = filteredVendors[idx + 1]; const curr = filteredVendors[idx]
    try { await Promise.all([updateDoc(doc(db, 'vendors', curr.id), { sortOrder: next.sortOrder ?? idx + 1 }), updateDoc(doc(db, 'vendors', next.id), { sortOrder: curr.sortOrder ?? idx })]); toast.success('✅ Moved down!') }
    catch { toast.error('Failed to reorder') }
  }

  const exportToExcel = (type) => {
    let data = []; let filename = ''
    const formatDate = (o) => o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || ''
    const formatTime = (o) => o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || ''
    if (type === 'monthly') {
      data = orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && d.getMonth() === exportMonth && d.getFullYear() === exportYear })
      filename = `FeedoZone_Orders_${new Date(exportYear, exportMonth).toLocaleString('en-IN', { month: 'long' })}_${exportYear}.csv`
    } else if (type === 'today') {
      const today = new Date()
      data = orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() })
      filename = `FeedoZone_Orders_Today_${today.toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`
    } else { data = [...orders]; filename = 'FeedoZone_All_Orders.csv' }
    if (data.length === 0) return toast.error('No orders found for selected period!')
    const headers = ['Bill No', 'Order Date', 'Order Time', 'Customer Name', 'Customer Phone', 'Vendor', 'Items', 'Subtotal', 'Delivery Fee', 'Total', 'Payment', 'Status', 'Address']
    const rows = data.map(o => [(o.billNo || 'FZ-' + (o.id?.slice(-6) || '').toUpperCase()), formatDate(o), formatTime(o), o.userName || '', o.userPhone || '', o.vendorName || '', o.items?.map(i => i.qty + 'x ' + i.name).join(' | ') || '', o.subtotal || '', o.deliveryFee || '', o.total || '', o.paymentMode || 'COD', o.status || '', (o.address || '').replace(/,/g, ';')])
    const totalRevenue = data.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
    rows.push([], ['SUMMARY'], ['Total Orders', data.length], ['Delivered', data.filter(o => o.status === 'delivered').length], ['Cancelled', data.filter(o => o.status === 'cancelled').length], ['Total Revenue (Delivered)', '', '', '', '', '', '', '', '', '₹' + totalRevenue])
    const csvContent = [headers, ...rows].map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
    toast.success(`✅ Downloaded: ${filename}`)
  }

  const exportVendorWise = () => {
    if (vendors.length === 0) return toast.error('No vendors found!')
    const rows = [['Sort Order', 'Vendor Name', 'Email', 'Phone', 'Category', 'Plan', 'Town', 'Total Orders', 'Delivered', 'Revenue', 'Status', 'Subscription', 'Onboarded', 'Sub End', 'Plan Price']]
    sortedVendors.forEach((v, i) => {
      const vOrders = orders.filter(o => o.vendorUid === v.id); const delivered = vOrders.filter(o => o.status === 'delivered'); const revenue = delivered.reduce((s, o) => s + (o.total || 0), 0)
      const sub = getSubscriptionStatus(v)
      rows.push([i + 1, v.storeName || '', v.email || '', v.phone || '', v.category || '', v.plan || '', v.town || v.locationName || '', vOrders.length, delivered.length, '₹' + revenue, v.isOpen ? 'Open' : 'Closed', v.subscriptionActive === false ? 'Deactivated' : sub.status, sub.onboardedAt || '—', sub.subscriptionEnd || '—', `₹${sub.planPrice || 99}`])
    })
    const csvContent = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'FeedoZone_Vendor_Report.csv'; a.click(); URL.revokeObjectURL(url)
    toast.success('✅ Vendor report downloaded!')
  }

  const exportCustomers = () => {
    const list = filteredCustomers; if (!list.length) return toast.error('No customers to export')
    const rows = [['Name', 'Phone', 'Email', 'Total Orders', 'Delivered', 'Cancelled', 'Total Spent', 'Last Order', 'First Order', 'Push Token']]
    list.forEach(c => { rows.push([c.name, c.phone, c.email, c.orders.length, c.deliveredCount, c.cancelledCount, '₹' + c.totalSpent, c.lastOrderDate?.toLocaleDateString('en-IN') || '—', c.firstOrderDate?.toLocaleDateString('en-IN') || '—', c.expoPushToken ? 'Yes' : 'No']) })
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `FeedoZone_Customers_${customerFilter}.csv`; a.click(); URL.revokeObjectURL(url)
    toast.success(`✅ Exported ${list.length} customers!`)
  }

  const getMostOrdered = () => {
    const counts = {}; orders.forEach(o => { o.items?.forEach(item => { counts[item.name] = (counts[item.name] || 0) + item.qty }) })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }))
  }

  const inp = { width: '100%', padding: '11px 13px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 9, fontSize: 13, fontFamily: 'Poppins,sans-serif', outline: 'none', marginTop: 4, boxSizing: 'border-box' }

  const targetUsers = getBroadcastUsers()
  const allTownsList = allTowns
  const townStats = allTownsList.map(town => { const tvs = vendors.filter(v => (v.town || v.locationName) === town); return { town, count: tvs.length, open: tvs.filter(v => v.isOpen).length } })

  const getBadge = (filter) => {
    switch (filter) {
      case 'all': return allCustomers.filter(c => c.orders.length > 0).length
      case 'repeat': return customerStats.repeat
      case 'weekly': return customerStats.thisWeek
      case 'top': return Math.min(20, allCustomers.filter(c => c.orders.length > 0).length)
      case 'inactive': return customerStats.inactive
      case 'new': return customerStats.newThisWeek
      case 'highspend': return allCustomers.filter(c => c.totalSpent >= 500).length
      default: return 0
    }
  }

  // Subscription filtered vendors
  const getSubFilteredVendors = () => {
    let list = [...sortedVendors]
    if (subSearchQuery.trim()) { const q = subSearchQuery.toLowerCase(); list = list.filter(v => v.storeName?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q)) }
    switch (subscriptionTab) {
      case 'active': return list.filter(v => { const sub = getSubscriptionStatus(v); return v.subscriptionActive !== false && sub.status === 'active' })
      case 'expired': return list.filter(v => { const sub = getSubscriptionStatus(v); return sub.status === 'expired' && v.subscriptionActive !== false })
      case 'deactivated': return list.filter(v => v.subscriptionActive === false)
      case 'expiring': return list.filter(v => { const sub = getSubscriptionStatus(v); return v.subscriptionActive !== false && sub.status === 'active' && sub.daysLeft <= 7 })
      default: return list
    }
  }

  const subFilteredVendors = getSubFilteredVendors()

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins,sans-serif' }}>

      {showReorderModal && <VendorReorderModal vendors={filteredVendors} onClose={() => setShowReorderModal(false)} onSave={() => { }} />}

      {selectedSubVendor && (
        <SubscriptionModal
          vendor={selectedSubVendor}
          onClose={() => setSelectedSubVendor(null)}
          onActivate={handleActivateSubscription}
          onDeactivate={handleDeactivateSubscription}
        />
      )}

      {newOrderAlert && (
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '100%', maxWidth: 430, padding: '12px 16px', background: 'linear-gradient(135deg,#E24B4A,#c73232)', fontFamily: 'Poppins,sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🔔</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>New Order — ₹{newOrderAlert.total}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{newOrderAlert.userName} · {newOrderAlert.vendorName}</div></div>
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
          { id: 'subscriptions', label: `💳 Sub${subStats.expired > 0 ? ` (${subStats.expired} due)` : ''}` },
          { id: 'customers', label: `👥 Customers (${customerStats.total})` },
          { id: 'addvendor', label: '+ Add Vendor' },
          { id: 'userdb', label: `🗄️ User DB (${users.length})` },
          { id: 'push', label: `🔔 Push${usersWithTokenCount > 0 ? ` (${usersWithTokenCount})` : ''}` },
          { id: 'broadcast', label: `📣 Broadcast` },
          { id: 'support', label: `💬 Support${supportTickets.filter(t => t.status === 'open').length > 0 ? ` (${supportTickets.filter(t => t.status === 'open').length})` : ''}` },
          { id: 'analytics', label: '📊 Analytics' }
        ].map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{ flexShrink: 0, padding: '11px 14px', fontSize: 12, fontWeight: 500, color: tab === t2.id ? '#E24B4A' : '#666', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t2.id ? '#E24B4A' : 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap' }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {/* ════════════════ TAB: SUBSCRIPTIONS ════════════════ */}
        {tab === 'subscriptions' && (
          <>
            {/* Revenue / stats header */}
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 14, padding: 16, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 70, opacity: 0.07 }}>💳</div>
              <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>Subscription Overview</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 12 }}>₹{subStats.monthlyRevenue.toLocaleString()}/month revenue</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { val: subStats.total, label: 'Total', color: '#fff' },
                  { val: subStats.active, label: '✅ Active', color: '#34d399' },
                  { val: subStats.expired, label: '⚠️ Expired', color: '#f87171' },
                  { val: subStats.deactivated, label: '🔴 Deactivated', color: '#94a3b8' },
                  { val: subStats.expiringSoon, label: '⏰ Exp. Soon', color: '#fbbf24' },
                  { val: vendors.filter(v => getSubscriptionStatus(v).planPrice === 99).length, label: '₹99 plan', color: '#a78bfa' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* UPI QR reminder card */}
            <div style={{ background: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>📱</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Payment Process</div>
                <div style={{ fontSize: 11, color: '#78350f', lineHeight: 1.7 }}>
                  1. Vendor pays via your UPI scanner<br />
                  2. You verify payment received<br />
                  3. Tap vendor below → Activate subscription<br />
                  4. Vendor dashboard auto-unlocks instantly
                </div>
              </div>
            </div>

            {/* Search */}
            <input style={{ ...inp, marginBottom: 12, marginTop: 0, background: '#f9fafb' }} placeholder="🔍 Search vendor name or email..." value={subSearchQuery} onChange={e => setSubSearchQuery(e.target.value)} />

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
              {[
                { id: 'all', label: 'All', count: vendors.length },
                { id: 'active', label: '✅ Active', count: subStats.active },
                { id: 'expiring', label: '⏰ Expiring', count: subStats.expiringSoon, alert: subStats.expiringSoon > 0 },
                { id: 'expired', label: '⚠️ Expired', count: subStats.expired, alert: subStats.expired > 0 },
                { id: 'deactivated', label: '🔴 Deactivated', count: subStats.deactivated },
              ].map(f2 => (
                <button key={f2.id} onClick={() => setSubscriptionTab(f2.id)}
                  style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: subscriptionTab === f2.id ? (f2.alert ? '#dc2626' : '#E24B4A') : '#f3f4f6', color: subscriptionTab === f2.id ? '#fff' : '#374151', position: 'relative' }}>
                  {f2.label} ({f2.count})
                  {f2.alert && subscriptionTab !== f2.id && <div style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', borderWidth: 1, borderStyle: 'solid', borderColor: '#fff' }} />}
                </button>
              ))}
            </div>

            {subFilteredVendors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No vendors in this filter</div>
              </div>
            )}

            {subFilteredVendors.map(v => {
              const sub = getSubscriptionStatus(v)
              const isDeactivated = v.subscriptionActive === false
              const isActive = !isDeactivated && sub.status === 'active'
              const isExpiringSoon = isActive && sub.daysLeft <= 7
              const isExpired = !isDeactivated && sub.status === 'expired'

              let cardBorderColor = '#e5e7eb'
              if (isDeactivated) cardBorderColor = '#fca5a5'
              else if (isExpired) cardBorderColor = '#fed7aa'
              else if (isExpiringSoon) cardBorderColor = '#fde68a'
              else if (isActive) cardBorderColor = '#bbf7d0'

              return (
                <div key={v.id} style={{ background: '#fff', borderRadius: 14, marginBottom: 12, borderWidth: 1.5, borderStyle: 'solid', borderColor: cardBorderColor, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.photo ? <img src={v.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🏪</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.storeName}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{v.email} · {v.category}</div>
                      </div>
                      {/* Status badge */}
                      <div style={{ flexShrink: 0, borderRadius: 20, padding: '4px 10px', background: isDeactivated ? '#fee2e2' : isExpired ? '#fff7ed' : isExpiringSoon ? '#fffbeb' : '#dcfce7', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: isDeactivated ? '#dc2626' : isExpired ? '#f97316' : isExpiringSoon ? '#f59e0b' : '#16a34a' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: isDeactivated ? '#dc2626' : isExpired ? '#c2410c' : isExpiringSoon ? '#92400e' : '#15803d' }}>
                          {isDeactivated ? 'BLOCKED' : isExpired ? 'EXPIRED' : isExpiringSoon ? `${sub.daysLeft}d left` : `${sub.daysLeft}d left`}
                        </span>
                      </div>
                    </div>

                    {/* Subscription detail strip */}
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1f2937' }}>{sub.onboardedAt ? new Date(sub.onboardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</div>
                        <div style={{ fontSize: 9, color: '#9ca3af' }}>Joined</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isDeactivated ? '#dc2626' : isExpired ? '#f97316' : '#16a34a' }}>
                          {isDeactivated ? 'Blocked' : sub.subscriptionEnd ? new Date(sub.subscriptionEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </div>
                        <div style={{ fontSize: 9, color: '#9ca3af' }}>Expires</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>₹{sub.planPrice || 99}</div>
                        <div style={{ fontSize: 9, color: '#9ca3af' }}>Plan</div>
                      </div>
                    </div>

                    {/* Action area */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Quick activate button */}
                      {(isDeactivated || isExpired) && (
                        <button onClick={() => { setSelectedSubVendor(v) }}
                          style={{ flex: 2, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          ✅ Activate Subscription
                        </button>
                      )}
                      {isActive && (
                        <button onClick={() => setSelectedSubVendor(v)}
                          style={{ flex: 2, background: '#f0fdf4', color: '#15803d', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0', padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          💳 Manage Subscription
                        </button>
                      )}
                      {/* Quick deactivate */}
                      {!isDeactivated && (
                        <button onClick={async () => {
                          if (!window.confirm(`Block ${v.storeName}? They won't be able to access the dashboard.`)) return
                          await handleDeactivateSubscription(v.id)
                        }}
                          style={{ flex: 1, background: '#fff5f5', color: '#dc2626', borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca', padding: '10px 0', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          🔴 Block
                        </button>
                      )}
                    </div>

                    {isDeactivated && (
                      <div style={{ marginTop: 8, background: '#fff5f5', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#991b1b', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span>🔒</span> Vendor sees payment lockout screen. They cannot access dashboard.
                      </div>
                    )}
                    {isExpired && !isDeactivated && (
                      <div style={{ marginTop: 8, background: '#fff7ed', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#9a3412', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span>⚠️</span> Subscription expired {sub.daysOverdue} days ago. Activate to restore access.
                      </div>
                    )}
                    {isExpiringSoon && (
                      <div style={{ marginTop: 8, background: '#fffbeb', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#92400e', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span>⏰</span> Expires in {sub.daysLeft} days. Remind vendor to pay.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Export subscription report */}
            <button onClick={() => {
              const rows = [['Sr', 'Store', 'Email', 'Status', 'Plan Price', 'Onboarded', 'Expires', 'Days Left', 'Days Overdue']]
              sortedVendors.forEach((v, i) => {
                const sub = getSubscriptionStatus(v)
                const status = v.subscriptionActive === false ? 'Blocked' : sub.status === 'active' ? 'Active' : 'Expired'
                rows.push([i + 1, v.storeName, v.email, status, `₹${sub.planPrice || 99}`, sub.onboardedAt || '—', sub.subscriptionEnd || '—', sub.daysLeft || 0, sub.daysOverdue || 0])
              })
              const csv = rows.map(r => r.map(v2 => '"' + String(v2).replace(/"/g, '""') + '"').join(',')).join('\n')
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `FeedoZone_Subscriptions_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`; a.click(); URL.revokeObjectURL(url)
              toast.success('✅ Subscription report downloaded!')
            }} style={{ width: '100%', background: '#f9fafb', color: '#374151', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', padding: '12px 0', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              📥 Export Subscription Report (CSV)
            </button>
          </>
        )}

        {/* ════════════════ TAB: OVERVIEW ════════════════ */}
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
                { label: 'Sub Revenue', val: `₹${subStats.monthlyRevenue.toLocaleString()}`, sub: `${subStats.active} active vendors` },
                { label: 'Active Vendors', val: `${vendors.filter(v => v.isOpen).length}/${vendors.length}`, sub: `${vendors.length - vendors.filter(v => v.isOpen).length} offline` }
              ].map(s => (
                <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Subscription alert banner */}
            {(subStats.expired > 0 || subStats.expiringSoon > 0) && (
              <div style={{ background: subStats.expired > 0 ? '#fff5f5' : '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1.5, borderStyle: 'solid', borderColor: subStats.expired > 0 ? '#fecaca' : '#fde68a', cursor: 'pointer' }}
                onClick={() => setTab('subscriptions')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{subStats.expired > 0 ? '⚠️' : '⏰'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: subStats.expired > 0 ? '#dc2626' : '#92400e' }}>
                      {subStats.expired > 0 ? `${subStats.expired} vendor${subStats.expired > 1 ? 's' : ''} payment due!` : `${subStats.expiringSoon} vendor${subStats.expiringSoon > 1 ? 's' : ''} expiring soon`}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Tap to manage subscriptions →</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'linear-gradient(135deg,#1f2937,#374151)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 10 }}>👥 Customer Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { val: customerStats.total, label: 'Total', color: '#fff' },
                  { val: customerStats.repeat, label: 'Repeat 🔄', color: '#34d399' },
                  { val: customerStats.thisWeek, label: 'This Week', color: '#60a5fa' },
                  { val: customerStats.newThisWeek, label: 'New (7d)', color: '#fbbf24' },
                  { val: customerStats.inactive, label: 'Inactive (30d)', color: '#f87171' },
                  { val: customerStats.withPhone, label: 'Have WA', color: '#4ade80' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', lineHeight: 1.2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setTab('customers')} style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>View All Customers →</button>
            </div>

            {allTownsList.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>📍 Vendors by Town</div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {townStats.map(ts => (
                    <div key={ts.town} onClick={() => { setTab('vendors'); setSelectedTown(ts.town) }} style={{ flexShrink: 0, background: '#fff', borderRadius: 10, padding: '10px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', cursor: 'pointer', minWidth: 100, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{ts.count}</div>
                      <div style={{ fontSize: 11, color: '#374151', fontWeight: 500, marginBottom: 2 }}>{ts.town}</div>
                      <div style={{ fontSize: 10, color: '#16a34a' }}>● {ts.open} open</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => logoutUser()} style={{ width: '100%', background: 'transparent', color: '#E24B4A', borderWidth: 1, borderStyle: 'solid', borderColor: '#E24B4A', padding: 11, borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500, marginBottom: 16 }}>Logout</button>

            {/* Excel Export */}
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>📊</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>Export to Excel</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {[
                  { icon: '📅', label: "Today's Orders", sub: `${todayOrders.length} orders · ₹${todayRevenue}`, fn: () => exportToExcel('today') },
                  { icon: '📦', label: 'All Orders', sub: `${orders.length} total orders`, fn: () => exportToExcel('all') },
                  { icon: '🏪', label: 'Vendor-wise Report', sub: `${vendors.length} vendors · includes subscription data`, fn: exportVendorWise },
                  { icon: '👥', label: 'Full User Database', sub: `${users.length} users · all details`, fn: () => setTab('userdb') },
                  { icon: '💳', label: 'Subscription Report', sub: `${vendors.length} vendors · payment status`, fn: () => setTab('subscriptions') },
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
                <button onClick={() => exportToExcel('monthly')} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>📊 Download Monthly Report</button>
              </div>
            </div>
          </>
        )}

        {/* ════════════════ TAB: USER DATABASE ════════════════ */}
        {tab === 'userdb' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 14, padding: 16, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 60, opacity: 0.06 }}>🗄️</div>
              <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>Complete User Database</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Download User Data</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 4 }}>
                {[
                  { val: users.length, label: 'Total Users', color: '#fff' },
                  { val: users.filter(u => u.mobile || u.phone).length, label: 'Have WhatsApp', color: '#4ade80' },
                  { val: users.filter(u => u.email).length, label: 'Have Email', color: '#60a5fa' },
                  { val: users.filter(u => u.expoPushToken).length, label: 'Have App', color: '#fbbf24' },
                  { val: allCustomers.filter(c => c.deliveredCount >= 2).length, label: 'Repeat Buyers', color: '#f472b6' },
                  { val: allCustomers.filter(c => c.orders.length > 0 && (!c.lastOrderDate || c.lastOrderDate < thirtyAgo)).length, label: 'Inactive 30d', color: '#f87171' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>⚡ Quick Download</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'all', icon: '👥', label: 'ALL Users', sub: `${users.length} users — complete database`, color: '#E24B4A', bg: '#fff5f5', border: '#fecaca' },
                { id: 'with_phone', icon: '💬', label: 'WhatsApp Numbers', sub: `${users.filter(u => u.mobile || u.phone).length} users with phone`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                { id: 'with_email', icon: '📧', label: 'Email Addresses', sub: `${users.filter(u => u.email).length} users with email`, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                { id: 'with_token', icon: '🔔', label: 'App Users', sub: `${users.filter(u => u.expoPushToken).length} users with push token`, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                { id: 'active', icon: '🔥', label: 'Active (30 days)', sub: `${getPushTargetCount('active')} recently ordered`, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
                { id: 'inactive', icon: '😴', label: 'Inactive Users', sub: `${getPushTargetCount('inactive')} not ordered in 30d`, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
              ].map(opt => (
                <button key={opt.id} onClick={() => exportUserDatabase(opt.id)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, background: opt.bg, borderWidth: 1.5, borderStyle: 'solid', borderColor: opt.border, borderRadius: 12, cursor: 'pointer', fontFamily: 'Poppins', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 22 }}>{opt.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: opt.color, color: '#fff', padding: '2px 8px', borderRadius: 20 }}>↓ CSV</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: opt.color }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.3 }}>{opt.sub}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>👁️ Preview — All {users.length} Users</div>
            <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ background: '#f9fafb', padding: '8px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
                {['all', 'with_phone', 'with_email', 'with_token', 'active', 'inactive'].map(f2 => {
                  const counts = { all: users.length, with_phone: users.filter(u => u.mobile || u.phone).length, with_email: users.filter(u => u.email).length, with_token: users.filter(u => u.expoPushToken).length, active: getPushTargetCount('active'), inactive: getPushTargetCount('inactive') }
                  const labels = { all: 'All', with_phone: '📱 WA', with_email: '📧 Email', with_token: '🔔 App', active: '🔥 Active', inactive: '😴 Inactive' }
                  return (
                    <button key={f2} onClick={() => setUserExportFilter(f2)}
                      style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: userExportFilter === f2 ? '#E24B4A' : '#fff', color: userExportFilter === f2 ? '#fff' : '#374151', borderWidth: 1, borderStyle: 'solid', borderColor: userExportFilter === f2 ? '#E24B4A' : '#e5e7eb' }}>
                      {labels[f2]} ({counts[f2]})
                    </button>
                  )
                })}
              </div>
              {(() => {
                const activeUids = new Set(orders.filter(o => o.createdAt?.toDate?.() > thirtyAgo).map(o => o.userUid))
                let previewList = [...users]
                if (userExportFilter === 'with_phone') previewList = previewList.filter(u => u.mobile || u.phone)
                else if (userExportFilter === 'with_email') previewList = previewList.filter(u => u.email)
                else if (userExportFilter === 'with_token') previewList = previewList.filter(u => u.expoPushToken)
                else if (userExportFilter === 'active') previewList = previewList.filter(u => activeUids.has(u.id))
                else if (userExportFilter === 'inactive') previewList = previewList.filter(u => !activeUids.has(u.id))
                const customerMap = {}; allCustomers.forEach(c => { customerMap[c.id] = c })
                return (
                  <>
                    {previewList.slice(0, 25).map((u, i) => {
                      const c = customerMap[u.id]; const phone = u.mobile || u.phone || ''; const isRepeat = (c?.deliveredCount || 0) >= 2
                      return (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottomWidth: i < Math.min(previewList.length, 25) - 1 ? 1 : 0, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: isRepeat ? 'linear-gradient(135deg,#E24B4A,#ff6b6a)' : 'linear-gradient(135deg,#374151,#1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{(u.name || u.displayName || 'U')[0].toUpperCase()}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || u.displayName || '—'}</div>
                              {isRepeat && <span style={{ fontSize: 8, background: '#dcfce7', color: '#16a34a', padding: '1px 4px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>REPEAT</span>}
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{phone || 'No phone'} · {u.email || 'No email'}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#E24B4A' }}>{c?.orders?.length || 0}</div>
                            <div style={{ fontSize: 9, color: '#9ca3af' }}>orders</div>
                            <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 3 }}>
                              {phone && <span style={{ fontSize: 10 }}>💬</span>}
                              {u.email && <span style={{ fontSize: 10 }}>📧</span>}
                              {u.expoPushToken && <span style={{ fontSize: 10 }}>🔔</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {previewList.length > 25 && (
                      <div style={{ padding: '12px 14px', background: '#f9fafb', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>+{previewList.length - 25} more users not shown in preview</div>
                        <button onClick={() => exportUserDatabase(userExportFilter)} style={{ background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>↓ Download All {previewList.length} Users as Excel</button>
                      </div>
                    )}
                    {previewList.length === 0 && <div style={{ padding: '30px 14px', textAlign: 'center', color: '#9ca3af' }}><div style={{ fontSize: 28, marginBottom: 8 }}>👥</div><div style={{ fontSize: 13 }}>No users match this filter</div></div>}
                    {previewList.length > 0 && previewList.length <= 25 && (
                      <div style={{ padding: '10px 14px', background: '#f9fafb', textAlign: 'center' }}>
                        <button onClick={() => exportUserDatabase(userExportFilter)} style={{ background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>↓ Download All {previewList.length} Users as Excel</button>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </>
        )}

        {/* ════════════════ TAB: VENDORS ════════════════ */}
        {tab === 'vendors' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#1f2937,#111827)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>🔢 Vendor Display Order</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Control which vendor appears first for customers</div>
                </div>
                <button onClick={() => setShowReorderModal(true)} style={{ background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>🔢 Reorder</button>
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {sortedVendors.slice(0, 5).map((v, i) => (
                  <div key={v.id} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? '#fbbf24' : '#9ca3af' }}>#{i + 1}</span>
                    <div style={{ width: 22, height: 22, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {v.photo ? <img src={v.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11 }}>🏪</span>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#e5e7eb', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.storeName?.split(' ')[0]}</span>
                  </div>
                ))}
                {sortedVendors.length > 5 && <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 10, color: '#6b7280' }}>+{sortedVendors.length - 5} more</span></div>}
              </div>
            </div>

            {/* Quick On/Off Panel */}
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>⚡ Quick Vendor On/Off
                <span style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', marginLeft: 8 }}>{vendors.filter(v => v.isOpen).length} open · {vendors.filter(v => !v.isOpen).length} closed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedVendors.map(v => {
                  const sub = getSubscriptionStatus(v)
                  const isBlocked = v.subscriptionActive === false || sub.status === 'expired'
                  return (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '10px 12px', borderWidth: 1, borderStyle: 'solid', borderColor: isBlocked ? '#fecaca' : v.isOpen ? '#bbf7d0' : '#fecaca' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.photo ? <img src={v.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16 }}>🏪</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.storeName}</div>
                        <div style={{ fontSize: 10, color: isBlocked ? '#dc2626' : '#9ca3af' }}>
                          {isBlocked ? '🔴 Sub expired/blocked' : `${v.category}${v.town ? ` · ${v.town}` : ''}`}
                        </div>
                      </div>
                      <button onClick={() => handleToggleVendor(v.id, v.isOpen)} disabled={togglingVendor === v.id || isBlocked}
                        style={{ position: 'relative', width: 52, height: 28, borderRadius: 14, background: togglingVendor === v.id ? '#e5e7eb' : isBlocked ? '#e5e7eb' : v.isOpen ? '#16a34a' : '#dc2626', border: 'none', cursor: (togglingVendor === v.id || isBlocked) ? 'not-allowed' : 'pointer', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center', paddingLeft: v.isOpen ? 26 : 4, paddingRight: v.isOpen ? 4 : 26 }}>
                        <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                          {togglingVendor === v.id ? '⏳' : isBlocked ? '🔒' : v.isOpen ? '✓' : '✕'}
                        </div>
                      </button>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isBlocked ? '#9ca3af' : v.isOpen ? '#16a34a' : '#dc2626', minWidth: 42, textAlign: 'right', flexShrink: 0 }}>
                        {togglingVendor === v.id ? '...' : isBlocked ? 'LOCKED' : v.isOpen ? 'OPEN' : 'CLOSED'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Town filter */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>📍 Filter by Town</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                <button onClick={() => setSelectedTown('all')} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 12, fontWeight: 600, background: selectedTown === 'all' ? '#E24B4A' : '#f3f4f6', color: selectedTown === 'all' ? '#fff' : '#6b7280' }}>All ({vendors.length})</button>
                {allTownsList.map(town => (
                  <button key={town} onClick={() => setSelectedTown(town)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 12, fontWeight: 600, background: selectedTown === town ? '#E24B4A' : '#f3f4f6', color: selectedTown === town ? '#fff' : '#374151' }}>📍 {town}</button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}{selectedTown !== 'all' ? ` in ${selectedTown}` : ' total'}</div>

            {filteredVendors.map((v, idx) => {
              const sub = getSubscriptionStatus(v)
              const isBlocked = v.subscriptionActive === false
              const isExpired = !isBlocked && sub.status === 'expired'
              return (
                <div key={v.id} style={{ background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: isBlocked ? '#fca5a5' : isExpired ? '#fed7aa' : '#e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: 100, position: 'relative', background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {v.photo ? <img src={v.photo} alt={v.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🏪</span>}
                    <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => handleExistingVendorPhoto(e, v.id); input.click() }}
                      style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                      {uploadingPhotoFor === v.id ? `${existingProgress}%` : '📷 Change Photo'}
                    </button>
                    <div style={{ position: 'absolute', top: 8, left: 8, background: v.isOpen ? '#16a34a' : '#dc2626', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>{v.isOpen ? '● Open' : '● Closed'}</div>
                    <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', color: idx === 0 ? '#fbbf24' : '#fff', fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {idx === 0 ? '🥇 #1 Top Vendor' : `#${idx + 1}`}
                    </div>
                    {(v.town || v.locationName) && <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>📍 {v.town || v.locationName}</div>}
                  </div>

                  <div style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{v.storeName}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: isBlocked ? '#fee2e2' : isExpired ? '#fff7ed' : sub.status === 'active' ? '#d1fae5' : '#fee2e2', color: isBlocked ? '#991b1b' : isExpired ? '#c2410c' : '#065f46' }}>
                        {isBlocked ? '🔴 Blocked' : isExpired ? '⚠️ Expired' : `✅ ${sub.daysLeft}d left`}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{v.email} · {v.category}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>🚴 ₹{v.deliveryCharge ?? 30} delivery · 📞 {v.phone || '—'}</div>

                    {/* Subscription quick action */}
                    <button onClick={() => setSelectedSubVendor(v)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: isBlocked ? '#fff5f5' : isExpired ? '#fff7ed' : '#f0fdf4', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderStyle: 'solid', borderColor: isBlocked ? '#fecaca' : isExpired ? '#fed7aa' : '#bbf7d0', cursor: 'pointer', border: 'none', fontFamily: 'Poppins' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isBlocked ? '#dc2626' : isExpired ? '#c2410c' : '#15803d' }}>
                          {isBlocked ? '🔒 Subscription Blocked' : isExpired ? '⚠️ Subscription Expired' : '💳 Subscription Active'}
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                          {isBlocked ? 'Vendor cannot access dashboard' : isExpired ? `${sub.daysOverdue}d overdue · Tap to activate` : `Expires ${sub.subscriptionEnd ? new Date(sub.subscriptionEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}`}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isBlocked ? '#dc2626' : isExpired ? '#c2410c' : '#15803d', flexShrink: 0, marginLeft: 8 }}>{isBlocked || isExpired ? '▶ Activate' : 'Manage →'}</span>
                    </button>

                    {/* Toggle + Move controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: v.isOpen ? '#f0fdf4' : '#fff5f5', borderRadius: 10, padding: '10px 14px', marginBottom: 10, borderWidth: 1, borderStyle: 'solid', borderColor: v.isOpen ? '#bbf7d0' : '#fecaca' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: v.isOpen ? '#15803d' : '#dc2626' }}>{v.isOpen ? '🟢 Vendor is OPEN' : '🔴 Vendor is CLOSED'}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{v.isOpen ? 'Customers can order now' : 'Customers cannot place orders'}</div>
                      </div>
                      <button onClick={() => handleToggleVendor(v.id, v.isOpen)} disabled={togglingVendor === v.id || isBlocked}
                        style={{ position: 'relative', width: 56, height: 30, borderRadius: 15, background: (togglingVendor === v.id || isBlocked) ? '#e5e7eb' : v.isOpen ? '#16a34a' : '#dc2626', border: 'none', cursor: (togglingVendor === v.id || isBlocked) ? 'not-allowed' : 'pointer', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center', paddingLeft: v.isOpen ? 28 : 4, paddingRight: v.isOpen ? 4 : 28 }}>
                        <div style={{ width: 22, height: 22, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                          {togglingVendor === v.id ? '⏳' : isBlocked ? '🔒' : v.isOpen ? '✓' : '✕'}
                        </div>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <button onClick={() => handleInlineMoveUp(v.id)} disabled={idx === 0} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', background: idx === 0 ? '#f9fafb' : '#fff5f5', color: idx === 0 ? '#d1d5db' : '#E24B4A', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: idx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', borderWidth: 1, borderStyle: 'solid', borderColor: idx === 0 ? '#f3f4f6' : '#fecaca' }}>↑ Move Up</button>
                      <button onClick={() => handleInlineMoveDown(v.id)} disabled={idx === filteredVendors.length - 1} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', background: idx === filteredVendors.length - 1 ? '#f9fafb' : '#fff5f5', color: idx === filteredVendors.length - 1 ? '#d1d5db' : '#E24B4A', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: idx === filteredVendors.length - 1 ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', borderWidth: 1, borderStyle: 'solid', borderColor: idx === filteredVendors.length - 1 ? '#f3f4f6' : '#fecaca' }}>↓ Move Down</button>
                      <button onClick={() => setShowReorderModal(true)} style={{ padding: '7px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap' }}>🔢 Full Order</button>
                    </div>

                    <button onClick={() => handleDeleteVendor(v.id, v.storeName)} style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️ Delete Vendor</button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ════════════════ TAB: CUSTOMERS ════════════════ */}
        {tab === 'customers' && (
          <>
            {selectedCustomer && <CustomerProfileModal customer={selectedCustomer} orders={orders} onClose={() => setSelectedCustomer(null)} broadcastMsg={broadcastMsg} broadcastTitle={broadcastTitle} />}
            <div style={{ background: 'linear-gradient(135deg,#1f2937,#374151)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Customer Analytics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[{ val: customerStats.total, label: 'Total', color: '#fff' }, { val: customerStats.repeat, label: '🔄 Repeat', color: '#34d399' }, { val: customerStats.thisWeek, label: 'This Week', color: '#60a5fa' }, { val: customerStats.newThisWeek, label: '🆕 New (7d)', color: '#fbbf24' }, { val: customerStats.inactive, label: '😴 Inactive', color: '#f87171' }, { val: customerStats.withPhone, label: '📱 WhatsApp', color: '#4ade80' }].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
              {[{ id: 'all', label: '👥 All' }, { id: 'repeat', label: '🔄 Repeat' }, { id: 'weekly', label: '📅 This Week' }, { id: 'top', label: '🏆 Top 20' }, { id: 'new', label: '🆕 New (7d)' }, { id: 'inactive', label: '😴 Inactive' }, { id: 'highspend', label: '💰 High Spend' }].map(f2 => (
                <button key={f2.id} onClick={() => setCustomerFilter(f2.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: customerFilter === f2.id ? '#E24B4A' : '#f3f4f6', color: customerFilter === f2.id ? '#fff' : '#374151' }}>{f2.label} ({getBadge(f2.id)})</button>
              ))}
            </div>
            <input style={{ ...inp, marginBottom: 12, marginTop: 0, background: '#f9fafb' }} placeholder="🔍 Search by name, phone, email..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>🎯 Bulk Actions — {filteredCustomers.length} customers</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => copyAllWhatsApp(filteredCustomers)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#25D366', color: '#fff', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>💬 Copy All WA</button>
                <button onClick={() => sendBulkEmail(filteredCustomers, broadcastTitle, broadcastMsg)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>📧 Mail All</button>
                <button onClick={exportCustomers} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#fff', color: '#374151', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>📥 Export CSV</button>
                <button onClick={() => setTab('broadcast')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#fff5f5', color: '#E24B4A', borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>📣 Broadcast</button>
              </div>
            </div>

            {filteredCustomers.map((c, i) => {
              const daysSince = c.lastOrderDate ? Math.floor((Date.now() - c.lastOrderDate) / 86400000) : null
              const isRepeat = c.deliveredCount >= 2; const isNewUser = c.firstOrderDate && c.firstOrderDate >= sevenAgo; const isInactive = c.orders.length > 0 && (!c.lastOrderDate || c.lastOrderDate < thirtyAgo)
              return (
                <div key={c.id} onClick={() => setSelectedCustomer(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: isRepeat ? 'linear-gradient(135deg,#E24B4A,#ff6b6a)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isRepeat ? '#fff' : '#374151' }}>{c.name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    {customerFilter === 'top' && <div style={{ position: 'absolute', top: -4, left: -4, background: '#fbbf24', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#92400e' }}>#{i + 1}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      {isRepeat && <span style={{ fontSize: 8, background: '#dcfce7', color: '#16a34a', padding: '1px 5px', borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>REPEAT</span>}
                      {isNewUser && <span style={{ fontSize: 8, background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>NEW</span>}
                      {isInactive && <span style={{ fontSize: 8, background: '#fee2e2', color: '#991b1b', padding: '1px 5px', borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>INACTIVE</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.phone || c.email || 'No contact'}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{c.orders.length} orders · ₹{c.totalSpent.toLocaleString()} spent{daysSince !== null ? ` · ${daysSince === 0 ? 'Today' : daysSince + 'd ago'}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#E24B4A' }}>{c.deliveredCount}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af' }}>delivered</div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ════════════════ TAB: PUSH ════════════════ */}
        {tab === 'push' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 12 }}>🔔 Push Notifications</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: users.length, label: 'Total Users', color: '#fff' }, { val: usersWithTokenCount, label: 'Can Receive', color: '#34d399' }, { val: users.length - usersWithTokenCount, label: 'No Token Yet', color: '#f59e0b' }].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>🧪 Test Push to Yourself First</div>
              <button onClick={handleTestPush} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>🧪 Send Test Push to My Phone</button>
            </div>
            {pushDone && (
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10 }}>✅ Push Notification Sent!</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>{pushDone.sent}</div><div style={{ fontSize: 10, color: '#6b7280' }}>Delivered</div></div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', flex: 1, textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{pushDone.noToken}</div><div style={{ fontSize: 10, color: '#6b7280' }}>No Token</div></div>
                </div>
                <button onClick={() => setPushDone(null)} style={{ width: '100%', background: 'transparent', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 10 }}>Send Another</button>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>⚡ Quick Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {PUSH_PRESETS.map(p => (
                  <button key={p.label} onClick={() => { setPushTitle(p.title); setPushBody(p.body) }} style={{ padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins', borderWidth: 1.5, borderStyle: 'solid', borderColor: pushTitle === p.title ? '#E24B4A' : '#e5e7eb', background: pushTitle === p.title ? '#fff5f5' : '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 3 }}>{p.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: pushTitle === p.title ? '#E24B4A' : '#374151' }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Title</label>
              <input style={inp} placeholder="e.g. 🍛 Hungry? Lunch Time!" value={pushTitle} onChange={e => setPushTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Message body</label>
              <textarea value={pushBody} onChange={e => setPushBody(e.target.value)} placeholder="e.g. Your favourite vendors are waiting. Order now!" rows={3} style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, marginTop: 4 }} />
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb' }}>
              {sendingPush && <div style={{ marginBottom: 12 }}><div style={{ background: '#e5e7eb', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 6 }}><div style={{ height: '100%', background: '#E24B4A', width: `${pushProgress}%`, transition: 'width 0.3s', borderRadius: 8 }} /></div><div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>Sending... {pushProgress}%</div></div>}
              <button onClick={handleSendPush} disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 0', background: (sendingPush || !pushTitle.trim() || !pushBody.trim()) ? '#d1d5db' : 'linear-gradient(135deg,#E24B4A,#c73232)', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: (sendingPush || !pushTitle.trim() || !pushBody.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                🔔 {sendingPush ? `Sending... ${pushProgress}%` : `Send Push to ${getPushTargetCount(pushTarget)} Users`}
              </button>
            </div>
            {pushHistory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>📋 Recent Push Notifications</div>
                {pushHistory.slice(0, 5).map(p => (
                  <div key={p.id} style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', flex: 1, marginRight: 8 }}>{p.title}</div>
                      <div style={{ background: '#dcfce7', borderRadius: 10, padding: '2px 8px', flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>✅ {p.sent || 0} sent</span></div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{p.body}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════ TAB: BROADCAST ════════════════ */}
        {tab === 'broadcast' && (
          <>
            <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#2d1a00)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 12 }}>📣 Broadcast Message</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: users.length, label: 'Total Users', color: '#fff' }, { val: users.filter(u => u.mobile || u.phone).length, label: 'Have WhatsApp', color: '#4ade80' }, { val: users.filter(u => u.email).length, label: 'Have Email', color: '#60a5fa' }].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {broadcastDone && (
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 8 }}>✅ Broadcast Sent!</div>
                <button onClick={() => setBroadcastDone(null)} style={{ width: '100%', background: 'transparent', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac', padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginTop: 10 }}>Send Another</button>
              </div>
            )}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Subject / Title</label>
              <input style={inp} placeholder="e.g. 🎉 New restaurant on FeedoZone!" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
            </div>
            <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder={`Write your message here...\n\nTip: Use {name} to personalise!`} rows={8} style={{ width: '100%', padding: '12px 14px', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, color: '#1f2937', marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => { if (!broadcastMsg.trim()) return toast.error('Please write a message first'); const wpUsers = getBroadcastUsers().filter(u => u.mobile || u.phone); if (!wpUsers.length) return toast.error('No WA numbers found'); wpUsers.slice(0, 3).forEach((u, i) => { setTimeout(() => window.open(sendWhatsAppToUser(u.mobile || u.phone, u.name, broadcastMsg), '_blank'), i * 800) }); toast.success(`Opening WA for ${wpUsers.length} users`) }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>💬 WhatsApp ({getBroadcastUsers().filter(u => u.mobile || u.phone).length})</button>
              <button onClick={() => { if (!broadcastMsg.trim()) return toast.error('Please write a message first'); sendBulkEmail(getBroadcastUsers().map(u => ({ ...u, phone: u.mobile || u.phone })), broadcastTitle, broadcastMsg) }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>📧 Email ({getBroadcastUsers().filter(u => u.email).length})</button>
            </div>
          </>
        )}

        {/* ════════════════ TAB: ORDERS ════════════════ */}
        {tab === 'orders' && (
          <>
            {selectedOrder && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null) }}>
                <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 430, maxHeight: '80vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Order Details</div>
                    <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    {[['Customer', selectedOrder.userName], ['Phone', selectedOrder.userPhone || '—'], ['Vendor', selectedOrder.vendorName], ['Address', selectedOrder.address || '—'], ['Date', selectedOrder.createdAt?.toDate?.()?.toLocaleString('en-IN') || '—']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: '#6b7280' }}>{k}</span><span style={{ fontSize: 12, fontWeight: 600, maxWidth: 200, textAlign: 'right' }}>{v}</span></div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: '#6b7280' }}>Status</span><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: selectedOrder.status === 'delivered' ? '#d1fae5' : selectedOrder.status === 'cancelled' ? '#fee2e2' : '#fef3c7', color: selectedOrder.status === 'delivered' ? '#065f46' : selectedOrder.status === 'cancelled' ? '#991b1b' : '#92400e' }}>{selectedOrder.status?.replace('_', ' ')}</span></div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Items Ordered</div>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6' }}>
                      <span style={{ fontSize: 13 }}>{item.qty}x {item.name}</span><span style={{ fontSize: 13, fontWeight: 600 }}>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopStyle: 'solid', borderTopColor: '#e5e7eb' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span><span style={{ fontSize: 14, fontWeight: 700, color: '#E24B4A' }}>₹{selectedOrder.total}</span>
                  </div>
                  <button onClick={() => { setFounderBillOrder(selectedOrder); setShowFounderBill(true) }} style={{ width: '100%', marginTop: 8, background: '#111', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 8 }}>🧾 View Full Bill</button>
                  <button onClick={(e) => handleDeleteOrder(selectedOrder.id, e)} style={{ width: '100%', marginTop: 6, background: '#fee2e2', color: '#dc2626', border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>🗑️ Delete This Order</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {[{ id: 'all', label: 'All', count: orders.length }, { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length }, { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length }, { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }, { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }].map(f2 => (
                <button key={f2.id} onClick={() => setOrderFilter(f2.id)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: orderFilter === f2.id ? '#E24B4A' : '#f3f4f6', color: orderFilter === f2.id ? '#fff' : '#6b7280' }}>{f2.label} ({f2.count})</button>
              ))}
            </div>
            {orders.filter(o => { if (orderFilter === 'all') return true; if (orderFilter === 'preparing') return o.status === 'preparing' || o.status === 'accepted'; return o.status === orderFilter }).slice(0, 50).map(o => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 0', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', cursor: 'pointer' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', minWidth: 42 }}>{o.createdAt?.toDate?.()?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || '--'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{o.userName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{o.vendorName} · {o.items?.length} item(s)</div>
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

        {/* ════════════════ TAB: SUPPORT ════════════════ */}
        {tab === 'support' && (
          <>
            {selectedTicket && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) { setSelectedTicket(null); setReplyText('') } }}>
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
                  {selectedTicket.founderReply && (<div style={{ background: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: '#3b82f6' }}><div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>👑 Your Previous Reply</div><div style={{ fontSize: 13, color: '#1e3a8a' }}>{selectedTicket.founderReply}</div></div>)}
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
                <button key={f2.id} onClick={() => setOrderFilter(f2.id)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: orderFilter === f2.id ? '#E24B4A' : '#f3f4f6', color: orderFilter === f2.id ? '#fff' : '#6b7280' }}>{f2.label} ({f2.count})</button>
              ))}
            </div>
            {supportTickets.filter(t => orderFilter === 'all_support' ? true : t.status === orderFilter).map(ticket => (
              <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.founderReply || '') }} style={{ background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: ticket.status === 'open' ? '#fecaca' : '#f3f4f6', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{ticket.userName}</div><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{ticket.userEmail}</div></div>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: ticket.status === 'resolved' ? '#d1fae5' : ticket.status === 'replied' ? '#dbeafe' : '#fee2e2', color: ticket.status === 'resolved' ? '#065f46' : ticket.status === 'replied' ? '#1e40af' : '#991b1b' }}>{ticket.status === 'resolved' ? '✅ Resolved' : ticket.status === 'replied' ? '💬 Replied' : '🔴 Open'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{ticket.message.slice(0, 80)}{ticket.message.length > 80 ? '...' : ''}</div>
              </div>
            ))}
          </>
        )}

        {/* ════════════════ TAB: ANALYTICS ════════════════ */}
        {tab === 'analytics' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📊 Analytics</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {[{ id: 'overview', label: '📊 Overview' }, { id: 'monthly', label: '📅 Monthly' }, { id: 'items', label: '🍽️ Items' }, { id: 'vendors', label: '🏪 Vendors' }, { id: 'users', label: '👤 Users' }, { id: 'subscriptions', label: '💳 Revenue' }].map(t => (
                <button key={t.id} onClick={() => setAnalyticsTab(t.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, background: analyticsTab === t.id ? '#E24B4A' : '#f3f4f6', color: analyticsTab === t.id ? '#fff' : '#6b7280' }}>{t.label}</button>
              ))}
            </div>

            {analyticsTab === 'overview' && (() => {
              const totalRev = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
              const activeUsers = [...new Set(orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && (now - d) < 30 * 86400000 }).map(o => o.userUid))].length
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ icon: '📦', label: 'Total Orders', val: orders.length, bg: '#fff5f5' }, { icon: '💰', label: 'Total Revenue', val: '₹' + totalRev.toLocaleString(), bg: '#f0fdf4' }, { icon: '✅', label: 'Delivered', val: orders.filter(o => o.status === 'delivered').length, bg: '#f0fdf4' }, { icon: '❌', label: 'Cancelled', val: orders.filter(o => o.status === 'cancelled').length, bg: '#fff5f5' }, { icon: '💳', label: 'Sub Revenue/mo', val: '₹' + subStats.monthlyRevenue.toLocaleString(), bg: '#eff6ff' }, { icon: '👥', label: 'Total Users', val: users.length, bg: '#eff6ff' }, { icon: '🔥', label: 'Active (30d)', val: activeUsers, bg: '#fff7ed' }, { icon: '🔄', label: 'Repeat Customers', val: customerStats.repeat, bg: '#f0fdf4' }].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6' }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {analyticsTab === 'subscriptions' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 14 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>MONTHLY SUB REVENUE</div><div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>₹{subStats.monthlyRevenue.toLocaleString()}</div></div>
                  <div style={{ background: '#eff6ff', borderRadius: 12, padding: 14 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>ACTIVE VENDORS</div><div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{subStats.active}</div></div>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 700 }}>💳 Vendor Subscription Details</div>
                  {sortedVendors.map(v => {
                    const sub = getSubscriptionStatus(v)
                    const isBlocked = v.subscriptionActive === false
                    const isExpired = !isBlocked && sub.status === 'expired'
                    return (
                      <div key={v.id} onClick={() => { setSelectedSubVendor(v); setTab('subscriptions') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb', cursor: 'pointer' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{v.storeName}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>Joined {sub.onboardedAt ? new Date(sub.onboardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>₹{sub.planPrice || 99}/mo</div>
                          <div style={{ fontSize: 9, fontWeight: 700, background: isBlocked ? '#fee2e2' : isExpired ? '#fff7ed' : '#dcfce7', color: isBlocked ? '#dc2626' : isExpired ? '#f97316' : '#16a34a', borderRadius: 6, padding: '1px 6px', marginTop: 2 }}>
                            {isBlocked ? 'BLOCKED' : isExpired ? 'EXPIRED' : `${sub.daysLeft}d`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {analyticsTab === 'monthly' && (() => {
              const year = new Date().getFullYear()
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              const monthlyData = months.map((m, i) => {
                const mo = orders.filter(o => { const d = o.createdAt?.toDate?.(); return d && d.getMonth() === i && d.getFullYear() === year })
                return { month: m, orders: mo.length, revenue: mo.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0), delivered: mo.filter(o => o.status === 'delivered').length, cancelled: mo.filter(o => o.status === 'cancelled').length }
              })
              const maxRev = Math.max(...monthlyData.map(m => m.revenue), 1)
              return (
                <div style={{ background: '#fff', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 700 }}>📅 Monthly Revenue — {year}</div>
                  {monthlyData.map(m => (
                    <div key={m.month} style={{ padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div><span style={{ fontSize: 13, fontWeight: 600 }}>{m.month}</span><span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{m.orders} orders</span></div>
                        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: m.revenue > 0 ? '#16a34a' : '#9ca3af' }}>₹{m.revenue.toLocaleString()}</div></div>
                      </div>
                      <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}><div style={{ height: '100%', background: m.revenue > 0 ? '#16a34a' : '#e5e7eb', width: ((m.revenue / maxRev) * 100) + '%', borderRadius: 4 }} /></div>
                    </div>
                  ))}
                </div>
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
                <div style={{ padding: '12px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>VENDORS BY ORDERS</div>
                {sortedVendors.map((v, idx) => {
                  const vOrders = orders.filter(o => o.vendorUid === v.id); const vRevenue = vOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
                  return (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f9fafb' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', background: '#fee2e2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v.photo ? <img src={v.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span>🏪</span>}</div>
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
                  const userMap = {}; orders.forEach(o => { if (!userMap[o.userUid]) userMap[o.userUid] = { name: o.userName, phone: o.userPhone, count: 0, spent: 0 }; userMap[o.userUid].count++; if (o.status === 'delivered') userMap[o.userUid].spent += o.total || 0 })
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

        {/* ════════════════ TAB: ADD VENDOR ════════════════ */}
        {tab === 'addvendor' && (
          <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Create Vendor Account</span>
              <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Founder Only</span>
            </div>

            {/* Subscription info banner */}
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginBottom: 14, borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💳</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 2 }}>Subscription Auto-Setup</div>
                <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.6 }}>New vendor gets 30-day subscription at ₹99 automatically. Onboarding date is set to today. You can change plan in Subscriptions tab.</div>
              </div>
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
              <div><label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>🚴 Delivery Charge (₹)</label><input style={inp} type="number" placeholder="e.g. 30" {...f('deliveryCharge')} /></div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>🏘️ Town / Area Name *</label>
                <input style={inp} placeholder="e.g. Warananagar, Kolhapur, Sangli..." {...f('town')} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>📍 Store GPS Location (optional)</label>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {newVendorLocName && <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, padding: '6px 10px', background: '#f0fdf4', borderRadius: 8 }}>✅ {newVendorLocName}</div>}
                  <button type="button" onClick={handleDetectVendorLoc} disabled={detectingLoc} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#fff5f5', borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca', borderRadius: 9, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    <span>📍</span><span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{detectingLoc ? 'Detecting...' : 'Use Current GPS'}</span>
                  </button>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inp, marginTop: 0 }} placeholder="Or search location..." value={locSearch} onChange={e => handleLocSearch(e.target.value)} />
                    {locSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', borderRadius: 9, zIndex: 50, marginTop: 2, overflow: 'hidden' }}>
                        {locSuggestions.map((s, i) => <button key={i} type="button" onClick={() => handleSelectVendorLoc(s)} style={{ width: '100%', padding: '9px 12px', border: 'none', borderBottomWidth: i < locSuggestions.length - 1 ? 1 : 0, borderBottomStyle: 'solid', borderBottomColor: '#f3f4f6', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'Poppins', fontSize: 12, color: '#1f2937' }}>📍 {s.name.split(',')[0]}</button>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {creating && vendorPhotoFile && photoProgress > 0 && (<div><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Uploading photo... {photoProgress}%</div><div style={{ background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', height: 6 }}><div style={{ height: '100%', background: '#E24B4A', width: `${photoProgress}%`, transition: 'width 0.3s' }} /></div></div>)}
              <button onClick={handleCreate} disabled={creating} style={{ width: '100%', background: creating ? '#f09595' : '#E24B4A', color: '#fff', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', marginTop: 4 }}>
                {creating ? 'Creating Account...' : '✅ Create Vendor Account'}
              </button>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: '#f0fdf4', borderRadius: 10, fontSize: 12, color: '#166534' }}>
              💡 New vendor gets a 30-day ₹99 subscription automatically. After creating, share the email + password with the vendor.
            </div>
          </div>
        )}

      </div>

      {showFounderBill && founderBillOrder && (
        <FounderBill order={founderBillOrder} vendors={vendors} onClose={() => { setShowFounderBill(false); setFounderBillOrder(null) }} />
      )}

    </div>
  )
}