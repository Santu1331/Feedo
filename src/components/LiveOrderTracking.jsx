// LiveOrderTracking.jsx
// Drop this file in your components/ folder
// Usage: import LiveOrderTracking from '../components/LiveOrderTracking'
// Requires: leaflet (already loaded via CDN in index.html OR we load it dynamically below)

import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase/config'

// ── Haversine distance in km ──
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Load Leaflet from CDN if not already loaded ──
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L)
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    document.head.appendChild(script)
  })
}

// ── Custom marker icons ──
function makeIcon(L, emoji, size = 38) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#fff;display:flex;align-items:center;
      justify-content:center;font-size:${size * 0.5}px;
      box-shadow:0 3px 12px rgba(0,0,0,0.3);
      border:2.5px solid #E24B4A;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
  })
}

function makeRiderIcon(L) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:48px;height:48px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(226,75,74,0.2);
          animation:riderPulse 1.5s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:#E24B4A;display:flex;align-items:center;
          justify-content:center;font-size:20px;
          box-shadow:0 4px 14px rgba(226,75,74,0.5);
          border:2.5px solid #fff;
        ">🛵</div>
      </div>
      <style>
        @keyframes riderPulse {
          0%{transform:scale(1);opacity:0.8}
          100%{transform:scale(2.2);opacity:0}
        }
      </style>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    className: '',
  })
}

// ── Dashed polyline between points ──
function drawDashedLine(L, map, from, to, color = '#E24B4A') {
  return L.polyline([from, to], {
    color,
    weight: 3,
    dashArray: '8,8',
    opacity: 0.7,
  }).addTo(map)
}

// ─────────────────────────────────────────────
export default function LiveOrderTracking({ order, userLat, userLng, onClose }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const riderMarkerRef = useRef(null)
  const riderLineRef = useRef(null)
  const restaurantMarkerRef = useRef(null)
  const userMarkerRef = useRef(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const [riderLocation, setRiderLocation] = useState(null)
  const [riderName, setRiderName] = useState(order?.riderName || 'Delivery Partner')
  const [riderPhone, setRiderPhone] = useState(order?.riderPhone || '')
  const [riderDistance, setRiderDistance] = useState(null)
  const [mapVisible, setMapVisible] = useState(true)
  const [eta, setEta] = useState(null)
  const [isLive, setIsLive] = useState(false)

  const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered']
  const currentStep = STATUS_STEPS.indexOf(order?.status ?? 'pending')

  const STEP_META = [
    { key: 'pending', icon: '📋', label: 'Placed' },
    { key: 'accepted', icon: '✅', label: 'Accepted' },
    { key: 'preparing', icon: '👨‍🍳', label: 'Cooking' },
    { key: 'ready', icon: '🎉', label: 'Ready' },
    { key: 'out_for_delivery', icon: '🛵', label: 'On Way' },
    { key: 'delivered', icon: '✅', label: 'Done' },
  ]

  // ── Listen to order doc for riderLocation + riderName + riderPhone ──
  useEffect(() => {
    if (!order?.id) return
    let unsub
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      unsub = onSnapshot(doc(db, 'orders', order.id), (snap) => {
        if (!snap.exists()) return
        const data = snap.data()
        if (data.riderLocation?.lat && data.riderLocation?.lng) {
          setRiderLocation({ lat: data.riderLocation.lat, lng: data.riderLocation.lng })
          setIsLive(true)
          if (data.riderName) setRiderName(data.riderName)
          if (data.riderPhone) setRiderPhone(data.riderPhone)
        }
      })
    })
    return () => unsub?.()
  }, [order?.id])

  // ── Load Leaflet ──
  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true))
  }, [])

  // ── Initialize map ──
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return
    const L = window.L

    // Determine initial center
    const vendorLat = order?.vendorLocation?.lat || userLat || 16.8524
    const vendorLng = order?.vendorLocation?.lng || userLng || 74.5815

    const map = L.map(mapRef.current, {
      center: [vendorLat, vendorLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map

    // Restaurant marker
    if (order?.vendorLocation?.lat) {
      restaurantMarkerRef.current = L.marker(
        [order.vendorLocation.lat, order.vendorLocation.lng],
        { icon: makeIcon(L, '🏪', 36) }
      )
        .addTo(map)
        .bindPopup(`<b>${order.vendorName}</b><br>Restaurant`)
    }

    // User marker
    if (userLat && userLng) {
      userMarkerRef.current = L.marker([userLat, userLng], {
        icon: makeIcon(L, '🏠', 36),
      })
        .addTo(map)
        .bindPopup('Your delivery location')
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [leafletReady])

  // ── Update rider marker on location change ──
  useEffect(() => {
    const L = window.L
    const map = mapInstanceRef.current
    if (!L || !map || !riderLocation) return

    const { lat, lng } = riderLocation

    // Compute distance to user
    if (userLat && userLng) {
      const d = haversine(lat, lng, userLat, userLng)
      setRiderDistance(d)
      // ETA: assume ~20 km/h avg delivery speed
      const etaMins = Math.ceil((d / 20) * 60)
      setEta(etaMins)
    }

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([lat, lng])
    } else {
      riderMarkerRef.current = L.marker([lat, lng], { icon: makeRiderIcon(L) })
        .addTo(map)
        .bindPopup(`<b>${riderName}</b><br>Delivery Rider`)
    }

    // Draw/update dashed line to user
    if (riderLineRef.current) {
      map.removeLayer(riderLineRef.current)
    }
    if (userLat && userLng) {
      riderLineRef.current = drawDashedLine(L, map, [lat, lng], [userLat, userLng])
    }

    // Fit bounds to show rider + user
    const points = [[lat, lng]]
    if (userLat && userLng) points.push([userLat, userLng])
    if (order?.vendorLocation?.lat) points.push([order.vendorLocation.lat, order.vendorLocation.lng])
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 })
    }
  }, [riderLocation])

  const isOutForDelivery = order?.status === 'out_for_delivery'
  const isDelivered = order?.status === 'delivered'
  const isCancelled = order?.status === 'cancelled'

  const headerBg = isCancelled
    ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
    : isDelivered
    ? 'linear-gradient(135deg,#16a34a,#15803d)'
    : 'linear-gradient(135deg,#E24B4A,#c73232)'

  const statusLabel = isCancelled
    ? '❌ Cancelled'
    : isDelivered
    ? '✅ Delivered!'
    : isOutForDelivery
    ? '🛵 On the way!'
    : order?.status === 'preparing'
    ? '👨‍🍳 Preparing...'
    : order?.status === 'accepted'
    ? '✅ Accepted!'
    : '📋 Order Placed'

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100%', fontFamily: 'Poppins,sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background: headerBg, padding: '20px 16px 24px', color: '#fff' }}>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 14 }}
        >
          ← My Orders
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {isCancelled ? '❌' : isDelivered ? '✅' : isOutForDelivery ? '🛵' : order?.status === 'preparing' ? '👨‍🍳' : '📋'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 0.5, marginBottom: 2 }}>ORDER TRACKING</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{order?.vendorName}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              {order?.createdAt?.toDate?.()?.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''} · ₹{order?.total}
            </div>
          </div>
          {isLive && isOutForDelivery && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'liveDot 1.2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700 }}>LIVE</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'inline-block', padding: '5px 16px' }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{statusLabel}</span>
        </div>
      </div>

      <style>{`
        @keyframes liveDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes riderPulse { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      <div style={{ padding: '0 16px 100px' }}>

        {/* ── STEP PROGRESS BAR ── */}
        {!isCancelled && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px 12px', marginTop: 14, marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              {/* progress line */}
              <div style={{ position: 'absolute', top: 18, left: '8%', right: '8%', height: 3, background: '#f3f4f6', borderRadius: 99, zIndex: 0 }} />
              <div style={{
                position: 'absolute', top: 18, left: '8%', height: 3, background: 'linear-gradient(90deg,#E24B4A,#ff6b6a)', borderRadius: 99, zIndex: 1,
                width: currentStep <= 0 ? '0%' : `${Math.min(100, (currentStep / (STEP_META.length - 1)) * 84)}%`,
                transition: 'width 0.6s ease',
              }} />

              {STEP_META.map((s, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: done ? (active ? '#E24B4A' : '#E24B4A') : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: active ? 16 : 12,
                      boxShadow: active ? '0 0 0 4px rgba(226,75,74,0.2)' : 'none',
                      border: active ? '2px solid #E24B4A' : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {done ? (active ? s.icon : <span style={{ fontSize: 13, color: '#fff' }}>✓</span>) : <span style={{ fontSize: 11, color: '#9ca3af' }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: done ? '#E24B4A' : '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── LIVE MAP (shown when out for delivery) ── */}
        {isOutForDelivery && !isCancelled && mapVisible && (
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', animation: 'slideUp 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px 10px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>📍</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>Live Rider Tracking</span>
                {isLive ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef2f2', borderRadius: 20, padding: '2px 8px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'liveDot 1.2s infinite' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626' }}>LIVE</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Waiting for rider...</span>
                )}
              </div>
              <button onClick={() => setMapVisible(false)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#9ca3af', cursor: 'pointer', fontFamily: 'Poppins' }}>Hide Map</button>
            </div>

            {/* Map container */}
            <div ref={mapRef} style={{ height: 220, width: '100%', background: '#e5e7eb' }}>
              {!leafletReady && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 28 }}>🗺️</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Loading map...</div>
                </div>
              )}
            </div>

            {/* Map legend */}
            <div style={{ display: 'flex', gap: 16, padding: '10px 14px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              {[
                { emoji: '🏠', label: 'Your location' },
                { emoji: '🏪', label: 'Restaurant' },
                { emoji: '🛵', label: 'Rider' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>{l.emoji}</span>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show map button if hidden */}
        {isOutForDelivery && !mapVisible && (
          <button
            onClick={() => setMapVisible(true)}
            style={{ width: '100%', background: '#fff', border: '1.5px solid #E24B4A', color: '#E24B4A', padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            📍 Show Live Map
          </button>
        )}

        {/* ── RIDER INFO CARD (when out for delivery) ── */}
        {isOutForDelivery && !isCancelled && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'slideUp 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: '2px solid #fecaca' }}>
                🛵
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{riderName}</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>On the way</span>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Your Delivery Partner</div>
                {riderDistance !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#E24B4A' }}>
                      📍 {riderDistance < 1 ? `${Math.round(riderDistance * 1000)}m away` : `${riderDistance.toFixed(1)}km away`}
                    </span>
                    {eta !== null && (
                      <span style={{ fontSize: 11, color: '#6b7280' }}>· ~{eta} min ETA</span>
                    )}
                  </div>
                )}
              </div>
              {riderPhone ? (
                <a href={`tel:+91${riderPhone}`} style={{ textDecoration: 'none' }}>
                  <button style={{ width: 42, height: 42, borderRadius: '50%', background: '#E24B4A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(226,75,74,0.4)' }}>
                    📞
                  </button>
                </a>
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📞</div>
              )}
            </div>
          </div>
        )}

        {/* ── ETA BANNER (when out for delivery) ── */}
        {isOutForDelivery && eta !== null && !isCancelled && (
          <div style={{ background: 'linear-gradient(135deg,#E24B4A,#ff6b6a)', borderRadius: 14, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, color: '#fff', boxShadow: '0 6px 20px rgba(226,75,74,0.35)', animation: 'slideUp 0.5s ease' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>{eta}</div>
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: -2 }}>min</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.3)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Estimated Arrival</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Your food is on the way 🎉</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 28 }}>🛵</div>
          </div>
        )}

        {/* ── STATUS CARD (non-delivery states) ── */}
        {!isOutForDelivery && !isCancelled && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>
              {STEP_META[currentStep]?.icon || '📋'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{STEP_META[currentStep]?.label}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 5 }}>
              {order?.status === 'pending' && 'Waiting for restaurant to accept your order...'}
              {order?.status === 'accepted' && 'Great! Restaurant accepted your order.'}
              {order?.status === 'preparing' && 'Chef is preparing your delicious meal!'}
              {order?.status === 'ready' && 'Your order is packed and ready for pickup!'}
              {isDelivered && 'Enjoy your meal! 😋'}
            </div>
            {order?.status === 'preparing' && order?.prepTime && (
              <div style={{ marginTop: 12, background: '#fff7ed', borderRadius: 10, padding: '8px 14px', display: 'inline-block', border: '1px solid #fed7aa' }}>
                <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 600 }}>⏱ ~{order.prepTime} min prep time</span>
              </div>
            )}
          </div>
        )}

        {/* ── CANCELLED STATE ── */}
        {isCancelled && (
          <div style={{ background: '#fee2e2', borderRadius: 16, padding: 20, marginBottom: 12, textAlign: 'center', border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>❌</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#dc2626' }}>Order Cancelled</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {order?.cancelledBy === 'vendor' ? 'Cancelled by the restaurant' : order?.cancelledBy === 'user' ? 'You cancelled this order' : 'This order was cancelled'}
            </div>
            {order?.cancellationReason && (
              <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 14px', border: '1px solid #fca5a5', textAlign: 'left' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', marginBottom: 4, letterSpacing: 0.5 }}>REASON</div>
                <div style={{ fontSize: 13, color: '#7f1d1d', fontWeight: 500, lineHeight: 1.5 }}>{order.cancellationReason}</div>
              </div>
            )}
          </div>
        )}

        {/* ── ORDER DETAILS ── */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Details</div>
          {order?.items?.map((item, i) => (
            <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{item.qty}x {item.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>₹{item.price * item.qty}</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Delivery fee</span>
            <span style={{ fontSize: 12 }}>{order?.deliveryFee === 0 ? 'Free 🎉' : `₹${order?.deliveryFee}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#E24B4A' }}>₹{order?.total}</span>
          </div>
        </div>

        {/* ── DELIVERY ADDRESS ── */}
        {order?.address && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>📍</div>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3, fontWeight: 500 }}>DELIVERY ADDRESS</div>
              <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.5 }}>{order.address}</div>
            </div>
          </div>
        )}

        {/* ── CONTACT RESTAURANT ── */}
        {order?.vendorPhone && !isCancelled && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Need Help?</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={`tel:+91${order.vendorPhone}`} style={{ flex: 1, textDecoration: 'none' }}>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', background: '#E24B4A', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins' }}>
                  <span style={{ fontSize: 16 }}>📞</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Call Restaurant</span>
                </button>
              </a>
              <a
                href={`https://wa.me/91${order.vendorPhone}?text=${encodeURIComponent(`Hi! I have a query about my order #${order.billNo || ''} from FeedoZone`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', background: '#25D366', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Poppins' }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>WhatsApp</span>
                </button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}