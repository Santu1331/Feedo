// ============================================================
// FILE: src/components/OfferManagement.jsx
// Offer Management — Vendor Panel (Create/Edit/Disable/Delete)
// ============================================================

import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, where
} from 'firebase/firestore'
import { uploadPhoto } from '../firebase/services'
import toast from 'react-hot-toast'

const inp = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9,
  fontSize: 13, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box',
  background: '#fff', color: '#1f2937',
}

const EMPTY_OFFER = {
  title: '', description: '', discountType: 'percentage',
  discountValue: '', minOrder: '', maxDiscount: '',
  couponCode: '', validFrom: '', validUntil: '',
  bannerImage: '', terms: '', status: 'pending',
}

function OfferCard({ offer, onEdit, onDelete, onToggle, deleting, toggling }) {
  const now = new Date()
  const from = offer.validFrom ? new Date(offer.validFrom) : null
  const until = offer.validUntil ? new Date(offer.validUntil) : null
  const isExpired = until && until < now

  const statusColor = {
    approved: { bg: '#d1fae5', color: '#065f46', text: 'Approved' },
    pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending Approval' },
    rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Rejected' },
    disabled: { bg: '#f3f4f6', color: '#6b7280', text: 'Disabled' },
  }[offer.status] || { bg: '#f3f4f6', color: '#6b7280', text: offer.status }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden', opacity: offer.status === 'disabled' ? 0.7 : 1 }}>
      {offer.bannerImage && (
        <img src={offer.bannerImage} alt="" style={{ width: '100%', height: 110, objectFit: 'cover' }} />
      )}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>{offer.title}</div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{offer.description}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: statusColor.bg, color: statusColor.color, flexShrink: 0, marginLeft: 8 }}>
            {statusColor.text}
          </span>
        </div>

        {/* Discount badge */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', color: '#fff' }}>
            {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
          </span>
          {offer.minOrder && (
            <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', fontWeight: 600 }}>
              Min ₹{offer.minOrder}
            </span>
          )}
          {offer.couponCode && (
            <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>
              {offer.couponCode}
            </span>
          )}
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 10, color: '#9ca3af' }}>
          {from && <span>📅 From: {from.toLocaleDateString('en-IN')}</span>}
          {until && (
            <span style={{ color: isExpired ? '#ef4444' : '#9ca3af' }}>
              {isExpired ? '⚠️ Expired:' : '⏰ Until:'} {until.toLocaleDateString('en-IN')}
            </span>
          )}
        </div>

        {/* Rejection remark */}
        {offer.founderRemark && offer.status === 'rejected' && (
          <div style={{ background: '#fff5f5', borderRadius: 8, padding: '7px 10px', marginBottom: 10, fontSize: 11, color: '#991b1b' }}>
            💬 Rejected: {offer.founderRemark}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEdit(offer)}
            style={{ flex: 1, padding: '9px 0', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onToggle(offer)}
            disabled={toggling === offer.id}
            style={{ flex: 1, padding: '9px 0', background: offer.status === 'disabled' ? '#f0fdf4' : '#fffbeb', color: offer.status === 'disabled' ? '#16a34a' : '#92400e', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}
          >
            {toggling === offer.id ? '⏳' : offer.status === 'disabled' ? '✅ Enable' : '⏸️ Disable'}
          </button>
          <button
            onClick={() => onDelete(offer.id)}
            disabled={deleting === offer.id}
            style={{ padding: '9px 12px', background: '#fff5f5', color: '#E24B4A', border: '1px solid #fecaca', borderRadius: 9, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}
          >
            {deleting === offer.id ? '⏳' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OfferManagement({ vendorUid, vendorName }) {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_OFFER)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!vendorUid) return
    const unsub = onSnapshot(
      query(collection(db, 'offers'), where('vendorId', '==', vendorUid)),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setOffers(list)
        setLoading(false)
      },
      err => { console.error('Offers error:', err); setLoading(false) }
    )
    return unsub
  }, [vendorUid])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      setForm(p => ({ ...p, bannerImage: url }))
      toast.success('✅ Banner uploaded!')
    } catch {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Offer title required')
    if (!form.discountValue || Number(form.discountValue) <= 0) return toast.error('Enter valid discount value')
    if (!form.validFrom) return toast.error('Valid from date required')
    if (!form.validUntil) return toast.error('Valid until date required')
    if (new Date(form.validFrom) >= new Date(form.validUntil)) return toast.error('Valid until must be after valid from')

    setSaving(true)
    try {
      const data = {
        vendorId: vendorUid,
        vendorName: vendorName || '',
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        couponCode: form.couponCode.trim().toUpperCase(),
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        bannerImage: form.bannerImage || '',
        terms: form.terms.trim(),
        updatedAt: serverTimestamp(),
      }
      if (editingId) {
        // Keep existing status/founderRemark — only reset to pending if previously rejected
        const existing = offers.find(o => o.id === editingId)
        if (existing?.status === 'rejected') data.status = 'pending'
        await updateDoc(doc(db, 'offers', editingId), data)
        toast.success('✅ Offer updated! Awaiting founder approval.')
      } else {
        data.status = 'pending'
        data.createdAt = serverTimestamp()
        await addDoc(collection(db, 'offers'), data)
        toast.success('✅ Offer submitted! Awaiting founder approval.')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_OFFER)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setSaving(false)
  }

  const handleEdit = (offer) => {
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue || '',
      minOrder: offer.minOrder || '',
      maxDiscount: offer.maxDiscount || '',
      couponCode: offer.couponCode || '',
      validFrom: offer.validFrom || '',
      validUntil: offer.validUntil || '',
      bannerImage: offer.bannerImage || '',
      terms: offer.terms || '',
      status: offer.status,
    })
    setEditingId(offer.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer permanently?')) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, 'offers', id))
      toast.success('Offer deleted')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setDeleting(null)
  }

  const handleToggle = async (offer) => {
    setToggling(offer.id)
    try {
      const newStatus = offer.status === 'disabled' ? 'pending' : 'disabled'
      await updateDoc(doc(db, 'offers', offer.id), { status: newStatus, updatedAt: serverTimestamp() })
      toast.success(newStatus === 'disabled' ? 'Offer disabled' : 'Offer re-submitted for approval')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    }
    setToggling(null)
  }

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
      <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#2d1f00)', borderRadius: 14, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.06 }}>🏷️</div>
        <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, letterSpacing: 1.5, marginBottom: 3, textTransform: 'uppercase' }}>Restaurant Panel</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 3 }}>🏷️ Offer Management</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Create & manage special offers. Approved offers show in customer app.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { val: offers.length, label: 'Total Offers', color: '#fbbf24' },
            { val: offers.filter(o => o.status === 'approved').length, label: 'Approved', color: '#4ade80' },
            { val: offers.filter(o => o.status === 'pending').length, label: 'Pending', color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 9, padding: '9px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_OFFER) }}
        style={{ width: '100%', padding: '12px 0', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        ➕ Create New Offer
      </button>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{editingId ? '✏️ Edit Offer' : '➕ New Offer'}</div>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_OFFER) }} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Offer Title *</label>
              <input style={inp} placeholder="e.g. Weekend Special 30% Off" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Description</label>
              <textarea style={{ ...inp, minHeight: 64, resize: 'vertical', lineHeight: 1.5 }} placeholder="Describe your offer..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Discount Type *</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}>
                <option value="percentage">Percentage Discount (%)</option>
                <option value="flat">Flat Discount (₹)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                  {form.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'} *
                </label>
                <input type="number" style={inp} placeholder="e.g. 20" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Min Order (₹)</label>
                <input type="number" style={inp} placeholder="e.g. 200" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))} />
              </div>
            </div>

            {form.discountType === 'percentage' && (
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Max Discount (₹) — optional cap</label>
                <input type="number" style={inp} placeholder="e.g. 100" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} />
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Coupon Code (optional)</label>
              <input style={inp} placeholder="e.g. SAVE30" value={form.couponCode} onChange={e => setForm(p => ({ ...p, couponCode: e.target.value.toUpperCase() }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Valid From *</label>
                <input type="date" style={inp} value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Valid Until *</label>
                <input type="date" style={inp} value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Banner Image (optional)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="offer-banner-input" />
                <label htmlFor="offer-banner-input" style={{ flex: 1, padding: '9px 12px', border: '1.5px dashed #e5e7eb', borderRadius: 9, fontSize: 12, color: '#6b7280', cursor: 'pointer', textAlign: 'center' }}>
                  {uploading ? '⏳ Uploading...' : form.bannerImage ? '✅ Banner set (tap to change)' : '📷 Upload Banner Image'}
                </label>
                {form.bannerImage && <button onClick={() => setForm(p => ({ ...p, bannerImage: '' }))} style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 11, color: '#E24B4A', fontFamily: 'Poppins' }}>✕</button>}
              </div>
              {form.bannerImage && <img src={form.bannerImage} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 6 }} />}
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Terms & Conditions (optional)</label>
              <textarea style={{ ...inp, minHeight: 56, resize: 'vertical', lineHeight: 1.5 }} placeholder="e.g. Valid on orders above ₹200..." value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} />
            </div>

            <div style={{ background: '#fffbeb', borderRadius: 9, padding: '10px 12px', fontSize: 11, color: '#92400e' }}>
              ℹ️ New offers are sent to Founder for approval. Only approved offers are shown to customers.
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 0', background: saving ? '#fca5a5' : '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins' }}>
                {saving ? '⏳ Saving...' : editingId ? '✅ Update Offer' : '✅ Submit for Approval'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_OFFER) }} style={{ flex: 1, padding: '12px 0', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers list */}
      {offers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏷️</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No offers yet</div>
          <div style={{ fontSize: 12 }}>Create your first offer to attract more customers</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {offers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              deleting={deleting}
              toggling={toggling}
            />
          ))}
        </div>
      )}
    </div>
  )
}
