// ============================================================
// FILE: src/components/OfferApproval.jsx
// Founder Offer Approval Panel
// ============================================================

import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  approved: { bg: '#d1fae5', color: '#065f46', label: '✅ Approved' },
  pending:  { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejected' },
  disabled: { bg: '#f3f4f6', color: '#6b7280', label: '⏸️ Disabled' },
}

export default function OfferApproval() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState(null)
  const [remarkModal, setRemarkModal] = useState(null)
  const [remark, setRemark] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'offers'),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setOffers(list)
        setLoading(false)
      },
      err => { console.error('Offers error:', err); setLoading(false) }
    )
    return unsub
  }, [])

  const handleApprove = async (offer) => {
    setProcessing(offer.id)
    try {
      await updateDoc(doc(db, 'offers', offer.id), {
        status: 'approved', founderRemark: '', updatedAt: serverTimestamp()
      })
      toast.success(`✅ "${offer.title}" approved!`)
    } catch (err) { toast.error('Failed: ' + err.message) }
    setProcessing(null)
  }

  const handleReject = async () => {
    if (!remarkModal) return
    setProcessing(remarkModal.id)
    try {
      await updateDoc(doc(db, 'offers', remarkModal.id), {
        status: 'rejected', founderRemark: remark.trim(), updatedAt: serverTimestamp()
      })
      toast.success('❌ Offer rejected')
      setRemarkModal(null); setRemark('')
    } catch (err) { toast.error('Failed: ' + err.message) }
    setProcessing(null)
  }

  const handleDisable = async (offer) => {
    setProcessing(offer.id)
    try {
      const newStatus = offer.status === 'disabled' ? 'approved' : 'disabled'
      await updateDoc(doc(db, 'offers', offer.id), { status: newStatus, updatedAt: serverTimestamp() })
      toast.success(newStatus === 'disabled' ? 'Offer disabled' : 'Offer re-enabled')
    } catch (err) { toast.error('Failed: ' + err.message) }
    setProcessing(null)
  }

  const handleDelete = async (offer) => {
    if (!window.confirm(`Delete offer "${offer.title}"? This cannot be undone.`)) return
    setProcessing(offer.id)
    try {
      await deleteDoc(doc(db, 'offers', offer.id))
      toast.success('Offer deleted')
    } catch (err) { toast.error('Failed: ' + err.message) }
    setProcessing(null)
  }

  const filtered = offers.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) || o.vendorName?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all: offers.length,
    pending: offers.filter(o => o.status === 'pending').length,
    approved: offers.filter(o => o.status === 'approved').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
    disabled: offers.filter(o => o.status === 'disabled').length,
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
      <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius: 14, padding: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.05 }}>🏷️</div>
        <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, letterSpacing: 1.5, marginBottom: 3, textTransform: 'uppercase' }}>Founder Panel</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 3 }}>🏷️ Offer Approval</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Review and approve restaurant offers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { val: counts.pending, label: 'Pending', color: '#fbbf24' },
            { val: counts.approved, label: 'Approved', color: '#4ade80' },
            { val: counts.rejected, label: 'Rejected', color: '#f87171' },
            { val: counts.disabled, label: 'Disabled', color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 9, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 10 }}>
        <input
          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' }}
          placeholder="🔍 Search offers or restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {['all', 'pending', 'approved', 'rejected', 'disabled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'Poppins', fontSize: 11, fontWeight: 600,
            background: filter === f ? '#E24B4A' : '#f3f4f6',
            color: filter === f ? '#fff' : '#6b7280',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? offers.length})
          </button>
        ))}
      </div>

      {/* Offers */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏷️</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No offers {filter !== 'all' ? `with status "${filter}"` : 'yet'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(offer => {
            const sc = STATUS_COLORS[offer.status] || STATUS_COLORS.pending
            const now = new Date()
            const until = offer.validUntil ? new Date(offer.validUntil) : null
            const isExpired = until && until < now
            return (
              <div key={offer.id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
                {offer.bannerImage && (
                  <img src={offer.bannerImage} alt="" style={{ width: '100%', height: 90, objectFit: 'cover' }} />
                )}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 1 }}>{offer.title}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>🏪 {offer.vendorName || 'Unknown Restaurant'}</div>
                      {offer.description && <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{offer.description}</div>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: 8 }}>
                      {sc.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', color: '#fff' }}>
                      {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                    </span>
                    {offer.minOrder > 0 && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: '#eff6ff', color: '#1e40af' }}>Min ₹{offer.minOrder}</span>}
                    {offer.couponCode && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', fontFamily: 'monospace' }}>{offer.couponCode}</span>}
                    {isExpired && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: '#fee2e2', color: '#991b1b' }}>⚠️ Expired</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 10, color: '#9ca3af' }}>
                    {offer.validFrom && <span>📅 {new Date(offer.validFrom).toLocaleDateString('en-IN')}</span>}
                    {offer.validUntil && <span>⏰ {new Date(offer.validUntil).toLocaleDateString('en-IN')}</span>}
                  </div>

                  {offer.founderRemark && (
                    <div style={{ background: '#fff5f5', borderRadius: 8, padding: '7px 10px', marginBottom: 8, fontSize: 11, color: '#991b1b' }}>
                      💬 Remark: {offer.founderRemark}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {offer.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(offer)}
                        disabled={processing === offer.id}
                        style={{ flex: 1, padding: '9px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', minWidth: 80 }}
                      >
                        {processing === offer.id ? '⏳' : '✅ Approve'}
                      </button>
                    )}
                    {(offer.status === 'pending' || offer.status === 'approved') && (
                      <button
                        onClick={() => { setRemarkModal(offer); setRemark('') }}
                        disabled={processing === offer.id}
                        style={{ flex: 1, padding: '9px 0', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', minWidth: 80 }}
                      >
                        ❌ Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDisable(offer)}
                      disabled={processing === offer.id}
                      style={{ flex: 1, padding: '9px 0', background: offer.status === 'disabled' ? '#f0fdf4' : '#fffbeb', color: offer.status === 'disabled' ? '#16a34a' : '#92400e', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', minWidth: 80 }}
                    >
                      {offer.status === 'disabled' ? '✅ Enable' : '⏸️ Disable'}
                    </button>
                    <button
                      onClick={() => handleDelete(offer)}
                      disabled={processing === offer.id}
                      style={{ padding: '9px 12px', background: '#fff5f5', color: '#E24B4A', border: '1px solid #fecaca', borderRadius: 9, fontSize: 11, cursor: 'pointer', fontFamily: 'Poppins' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject remark modal */}
      {remarkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) { setRemarkModal(null); setRemark('') } }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 430 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>❌ Reject Offer</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>"{remarkModal.title}" by {remarkModal.vendorName}</div>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Reason for rejection (optional — visible to restaurant owner)"
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontFamily: 'Poppins', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5, marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleReject} disabled={processing === remarkModal?.id} style={{ flex: 1, padding: '12px 0', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}>
                {processing === remarkModal?.id ? '⏳ Rejecting...' : '❌ Confirm Reject'}
              </button>
              <button onClick={() => { setRemarkModal(null); setRemark('') }} style={{ flex: 1, padding: '12px 0', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
