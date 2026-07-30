// ============================================================
// FILE: src/components/FounderRevenue.jsx
// Founder Revenue Dashboard — Subscription + Slab combined
// ============================================================

import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { calculatePlatformFee } from './SlabSettings'

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
    </div>
  )
}

export default function FounderRevenue({ vendors, orders, subscriptionBills }) {
  const [slabs, setSlabs] = useState([])
  const [revenueTab, setRevenueTab] = useState('overview')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orderSlabs'),
      snap => setSlabs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Slabs err:', err)
    )
    return unsub
  }, [])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const delivered = (orders || []).filter(o => o.status === 'delivered')

  // Slab revenue
  const totalSlabRev = delivered.reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)
  const todaySlabRev = delivered.filter(o => {
    const d = o.createdAt?.toDate?.(); return d && d >= todayStart
  }).reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)
  const monthSlabRev = delivered.filter(o => {
    const d = o.createdAt?.toDate?.(); return d && d >= monthStart
  }).reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)

  // Subscription revenue
  const getBillDate = (b) => {
    if (b.createdAt?.toDate) return b.createdAt.toDate()
    if (b.activatedAt) return new Date(b.activatedAt)
    return null
  }
  const totalSubRev = (subscriptionBills || []).reduce((s, b) => s + (b.fee || 0), 0)
  const monthSubRev = (subscriptionBills || []).filter(b => {
    const d = getBillDate(b); return d && d >= monthStart
  }).reduce((s, b) => s + (b.fee || 0), 0)
  const todaySubRev = (subscriptionBills || []).filter(b => {
    const d = getBillDate(b); return d && d >= todayStart
  }).reduce((s, b) => s + (b.fee || 0), 0)

  const totalRev = totalSlabRev + totalSubRev
  const monthRev = monthSlabRev + monthSubRev
  const todayRev = todaySlabRev + todaySubRev

  // Per-vendor slab revenue
  const vendorSlabMap = {}
  delivered.forEach(o => {
    const fee = calculatePlatformFee(o.total || 0, slabs)
    if (!vendorSlabMap[o.vendorUid]) vendorSlabMap[o.vendorUid] = { fee: 0, orders: 0, sales: 0 }
    vendorSlabMap[o.vendorUid].fee += fee
    vendorSlabMap[o.vendorUid].orders += 1
    vendorSlabMap[o.vendorUid].sales += o.total || 0
  })

  // Per-vendor sub revenue
  const vendorSubMap = {}
  ;(subscriptionBills || []).forEach(b => {
    if (!vendorSubMap[b.vendorId]) vendorSubMap[b.vendorId] = 0
    vendorSubMap[b.vendorId] += b.fee || 0
  })

  // Merged per-vendor totals
  const vendorRevList = (vendors || []).map(v => ({
    ...v,
    slabRev: vendorSlabMap[v.id]?.fee || 0,
    subRev: vendorSubMap[v.id] || 0,
    totalRev: (vendorSlabMap[v.id]?.fee || 0) + (vendorSubMap[v.id] || 0),
    orders: vendorSlabMap[v.id]?.orders || 0,
    sales: vendorSlabMap[v.id]?.sales || 0,
  })).sort((a, b) => b.totalRev - a.totalRev)

  const maxVendorRev = Math.max(...vendorRevList.map(v => v.totalRev), 1)

  // Slab distribution
  const slabDist = {}
  delivered.forEach(o => {
    const fee = calculatePlatformFee(o.total || 0, slabs)
    const key = `₹${fee}`
    slabDist[key] = (slabDist[key] || 0) + 1
  })
  const maxSlabCount = Math.max(...Object.values(slabDist), 1)

  // Monthly chart (last 6 months)
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const subAmt = (subscriptionBills || []).filter(b => {
      const bd = getBillDate(b); return bd && bd >= d && bd < end
    }).reduce((s, b) => s + (b.fee || 0), 0)
    const slabAmt = delivered.filter(o => {
      const od = o.createdAt?.toDate?.(); return od && od >= d && od < end
    }).reduce((s, o) => s + calculatePlatformFee(o.total || 0, slabs), 0)
    monthlyData.push({ label: MONTH_NAMES[d.getMonth()], sub: subAmt, slab: slabAmt, total: subAmt + slabAmt })
  }
  const maxMonthRev = Math.max(...monthlyData.map(m => m.total), 1)

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'vendors',  label: '🏪 By Restaurant' },
    { id: 'slabs',    label: '📋 Slabs' },
    { id: 'chart',    label: '📈 Chart' },
  ]

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: 14, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.05 }}>💎</div>
        <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: 1.5, marginBottom: 3, textTransform: 'uppercase' }}>Founder Panel · Revenue Intelligence</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 3 }}>💎 Platform Revenue</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>Subscription + Slab charges combined</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { val: `₹${todayRev.toLocaleString()}`, label: "Today's Revenue", color: '#4ade80', sub: `₹${todaySubRev} sub + ₹${todaySlabRev} slab` },
            { val: `₹${monthRev.toLocaleString()}`, label: 'Monthly Revenue', color: '#fbbf24', sub: `₹${monthSubRev} sub + ₹${monthSlabRev} slab` },
            { val: `₹${totalRev.toLocaleString()}`, label: 'Total Revenue', color: '#60a5fa', sub: `${delivered.length} orders` },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setRevenueTab(t.id)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'Poppins', fontSize: 11, fontWeight: 600,
            background: revenueTab === t.id ? '#E24B4A' : '#f3f4f6',
            color: revenueTab === t.id ? '#fff' : '#6b7280',
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {revenueTab === 'overview' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '14px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>Revenue Breakdown</div>
            {[
              { label: 'Subscription Revenue', today: todaySubRev, month: monthSubRev, total: totalSubRev, color: '#7c3aed' },
              { label: 'Slab (Per-Order) Revenue', today: todaySlabRev, month: monthSlabRev, total: totalSlabRev, color: '#E24B4A' },
              { label: 'Total Platform Revenue', today: todayRev, month: monthRev, total: totalRev, color: '#16a34a', bold: true },
            ].map(row => (
              <div key={row.label} style={{ borderTop: row.bold ? '2px solid #e5e7eb' : 'none', paddingTop: row.bold ? 10 : 0, marginTop: row.bold ? 8 : 0, marginBottom: 10 }}>
                <div style={{ fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 700 : 600, color: row.color, marginBottom: 6 }}>{row.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[{ l: 'Today', v: row.today }, { l: 'This Month', v: row.month }, { l: 'All Time', v: row.total }].map(c => (
                    <div key={c.l} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: row.color }}>₹{c.v.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{c.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Active vendors count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Active Restaurants', val: (vendors || []).filter(v => v.subscriptionStatus === 'active').length, icon: '🏪', color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Due Subscriptions', val: (vendors || []).filter(v => v.subscriptionStatus !== 'active').length, icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Total Delivered', val: delivered.length, icon: '✅', color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Avg Fee/Order', val: delivered.length > 0 ? `₹${(totalSlabRev / delivered.length).toFixed(1)}` : '₹0', icon: '📊', color: '#E24B4A', bg: '#fff5f5' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 11, padding: '12px 13px', border: `1.5px solid ${s.color}22` }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VENDORS TAB */}
      {revenueTab === 'vendors' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>Revenue by Restaurant</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Subscription + Slab fees combined</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '7px 14px', background: '#f9fafb', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
            <span>Restaurant</span>
            <span style={{ textAlign: 'right' }}>Slab</span>
            <span style={{ textAlign: 'right' }}>Sub</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>
          {vendorRevList.filter(v => v.totalRev > 0).length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No revenue data yet</div>
          ) : vendorRevList.filter(v => v.totalRev > 0).map((v, i) => (
            <div key={v.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center', marginBottom: 4 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i === 0 && <span style={{ fontSize: 14 }}>🥇</span>}
                    {i === 1 && <span style={{ fontSize: 14 }}>🥈</span>}
                    {i === 2 && <span style={{ fontSize: 14 }}>🥉</span>}
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.storeName}</div>
                  </div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{v.orders} orders · ₹{v.sales.toLocaleString()} sales</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#E24B4A' }}>₹{v.slabRev}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>₹{v.subRev}</div>
                <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#16a34a' }}>₹{v.totalRev.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <MiniBar value={v.totalRev} max={maxVendorRev} color={i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c2f' : '#E24B4A'} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SLABS TAB */}
      {revenueTab === 'slabs' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>Slab Fee Distribution</div>
            {Object.entries(slabDist).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 12 }}>No delivered orders yet</div>
            ) : Object.entries(slabDist).sort((a, b) => parseInt(a[0].slice(1)) - parseInt(b[0].slice(1))).map(([fee, count]) => (
              <div key={fee} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>Fee {fee}</span>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{count} orders · Total ₹{(parseInt(fee.slice(1)) * count).toLocaleString()}</span>
                </div>
                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / maxSlabCount) * 100}%`, background: 'linear-gradient(90deg,#E24B4A,#ff6b6a)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART TAB */}
      {revenueTab === 'chart' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 14 }}>📈 Revenue Growth (Last 6 Months)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginBottom: 12 }}>
            {monthlyData.map(m => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#6b7280' }}>₹{(m.total / 1000).toFixed(1)}k</div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 90 }}>
                  <div style={{ width: '100%', borderRadius: '2px 2px 0 0', height: Math.max((m.slab / maxMonthRev) * 80, m.slab > 0 ? 4 : 0), background: '#E24B4A' }} />
                  <div style={{ width: '100%', height: Math.max((m.sub / maxMonthRev) * 80, m.sub > 0 ? 4 : 0), background: '#7c3aed' }} />
                </div>
                <div style={{ fontSize: 8, color: '#9ca3af' }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#E24B4A' }} />
              <span style={{ fontSize: 10, color: '#6b7280' }}>Slab Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#7c3aed' }} />
              <span style={{ fontSize: 10, color: '#6b7280' }}>Subscription Revenue</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
