// ─────────────────────────────────────────────────────────────────────────────
// CustomerLocationPanel.jsx
// Save as: src/components/CustomerLocationPanel.jsx
//
// ═══ STEP 1 — Import in VendorApp.jsx ════════════════════════════════════════
//
//   import CustomerLocationPanel, { MiniCustomerMap }
//     from '../components/CustomerLocationPanel'
//
// ═══ STEP 2 — Add state in VendorApp ═════════════════════════════════════════
//
//   const [showCustomerMap, setShowCustomerMap]   = useState(false)
//   const [customerMapOrder, setCustomerMapOrder] = useState(null)
//
// ═══ STEP 3 — Add MiniCustomerMap inside the out_for_delivery detail card ════
//
//   In selectedVendorOrder detail view, inside the dark-blue
//   "Live Rider Tracking" card, add BELOW the riderName block and ABOVE the
//   existing "Assign Rider & Start Tracking" button:
//
//   {selectedVendorOrder.status === 'out_for_delivery' && (
//     <MiniCustomerMap
//       order={selectedVendorOrder}
//       onExpand={() => {
//         setCustomerMapOrder(selectedVendorOrder)
//         setShowCustomerMap(true)
//       }}
//     />
//   )}
//
// ═══ STEP 4 — Render fullscreen panel at the bottom of VendorApp return ══════
//   (after the existing RiderLocationPanel block)
//
//   {showCustomerMap && customerMapOrder && (
//     <CustomerLocationPanel
//       order={customerMapOrder}
//       onClose={() => { setShowCustomerMap(false); setCustomerMapOrder(null) }}
//     />
//   )}
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

// ── Load Leaflet from CDN exactly once ──────────────────────────────────────
let leafletLoadPromise = null
function loadLeaflet() {
  if (leafletLoadPromise) return leafletLoadPromise
  leafletLoadPromise = new Promise((resolve) => {
    if (window.L) return resolve(window.L)
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script  = document.createElement('script')
    script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    document.head.appendChild(script)
  })
  return leafletLoadPromise
}

// ── Geocode address text → {lat, lng} via Nominatim (free, no API key) ───────
async function geocodeAddress(address) {
  try {
    const q   = encodeURIComponent(address + ', Maharashtra, India')
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
    )
    const data = await res.json()
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {}
  return null
}

// ── Haversine distance in km ─────────────────────────────────────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371, rad = d => (d * Math.PI) / 180
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtDist(km) {
  return km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`
}

function fmtEta(km) {
  const mins = Math.round((km / 25) * 60)  // avg 25 km/h local delivery
  return mins < 1 ? '< 1 min' : `~${mins} min`
}

// ── Build a custom SVG pin icon for Leaflet ──────────────────────────────────
function pinIcon(L, hexColor, emoji, size = 42) {
  const id  = `sh${hexColor.replace('#', '')}`
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 12}"
         viewBox="0 0 42 54">
      <filter id="${id}">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
      <ellipse cx="21" cy="51" rx="7" ry="3" fill="rgba(0,0,0,0.14)"/>
      <path d="M21 2C11.6 2 4 9.6 4 19c0 13.3 17 31 17 31s17-17.7 17-31C38 9.6 30.4 2 21 2z"
        fill="${hexColor}" filter="url(#${id})"/>
      <circle cx="21" cy="19" r="10" fill="white" opacity="0.93"/>
      <text x="21" y="19" font-size="12" text-anchor="middle"
        dominant-baseline="central">${emoji}</text>
    </svg>`
  return L.divIcon({
    html: svg, className: '',
    iconSize:    [size, size + 12],
    iconAnchor:  [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared hook — resolves customer coords + subscribes to live rider location
// ─────────────────────────────────────────────────────────────────────────────
function useDeliveryCoords(order) {
  const [customerCoords, setCustomerCoords] = useState(null)
  const [riderCoords,    setRiderCoords]    = useState(order?.riderLocation || null)
  const [locSource,      setLocSource]      = useState(null)   // 'gps' | 'geocode'
  const [locError,       setLocError]       = useState(null)

  // Resolve customer location once
  useEffect(() => {
    if (!order) return
    // Priority 1: live GPS saved on order doc (from UserApp)
    if (order.customerLocation?.lat) {
      setCustomerCoords(order.customerLocation)
      setLocSource('gps')
      return
    }
    // Priority 2: geocode delivery address text
    if (order.address) {
      geocodeAddress(order.address).then(coords => {
        if (coords) { setCustomerCoords(coords); setLocSource('geocode') }
        else setLocError('Could not locate this address on the map.')
      })
    } else {
      setLocError('No delivery address found for this order.')
    }
  }, [order?.id]) // eslint-disable-line

  // Live-subscribe to rider GPS on the order Firestore doc
  useEffect(() => {
    if (!order?.id) return
    const unsub = onSnapshot(doc(db, 'orders', order.id), snap => {
      const d = snap.data()
      if (d?.riderLocation?.lat) setRiderCoords(d.riderLocation)
    })
    return () => unsub()
  }, [order?.id])

  return { customerCoords, riderCoords, locSource, locError }
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI MAP  —  embedded inline inside the out_for_delivery order detail card
// ─────────────────────────────────────────────────────────────────────────────
export function MiniCustomerMap({ order, onExpand }) {
  const mapDivRef     = useRef(null)
  const leafletMapRef = useRef(null)
  const custMarkerRef = useRef(null)
  const riderMarkerRef= useRef(null)
  const routeRef      = useRef(null)
  const LRef          = useRef(null)
  const [ready, setReady] = useState(false)

  const { customerCoords, riderCoords, locSource, locError } = useDeliveryCoords(order)

  const km = riderCoords?.lat && customerCoords
    ? distanceKm(riderCoords.lat, riderCoords.lng, customerCoords.lat, customerCoords.lng)
    : null

  // Init map
  useEffect(() => {
    if (!customerCoords || !mapDivRef.current) return
    let cancelled = false

    loadLeaflet().then(L => {
      if (cancelled || leafletMapRef.current) return
      LRef.current = L

      const map = L.map(mapDivRef.current, {
        center: [customerCoords.lat, customerCoords.lng], zoom: 14,
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map)

      custMarkerRef.current = L.marker(
        [customerCoords.lat, customerCoords.lng],
        { icon: pinIcon(L, '#E24B4A', '🏠', 36) }
      ).addTo(map)

      leafletMapRef.current = map
      setReady(true)
    })

    return () => {
      cancelled = true
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null }
    }
  }, [customerCoords])

  // Update rider pin + route line
  useEffect(() => {
    if (!ready || !leafletMapRef.current || !LRef.current || !customerCoords || !riderCoords?.lat) return
    const L = LRef.current, map = leafletMapRef.current

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([riderCoords.lat, riderCoords.lng])
    } else {
      riderMarkerRef.current = L.marker(
        [riderCoords.lat, riderCoords.lng],
        { icon: pinIcon(L, '#1d4ed8', '🛵', 32) }
      ).addTo(map)
    }

    const pts = [
      [riderCoords.lat, riderCoords.lng],
      [customerCoords.lat, customerCoords.lng],
    ]
    if (routeRef.current) {
      routeRef.current.setLatLngs(pts)
    } else {
      routeRef.current = L.polyline(pts, {
        color: '#E24B4A', weight: 2.5, dashArray: '7 5', opacity: 0.8,
      }).addTo(map)
    }

    map.fitBounds(L.latLngBounds(pts), { padding: [28, 28] })
  }, [riderCoords, ready, customerCoords])

  // ── Error fallback ──────────────────────────────────────────────────────
  if (locError) return (
    <div style={{
      background: '#fff5f5', borderRadius: 12, padding: '11px 14px', marginTop: 12,
      display: 'flex', gap: 8, alignItems: 'center',
      borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca',
    }}>
      <span>⚠️</span>
      <div style={{ flex: 1, fontSize: 11, color: '#991b1b', lineHeight: 1.5 }}>{locError}</div>
    </div>
  )

  return (
    <div style={{
      marginTop: 12, borderRadius: 14, overflow: 'hidden',
      borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}>

      {/* ── Stats bar ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0f766e,#134e4a)',
        padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>🗺️</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
            Customer Location
          </span>
          {locSource === 'geocode' && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginLeft: 6 }}>
              from address
            </span>
          )}
          {locSource === 'gps' && (
            <span style={{ fontSize: 9, color: '#4ade80', fontWeight: 700, marginLeft: 6 }}>
              ● LIVE
            </span>
          )}
        </div>
        {km !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{fmtDist(km)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>ETA {fmtEta(km)}</div>
          </div>
        )}
      </div>

      {/* ── Map area (disabled interaction, tap = expand) ── */}
      <div style={{ position: 'relative', height: 160 }}>
        {/* Loading spinner */}
        {!ready && (
          <div style={{
            position: 'absolute', inset: 0, background: '#f3f4f6',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 6, zIndex: 2,
          }}>
            <div style={{
              fontSize: 28, display: 'inline-block',
              animation: 'miniSpin 1.5s linear infinite',
            }}>🗺️</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Loading map…</div>
          </div>
        )}

        <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />

        {/* Tap-to-expand overlay */}
        <div
          onClick={onExpand}
          style={{
            position: 'absolute', inset: 0, zIndex: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            background: 'rgba(15,118,110,0.88)', color: '#fff', borderRadius: 20,
            padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 700, fontFamily: 'Poppins',
            boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: 15 }}>⛶</span> Fullscreen Map
          </div>
        </div>
      </div>

      {/* ── Navigate button ── */}
      {customerCoords && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${customerCoords.lat},${customerCoords.lng}&travelmode=driving`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '11px 0', background: '#1a73e8',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 13,
          }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ fontSize: 16 }}>🧭</span> Navigate with Google Maps
        </a>
      )}

      <style>{`
        @keyframes miniSpin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FULLSCREEN PANEL  —  full-height bottom-sheet map view
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomerLocationPanel({ order, onClose }) {
  const mapDivRef     = useRef(null)
  const leafletMapRef = useRef(null)
  const custMarkerRef = useRef(null)
  const riderMarkerRef= useRef(null)
  const routeRef      = useRef(null)
  const LRef          = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [initDone, setInitDone] = useState(false)

  const { customerCoords, riderCoords, locSource, locError } = useDeliveryCoords(order)

  const isLoading = !customerCoords && !locError

  const km = riderCoords?.lat && customerCoords
    ? distanceKm(riderCoords.lat, riderCoords.lng, customerCoords.lat, customerCoords.lng)
    : null

  // Init fullscreen map
  useEffect(() => {
    if (!customerCoords || !mapDivRef.current || initDone) return
    setInitDone(true)

    loadLeaflet().then(L => {
      if (!mapDivRef.current) return
      LRef.current = L

      const map = L.map(mapDivRef.current, {
        center: [customerCoords.lat, customerCoords.lng], zoom: 15,
        zoomControl: false, attributionControl: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      custMarkerRef.current = L.marker(
        [customerCoords.lat, customerCoords.lng],
        { icon: pinIcon(L, '#E24B4A', '🏠', 44) }
      ).addTo(map)
        .bindPopup(
          `<b style="font-family:Poppins;font-size:13px">🏠 ${order.userName}</b><br/>` +
          `<span style="font-size:11px;color:#6b7280;font-family:Poppins">` +
          `${(order.address || '').slice(0, 60)}…</span>`
        )

      leafletMapRef.current = map
      setMapReady(true)
    })

    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null }
    }
  }, [customerCoords]) // eslint-disable-line

  // Update rider pin + route
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !LRef.current || !customerCoords || !riderCoords?.lat) return
    const L = LRef.current, map = leafletMapRef.current

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([riderCoords.lat, riderCoords.lng])
    } else {
      riderMarkerRef.current = L.marker(
        [riderCoords.lat, riderCoords.lng],
        { icon: pinIcon(L, '#1d4ed8', '🛵', 44) }
      ).addTo(map)
        .bindPopup(
          `<b style="font-family:Poppins;font-size:13px">🛵 ${order.riderName || 'Rider'}</b><br/>` +
          `<span style="font-size:11px;color:#6b7280;font-family:Poppins">Delivering now</span>`
        )
    }

    const pts = [
      [riderCoords.lat, riderCoords.lng],
      [customerCoords.lat, customerCoords.lng],
    ]
    if (routeRef.current) {
      routeRef.current.setLatLngs(pts)
    } else {
      routeRef.current = L.polyline(pts, {
        color: '#E24B4A', weight: 3, dashArray: '9 6', opacity: 0.85,
      }).addTo(map)
    }

    map.fitBounds(L.latLngBounds(pts), { padding: [70, 70] })
  }, [riderCoords, mapReady, customerCoords])

  const fitBoth = useCallback(() => {
    if (!leafletMapRef.current || !LRef.current || !customerCoords) return
    const pts = riderCoords?.lat
      ? [[riderCoords.lat, riderCoords.lng], [customerCoords.lat, customerCoords.lng]]
      : [[customerCoords.lat, customerCoords.lng]]
    leafletMapRef.current.fitBounds(
      LRef.current.latLngBounds(pts), { padding: [70, 70] }
    )
  }, [customerCoords, riderCoords])

  const googleNav = customerCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${customerCoords.lat},${customerCoords.lng}&travelmode=driving`
    : null

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      zIndex: 2100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div style={{
        background: '#fff', borderRadius: '22px 22px 0 0',
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        maxWidth: 430, width: '100%', margin: '0 auto',
        fontFamily: 'Poppins, sans-serif', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg,#0f766e,#134e4a)',
          padding: '16px 18px 20px', flexShrink: 0,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -14, top: -14, fontSize: 72, opacity: 0.07 }}>🗺️</div>

          {/* Drag pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
                DELIVERY MAP
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                🗺️ Customer Location
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
                #{order.id.slice(-6).toUpperCase()} · {order.userName}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: 34, height: 34, borderRadius: '50%', fontSize: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Stats row — shown once coords are ready */}
          {!isLoading && !locError && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>

              {/* Source badge */}
              <div style={{
                background: locSource === 'gps' ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)',
                borderRadius: 10, padding: '6px 10px', flex: 1, textAlign: 'center',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: locSource === 'gps' ? 'rgba(74,222,128,0.4)' : 'rgba(251,191,36,0.4)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: locSource === 'gps' ? '#4ade80' : '#fbbf24' }}>
                  {locSource === 'gps' ? '📡 LIVE GPS' : '📍 ADDRESS'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                  {locSource === 'gps' ? 'Customer GPS' : 'Geocoded'}
                </div>
              </div>

              {km !== null ? (
                <>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: 10,
                    padding: '6px 10px', flex: 1, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>DISTANCE</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 1 }}>{fmtDist(km)}</div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: 10,
                    padding: '6px 10px', flex: 1, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>ETA</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 1 }}>{fmtEta(km)}</div>
                  </div>
                </>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.08)', borderRadius: 10,
                  padding: '6px 10px', flex: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af' }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                    Start rider tracking for distance
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Loading state ── */}
        {isLoading && (
          <div style={{
            height: 280, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#f9fafb',
          }}>
            <div style={{
              fontSize: 38, display: 'inline-block',
              animation: 'fsSpin 1.5s linear infinite',
            }}>🗺️</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
              Finding customer location…
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              {order.customerLocation?.lat ? 'Reading live GPS…' : 'Geocoding delivery address…'}
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {locError && (
          <div style={{
            height: 260, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#fff5f5', padding: 24,
          }}>
            <div style={{ fontSize: 44 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>Could Not Locate</div>
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
              {locError}
            </div>
          </div>
        )}

        {/* ── Map canvas ── */}
        <div
          ref={mapDivRef}
          style={{
            flex: 1, minHeight: 300,
            display: isLoading || locError ? 'none' : 'block',
            opacity:  mapReady ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        />

        {/* ── Bottom actions ── */}
        {!isLoading && (
          <div style={{
            padding: '12px 16px 30px', flexShrink: 0, background: '#fff',
            borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f3f4f6',
            display: 'flex', flexDirection: 'column', gap: 9,
          }}>

            {/* Address card */}
            <div style={{
              background: '#f9fafb', borderRadius: 10, padding: '10px 12px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
              borderWidth: 1, borderStyle: 'solid', borderColor: '#e5e7eb',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🏠</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5, marginBottom: 2 }}>
                  DELIVERY ADDRESS
                </div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, fontWeight: 500 }}>
                  {order.address || '—'}
                </div>
              </div>
              {mapReady && (
                <button onClick={fitBoth} style={{
                  background: '#eff6ff', border: 'none', borderRadius: 8,
                  padding: '5px 10px', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, color: '#1d4ed8',
                  fontFamily: 'Poppins', flexShrink: 0,
                }}>
                  📐 Fit
                </button>
              )}
            </div>

            {/* Rider live status */}
            {riderCoords?.lat ? (
              <div style={{
                background: '#f0fdf4', borderRadius: 10, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#16a34a',
                  flexShrink: 0, animation: 'liveBlip 1s infinite',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>
                    🛵 {order.riderName || 'Rider'} is on the way
                  </div>
                  {km !== null && (
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>
                      {fmtDist(km)} away · ETA {fmtEta(km)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#fffbeb', borderRadius: 10, padding: '9px 12px',
                display: 'flex', gap: 8, alignItems: 'center',
                borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a',
              }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>
                  Rider hasn't started tracking yet. Open the Rider panel on the rider's phone to stream live GPS.
                </div>
              </div>
            )}

            {/* Google Maps navigate */}
            {googleNav && (
              <a href={googleNav} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '14px 0',
                background: 'linear-gradient(135deg,#1a73e8,#1558c2)',
                color: '#fff', borderRadius: 14, textDecoration: 'none',
                fontFamily: 'Poppins', fontWeight: 800, fontSize: 15,
                boxShadow: '0 5px 18px rgba(26,115,232,0.32)',
              }}>
                <span style={{ fontSize: 20 }}>🧭</span> Navigate with Google Maps
              </a>
            )}

            {/* Call / WhatsApp row */}
            {order.userPhone && (
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:+91${order.userPhone}`} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '11px 0', background: '#f3f4f6',
                  color: '#1f2937', borderRadius: 12, textDecoration: 'none',
                  fontFamily: 'Poppins', fontWeight: 700, fontSize: 12,
                }}>
                  <span>📞</span> Call Customer
                </a>
                <a
                  href={`https://wa.me/91${order.userPhone}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '11px 0', background: '#dcfce7',
                    color: '#15803d', borderRadius: 12, textDecoration: 'none',
                    fontFamily: 'Poppins', fontWeight: 700, fontSize: 12,
                  }}
                >
                  <span>💬</span> WhatsApp
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fsSpin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        @keyframes liveBlip {
          0%,100% { opacity:1; transform:scale(1) }
          50%     { opacity:0.5; transform:scale(1.6) }
        }
        .leaflet-container { font-family: Poppins, sans-serif !important; }
      `}</style>
    </div>
  )
}