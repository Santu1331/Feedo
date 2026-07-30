// ============================================================
// FILE: src/components/VendorRevenue.jsx
// Restaurant Revenue & Charges Dashboard
// ============================================================

import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { calculatePlatformFee } from './SlabSettings'

function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div style={{ background: bg || '#f9fafb', borderRadius: 12, padding: '12px 14px', border: `1.5px solid ${color}22` }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || '#1f2937' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function VendorRevenue({ vendorUid, vendorData }) {
  const [orders, setOrders] = useState([])
  const [slabs, setSlabs] = useState([])
  const [subBills, setSubBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vendorUid) return
    const unsub = onSnapshot(
      query(collection(db, 'orders'), where('vendorUid', '==', vendorUid)),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setOrders(list)
        setLoading(false)
      },
      err => { console.error('VendorRevenue orders:', err); setLoading(false) }
    )
    return unsub
  }, [vendorUid])

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orderSlabs'),
      snap => setSlabs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Slabs error:', err)
    )
    return unsub
  }, [])

  useEffect(() => {
    if (!vendorUid) return
    const unsub = onSnapshot(
      query(collection(db, 'subscriptionBills'), where('vendorId', '==', vendorUid)),
      snap => setSubBills(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('SubBills error:', err)
    )
    return unsub
  }, [vendorUid])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const delivered = orders.filter(o => o.status === 'delivered')

  const todayDelivered = delivered.filter(o => {
    const d = o.createdAt?.toDate?.()
    return d && d >= todayStart
  })
  const monthDelivered = delivered.filter(o => {
    const d = o.createdAt?.toDate?.()
    return d && d >= monthStart
  })

  const todaySales = todayDelivered.reduce((s, o) => s + (o.total || 0), 0)
  const monthSales = monthDelivered.reduce((s, o) => s + (o.total || 0), 0)

  const todayFee = todayDelivered.reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)
  const monthFee = monthDelivered.reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)
  const totalFee = delivered.reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)

  const todayNet = todaySales - todayFee
  const monthNet = monthSales - monthFee

  // Subscription
  const subFee = vendorData?.subscriptionFee || 0
  const subStatus = vendorData?.subscriptionStatus || 'due'
  const subDue = vendorData?.subscriptionDueDate?.toDate?.() || null
  const daysLeft = subDue ? Math.ceil((subDue - now) / 86400000) : null
  const monthSubFee = subBills.filter(b => {
    const d = b.createdAt?.toDate?.() || (b.activatedAt ? new Date(b.activatedAt) : null)
    return d && d >= monthStart
  }).reduce((s, b) => s + (b.fee || 0), 0)

  const totalSubPaid = subBills.reduce((s, b) => s + (b.fee || 0), 0)

  // Recent transactions
  const recentTxns = delivered.slice(0, 20).map(o => ({
    ...o,
    platformFee: calculatePlatformFee(o.total || 0, slabs),
    netAmount: (o.total || 0) - calculatePlatformFee(o.total || 0, slabs),
  }))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 28, height: 28, border: '3px solid #f3f4f6', borderTopColor: '#E24B4A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#E24B4A22)', borderRadius: 14, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.05 }}>💰</div>
        <div style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700, letterSpacing: 1.5, marginBottom: 3, textTransform: 'uppercase' }}>Restaurant Dashboard</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 3 }}>💰 Revenue & Charges</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>Your earnings · Platform fees · Net income</div>
      </div>

      {/* Subscription Status Card */}
      <div style={{ background: subStatus === 'active' ? 'linear-gradient(135deg,#065f46,#059669)' : 'linear-gradient(135deg,#991b1b,#E24B4A)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              {subStatus === 'active' ? '🟢 Subscription Active' : '🔴 Subscription Due'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>
              {subDue
                ? (daysLeft > 0 ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} · ${subDue.toLocaleDateString('en-IN')}` : `Expired on ${subDue.toLocaleDateString('en-IN')}`)
                : 'Contact founder to activate'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>₹{subFee}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>per month</div>
          </div>
        </div>
      </div>

      {/* Today stats */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>📅 Today</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard label="Today's Orders" value={todayDelivered.length} icon="📦" color="#3b82f6" bg="#eff6ff" />
        <StatCard label="Today's Sales" value={`₹${todaySales.toLocaleString()}`} icon="💵" color="#16a34a" bg="#f0fdf4" />
        <StatCard label="Platform Fee" value={`₹${todayFee}`} icon="🏛️" color="#E24B4A" bg="#fff5f5" sub="Slab charge" />
        <StatCard label="Net Earnings" value={`₹${todayNet.toLocaleString()}`} icon="✅" color="#0891b2" bg="#ecfeff" sub="After platform fee" />
      </div>

      {/* Monthly stats */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>📊 This Month</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard label="Monthly Orders" value={monthDelivered.length} icon="🛍️" color="#7c3aed" bg="#f5f3ff" />
        <StatCard label="Monthly Sales" value={`₹${monthSales.toLocaleString()}`} icon="💰" color="#16a34a" bg="#f0fdf4" />
        <StatCard label="Platform Charges" value={`₹${monthFee}`} icon="📋" color="#E24B4A" bg="#fff5f5" sub="Slab total" />
        <StatCard label="Subscription" value={`₹${monthSubFee || subFee}`} icon="💳" color="#f59e0b" bg="#fffbeb" sub="This month" />
      </div>

      {/* Net earnings summary */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, border: '1.5px solid #86efac', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 10 }}>✅ Monthly Net Earnings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { label: 'Gross Sales', val: `₹${monthSales.toLocaleString()}`, color: '#1f2937' },
            { label: '− Platform Slab Fee', val: `−₹${monthFee}`, color: '#E24B4A' },
            { label: '− Subscription Fee', val: `−₹${monthSubFee || subFee}`, color: '#f59e0b' },
            { label: '= Net Earnings', val: `₹${Math.max(0, monthNet - (monthSubFee || subFee)).toLocaleString()}`, color: '#16a34a', bold: true },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderTop: row.bold ? '1.5px solid #86efac' : 'none', paddingTop: row.bold ? 7 : 0, marginTop: row.bold ? 2 : 0 }}>
              <span style={{ fontSize: row.bold ? 13 : 12, color: '#374151', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
              <span style={{ fontSize: row.bold ? 16 : 13, fontWeight: row.bold ? 800 : 600, color: row.color }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total slab charges all time */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '12px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>📈 All-Time Summary</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Total Delivered Orders', val: delivered.length },
            { label: 'Total Revenue Generated', val: `₹${delivered.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}` },
            { label: 'Total Slab Charges', val: `₹${totalFee.toLocaleString()}` },
            { label: 'Total Subscription Paid', val: `₹${totalSubPaid.toLocaleString()}` },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>🧾 Recent Transactions</div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Delivered orders with platform fee breakdown</div>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 14px', background: '#f9fafb', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Order</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
          <span style={{ textAlign: 'right' }}>Fee</span>
          <span style={{ textAlign: 'right' }}>Net</span>
        </div>

        {recentTxns.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
            No delivered orders yet
          </div>
        ) : (
          recentTxns.map(o => {
            const date = o.createdAt?.toDate?.()
            return (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.userName}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af' }}>{date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1f2937' }}>₹{o.total}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#E24B4A' }}>−₹{o.platformFee}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>₹{o.netAmount}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
