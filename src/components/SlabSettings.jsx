// ============================================================
// FILE: src/components/SlabSettings.jsx
// Order Value Slab Pricing Manager — Founder Only
// ============================================================

import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, getDocs
} from 'firebase/firestore'
import toast from 'react-hot-toast'

const DEFAULT_SLABS = [
  { minOrder: 0,    maxOrder: 100,  platformFee: 5,  enabled: true },
  { minOrder: 101,  maxOrder: 250,  platformFee: 8,  enabled: true },
  { minOrder: 251,  maxOrder: 500,  platformFee: 10, enabled: true },
  { minOrder: 501,  maxOrder: 800,  platformFee: 12, enabled: true },
  { minOrder: 801,  maxOrder: 1000, platformFee: 18, enabled: true },
  { minOrder: 1001, maxOrder: null, platformFee: 20, enabled: true },
]

export function calculatePlatformFee(orderTotal, slabs) {
  if (!slabs || slabs.length === 0) return 0
  const enabledSlabs = slabs.filter(s => s.enabled !== false).sort((a, b) => a.minOrder - b.minOrder)
  for (const slab of enabledSlabs) {
    const maxOk = slab.maxOrder === null || slab.maxOrder === undefined || orderTotal <= slab.maxOrder
    if (orderTotal >= slab.minOrder && maxOk) {
      return slab.platformFee
    }
  }
  return 0
}

const inp = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9,
  fontSize: 13, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box',
  background: '#fff', color: '#1f2937',
}

const EMPTY_SLAB = { minOrder: '', maxOrder: '', platformFee: '', enabled: true }

export default function SlabSettings() {
  const [slabs, setSlabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_SLAB)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orderSlabs'),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => a.minOrder - b.minOrder)
        setSlabs(list)
        setLoading(false)
      },
      err => { console.error('Slabs error:', err); setLoading(false) }
    )
    return unsub
  }, [])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await Promise.all(DEFAULT_SLABS.map(s =>
        addDoc(collection(db, 'orderSlabs'), { ...s, createdAt: serverTimestamp() })
      ))
      toast.success('✅ Default slabs created!')
    } catch (err) {
      toast.error('Failed to seed: ' + err.message)
    }
    setSeeding(false)
  }

  const handleSave = async () => {
    const min = Number(form.minOrder)
    const max = form.maxOrder === '' || form.maxOrder === null ? null : Number(form.maxOrder)
    const fee = Number(form.platformFee)

    if (isNaN(min) || min < 0) return toast.error('Enter valid min order value')
    if (max !== null && (isNaN(max) || max <= min)) return toast.error('Max order must be greater than min order')
    if (!fee || fee <= 0) return toast.error('Enter valid platform fee')

    setSaving(true)
    try {
      const data = {
        minOrder: min,
        maxOrder: max,
        platformFee: fee,
        enabled: form.enabled !== false,
        updatedAt: serverTimestamp(),
      }
      if (editingId) {
        await updateDoc(doc(db, 'orderSlabs', editingId), data)
        toast.success('✅ Slab updated!')
      } else {
        await addDoc(collection(db, 'orderSlabs'), { ...data, createdAt: serverTimestamp() })
        toast.success('✅ Slab added!')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_SLAB)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setSaving(false)
  }

  const handleEdit = (slab) => {
    setForm({
      minOrder: slab.minOrder,
      maxOrder: slab.maxOrder === null || slab.maxOrder === undefined ? '' : slab.maxOrder,
      platformFee: slab.platformFee,
      enabled: slab.enabled !== false,
    })
    setEditingId(slab.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slab?')) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, 'orderSlabs', id))
      toast.success('Slab deleted')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setDeleting(null)
  }

  const handleToggle = async (slab) => {
    setToggling(slab.id)
    try {
      await updateDoc(doc(db, 'orderSlabs', slab.id), { enabled: !slab.enabled, updatedAt: serverTimestamp() })
      toast.success(slab.enabled ? 'Slab disabled' : 'Slab enabled')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setToggling(null)
  }

  const previewFee = (total) => calculatePlatformFee(total, slabs)

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
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 14, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.05 }}>📊</div>
        <div style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700, letterSpacing: 1.5, marginBottom: 3, textTransform: 'uppercase' }}>Revenue Settings · Founder Only</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 3 }}>📊 Order Slab Settings</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Platform fee per delivered order based on order value</div>

        {/* Live preview */}
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>LIVE FEE PREVIEW</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[80, 200, 400, 700, 950, 1200].map(v => (
              <div key={v} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>₹{v}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>₹{previewFee(v)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_SLAB) }}
          style={{ flex: 1, padding: '11px 0', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          ➕ Add Slab
        </button>
        {slabs.length === 0 && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            style={{ flex: 1, padding: '11px 0', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {seeding ? '⏳ Creating...' : '⚡ Seed Defaults'}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{editingId ? '✏️ Edit Slab' : '➕ New Slab'}</div>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_SLAB) }} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Min Order (₹) *</label>
              <input type="number" style={inp} placeholder="e.g. 0" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Max Order (₹) — blank = unlimited</label>
              <input type="number" style={inp} placeholder="e.g. 100 (blank = above)" value={form.maxOrder} onChange={e => setForm(p => ({ ...p, maxOrder: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Platform Fee (₹) *</label>
            <input type="number" style={inp} placeholder="e.g. 5" value={form.platformFee} onChange={e => setForm(p => ({ ...p, platformFee: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <button
              onClick={() => setForm(p => ({ ...p, enabled: !p.enabled }))}
              style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: form.enabled ? '#16a34a' : '#9ca3af', position: 'relative', transition: 'all 0.2s', padding: 0 }}
            >
              <div style={{ position: 'absolute', top: 2, left: form.enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
            <span style={{ fontSize: 12, color: form.enabled ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>{form.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 0', background: saving ? '#fca5a5' : '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
              {saving ? '⏳ Saving...' : editingId ? '✅ Update Slab' : '✅ Add Slab'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_SLAB) }} style={{ flex: 1, padding: '12px 0', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slab List */}
      {slabs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No slabs configured</div>
          <div style={{ fontSize: 12 }}>Click "Seed Defaults" to add standard pricing slabs</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slabs.map((slab, i) => (
            <div key={slab.id} style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${slab.enabled !== false ? '#e5e7eb' : '#f3f4f6'}`, overflow: 'hidden', opacity: slab.enabled !== false ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12 }}>
                {/* Slab number */}
                <div style={{ width: 32, height: 32, borderRadius: 8, background: slab.enabled !== false ? 'linear-gradient(135deg,#E24B4A,#ff6b6a)' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: slab.enabled !== false ? '#fff' : '#9ca3af' }}>S{i + 1}</span>
                </div>

                {/* Range */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>
                    ₹{slab.minOrder}
                    {slab.maxOrder === null || slab.maxOrder === undefined
                      ? ' & above'
                      : ` – ₹${slab.maxOrder}`}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                    {slab.enabled !== false ? '✅ Active' : '⏸️ Disabled'}
                  </div>
                </div>

                {/* Fee */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#E24B4A' }}>₹{slab.platformFee}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af' }}>Platform fee</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(slab)}
                    disabled={toggling === slab.id}
                    title={slab.enabled !== false ? 'Disable slab' : 'Enable slab'}
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb', background: slab.enabled !== false ? '#f0fdf4' : '#fef9f0', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {slab.enabled !== false ? '✅' : '⏸️'}
                  </button>
                  <button
                    onClick={() => handleEdit(slab)}
                    title="Edit slab"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb', background: '#eff6ff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(slab.id)}
                    disabled={deleting === slab.id}
                    title="Delete slab"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {deleting === slab.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div style={{ background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7', padding: 14, marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>ℹ️ How Slab Pricing Works</div>
        <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.7 }}>
          • Fee is charged per delivered order based on the order total amount.<br />
          • Example: ₹80 order → ₹5 fee · ₹450 order → ₹10 fee · ₹1200 order → ₹20 fee<br />
          • Slabs work independently of the monthly subscription fee.<br />
          • Disabled slabs are skipped during fee calculation.
        </div>
      </div>
    </div>
  )
}
