// ============================================================
// FILE: src/components/FounderBill.jsx
// FIXED: gstNumber + upiId (correct Firestore field names)
// ============================================================

import { useRef } from 'react'

export default function FounderBill({ order, vendors, onClose }) {
  const billRef = useRef()

  if (!order) return null

  const billNo = order.billNo || ('FZ-' + order.id?.slice(-6).toUpperCase())
  const items = order.items || []
  const subtotal = order.subtotal || items.reduce((s, i) => s + i.price * i.qty, 0)
  const deliveryFee = order.deliveryFee ?? 0
  const total = order.total || subtotal + deliveryFee

  const vendor = vendors?.find(v => v.id === order.vendorUid) || {}
  const storeName    = vendor.storeName || order.vendorName || 'FeedoZone Vendor'
  const storeAddress = vendor.address || 'Warananagar, Kolhapur'
  const storePhone   = vendor.phone || ''
  const fssai        = vendor.fssai || ''
  // ✅ FIXED: was vendor.gstin — field is actually gstNumber
  const gstNumber    = vendor.gstNumber || ''
  // ✅ NEW: UPI ID
  const upiId        = vendor.upiId || ''

  const orderDate = order.createdAt?.toDate?.()
  const dateStr = orderDate
    ? orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'
  const timeStr = orderDate
    ? orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—'

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=400,height=720')
    win.document.write(`
      <html><head><title>Bill ${billNo}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Courier New',monospace;background:#fff;padding:20px;max-width:360px}
        .ctr{text-align:center}.big{font-size:18px;font-weight:bold;text-transform:uppercase;letter-spacing:1px}
        .sm{font-size:11px;color:#555;margin-top:3px}.dash{border-top:1px dashed #999;margin:8px 0}
        .row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0}
        .badge{display:inline-block;font-size:10px;padding:2px 7px;border-radius:4px;margin-top:4px;font-weight:bold}
        .ih{display:flex;font-size:10px;font-weight:bold;text-transform:uppercase;padding:4px 0;border-bottom:1px solid #ccc}
        .ir{display:flex;font-size:11px;padding:5px 0;border-bottom:1px solid #f0f0f0}
        .grand{display:flex;justify-content:space-between;font-size:15px;font-weight:bold;padding:8px 0;border-top:2px solid #000;margin-top:4px}
        .ftr{text-align:center;font-size:11px;color:#666;padding-top:10px;border-top:1px dashed #999;margin-top:8px}
        .upi-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px;text-align:center;margin:8px 0}
      </style></head>
      <body>
        <div class="ctr">
          <div class="big">${storeName}</div>
          <div class="sm">${storeAddress}</div>
          ${storePhone ? `<div class="sm">Ph: ${storePhone}</div>` : ''}
          ${fssai ? `<div><span class="badge" style="background:#dcfce7;color:#166534">✓ FSSAI: ${fssai}</span></div>` : ''}
          ${gstNumber ? `<div><span class="badge" style="background:#dbeafe;color:#1e40af">GST: ${gstNumber}</span></div>` : ''}
        </div>
        <div class="dash"></div>
        <div class="row"><span>Bill No</span><span><b>${billNo}</b></span></div>
        <div class="row"><span>Date</span><span>${dateStr}</span></div>
        <div class="row"><span>Time</span><span>${timeStr}</span></div>
        <div class="row"><span>Customer</span><span>${order.userName}</span></div>
        <div class="row"><span>Phone</span><span>${order.userPhone || '—'}</span></div>
        ${order.address ? `<div class="row"><span>Address</span><span style="max-width:200px;text-align:right">${order.address}</span></div>` : ''}
        <div class="dash"></div>
        <div class="ih">
          <span style="flex:2">Particular</span>
          <span style="text-align:center;flex:0.5">Qty</span>
          <span style="text-align:right;flex:0.7">Rate</span>
          <span style="text-align:right;flex:0.7">Amt</span>
        </div>
        ${items.map(i => `
          <div class="ir">
            <span style="flex:2">${i.name}</span>
            <span style="text-align:center;flex:0.5">${i.qty}</span>
            <span style="text-align:right;flex:0.7">${i.price}</span>
            <span style="text-align:right;flex:0.7;font-weight:bold">${i.price * i.qty}</span>
          </div>
        `).join('')}
        <div style="border-top:1px dashed #999;padding-top:6px;margin-top:4px">
          <div class="row"><span>Subtotal</span><span>₹${subtotal}.00</span></div>
          <div class="row"><span>Delivery</span><span>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}</span></div>
          <div class="row"><span>Round Off</span><span>0.00</span></div>
        </div>
        <div class="grand"><span>BILL AMOUNT ₹</span><span>${total}</span></div>
        <div style="font-size:12px;padding:6px 0;border-top:1px dashed #999;margin-top:4px">
          <div class="row"><span>Payment Mode</span><span><b>COD</b></span></div>
        </div>
        ${upiId ? `
        <div class="upi-box">
          <div style="font-size:11px;font-weight:bold;color:#15803d">📱 Pay via UPI</div>
          <div style="font-size:13px;font-weight:bold;color:#166534;margin-top:3px">${upiId}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px">PhonePe · GPay · Paytm · BHIM</div>
        </div>` : ''}
        <div class="ftr">
          <b>❤️ Thank You... Visit Again!</b><br>
          Powered by FeedoZone<br>
          <span style="font-size:10px">Computer generated bill. No signature required.</span>
        </div>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'Poppins, sans-serif' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div style={{ background: '#111', color: '#fff', padding: '14px 16px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>👑 Founder Bill View</div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Bill No: {billNo}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Receipt */}
        <div ref={billRef} style={{ fontFamily: '"Courier New", Courier, monospace', background: '#fff' }}>

          {/* Store header */}
          <div style={{ textAlign: 'center', padding: '18px 16px 12px', borderBottom: '1px dashed #ccc' }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, color: '#1f2937', textTransform: 'uppercase' }}>{storeName}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{storeAddress}</div>
            {storePhone && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Ph: {storePhone}</div>}

            {/* ✅ Badges — FSSAI, GST */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              {fssai && (
                <span style={{ fontSize: 10, background: '#dcfce7', color: '#166634', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontFamily: 'Poppins' }}>
                  ✓ FSSAI: {fssai}
                </span>
              )}
              {gstNumber && (
                <span style={{ fontSize: 10, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontFamily: 'Poppins' }}>
                  GST: {gstNumber}
                </span>
              )}
            </div>
          </div>

          {/* Bill meta */}
          <div style={{ padding: '10px 16px', borderBottom: '1px dashed #ccc' }}>
            {[
              ['Bill No', billNo, true], ['Date', dateStr, false], ['Time', timeStr, false],
              ['Customer', order.userName, false], ['Phone', order.userPhone || '—', false],
            ].map(([label, val, bold]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>{label}</span>
                <span style={{ fontWeight: bold ? 700 : 500 }}>{val}</span>
              </div>
            ))}
            {order.address && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
                <span style={{ color: '#6b7280', flexShrink: 0 }}>Address</span>
                <span style={{ textAlign: 'right', lineHeight: 1.4, color: '#374151' }}>{order.address}</span>
              </div>
            )}
          </div>

          {/* Items header */}
          <div style={{ display: 'flex', padding: '6px 16px', fontSize: 10, fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <span style={{ flex: 2 }}>Particular</span>
            <span style={{ textAlign: 'center', flex: 0.5 }}>Qty</span>
            <span style={{ textAlign: 'right', flex: 0.7 }}>Rate</span>
            <span style={{ textAlign: 'right', flex: 0.7 }}>Amt</span>
          </div>

          {/* Items */}
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', padding: '6px 16px', fontSize: 12, color: '#1f2937', borderBottom: '1px solid #f9fafb', alignItems: 'flex-start' }}>
              <span style={{ flex: 2, lineHeight: 1.4 }}>{item.name}</span>
              <span style={{ textAlign: 'center', flex: 0.5 }}>{item.qty}</span>
              <span style={{ textAlign: 'right', flex: 0.7 }}>{item.price}</span>
              <span style={{ textAlign: 'right', flex: 0.7, fontWeight: 700 }}>{item.price * item.qty}</span>
            </div>
          ))}

          {/* Totals */}
          <div style={{ padding: '8px 16px 0', borderTop: '1px dashed #ccc', marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}><span>Subtotal</span><span>{subtotal}.00</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}><span>Delivery</span><span style={{ color: deliveryFee === 0 ? '#16a34a' : '#374151' }}>{deliveryFee === 0 ? 'FREE' : deliveryFee + '.00'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}><span>Round Off</span><span>0.00</span></div>
          </div>

          {/* Grand total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: 16, fontWeight: 700, color: '#1f2937', borderTop: '2px solid #1f2937', marginTop: 4 }}>
            <span>BILL AMOUNT ₹</span>
            <span style={{ fontSize: 20, color: '#E24B4A' }}>{total}</span>
          </div>

          {/* Payment */}
          <div style={{ padding: '6px 16px', background: '#fffbeb', borderTop: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#92400e' }}>
              <span>Payment Mode</span><span style={{ fontWeight: 700 }}>Cash on Delivery (COD)</span>
            </div>
          </div>

          {/* ✅ UPI section */}
          {upiId && (
            <div style={{ margin: '0 16px', padding: '10px 12px', background: '#f0fdf4', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', fontFamily: 'Poppins, sans-serif' }}>📱 Pay via UPI</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginTop: 3, letterSpacing: 0.5 }}>{upiId}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3, fontFamily: 'Poppins, sans-serif' }}>PhonePe · GPay · Paytm · BHIM</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '12px 16px', borderTop: '1px dashed #ccc', marginTop: upiId ? 10 : 0, color: '#6b7280' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 4, fontFamily: 'Poppins' }}>❤️ Thank You... Visit Again!</div>
            <div style={{ fontSize: 11 }}>Powered by FeedoZone</div>
            <div style={{ fontSize: 10, marginTop: 4, color: '#9ca3af' }}>Computer generated bill. No signature required.</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px' }}>
          <button onClick={handlePrint} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🖨️ Print Bill
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', background: 'transparent', color: '#374151' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  )
}