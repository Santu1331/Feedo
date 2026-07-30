// ============================================================
// FILE: src/components/OffersSection.jsx
// Customer-facing approved offers display
// ============================================================

import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'

function OfferBanner({ offer, onApply }) {
  const now = new Date()
  const until = offer.validUntil ? new Date(offer.validUntil) : null
  const isExpired = until && until < now
  if (isExpired) return null

  const daysLeft = until ? Math.ceil((until - now) / 86400000) : null

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1.5px solid #fee2e2', minWidth: 240, maxWidth: 260, flexShrink: 0 }}>
      {offer.bannerImage ? (
        <div style={{ position: 'relative' }}>
          <img src={offer.bannerImage} alt={offer.title} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
            {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
          </div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg,#E24B4A22,#ff6b6a11)', padding: '16px 14px 12px', borderBottom: '1px dashed #fecaca' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#E24B4A', lineHeight: 1.1 }}>
            {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
          </div>
        </div>
      )}

      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.title}</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🏪 {offer.vendorName}</div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {offer.minOrder > 0 && (
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', fontWeight: 600 }}>Min ₹{offer.minOrder}</span>
          )}
          {daysLeft !== null && (
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: daysLeft <= 2 ? '#fee2e2' : '#fef3c7', color: daysLeft <= 2 ? '#991b1b' : '#92400e', fontWeight: 600 }}>
              {daysLeft <= 0 ? 'Last day' : `${daysLeft}d left`}
            </span>
          )}
        </div>

        {offer.couponCode ? (
          <button
            onClick={() => onApply(offer)}
            style={{ width: '100%', padding: '8px 0', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            🏷️ {offer.couponCode} · Apply
          </button>
        ) : (
          <button
            onClick={() => onApply(offer)}
            style={{ width: '100%', padding: '8px 0', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins' }}
          >
            ✅ Auto-applied at checkout
          </button>
        )}
      </div>
    </div>
  )
}

export default function OffersSection({ vendorId, compact }) {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const conditions = [where('status', '==', 'approved')]
    if (vendorId) conditions.push(where('vendorId', '==', vendorId))
    const q = query(collection(db, 'offers'), ...conditions)
    const unsub = onSnapshot(q,
      snap => {
        const now = new Date()
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(o => !o.validUntil || new Date(o.validUntil) >= now)
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setOffers(list)
        setLoading(false)
      },
      err => { console.error('OffersSection error:', err); setLoading(false) }
    )
    return unsub
  }, [vendorId])

  const handleApply = (offer) => {
    if (offer.couponCode) {
      navigator.clipboard?.writeText(offer.couponCode).then(() => {
        toast.success(`🏷️ Coupon "${offer.couponCode}" copied!`)
      }).catch(() => {
        toast.success(`🏷️ Coupon: ${offer.couponCode}`)
      })
    } else {
      toast.success(`✅ "${offer.title}" will be auto-applied!`)
    }
  }

  if (loading || offers.length === 0) return null

  if (compact) {
    // Horizontal scroll strip for home/restaurant page
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>🏷️ Special Offers</div>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{offers.length} offer{offers.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 6, scrollbarWidth: 'none' }}>
          {offers.map(offer => (
            <OfferBanner key={offer.id} offer={offer} onApply={handleApply} />
          ))}
        </div>
      </div>
    )
  }

  // Full grid view for offers page
  return (
    <div style={{ padding: '0 16px', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>🏷️ Available Offers</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {offers.map(offer => (
          <OfferBanner key={offer.id} offer={offer} onApply={handleApply} />
        ))}
      </div>
    </div>
  )
}
