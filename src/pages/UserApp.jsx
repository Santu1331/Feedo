import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  logoutUser, getAllVendors, getMenuItems, placeOrder, getUserOrders,
  getUserLocation, getDistance, saveUserLocation,
  listenNotifications, markNotificationRead, callVendor, notifyVendorWhatsApp,
  getCombos, saveExpoPushToken, updateOrderStatus
} from '../firebase/services'
import { db } from '../firebase/config'
import {
  collection, query, where, onSnapshot, addDoc, getDoc, doc, getDocs, serverTimestamp
} from 'firebase/firestore'
import { useNotifications } from '../hooks/useNotifications'
import UserBill from '../components/UserBill'
import LiveOrderTracking from '../components/LiveOrderTracking'
import toast from 'react-hot-toast'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../i18n/LanguageSwitcher'
import OffersSection from '../components/OffersSection'
import FeedozoneLogo from '../components/FeedozoneLogo'

// ─── Delivery charge: vendor fixed OR distance-based ─────────────────────────
function calcDeliveryCharge(distanceKm, vendorBaseCharge, useDistanceBased) {
  if (useDistanceBased) {
    if (distanceKm === null || distanceKm === undefined) return Number(vendorBaseCharge ?? 0)
    const km = parseFloat(distanceKm)
    if (km <= 1) return 10
    if (km <= 2) return 20
    if (km <= 3) return 30
    if (km <= 4) return 40
    return 40
  }
  return Number(vendorBaseCharge ?? 0)
}

const MAX_DELIVERY_KM = 4

// ─── WhatsApp Community ──────────────────────────────────────────────────────
// Public invite link for the FeedoZone community group. Used by the home-tab
// banner and the Profile menu entry. Updating this one constant updates both.
const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/BfM3K3v2HBCDEJ8VKG6jAH'

// ─── Special Offer: Free Delivery — Ashadi Ekadashi ───────────────────────────
// One-day, festival-based free-delivery promotion. FREE_DELIVERY_OFFER_DATE
// is compared against the device's local date (YYYY-MM-DD) — so the offer
// switches itself on and off automatically, no manual toggling needed.
// To reuse this for a different festival/date later, just change the date
// and copy below; nothing else in the file needs to change.
const FREE_DELIVERY_OFFER_DATE = '2026-07-25' // Ashadi Ekadashi
const FREE_DELIVERY_OFFER_COPY = {
  en: { title: 'Free Delivery Today!', sub: '🙏 Ashadi Ekadashi Special · All orders, zero delivery fee', badge: 'ASHADI EKADASHI' },
  mr: { title: 'आज मोफत डिलिव्हरी!', sub: '🙏 आषाढी एकादशी स्पेशल · सर्व ऑर्डरवर डिलिव्हरी चार्ज माफ', badge: 'आषाढी एकादशी' },
}

function getLocalDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isFreeDeliveryOfferActive() {
  return getLocalDateStr() === FREE_DELIVERY_OFFER_DATE
}

const S = {
  shell: {
    maxWidth: 430, margin: '0 auto', background: '#F8F8F8',
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  redHdr: {
    background: '#FFFFFF', color: '#1A1A1A', padding: '0', flexShrink: 0,
    boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
  },
  pageContent: { flex: 1, overflowY: 'auto', paddingBottom: 72 },
  bottomNav: {
    display: 'flex', background: '#FFFFFF', flexShrink: 0,
    position: 'sticky', bottom: 0, zIndex: 100,
    borderTop: '1px solid #F0F0F0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  bnItem: (active) => ({
    flex: 1, paddingTop: 10, paddingBottom: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    cursor: 'pointer', border: 'none', background: 'transparent',
    fontFamily: "'Poppins', sans-serif",
    transition: 'transform 0.15s ease',
    transform: active ? 'translateY(-1px)' : 'translateY(0)',
  }),
}

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const DS = {
  primary: '#E24B4A',
  primaryLight: '#FFF1F0',
  primaryDark: '#C73232',
  bg: '#F8F8F8',
  card: '#FFFFFF',
  border: '#F0F0F0',
  borderMed: '#E8E8E8',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  shadow: '0 2px 16px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.10)',
  shadowLg: '0 8px 40px rgba(0,0,0,0.12)',
  radius: 16,
  radiusSm: 10,
  radiusXl: 24,
}

// ── FOOD CATEGORY IMAGES (Zomato-style real food photos) ──────────────────────
// Using high-quality royalty-free food images from Unsplash CDN (free, no auth needed)
const CATEGORIES = [
  {
    id: 'All',
    label: 'All',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&h=120&fit=crop&auto=format',
    color: '#E24B4A',
  },
  {
    id: 'Thali',
    label: 'Thali',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&h=120&fit=crop&auto=format',
    color: '#F59E0B',
  },
  {
    id: 'Biryani',
    label: 'Biryani',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&h=120&fit=crop&auto=format',
    color: '#D97706',
  },
  {
    id: 'Pizza',
    label: 'Pizza',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop&auto=format',
    color: '#DC2626',
  },
  {
    id: 'Chinese',
    label: 'Chinese',
    img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=120&h=120&fit=crop&auto=format',
    color: '#EA580C',
  },
  {
    id: 'Snacks',
    label: 'Snacks',
    img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=120&h=120&fit=crop&auto=format',
    color: '#16A34A',
  },
  {
    id: 'Juice',
    label: 'Juice',
    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=120&h=120&fit=crop&auto=format',
    color: '#0891B2',
  },
  {
    id: 'Sweets',
    label: 'Sweets',
    img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=120&h=120&fit=crop&auto=format',
    color: '#7C3AED',
  },
  {
    id: 'Roti',
    label: 'Roti',
    img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=120&h=120&fit=crop&auto=format',
    color: '#B45309',
  },
  {
    id: 'Rice',
    label: 'Rice',
    img: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=120&h=120&fit=crop&auto=format',
    color: '#059669',
  },
]

// Master category name list used across Founder + Vendor + User
const CATEGORY_NAMES = CATEGORIES.filter(c => c.id !== 'All').map(c => c.id)

const PRICE_CHIPS = [
  { id:'all',    label:'All',       min:0,   max:Infinity },
  { id:'u50',    label:'Under ₹50', min:0,   max:50 },
  { id:'50_150', label:'₹50–₹150',  min:50,  max:150 },
  { id:'150_300',label:'₹150–₹300', min:150, max:300 },
  { id:'300p',   label:'₹300+',     min:300, max:Infinity },
]
const SORT_OPTIONS = [
  { id:'default',  label:'Relevant',         icon:'✨' },
  { id:'low_high', label:'Price: Low–High',  icon:'⬆️' },
  { id:'high_low', label:'Price: High–Low',  icon:'⬇️' },
]

const VegDot = ({ isVeg }) => (
  <div style={{
    width:14, height:14, borderRadius:3, flexShrink:0, display:'inline-flex',
    alignItems:'center', justifyContent:'center',
    borderWidth:1.5, borderStyle:'solid',
    borderColor: isVeg===false ? '#dc2626' : '#16a34a',
  }}>
    <div style={{ width:7, height:7, borderRadius:'50%', background: isVeg===false ? '#dc2626' : '#16a34a' }} />
  </div>
)

function getCancelSecondsLeft(order) {
  if (!order?.createdAt) return 0
  const placedMs = order.createdAt?.toDate
    ? order.createdAt.toDate().getTime()
    : order.createdAt?.seconds
      ? order.createdAt.seconds * 1000
      : null
  if (!placedMs) return 0
  const elapsed = (Date.now() - placedMs) / 1000
  return Math.max(0, 300 - elapsed)
}

function useCancelCountdown(order) {
  const [secondsLeft, setSecondsLeft] = useState(() => getCancelSecondsLeft(order))
  useEffect(() => {
    if (!order) return
    const tick = () => setSecondsLeft(getCancelSecondsLeft(order))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [order])
  return secondsLeft
}

// ─── Free Delivery Offer Banner (Ashadi Ekadashi) ─────────────────────────────
// Festive gold/saffron banner shown on the home tab only while the offer is
// active. Dismissible for the day (localStorage key includes the offer date,
// so it reappears automatically next time a new offer date is set).
function FreeDeliveryOfferBanner({ lang }) {
  const copy = FREE_DELIVERY_OFFER_COPY[lang] || FREE_DELIVERY_OFFER_COPY.en
  const dismissKey = 'feedo_offer_dismissed_' + FREE_DELIVERY_OFFER_DATE
  const [dismissed, setDismissed] = useState(
    () => { try { return !!localStorage.getItem(dismissKey) } catch { return false } }
  )
  if (dismissed) return null

  const handleDismiss = (e) => {
    e.stopPropagation()
    try { localStorage.setItem(dismissKey, '1') } catch {}
    setDismissed(true)
  }

  return (
    <>
      <style>{`
        @keyframes offerShimmer {
          0%   { background-position: -180% center; }
          100% { background-position:  180% center; }
        }
        @keyframes offerFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-3px) rotate(-4deg); }
        }
        .feedo-offer-card {
          margin: 12px 16px 4px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #FF9933 0%, #E24B4A 55%, #C2410C 100%);
          box-shadow: 0 10px 28px rgba(226,75,74,0.35), 0 2px 6px rgba(0,0,0,0.08);
          font-family: Poppins, sans-serif;
          isolation: isolate;
        }
        .feedo-offer-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: offerShimmer 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .feedo-offer-icon { animation: offerFloat 2.6s ease-in-out infinite; }
      `}</style>
      <div className="feedo-offer-card">
        <div style={{ position:'absolute', top:-24, right:-18, width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,0.10)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, left:-14, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            position:'absolute', top:8, right:8, zIndex:3,
            background:'rgba(0,0,0,0.22)', border:'none', borderRadius:'50%',
            width:24, height:24, color:'#fff', cursor:'pointer',
            fontSize:11, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Poppins',
          }}
        >✕</button>

        <div style={{ position:'relative', zIndex:2, padding:'16px 16px 14px', display:'flex', alignItems:'center', gap:14 }}>
          <div className="feedo-offer-icon" style={{
            width:54, height:54, borderRadius:14, flexShrink:0,
            background:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(0,0,0,0.18)',
            fontSize:28,
          }}>🚩</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
              <span style={{
                fontSize:9, fontWeight:800, color:'#fff', letterSpacing:0.6,
                background:'rgba(255,255,255,0.2)', padding:'2px 7px', borderRadius:20,
                borderWidth:1, borderStyle:'solid', borderColor:'rgba(255,255,255,0.3)',
              }}>{copy.badge}</span>
            </div>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:3 }}>
              {copy.title}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.95)', lineHeight:1.45 }}>
              {copy.sub}
            </div>
          </div>

          <div style={{
            flexShrink:0, background:'#fff', color:'#C2410C',
            padding:'8px 12px', borderRadius:24,
            display:'flex', flexDirection:'column', alignItems:'center',
            boxShadow:'0 4px 12px rgba(0,0,0,0.18)',
            fontFamily:'Poppins',
          }}>
            <span style={{ fontSize:13, fontWeight:900, lineHeight:1 }}>₹0</span>
            <span style={{ fontSize:8, fontWeight:700, opacity:0.8, marginTop:1 }}>DELIVERY</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── WhatsApp Community Banner ──────────────────────────────────────────────
// Eye-catching promo card on the home tab that nudges users to join the
// FeedoZone WhatsApp community for offers, free-delivery coupons, and
// new-vendor announcements. Dismissible (saved in localStorage so it stays
// hidden after one tap on ✕).
function WhatsAppCommunityBanner() {
  const [dismissed, setDismissed] = useState(
    () => { try { return !!localStorage.getItem('feedo_wa_banner_dismissed') } catch { return false } }
  )

  if (dismissed) return null

  const handleJoin = () => {
    try { window.open(WHATSAPP_COMMUNITY_URL, '_blank', 'noopener,noreferrer') } catch {}
  }
  const handleDismiss = (e) => {
    e.stopPropagation()
    try { localStorage.setItem('feedo_wa_banner_dismissed', '1') } catch {}
    setDismissed(true)
  }

  return (
    <>
      <style>{`
        @keyframes waPulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
        }
        @keyframes waShine {
          0%   { background-position: -180% center; }
          100% { background-position:  180% center; }
        }
        @keyframes waBounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .feedo-wa-card {
          margin: 12px 16px 4px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #075E54 0%, #128C7E 45%, #25D366 100%);
          box-shadow: 0 10px 28px rgba(18,140,126,0.32), 0 2px 6px rgba(0,0,0,0.08);
          cursor: pointer;
          font-family: Poppins, sans-serif;
          isolation: isolate;
        }
        .feedo-wa-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: waShine 3.2s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .feedo-wa-icon {
          animation: waBounce 2.4s ease-in-out infinite, waPulseRing 2.4s ease-in-out infinite;
        }
      `}</style>
      <div className="feedo-wa-card" onClick={handleJoin} role="button" aria-label="Join FeedoZone WhatsApp community">
        {/* Decorative bubbles */}
        <div style={{ position:'absolute', top:-22, right:-22, width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-36, left:-12, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            position:'absolute', top:8, right:8, zIndex:3,
            background:'rgba(0,0,0,0.25)', border:'none', borderRadius:'50%',
            width:24, height:24, color:'#fff', cursor:'pointer',
            fontSize:11, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Poppins',
          }}
        >✕</button>

        <div style={{ position:'relative', zIndex:2, padding:'16px 16px 14px', display:'flex', alignItems:'center', gap:14 }}>
          {/* WhatsApp logo bubble (pure SVG so no asset dependency) */}
          <div className="feedo-wa-icon" style={{
            width:54, height:54, borderRadius:14, flexShrink:0,
            background:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(0,0,0,0.18)',
          }}>
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
              <path fill="#25D366" d="M16 0C7.18 0 0 7.18 0 16c0 2.82.74 5.46 2.04 7.76L0 32l8.46-2.22A15.92 15.92 0 0 0 16 32c8.82 0 16-7.18 16-16S24.82 0 16 0z"/>
              <path fill="#fff" d="M23.4 19.5c-.4-.2-2.36-1.16-2.72-1.3-.36-.14-.62-.2-.88.2-.26.4-1 1.3-1.22 1.56-.22.26-.45.3-.84.1-.4-.2-1.68-.62-3.2-1.97-1.18-1.05-1.98-2.36-2.21-2.76-.23-.4-.02-.62.18-.82.18-.18.4-.46.6-.7.2-.23.27-.4.4-.66.14-.27.07-.5-.04-.7-.1-.2-.88-2.12-1.2-2.9-.32-.78-.64-.66-.88-.66h-.74c-.26 0-.66.1-1.02.5-.36.4-1.36 1.32-1.36 3.22s1.4 3.74 1.6 4c.2.27 2.74 4.2 6.64 5.88.93.4 1.65.64 2.22.82.93.3 1.78.26 2.45.16.75-.11 2.36-.97 2.7-1.9.33-.93.33-1.73.23-1.9-.1-.18-.36-.27-.76-.47z"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
              <span style={{
                fontSize:9, fontWeight:800, color:'#fff', letterSpacing:0.6,
                background:'rgba(255,255,255,0.18)', padding:'2px 7px', borderRadius:20,
                borderWidth:1, borderStyle:'solid', borderColor:'rgba(255,255,255,0.25)',
              }}>EXCLUSIVE</span>
              <span style={{ fontSize:9, fontWeight:700, color:'#fff', opacity:0.85 }}>· Members only</span>
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:3 }}>
              Join FeedoZone Community
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.92)', lineHeight:1.45 }}>
              🎁 Free-delivery coupons · 🔥 Hot offers · 🍽️ New vendor alerts
            </div>
          </div>

          {/* Join CTA */}
          <div style={{
            flexShrink:0, background:'#fff', color:'#075E54',
            padding:'10px 14px', borderRadius:24,
            display:'flex', alignItems:'center', gap:6,
            boxShadow:'0 4px 12px rgba(0,0,0,0.18)',
            fontSize:12, fontWeight:800, fontFamily:'Poppins',
          }}>
            Join
            <span style={{ fontSize:14 }}>›</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Zomato-style Price Filter Bottom Sheet ───────────────────────────────────
function PriceFilterSheet({ onClose, priceChip, setPriceChip, priceSort, setPriceSort, menuMaxPrice, priceSliderMax, setPriceSliderMax }) {
  const sliderCeiling = Math.ceil((menuMaxPrice || 500) / 50) * 50
  const activeCount = (priceChip !== 'all' ? 1 : 0) + (priceSort !== 'default' ? 1 : 0) + (priceSliderMax < sliderCeiling ? 1 : 0)

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:2100, display:'flex', flexDirection:'column', justifyContent:'flex-end', fontFamily:'Poppins,sans-serif' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes slideUpSheet { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .price-sheet { animation: slideUpSheet 0.28s cubic-bezier(0.34,1.2,0.64,1) forwards; }
      `}</style>
      <div className="price-sheet" style={{ background:'#fff', borderRadius:'22px 22px 0 0', maxWidth:430, width:'100%', margin:'0 auto', overflow:'hidden', maxHeight:'82vh' }}>

        <div style={{ display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:4 }}>
          <div style={{ width:38, height:4, borderRadius:2, background:'#e5e7eb' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 20px 14px' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>Filter & Sort</div>
            {activeCount > 0 && <div style={{ fontSize:11, color:'#E24B4A', fontWeight:600, marginTop:2 }}>{activeCount} filter{activeCount > 1 ? 's' : ''} active</div>}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {activeCount > 0 && (
              <button
                onClick={() => { setPriceChip('all'); setPriceSort('default'); setPriceSliderMax(sliderCeiling) }}
                style={{ background:'#fff0f0', color:'#E24B4A', border:'none', borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}
              >Clear all</button>
            )}
            <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:32, height:32, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
        </div>

        <div style={{ height:1, background:'#f3f4f6' }} />
        <div style={{ overflowY:'auto', padding:'20px 20px 32px', display:'flex', flexDirection:'column', gap:24 }}>

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:12, textTransform:'uppercase', letterSpacing:0.5 }}>Sort By</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {SORT_OPTIONS.map(opt => {
                const active = priceSort === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPriceSort(opt.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
                      borderRadius:13, borderWidth:1.5, borderStyle:'solid',
                      borderColor: active ? '#E24B4A' : '#f0f0f0',
                      background: active ? '#fff5f5' : '#fafafa',
                      cursor:'pointer', fontFamily:'Poppins', textAlign:'left', transition:'all 0.15s'
                    }}
                  >
                    <div style={{
                      width:20, height:20, borderRadius:'50%', borderWidth:2, borderStyle:'solid',
                      borderColor: active ? '#E24B4A' : '#d1d5db',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                    }}>
                      {active && <div style={{ width:9, height:9, borderRadius:'50%', background:'#E24B4A' }} />}
                    </div>
                    <span style={{ fontSize:14, fontWeight:active ? 700 : 500, color: active ? '#E24B4A' : '#374151' }}>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:12, textTransform:'uppercase', letterSpacing:0.5 }}>Price Range</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {PRICE_CHIPS.map(chip => {
                const active = priceChip === chip.id
                return (
                  <button
                    key={chip.id}
                    onClick={() => setPriceChip(chip.id)}
                    style={{
                      padding:'9px 16px', borderRadius:25, borderWidth:1.5, borderStyle:'solid',
                      borderColor: active ? '#E24B4A' : '#e5e7eb',
                      background: active ? '#E24B4A' : '#fff',
                      color: active ? '#fff' : '#374151',
                      fontSize:13, fontWeight:active ? 700 : 500, cursor:'pointer', fontFamily:'Poppins',
                      transition:'all 0.15s',
                      boxShadow: active ? '0 3px 10px rgba(226,75,74,0.3)' : 'none'
                    }}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:0.5 }}>Max Price</div>
              <div style={{ background: priceSliderMax < sliderCeiling ? '#fff0f0' : '#f3f4f6', borderRadius:20, padding:'4px 12px' }}>
                <span style={{ fontSize:13, fontWeight:800, color: priceSliderMax < sliderCeiling ? '#E24B4A' : '#6b7280' }}>
                  {priceSliderMax >= sliderCeiling ? 'Any price' : `Up to ₹${priceSliderMax}`}
                </span>
              </div>
            </div>
            <div style={{ position:'relative', padding:'6px 0' }}>
              <input
                type="range"
                min={0}
                max={sliderCeiling}
                step={10}
                value={priceSliderMax}
                onChange={e => setPriceSliderMax(Number(e.target.value))}
                style={{ width:'100%', accentColor:'#E24B4A', cursor:'pointer', height:4 }}
              />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ fontSize:10, color:'#9ca3af' }}>₹0</span>
              <span style={{ fontSize:10, color:'#9ca3af' }}>₹{sliderCeiling}+</span>
            </div>
          </div>
        </div>

        <div style={{ padding:'12px 20px 24px', borderTop:'1px solid #f3f4f6' }}>
          <button
            onClick={onClose}
            style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:'14px 0', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 4px 14px rgba(226,75,74,0.35)' }}
          >
            Apply Filters {activeCount > 0 ? `(${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Variant Picker Sheet ─────────────────────────────────────────────────────
function VariantPickerSheet({ item, cart, onAdd, onUpdateQty, onClose }) {
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', flexDirection:'column', justifyContent:'flex-end', fontFamily:'Poppins,sans-serif' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background:'#fff', borderRadius:'22px 22px 0 0', maxWidth:430, width:'100%', margin:'0 auto', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'#e5e7eb' }} />
        </div>
        <div style={{ padding:'12px 20px 14px', display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{ width:64, height:64, borderRadius:12, overflow:'hidden', background:'#f3f4f6', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {item.photo ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:26 }}>🍛</span>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <VegDot isVeg={item.isVeg !== false} />
              <div style={{ fontSize:15, fontWeight:700, color:'#1f2937', lineHeight:1.3 }}>{item.name}</div>
            </div>
            {item.description && <div style={{ fontSize:11, color:'#9ca3af', lineHeight:1.5 }}>{item.description}</div>}
          </div>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:30, height:30, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
        </div>
        <div style={{ height:1, background:'#f3f4f6' }} />
        <div style={{ padding:'14px 20px 8px', display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#7c3aed', background:'#faf5ff', borderRadius:20, padding:'3px 10px', letterSpacing:0.4 }}>⚡ CHOOSE SIZE</span>
          <span style={{ fontSize:11, color:'#9ca3af' }}>Required</span>
        </div>
        <div style={{ padding:'0 20px 20px', display:'flex', flexDirection:'column', gap:10 }}>
          {item.variants.map((variant, idx) => {
            const cartId = `${item.id}_${variant.label}`
            const inCart = cart.find(c => c.id === cartId)
            return (
              <div key={idx} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderRadius:13, borderWidth:1.5, borderStyle:'solid', borderColor: inCart ? '#7c3aed' : '#e5e7eb', background: inCart ? '#faf5ff' : '#fafafa', transition:'all 0.18s' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', borderWidth:2, borderStyle:'solid', borderColor: inCart ? '#7c3aed' : '#d1d5db', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {inCart && <div style={{ width:9, height:9, borderRadius:'50%', background:'#7c3aed' }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:inCart ? 700 : 600, color:inCart ? '#7c3aed' : '#1f2937' }}>{variant.label}</div>
                  {idx > 0 && item.variants[0].price < variant.price && (
                    <div style={{ fontSize:10, color:'#9ca3af' }}>₹{variant.price - item.variants[0].price} more than {item.variants[0].label}</div>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:15, fontWeight:800, color: inCart ? '#7c3aed' : '#E24B4A' }}>₹{variant.price}</div>
                  {inCart ? (
                    <div style={{ display:'flex', alignItems:'center', gap:7, background:'#fff', borderWidth:1.5, borderStyle:'solid', borderColor:'#7c3aed', borderRadius:20, padding:'4px 10px' }}>
                      <button onClick={() => onUpdateQty(cartId, -1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:17, fontWeight:700, padding:0, lineHeight:1 }}>−</button>
                      <span style={{ fontSize:13, fontWeight:800, color:'#7c3aed', minWidth:16, textAlign:'center' }}>{inCart.qty}</span>
                      <button onClick={() => onAdd(item, variant)} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:17, fontWeight:700, padding:0, lineHeight:1 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => onAdd(item, variant)} style={{ background:'#7c3aed', color:'#fff', border:'none', borderRadius:20, padding:'6px 16px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>ADD</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Map Modal ────────────────────────────────────────────────────────────────
function MapModal({ userLat, userLng, vendors, onClose, freeDeliveryToday }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => {
      if (!mapRef.current || mapInstance.current) return
      const L = window.L
      const map = L.map(mapRef.current, { zoomControl:true }).setView([userLat, userLng], 14)
      mapInstance.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap contributors' }).addTo(map)
      const userIcon = L.divIcon({ html:`<div style="width:36px;height:36px;border-radius:50%;background:#E24B4A;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 12px rgba(226,75,74,0.5)">👤</div>`, className:'', iconSize:[36,36], iconAnchor:[18,18] })
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup('<b>📍 You are here</b>').openPopup()
      L.circle([userLat, userLng], { radius: MAX_DELIVERY_KM * 1000, color:'#E24B4A', fillColor:'#fee2e2', fillOpacity:0.08, weight:2, dashArray:'6,6' }).addTo(map)
      vendors.forEach(v => {
        if (!v.location?.lat || !v.location?.lng) return
        const dist = getDistance(userLat, userLng, v.location.lat, v.location.lng)
        if (dist > MAX_DELIVERY_KM) return
        const rawCharge = calcDeliveryCharge(dist, v.deliveryCharge, v.distanceBasedDelivery)
        const charge = freeDeliveryToday ? 0 : rawCharge
        const color = v.isOpen ? '#16a34a' : '#6b7280'
        const vendorIcon = L.divIcon({ html:`<div style="background:${color};border:2.5px solid #fff;border-radius:10px;padding:5px 8px;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.2);font-family:Poppins,sans-serif">${v.isOpen?'🟢':'🔴'} ${v.storeName?.split(' ')[0]||'Vendor'}</div>`, className:'', iconSize:[null,null], iconAnchor:[0,0] })
        L.marker([v.location.lat, v.location.lng], { icon: vendorIcon }).addTo(map).bindPopup(`<div style="font-family:Poppins,sans-serif;min-width:160px"><b style="font-size:13px">${v.storeName}</b><br/><span style="font-size:11px;color:#6b7280">${v.category}</span><br/><span style="font-size:11px;color:${v.isOpen?'#16a34a':'#dc2626'};font-weight:600">${v.isOpen?'● Open':'● Closed'}</span><br/><span style="font-size:11px">📍 ${dist.toFixed(1)} km · 🚚 ${charge===0?(freeDeliveryToday && rawCharge>0 ? '🎉 FREE today':'Free'):'₹'+charge}</span></div>`)
      })
    }
    document.head.appendChild(script)
  }, [userLat, userLng, vendors, freeDeliveryToday])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1500, display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ background:'#fff', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:'#1f2937' }}>🗺️ Nearby Restaurants</div>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Showing within {MAX_DELIVERY_KM}km radius{freeDeliveryToday ? ' · 🎉 Free delivery today' : ''}</div>
        </div>
        <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:34, height:34, fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ flex:1, position:'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
      </div>
      <div style={{ background:'#fff', padding:'12px 16px', display:'flex', gap:16, flexWrap:'wrap', flexShrink:0 }}>
        {[{ color:'#E24B4A', label:'You' },{ color:'#16a34a', label:'Open' },{ color:'#6b7280', label:'Closed' }].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:l.color }} />
            <span style={{ fontSize:11, color:'#374151' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ marginLeft:'auto', fontSize:11, color:'#6b7280' }}>{freeDeliveryToday ? '🎉 Free delivery — Ashadi Ekadashi' : '🚚 Charges vary by vendor'}</div>
      </div>
    </div>
  )
}

// ─── Support Chat Modal ────────────────────────────────────────────────────────
function SupportChatModal({ user, userData, tickets, onClose, onSendMessage }) {
  const [msgText, setMsgText] = useState('')
  const [category, setCategory] = useState('General')
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef(null)

  const chatMessages = []
  tickets.forEach(t => {
    chatMessages.push({ id: t.id + '_user', type: 'user', text: t.message, category: t.category, time: t.createdAt, ticketId: t.id })
    if (t.founderReply) chatMessages.push({ id: t.id + '_reply', type: 'support', text: t.founderReply, time: t.repliedAt || t.createdAt, ticketId: t.id, status: t.status })
  })
  chatMessages.sort((a, b) => (a.time?.seconds || 0) - (b.time?.seconds || 0))

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages.length])

  const handleSend = async () => {
    if (!msgText.trim()) return
    setSending(true)
    await onSendMessage(msgText.trim(), category)
    setMsgText('')
    setSending(false)
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts?.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', flexDirection:'column', justifyContent:'flex-end', fontFamily:'Poppins,sans-serif' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', display:'flex', flexDirection:'column', maxHeight:'88vh', maxWidth:430, width:'100%', margin:'0 auto' }}>
        <div style={{ background:'linear-gradient(135deg,#E24B4A,#c73232)', borderRadius:'20px 20px 0 0', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, borderWidth:2, borderStyle:'solid', borderColor:'rgba(255,255,255,0.4)' }}>🎧</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>FeedoZone Support</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>Online · Typically replies within 24hrs</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 8px', display:'flex', flexDirection:'column', gap:12, minHeight:200 }}>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🎧</div>
            <div style={{ background:'#f3f4f6', borderRadius:'14px 14px 14px 2px', padding:'10px 13px', maxWidth:'75%' }}>
              <div style={{ fontSize:13, color:'#1f2937', lineHeight:1.5 }}>Hi {userData?.name?.split(' ')[0] || 'there'}! 👋 Welcome to FeedoZone support. How can I help you today?</div>
              <div style={{ fontSize:10, color:'#9ca3af', marginTop:4 }}>Support Team</div>
            </div>
          </div>
          {chatMessages.length === 0 && (
            <div style={{ textAlign:'center', padding:'20px 0', color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
              <div style={{ fontSize:13 }}>Send us a message and we'll get back to you!</div>
            </div>
          )}
          {chatMessages.map(msg => (
            <div key={msg.id} style={{ display:'flex', gap:8, alignItems:'flex-end', flexDirection: msg.type === 'user' ? 'row-reverse' : 'row' }}>
              {msg.type === 'support' && <div style={{ width:28, height:28, borderRadius:'50%', background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🎧</div>}
              <div style={{ background: msg.type === 'user' ? '#E24B4A' : '#f3f4f6', borderRadius: msg.type === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', padding:'10px 13px', maxWidth:'75%' }}>
                {msg.category && msg.type === 'user' && <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>{msg.category}</div>}
                <div style={{ fontSize:13, color: msg.type === 'user' ? '#fff' : '#1f2937', lineHeight:1.5 }}>{msg.text}</div>
                <div style={{ fontSize:10, color: msg.type === 'user' ? 'rgba(255,255,255,0.65)' : '#9ca3af', marginTop:4, textAlign: msg.type === 'user' ? 'right' : 'left' }}>{formatTime(msg.time)}{msg.type === 'user' && ' ✓✓'}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding:'8px 16px 0', flexShrink:0 }}>
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6 }}>
            {['General','Order Issue','Payment','App Bug','Feedback','Other'].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ flexShrink:0, padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:10, fontWeight:600, background:category===cat?'#E24B4A':'#f3f4f6', color:category===cat?'#fff':'#6b7280', whiteSpace:'nowrap' }}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{ padding:'8px 16px 16px', display:'flex', gap:8, alignItems:'flex-end', flexShrink:0 }}>
          <textarea value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder="Type your message..." rows={1} style={{ flex:1, padding:'11px 14px', borderWidth:1.5, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:20, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', lineHeight:1.5, maxHeight:100, overflowY:'auto' }} />
          <button onClick={handleSend} disabled={sending || !msgText.trim()} style={{ width:42, height:42, borderRadius:'50%', border:'none', background:(!msgText.trim()||sending)?'#f3f4f6':'#E24B4A', color:(!msgText.trim()||sending)?'#9ca3af':'#fff', cursor:(!msgText.trim()||sending)?'not-allowed':'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>{sending ? '...' : '➤'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Vendor Cancellation Popup (full-screen modal) ────────────────────────────
function VendorCancelPopup({ order, onClose, onViewDetails }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])
  const handleClose = () => { setVisible(false); setTimeout(onClose, 250) }
  const reason = order?.cancellationReason || 'No reason provided'
  const cancelledByLabel = order?.cancelledBy === 'vendor' ? 'the restaurant' : 'this order'

  return (
    <>
      <style>{`
        @keyframes vcpFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes vcpFadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes vcpScaleIn { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes vcpScaleOut { from { transform: scale(1); opacity: 1 } to { transform: scale(0.95); opacity: 0 } }
        @keyframes vcpShake {
          0%, 100% { transform: translateX(0) }
          20% { transform: translateX(-6px) }
          40% { transform: translateX(6px) }
          60% { transform: translateX(-4px) }
          80% { transform: translateX(4px) }
        }
        .vcp-overlay-in  { animation: vcpFadeIn 0.25s ease forwards }
        .vcp-overlay-out { animation: vcpFadeOut 0.22s ease forwards }
        .vcp-card-in     { animation: vcpScaleIn 0.32s cubic-bezier(0.34,1.5,0.64,1) forwards }
        .vcp-card-out    { animation: vcpScaleOut 0.22s ease-in forwards }
        .vcp-icon        { animation: vcpShake 0.6s ease 0.2s 1 }
      `}</style>
      <div
        className={visible ? 'vcp-overlay-in' : 'vcp-overlay-out'}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'Poppins,sans-serif' }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      >
        <div
          className={visible ? 'vcp-card-in' : 'vcp-card-out'}
          style={{ background:'#fff', borderRadius:20, maxWidth:380, width:'100%', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}
        >
          {/* Header strip */}
          <div style={{ background:'linear-gradient(135deg,#dc2626,#991b1b)', padding:'22px 20px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-20, top:-20, fontSize:120, opacity:0.08 }}>🚫</div>
            <div className="vcp-icon" style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 10px', borderWidth:3, borderStyle:'solid', borderColor:'rgba(255,255,255,0.3)' }}>❌</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#fff', letterSpacing:-0.3 }}>Order Cancelled</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:4 }}>Cancelled by {cancelledByLabel}</div>
          </div>

          {/* Body */}
          <div style={{ padding:'18px 20px 4px' }}>
            <div style={{ background:'#f9fafb', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6' }}>
              <div>
                <div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, letterSpacing:0.5 }}>RESTAURANT</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginTop:2 }}>{order?.vendorName || '—'}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10, color:'#9ca3af', fontWeight:700, letterSpacing:0.5 }}>ORDER</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', marginTop:2 }}>#{order?.id?.slice(-6)?.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ background:'#fff5f5', borderLeft:'4px solid #dc2626', borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#dc2626', letterSpacing:0.6, marginBottom:6 }}>📋 REASON</div>
              <div style={{ fontSize:13, color:'#7f1d1d', fontWeight:500, lineHeight:1.55 }}>{reason}</div>
            </div>

            <div style={{ background:'#eff6ff', borderRadius:10, padding:'10px 12px', marginBottom:16, fontSize:11, color:'#1e40af', lineHeight:1.6, display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
              <div>No charges apply. You can reorder from any other restaurant.</div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ padding:'4px 20px 20px', display:'flex', gap:8 }}>
            {onViewDetails && (
              <button
                onClick={() => { onViewDetails(); handleClose() }}
                style={{ flex:1, background:'#f3f4f6', color:'#374151', border:'none', borderRadius:12, padding:'12px 0', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}
              >
                View Order
              </button>
            )}
            <button
              onClick={handleClose}
              style={{ flex:1.4, background:'#E24B4A', color:'#fff', border:'none', borderRadius:12, padding:'12px 0', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 4px 14px rgba(226,75,74,0.35)' }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Floating Support Reply Popup ─────────────────────────────────────────────
function SupportReplyPopup({ reply, onOpen, onDismiss }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    const id = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 350) }, 8000)
    return () => clearTimeout(id)
  }, [])
  const handleOpen = () => { setVisible(false); setTimeout(onOpen, 200); setTimeout(onDismiss, 300) }
  const handleClose = (e) => { e.stopPropagation(); setVisible(false); setTimeout(onDismiss, 350) }
  return (
    <>
      <style>{`@keyframes slideUpPop{from{transform:translateX(-50%) translateY(100px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}@keyframes slideDownPop{from{transform:translateX(-50%) translateY(0);opacity:1}to{transform:translateX(-50%) translateY(100px);opacity:0}}.popup-slide-in{animation:slideUpPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards}.popup-slide-out{animation:slideDownPop 0.3s ease-in forwards}`}</style>
      <div className={visible ? 'popup-slide-in' : 'popup-slide-out'} onClick={handleOpen} style={{ position:'fixed', bottom:80, left:'50%', width:'calc(100% - 32px)', maxWidth:400, background:'#fff', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.18),0 2px 8px rgba(0,0,0,0.1)', padding:'12px 14px', zIndex:3000, cursor:'pointer', borderWidth:1.5, borderStyle:'solid', borderColor:'#fecaca', fontFamily:'Poppins,sans-serif', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#E24B4A,#c73232)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, position:'relative' }}>
          🎧
          <div style={{ position:'absolute', bottom:1, right:1, width:12, height:12, borderRadius:'50%', background:'#4ade80', borderWidth:2, borderStyle:'solid', borderColor:'#fff' }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1f2937' }}>FeedoZone Support</div>
            <div style={{ fontSize:10, color:'#9ca3af' }}>now</div>
          </div>
          <div style={{ fontSize:12, color:'#374151', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'90%' }}>{reply}</div>
          <div style={{ fontSize:10, color:'#E24B4A', fontWeight:600, marginTop:4 }}>Tap to view reply →</div>
        </div>
        <button onClick={handleClose} style={{ background:'#f3f4f6', border:'none', borderRadius:'50%', width:24, height:24, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
      </div>
    </>
  )
}

// ── Multi-cart order panel — separate component so it can use useState legally ──
function MultiCartOrderPanel({ vendorId, carts, removeMultiCart, user, userData, deliveryName, deliveryPhone, deliveryHostel, deliveryAddress, userLat, userLng, DS }) {
  const [mcPlacing, setMcPlacing] = useState(false)
  const vc = carts[vendorId]
  if (!vc) return null
  const mcItems = vc.items
  const mcVendor = vc.vendor
  const mcTotal = mcItems.reduce((s, i) => s + i.price * i.qty, 0)
  const mcDelivery = Number(mcVendor?.deliveryCharge ?? 0)

  const handlePlace = async () => {
    if (!deliveryName?.trim() || !deliveryPhone?.trim()) {
      toast.error('Fill in your name and phone below first')
      return
    }
    setMcPlacing(true)
    try {
      const { placeOrder } = await import('../firebase/services')
      const billNo = 'FZ-' + Date.now().toString(36).slice(-6).toUpperCase()
      const fullAddress = [deliveryHostel?.trim(), deliveryAddress?.trim()].filter(Boolean).join(' · ')
      await placeOrder({
        userUid: user.uid, userName: deliveryName.trim(), userPhone: deliveryPhone.trim(),
        userEmail: user.email, vendorUid: mcVendor.id, vendorName: mcVendor.storeName,
        items: mcItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, isCombo: i.isCombo||false, isVariant: i.isVariant||false })),
        subtotal: mcTotal, deliveryFee: mcDelivery, total: mcTotal + mcDelivery,
        address: fullAddress || '(same as main order)', paymentMode: 'COD', billNo,
        userLat, userLng,
        vendorFcmToken: mcVendor.fcmToken || null,
        vendorExpoPushToken: mcVendor.expoPushToken || null,
      })
      removeMultiCart(vendorId)
      toast.success(`✅ Order placed with ${mcVendor.storeName}!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to place order. Try again.')
    }
    setMcPlacing(false)
  }

  return (
    <>
      <div style={{ background:'#FFFFFF', borderRadius:14, padding:'12px 16px', marginBottom:12, boxShadow:DS.shadow }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:12, color:DS.textSecondary }}>Subtotal</span>
          <span style={{ fontSize:12, fontWeight:600 }}>₹{mcTotal}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:12, color:DS.textSecondary }}>Delivery</span>
          <span style={{ fontSize:12, fontWeight:600 }}>{mcDelivery === 0 ? 'Free 🎉' : '₹' + mcDelivery}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:`1.5px solid ${DS.border}` }}>
          <span style={{ fontSize:14, fontWeight:700 }}>Total</span>
          <span style={{ fontSize:14, fontWeight:800, color:DS.primary }}>₹{mcTotal + mcDelivery}</span>
        </div>
      </div>
      <button
        disabled={mcPlacing}
        onClick={handlePlace}
        style={{ width:'100%', background: mcPlacing ? '#FCA5A5' : `linear-gradient(135deg,${DS.primary},${DS.primaryDark})`, color:'#fff', border:'none', padding:'15px 0', borderRadius:16, fontSize:14, fontWeight:800, cursor: mcPlacing ? 'not-allowed' : 'pointer', fontFamily:'Poppins', boxShadow:`0 4px 18px rgba(226,75,74,0.4)`, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
      >
        {mcPlacing ? '⏳ Placing...' : `🎉 Place Order · ₹${mcTotal + mcDelivery}`}
      </button>
    </>
  )
}

export default function UserApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState(() => localStorage.getItem('feedo_tab') || 'home')
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [vendorCombos, setVendorCombos] = useState([])

  // ── UNIFIED MULTI-VENDOR CART ─────────────────────────────────────────────
  // carts: { [vendorId]: { vendor: {...}, items: [{id,name,price,qty,...}] } }
  // One object replaces the old cart+cartVendor+carts split.
  const [carts, setCarts] = useState({})
  const [activeCartVendorId, setActiveCartVendorId] = useState(null)

  // Derived helpers (keep legacy names where possible to minimise changes)
  const cartVendorIds   = Object.keys(carts)
  const hasAnyCarts     = cartVendorIds.length > 0
  // "active" cart = selected vendor tab; fallback to first vendor
  const activeVid       = activeCartVendorId && carts[activeCartVendorId]
    ? activeCartVendorId
    : cartVendorIds[0] || null
  const activeCart      = activeVid ? carts[activeVid] : null
  const activeItems     = activeCart?.items || []
  const activeVendor    = activeCart?.vendor || null
  // Legacy aliases (used in checkout / offer / render sections below)
  const cart            = activeItems
  const cartVendor      = activeVendor
  const cartTotal       = activeItems.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount       = activeItems.reduce((s, i) => s + i.qty, 0)
  const totalAllCarts   = Object.values(carts).reduce(
    (s, vc) => s + vc.items.reduce((ss, i) => ss + i.qty, 0), 0
  )
  const totalAllAmt     = Object.values(carts).reduce(
    (s, vc) => s + vc.items.reduce((ss, i) => ss + i.price * i.qty, 0), 0
  )
  // ─────────────────────────────────────────────────────────────────────────
  // ── BOUNCE & ROLL ────────────────────────────────────────────────────────
  // When a restaurant cancels an order, it broadcasts to all open vendors.
  // The first vendor to accept wins and the customer is notified.
  const [bounceRollEnabled, setBounceRollEnabled] = useState(() => {
    try { return localStorage.getItem('feedo_bounce_roll') !== 'false' } catch { return true }
  })
  const [bounceRollOffers, setBounceRollOffers] = useState([]) // live incoming BR offers
  const [showBrInfo, setShowBrInfo] = useState(false)         // B&R info modal
  // ──────────────────────────────────────────────────────────────────────────
  // ── OFFER APPLICATION ─────────────────────────────────────────────────
  const [vendorOffers, setVendorOffers] = useState([])       // live offers for cart vendor
  const [appliedOffer, setAppliedOffer] = useState(null)     // currently applied offer
  const [manualCoupon, setManualCoupon] = useState('')       // coupon code input
  const [couponError, setCouponError] = useState('')         // coupon validation message
  // ──────────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([])
  const [catFilter, setCatFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { lang, setLang, t: tt } = useLanguage()
  const [showCheckout, setShowCheckout] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [showVendorInfo, setShowVendorInfo] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [reviewVendor, setReviewVendor] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviews, setReviews] = useState([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [billOrder, setBillOrder] = useState(null)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [menuCatFilter, setMenuCatFilter] = useState('All')

  const [variantPickerItem, setVariantPickerItem] = useState(null)

  const [showPriceSheet, setShowPriceSheet] = useState(false)
  const [priceChip, setPriceChip] = useState('all')
  const [priceSort, setPriceSort] = useState('default')
  const [priceSliderMax, setPriceSliderMax] = useState(999)

  const [showClosedVendors, setShowClosedVendors] = useState(false)

  const [showSupportChat, setShowSupportChat] = useState(false)
  const [myTickets, setMyTickets] = useState([])
  const [supportReplyPopup, setSupportReplyPopup] = useState(null)
  const seenRepliesRef = useRef(new Set())
  const [supportUnreadCount, setSupportUnreadCount] = useState(0)

  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [locationName, setLocationName] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [searchingLocation, setSearchingLocation] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryHostel, setDeliveryHostel] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const [cancellingOrder, setCancellingOrder] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)

  // ── VENDOR-CANCELLED POPUP ─────────────────────────────────────────────
  const [vendorCancelPopup, setVendorCancelPopup] = useState(null)
  const prevOrderStatusRef = useRef({})
  const seenCancelPopupsRef = useRef(new Set())

  // ── FREE DELIVERY OFFER (Ashadi Ekadashi) ───────────────────────────────
  // Pure function of today's date — recomputed each render, which is fine
  // since it's cheap and the offer only ever flips once a day.
  const freeDeliveryToday = isFreeDeliveryOfferActive()

  // Inline bilingual helper kept for backwards compatibility with the
  // many `t('English','मराठी')` calls in this file. For Hindi, falls back to
  // English (or the Marathi text if English is missing). For new strings,
  // prefer `tt('some.key')` from the global dictionary.
  const t = (en, mr, hi) => {
    if (lang === 'mr') return mr ?? en
    if (lang === 'hi') return hi ?? en ?? mr
    return en ?? mr
  }

  useNotifications(user?.uid, 'user')

  useEffect(() => {
    if (!user?.uid) return
    const saveToken = async (token) => {
      if (token && typeof token === 'string' && token.trim() !== '') {
        await saveExpoPushToken(user.uid, token, 'user')
      }
    }
    if (window.expoPushToken) saveToken(window.expoPushToken)
    try { const stored = localStorage.getItem('expoPushToken'); if (stored) saveToken(stored) } catch(e) {}
    const handleToken = (e) => saveToken(e.detail)
    window.addEventListener('expoPushToken', handleToken)
    return () => window.removeEventListener('expoPushToken', handleToken)
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return
    const token = window.expoPushToken || localStorage.getItem('expoPushToken')
    if (token && typeof token === 'string' && token.trim() !== '') saveExpoPushToken(user.uid, token, 'user')
  }, [user?.uid])

  // ─── Detect user's location on first load ──────────────────────────────
  // Zomato-style: use cached coords if we have them, otherwise fire the
  // browser geolocation popup right away. No custom overlay — just the
  // native "Allow Location" dialog the browser shows automatically.
  // If the user denies or the call fails, we silently leave userLat/userLng
  // null and they can pick a location manually from the header pin.
  useEffect(() => {
    // Fast path: cached coords from a previous session.
    try {
      const cached = localStorage.getItem('feedo_location')
      if (cached) {
        const { lat, lng, name } = JSON.parse(cached)
        if (typeof lat === 'number' && typeof lng === 'number') {
          setUserLat(lat); setUserLng(lng); setLocationName(name || null)
          return
        }
      }
    } catch {}

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserLat(lat); setUserLng(lng)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const data = await res.json()
          const addr = data.address || {}
          const name = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || 'Your Location'
          setLocationName(name)
          try { localStorage.setItem('feedo_location', JSON.stringify({ lat, lng, name })) } catch {}
        } catch {
          setLocationName('Your Location')
          try { localStorage.setItem('feedo_location', JSON.stringify({ lat, lng, name: 'Your Location' })) } catch {}
        }
        try { if (user) await saveUserLocation(user.uid, lat, lng) } catch {}
      },
      () => { /* user denied or timed out — silent, user can pick manually */ },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!user) return
    let unsub
    const loadStoredSeen = () => {
      try {
        const stored = localStorage.getItem('feedo_seen_replies_' + user.uid)
        if (stored) JSON.parse(stored).forEach(id => seenRepliesRef.current.add(id))
      } catch {}
    }
    loadStoredSeen()
    const q = query(collection(db, 'supportTickets'), where('userUid', '==', user.uid))
    unsub = onSnapshot(q, snap => {
      const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      tickets.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      setMyTickets(tickets)
      let newUnread = 0
      tickets.forEach(ticket => {
        if (ticket.founderReply) {
          const seenKey = ticket.id + '_reply'
          if (!seenRepliesRef.current.has(seenKey)) {
            setSupportReplyPopup({ text: ticket.founderReply, ticketId: ticket.id })
            try { navigator.vibrate?.([200, 100, 200]) } catch {}
            toast('💬 Support replied!', { icon: '🎧', duration: 3000 })
          }
        }
        if (ticket.founderReply && !seenRepliesRef.current.has(ticket.id + '_reply_read')) newUnread++
      })
      setSupportUnreadCount(newUnread)
    })
    return () => unsub()
  }, [user])

  const handleOpenSupportChat = () => {
    setShowSupportChat(true)
    setSupportReplyPopup(null)
    myTickets.forEach(ticket => {
      if (ticket.founderReply) {
        seenRepliesRef.current.add(ticket.id + '_reply')
        seenRepliesRef.current.add(ticket.id + '_reply_read')
      }
    })
    setSupportUnreadCount(0)
    try { localStorage.setItem('feedo_seen_replies_' + user?.uid, JSON.stringify([...seenRepliesRef.current])) } catch {}
  }

  const handleSendSupportMessage = async (text, category) => {
    try {
      await addDoc(collection(db, 'supportTickets'), {
        userUid: user.uid, userName: userData?.name || 'User', userEmail: user.email,
        userPhone: userData?.mobile || '',
        userCity: locationName || '',
        category, message: text, status: 'open',
        founderReply: '', createdAt: serverTimestamp()
      })
    } catch { toast.error('Failed to send. Try again.') }
  }

  useEffect(() => {
    window.history.pushState({ tab }, '', window.location.href)
    const handlePopState = () => {
      if (tab === 'vendor-menu') { setTab('home'); setSearchQuery('') }
      else if (selectedOrder) { setSelectedOrder(null) }
      else if (tab === 'cart') { setTab('home') }
      else if (showCheckout) { setShowCheckout(false) }
      else if (showVendorInfo) { setShowVendorInfo(false) }
      else if (showLocationPicker) { setShowLocationPicker(false) }
      else if (orderSuccess) { setOrderSuccess(null); setTab('orders') }
      else if (tab !== 'home') { setTab('home') }
      else { window.history.pushState({ tab: 'home' }, '', window.location.href); return }
      window.history.pushState({ tab }, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [tab, showCheckout, showVendorInfo, showLocationPicker, orderSuccess])

  useEffect(() => { if (tab !== 'vendor-menu') localStorage.setItem('feedo_tab', tab) }, [tab])

  // ── FETCH APPROVED OFFERS FOR CART VENDOR ────────────────────────────────────
  useEffect(() => {
    if (!cartVendor?.id) {
      setVendorOffers([]); setAppliedOffer(null); setManualCoupon(''); setCouponError('')
      return
    }
    const q = query(
      collection(db, 'offers'),
      where('vendorId', '==', cartVendor.id),
      where('status', '==', 'approved')
    )
    const unsub = onSnapshot(q,
      snap => {
        const now = new Date()
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(o => !o.validUntil || new Date(o.validUntil) >= now)
        setVendorOffers(list)
      },
      err => { console.error('VendorOffers error:', err); setVendorOffers([]) }
    )
    return unsub
  }, [cartVendor?.id])
  // ──────────────────────────────────────────────────────────────────────────────
  // ── BOUNCE & ROLL — listen for BR offers sent to this user ──────────────────
  useEffect(() => {
    if (!user?.uid || !bounceRollEnabled) { setBounceRollOffers([]); return }
    const q = query(
      collection(db, 'bounceRollOffers'),
      where('targetUserUid', '==', user.uid),
      where('status', '==', 'open')
    )
    const unsub = onSnapshot(q,
      snap => setBounceRollOffers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => { console.error('BR error:', err); setBounceRollOffers([]) }
    )
    return unsub
  }, [user?.uid, bounceRollEnabled])

  // Save bounce roll preference
  const toggleBounceRoll = () => {
    const newVal = !bounceRollEnabled
    setBounceRollEnabled(newVal)
    try { localStorage.setItem('feedo_bounce_roll', String(newVal)) } catch {}
    toast.success(newVal ? '🔄 Bounce & Roll ON — cancelled orders will find a new restaurant!' : '⏸️ Bounce & Roll OFF')
  }

  // ── UNIFIED CART HELPERS ──────────────────────────────────────────────────
  // All cart operations work on the unified `carts` object.

  const _addItem = (vendorObj, itemObj) => {
    const vid = vendorObj.id
    setCarts(prev => {
      const vc = prev[vid] || { vendor: vendorObj, items: [] }
      const ex = vc.items.find(i => i.id === itemObj.id)
      const items = ex
        ? vc.items.map(i => i.id === itemObj.id ? { ...i, qty: i.qty + 1 } : i)
        : [...vc.items, itemObj]
      return { ...prev, [vid]: { vendor: vendorObj, items } }
    })
    setActiveCartVendorId(vid)
  }

  const addToCart = (item) => {
    if (!selectedVendor?.isOpen) { toast.error('This store is currently closed.'); return }
    const { dist, charge, rawCharge } = getDynamicCharge(selectedVendor)
    const vendorObj = { ...selectedVendor, deliveryCharge: charge, rawDeliveryCharge: rawCharge, distanceKm: dist }
    _addItem(vendorObj, { ...item, qty: 1 })
    toast.success(`${item.name} added!`, { icon: '🛒', duration: 1500 })
  }

  const addVariantToCart = (item, variant) => {
    if (!selectedVendor?.isOpen) { toast.error('This store is currently closed.'); return }
    const { dist, charge, rawCharge } = getDynamicCharge(selectedVendor)
    const vendorObj = { ...selectedVendor, deliveryCharge: charge, rawDeliveryCharge: rawCharge, distanceKm: dist }
    const cartId = `${item.id}_${variant.label}`
    _addItem(vendorObj, { id: cartId, name: `${item.name} (${variant.label})`, price: variant.price, qty: 1, isVeg: item.isVeg, photo: item.photo, isVariant: true, variantLabel: variant.label, baseItemId: item.id })
    toast.success(`${item.name} (${variant.label}) added!`, { icon: '🛒', duration: 1500 })
  }

  const handleAddItemTap = (item) => {
    if (!selectedVendor?.isOpen) { toast.error('This store is currently closed.'); return }
    if (item.hasVariants && item.variants?.length >= 2) setVariantPickerItem(item)
    else addToCart(item)
  }

  const addComboToCart = (combo) => {
    if (!selectedVendor?.isOpen) { toast.error('This store is currently closed.'); return }
    const { dist, charge, rawCharge } = getDynamicCharge(selectedVendor)
    const vendorObj = { ...selectedVendor, deliveryCharge: charge, rawDeliveryCharge: rawCharge, distanceKm: dist }
    const comboCartId = 'combo_' + combo.id
    _addItem(vendorObj, { id: comboCartId, name: '🍱 ' + combo.name, price: combo.comboPrice, qty: 1, isCombo: true, comboItems: combo.items })
    toast.success(`🍱 ${combo.name} added!`, { icon: '🍱', duration: 1500 })
  }

  const updateQty = (itemId, delta) => {
    // Update item in active vendor's cart
    if (!activeVid) return
    setCarts(prev => {
      const vc = prev[activeVid]
      if (!vc) return prev
      const items = vc.items.map(i => i.id === itemId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
      if (items.length === 0) {
        const { [activeVid]: _, ...rest } = prev
        // Switch to next available vendor cart
        const nextVid = Object.keys(rest)[0] || null
        setActiveCartVendorId(nextVid)
        return rest
      }
      return { ...prev, [activeVid]: { ...vc, items } }
    })
  }

  const updateMultiCartQty = (vendorId, itemId, delta) => {
    setCarts(prev => {
      const vc = prev[vendorId]
      if (!vc) return prev
      const items = vc.items.map(i => i.id === itemId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
      if (items.length === 0) {
        const { [vendorId]: _, ...rest } = prev
        if (activeCartVendorId === vendorId) setActiveCartVendorId(Object.keys(rest)[0] || null)
        return rest
      }
      return { ...prev, [vendorId]: { ...vc, items } }
    })
  }

  const removeMultiCart = (vendorId) => {
    setCarts(prev => {
      const { [vendorId]: _, ...rest } = prev
      if (activeCartVendorId === vendorId) setActiveCartVendorId(Object.keys(rest)[0] || null)
      return rest
    })
  }

  // Legacy aliases kept for downstream checkout/offer calculations
  const deliveryFee        = freeDeliveryToday ? 0 : Number(activeVendor?.deliveryCharge ?? 0)
  const deliveryFeeWaived  = freeDeliveryToday && Number(activeVendor?.rawDeliveryCharge ?? 0) > 0
  const minOrder           = Number(activeVendor?.minOrderAmount ?? 0)
  const minOrderShortfall  = minOrder > 0 ? Math.max(0, minOrder - cartTotal) : 0
  const meetsMinOrder      = minOrderShortfall === 0
  const multiCartTotalCount = totalAllCarts  // alias used in cart bar
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => { return getAllVendors(setVendors) }, [])
  useEffect(() => { if (!user) return; return getUserOrders(user.uid, setOrders) }, [user])

  // ── DETECT VENDOR CANCELLATION → SHOW POPUP ────────────────────────────
  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem('feedo_seen_cancel_' + user.uid)
      if (stored) JSON.parse(stored).forEach(id => seenCancelPopupsRef.current.add(id))
    } catch {}
  }, [user])

  useEffect(() => {
    if (!orders?.length || !user) return
    orders.forEach(o => {
      const prevStatus = prevOrderStatusRef.current[o.id]
      const seenKey = o.id + '_cancelled'
      const isVendorCancel = o.status === 'cancelled' && o.cancelledBy === 'vendor'

      // First load: don't pop, just remember status
      if (prevStatus === undefined) {
        prevOrderStatusRef.current[o.id] = o.status
        if (isVendorCancel && !seenCancelPopupsRef.current.has(seenKey)) {
          // Show popup once on first sight (covers app reopen)
          setVendorCancelPopup(o)
          seenCancelPopupsRef.current.add(seenKey)
          try { localStorage.setItem('feedo_seen_cancel_' + user.uid, JSON.stringify([...seenCancelPopupsRef.current])) } catch {}
          try { navigator.vibrate?.([300, 100, 300]) } catch {}
        }
        return
      }

      // Status transitioned to cancelled by vendor while app is open
      if (prevStatus !== 'cancelled' && isVendorCancel && !seenCancelPopupsRef.current.has(seenKey)) {
        setVendorCancelPopup(o)
        seenCancelPopupsRef.current.add(seenKey)
        try { localStorage.setItem('feedo_seen_cancel_' + user.uid, JSON.stringify([...seenCancelPopupsRef.current])) } catch {}
        try { navigator.vibrate?.([300, 100, 300]) } catch {}
        toast.error(`Order from ${o.vendorName} was cancelled`, { duration: 5000 })
      }
      prevOrderStatusRef.current[o.id] = o.status
    })
  }, [orders, user])

  useEffect(() => {
    if (!selectedVendor) return
    setMenuItems([]); setVendorCombos([])
    setPriceChip('all'); setPriceSort('default'); setPriceSliderMax(999)
    const u1 = getMenuItems(selectedVendor.id, setMenuItems)
    const u2 = getCombos(selectedVendor.id, (combos) => {
      setVendorCombos(combos.filter(c => c.available !== false && c.items?.length >= 2))
    })
    return () => { u1(); u2() }
  }, [selectedVendor])

  useEffect(() => {
    if (!user) return
    return listenNotifications(user.uid, (notifs) => {
      setNotifications(notifs)
      notifs.forEach(n => { toast(n.body, { icon: '🔔', duration: 4000 }); markNotificationRead(n.id) })
    })
  }, [user])

  useEffect(() => {
    if (userData) {
      setDeliveryName(userData.name || '')
      setDeliveryPhone(userData.mobile || '')
      setDeliveryAddress(userData.address || '')
    }
  }, [userData])

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const addr = data.address || {}
      return addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Your Location'
    } catch { return 'Your Location' }
  }

  const handleLocationGranted = async (lat, lng) => {
    setUserLat(lat); setUserLng(lng)
    const name = await reverseGeocode(lat, lng)
    setLocationName(name)
    localStorage.setItem('feedo_location', JSON.stringify({ lat, lng, name }))
    if (user) await saveUserLocation(user.uid, lat, lng)
    toast.success(`📍 Location set to ${name}`)
    setShowLocationPicker(false)
  }

  const handleGetLocation = async () => {
    setLocationLoading(true)
    try {
      const { lat, lng } = await getUserLocation()
      await handleLocationGranted(lat, lng)
    }
    catch { toast.error('Could not get location. Enable GPS.') }
    setLocationLoading(false)
  }

  const handleLocationSearch = async (q) => {
    setLocationSearch(q)
    if (q.length < 3) { setLocationSuggestions([]); return }
    setSearchingLocation(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`)
      const data = await res.json()
      setLocationSuggestions(data.map(d => ({ name: d.display_name.split(',').slice(0,3).join(', '), lat: parseFloat(d.lat), lng: parseFloat(d.lon) })))
    } catch { setLocationSuggestions([]) }
    setSearchingLocation(false)
  }

  const handleSelectLocation = async (suggestion) => {
    await handleLocationGranted(suggestion.lat, suggestion.lng)
    setLocationSearch(''); setLocationSuggestions([])
  }

  const openVendor = (v) => {
    if (!v.isOpen) {
      toast.error(`${v.storeName} is currently closed${v.openTime ? `. Opens at ${v.openTime}` : ''}`, { icon: '🔒', duration: 3000 })
      return
    }
    setSelectedVendor(v); setTab('vendor-menu'); setShowVendorInfo(false)
    loadReviews(v.id); setMenuCatFilter('All'); setVendorCombos([])
  }

  const getDynamicCharge = (vendor) => {
    const dist = (userLat && userLng && vendor?.location?.lat && vendor?.location?.lng)
      ? getDistance(userLat, userLng, vendor.location.lat, vendor.location.lng)
      : null
    const rawCharge = calcDeliveryCharge(dist, vendor?.deliveryCharge, vendor?.distanceBasedDelivery)
    const charge = freeDeliveryToday ? 0 : rawCharge
    return { dist, charge, rawCharge }
  }

  // ── OFFER DISCOUNT CALCULATION ────────────────────────────────────────────────
  // Finds the best auto-applicable offer for the current cart total.
  // Rules:
  //   1. Offer must be approved + not expired
  //   2. cartTotal must be >= offer.minOrder  (e.g. 5% off requires min ₹200 → only applies if cartTotal >= 200)
  //   3. If discount type is percentage, cap at offer.maxDiscount if set
  //   4. Among multiple valid offers, pick the one giving the highest discount
  const computeDiscount = (offer, subtotal) => {
    if (!offer) return 0
    if (offer.minOrder > 0 && subtotal < offer.minOrder) return 0
    let disc = 0
    if (offer.discountType === 'percentage') {
      disc = Math.round((subtotal * offer.discountValue) / 100)
      if (offer.maxDiscount > 0) disc = Math.min(disc, offer.maxDiscount)
    } else {
      disc = offer.discountValue || 0
    }
    return Math.max(0, Math.min(disc, subtotal)) // never negative, never > subtotal
  }

  // Auto-pick best offer (no coupon needed) among those without a coupon code
  const autoBestOffer = (() => {
    const now = new Date()
    const eligible = vendorOffers.filter(o =>
      !o.couponCode &&                                       // no coupon needed
      o.status === 'approved' &&
      (!o.validUntil || new Date(o.validUntil) >= now) &&
      (!o.minOrder || cartTotal >= o.minOrder)
    )
    if (eligible.length === 0) return null
    return eligible.reduce((best, o) => {
      return computeDiscount(o, cartTotal) >= computeDiscount(best, cartTotal) ? o : best
    })
  })()

  // The discount comes from: applied coupon offer > auto best offer
  const activeOffer = appliedOffer || autoBestOffer
  const discountAmount = computeDiscount(activeOffer, cartTotal)
  const finalTotal = Math.max(0, cartTotal - discountAmount) + deliveryFee

  // Coupon apply handler
  const handleApplyCoupon = () => {
    const code = manualCoupon.trim().toUpperCase()
    if (!code) { setCouponError('Enter a coupon code'); return }
    const now = new Date()
    const matched = vendorOffers.find(o =>
      o.couponCode?.toUpperCase() === code &&
      o.status === 'approved' &&
      (!o.validUntil || new Date(o.validUntil) >= now)
    )
    if (!matched) { setCouponError('Invalid or expired coupon code'); return }
    if (matched.minOrder > 0 && cartTotal < matched.minOrder) {
      setCouponError(`Add ₹${matched.minOrder - cartTotal} more to use this coupon (min ₹${matched.minOrder})`)
      return
    }
    setAppliedOffer(matched)
    setCouponError('')
    toast.success(`🏷️ Coupon "${code}" applied!`)
  }

  const handleRemoveCoupon = () => {
    setAppliedOffer(null); setManualCoupon(''); setCouponError('')
    toast('Coupon removed', { icon: '✕' })
  }
  // ──────────────────────────────────────────────────────────────────────────────

  const handleCancelOrder = async (order) => {
    if (cancellingOrder) return
    setCancellingOrder(true)
    try {
      await updateOrderStatus(order.id, 'cancelled', {
        userUid: order.userUid, vendorUid: order.vendorUid, vendorName: order.vendorName,
        cancellationReason: 'Cancelled by customer within 5 minutes',
      })
      toast.success('Order cancelled successfully.')
      setShowCancelConfirm(false); setOrderToCancel(null)
      if (selectedOrder?.id === order.id) setSelectedOrder(null)
    } catch { toast.error('Failed to cancel. Please try again.') }
    setCancellingOrder(false)
  }

  const handlePlaceOrder = async () => {
    if (placingOrder) return
    if (!deliveryName.trim()) return toast.error('Enter your name')
    if (!deliveryPhone.trim()) return toast.error('Enter phone number')
    if (!deliveryAddress.trim() && !deliveryHostel.trim()) return toast.error('Enter delivery address')
    if (minOrder > 0 && cartTotal < minOrder) return toast.error(`Minimum order is ₹${minOrder}. Add ₹${minOrderShortfall} more to checkout.`, { duration: 4000, icon: '🛒' })
    
    setPlacingOrder(true)
    try {
      const fullAddress = [deliveryHostel.trim(), deliveryAddress.trim(), deliveryNote.trim() ? `Note: ${deliveryNote.trim()}` : ''].filter(Boolean).join(' · ')
      const billNo = 'FZ-' + Date.now().toString(36).slice(-6).toUpperCase()
      const orderRef = await placeOrder({
        userUid: user.uid, userName: deliveryName.trim(), userPhone: deliveryPhone.trim(),
        userEmail: user.email,
        vendorUid: activeVendor?.id || cartVendor?.id,
        vendorName: activeVendor?.storeName || cartVendor?.storeName || '',
        items: activeItems.map(i => ({ id:i.id, name:i.name, price:i.price, qty:i.qty, isCombo: i.isCombo||false, isVariant: i.isVariant||false })),
        subtotal: cartTotal,
        discountAmount: discountAmount || 0,
        discountedSubtotal: cartTotal - (discountAmount || 0),
        offerId: activeOffer?.id || null,
        offerTitle: activeOffer?.title || null,
        couponCode: activeOffer?.couponCode || null,
        deliveryFee, total: finalTotal,
        address: fullAddress, paymentMode: 'COD', billNo,
        userLat, userLng, distanceKm: activeVendor?.distanceKm || null,
        freeDeliveryOffer: deliveryFeeWaived,
        bounceRollEnabled: bounceRollEnabled,
        vendorFcmToken: activeVendor?.fcmToken || null,
        vendorExpoPushToken: activeVendor?.expoPushToken || null,
      })
      const orderId = orderRef?.id
      setOrderSuccess({
        id: orderId || Math.random().toString(36).slice(-6).toUpperCase(),
        orderId: orderId || Math.random().toString(36).slice(-6).toUpperCase(), billNo,
        vendorName: activeVendor?.storeName || cartVendor?.storeName || '',
        vendorPhone: (activeVendor?.phone || activeVendor?.mobile || activeVendor?.contactPhone || ''),
        vendorPhoto: activeVendor?.photo || '', items: [...activeItems],
        total: finalTotal, subtotal: cartTotal, deliveryFee,
        discountAmount: discountAmount || 0,
        offerTitle: activeOffer?.title || null,
        freeDeliveryOffer: deliveryFeeWaived,
        address: fullAddress, userName: deliveryName.trim(), userPhone: deliveryPhone.trim(),
        prepTime: activeVendor?.prepTime || 20,
      })
      // Remove the just-ordered vendor cart; keep others
      if (activeVid) removeMultiCart(activeVid)
      setShowCheckout(false)
      setDeliveryNote(''); setDeliveryHostel('')
      setAppliedOffer(null); setManualCoupon(''); setCouponError('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to place order. Try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return toast.error('Please write a review!')
    setSubmittingReview(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        vendorId: reviewVendor.id, vendorName: reviewVendor.storeName,
        userId: user.uid, userName: userData?.name || 'Anonymous',
        rating: reviewRating, text: reviewText.trim(), createdAt: serverTimestamp()
      })
      toast.success('Review submitted! ⭐'); setShowReview(false); setReviewText(''); setReviewRating(5)
    } catch { toast.error('Failed to submit review') }
    setSubmittingReview(false)
  }

  const loadReviews = async (vendorId) => {
    try {
      const q = query(collection(db, 'reviews'), where('vendorId', '==', vendorId))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      setReviews(data)
    } catch { setReviews([]) }
  }

  const allFilteredVendors = vendors
    .filter(v => {
      const matchCat = catFilter === 'All' || v.category === catFilter || (catFilter !== 'All' && v.customCategories?.includes(catFilter))
      const q = searchQuery.toLowerCase().trim()
      const matchSearch = !q || v.storeName?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q) || v.address?.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    .map(v => ({
      ...v,
      distance: (userLat && userLng && v.location?.lat && v.location?.lng)
        ? getDistance(userLat, userLng, v.location.lat, v.location.lng)
        : null,
    }))
    .filter(v => {
      // ── LOCATION FILTER (Zomato-style) ────────────────────────────────
      // Each vendor can set their own delivery radius (1-4km or unlimited)
      const vendorRadius = v.deliveryRadiusKm > 0 ? v.deliveryRadiusKm : MAX_DELIVERY_KM

      // Priority 1: both user and vendor have GPS → per-vendor radius
      if (userLat && userLng && v.distance !== null) {
        return v.distance <= vendorRadius
      }

      // Priority 2: user has GPS but vendor has no GPS coords →
      // fall back to town-name matching so out-of-town vendors don't show
      if (userLat && userLng && v.distance === null) {
        const vTown = (v.town || v.locationName || '').toLowerCase().trim()
        if (!vTown) return false
        const uLoc = (locationName || '').toLowerCase().trim()
        if (!uLoc) return false
        return vTown.includes(uLoc) || uLoc.includes(vTown) ||
          vTown.split(/[\s,]+/).some(w => w.length > 3 && uLoc.includes(w)) ||
          uLoc.split(/[\s,]+/).some(w => w.length > 3 && vTown.includes(w))
      }

      // Priority 3: user has no GPS → match by town name only
      if (!userLat || !userLng) {
        const vTown = (v.town || v.locationName || '').toLowerCase().trim()
        const uLoc  = (locationName || '').toLowerCase().trim()
        if (!uLoc) return false
        if (!vTown) return false
        return vTown.includes(uLoc) || uLoc.includes(vTown) ||
          vTown.split(/[\s,]+/).some(w => w.length > 3 && uLoc.includes(w)) ||
          uLoc.split(/[\s,]+/).some(w => w.length > 3 && vTown.includes(w))
      }

      return false
    })

  const openVendors = allFilteredVendors
    .filter(v => v.isOpen)
    .sort((a, b) => {
      const sa = a.sortOrder ?? 9999; const sb = b.sortOrder ?? 9999
      if (sa !== sb) return sa - sb
      return 0
    })

  const closedVendors = allFilteredVendors
    .filter(v => !v.isOpen)
    .sort((a, b) => {
      const sa = a.sortOrder ?? 9999; const sb = b.sortOrder ?? 9999
      if (sa !== sb) return sa - sb
      return 0
    })

  const filteredVendors = showClosedVendors ? [...openVendors, ...closedVendors] : openVendors

  const inp = {
    width:'100%', padding:'11px 13px', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:9, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:6, boxSizing:'border-box', background:'#fff'
  }

  const unreadCount = notifications.length

  const CancelConfirmModal = ({ order, onConfirm, onClose, loading }) => {
    const secs = useCancelCountdown(order)
    const mm = String(Math.floor(secs / 60)).padStart(2,'0')
    const ss = String(Math.floor(secs % 60)).padStart(2,'0')
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
        onClick={e => { if(e.target===e.currentTarget) onClose() }}>
        <div style={{ background:'#fff', borderRadius:20, padding:24, maxWidth:380, width:'100%', fontFamily:'Poppins,sans-serif', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1f2937', marginBottom:6 }}>Cancel this order?</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:16, lineHeight:1.6 }}>Are you sure you want to cancel your order from <strong>{order?.vendorName}</strong>? This action cannot be undone.</div>
          {secs > 0 && (
            <div style={{ background:'#fff7ed', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'inline-block', borderWidth:1, borderStyle:'solid', borderColor:'#fed7aa' }}>
              <span style={{ fontSize:11, color:'#c2410c', fontWeight:600 }}>⏱ Cancel window closes in {mm}:{ss}</span>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, background:'#f3f4f6', color:'#374151', border:'none', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>Keep Order</button>
            <button onClick={() => onConfirm(order)} disabled={loading} style={{ flex:1, background:loading?'#fca5a5':'#dc2626', color:'#fff', border:'none', padding:'12px 0', borderRadius:12, fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:'Poppins' }}>{loading ? 'Cancelling...' : 'Yes, Cancel'}</button>
          </div>
        </div>
      </div>
    )
  }

  const CancelOrderButton = ({ order, style = {} }) => {
    const [secs, setSecs] = useState(() => getCancelSecondsLeft(order))
    useEffect(() => {
      const tick = () => setSecs(getCancelSecondsLeft(order)); tick()
      const id = setInterval(tick, 1000); return () => clearInterval(id)
    }, [order])
    const isCancellable = secs > 0 && !['delivered','cancelled'].includes(order.status)
    if (!isCancellable) return null
    const mm = String(Math.floor(secs / 60)).padStart(2,'0')
    const ss = String(Math.floor(secs % 60)).padStart(2,'0')
    return (
      <button onClick={e => { e.stopPropagation(); setOrderToCancel(order); setShowCancelConfirm(true) }}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:'#fee2e2', borderRadius:8, padding:'6px 0', flex:1, borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', cursor:'pointer', fontFamily:'Poppins', ...style }}>
        <span style={{ fontSize:13 }}>❌</span>
        <span style={{ fontSize:11, fontWeight:600, color:'#dc2626' }}>Cancel ({mm}:{ss})</span>
      </button>
    )
  }

  const ComboCard = ({ combo }) => {
    const inCart = cart.find(c => c.id === 'combo_' + combo.id)
    const vendorClosed = !selectedVendor?.isOpen
    const savings = (combo.originalPrice || 0) - combo.comboPrice
    const savingsPct = combo.originalPrice > 0 ? Math.round(savings / combo.originalPrice * 100) : 0
    return (
      <div style={{ background:'linear-gradient(135deg,#1a1a1a,#2d1f00)', borderRadius:14, marginBottom:12, overflow:'hidden', boxShadow:'0 4px 14px rgba(0,0,0,0.15)', opacity:vendorClosed?0.6:1 }}>
        <div style={{ padding:'12px 14px 10px', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            <div style={{ width:12, height:12, borderRadius:2, flexShrink:0, borderWidth:1.5, borderStyle:'solid', borderColor:combo.isVeg===false?'#dc2626':'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:combo.isVeg===false?'#dc2626':'#16a34a' }} />
            </div>
            {combo.tag && <span style={{ fontSize:9, fontWeight:800, background:'#fbbf24', color:'#78350f', borderRadius:10, padding:'2px 8px', letterSpacing:0.3 }}>{combo.tag}</span>}
            {savingsPct > 0 && <span style={{ fontSize:9, fontWeight:800, background:'#16a34a', color:'#fff', borderRadius:10, padding:'2px 8px' }}>{savingsPct}% OFF</span>}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:4 }}>{combo.name}</div>
              {combo.description && <div style={{ fontSize:11, color:'#9ca3af', lineHeight:1.5 }}>{combo.description}</div>}
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:900, color:'#fbbf24' }}>₹{combo.comboPrice}</div>
              {combo.originalPrice > combo.comboPrice && <>
                <div style={{ fontSize:10, color:'#6b7280', textDecoration:'line-through' }}>₹{combo.originalPrice}</div>
                <div style={{ fontSize:10, color:'#4ade80', fontWeight:700 }}>Save ₹{savings}</div>
              </>}
            </div>
          </div>
        </div>
        <div style={{ padding:'0 14px 12px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
            {combo.items?.map((item, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:6, padding:'4px 9px', fontSize:11, color:'rgba(255,255,255,0.85)', fontWeight:500 }}>
                {item.qty > 1 && <span style={{ color:'#fbbf24', fontWeight:800, marginRight:2 }}>{item.qty}×</span>}{item.name}
              </div>
            ))}
          </div>
          {vendorClosed ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 0' }}>
              <span style={{ fontSize:12 }}>🔒</span><span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>Store Closed</span>
            </div>
          ) : inCart ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,187,0,0.15)', borderRadius:10, padding:'8px 14px', borderWidth:1, borderStyle:'solid', borderColor:'rgba(251,191,36,0.3)' }}>
              <span style={{ fontSize:12, color:'#fbbf24', fontWeight:600 }}>🍱 In Cart</span>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={() => updateQty('combo_'+combo.id,-1)} style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,0.15)', color:'#fbbf24', cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <span style={{ fontSize:13, fontWeight:800, color:'#fff', minWidth:16, textAlign:'center' }}>{inCart.qty}</span>
                <button onClick={() => addComboToCart(combo)} style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,0.15)', color:'#fbbf24', cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
            </div>
          ) : (
            <button onClick={() => addComboToCart(combo)} style={{ width:'100%', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#1a1a1a', border:'none', padding:'11px 0', borderRadius:10, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span>🍱</span> Add Combo · ₹{combo.comboPrice}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={S.shell}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }

        /* ── PREMIUM 3D & MICRO-INTERACTION ANIMATIONS ── */
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeInScale { from { opacity:0; transform:scale(0.94) } to { opacity:1; transform:scale(1) } }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* 3D floating food animation */
        @keyframes float3d {
          0%,100% { transform: translateY(0) rotateX(0deg) rotateZ(0deg); }
          33%     { transform: translateY(-7px) rotateX(5deg) rotateZ(-2deg); }
          66%     { transform: translateY(-3px) rotateX(-3deg) rotateZ(1.5deg); }
        }
        /* Hero banner gradient shift */
        @keyframes heroBannerShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Restaurant card hover lift */
        @keyframes cardHoverFloat {
          0%,100% { transform: translateY(0) scale(1); box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
          50%     { transform: translateY(-3px) scale(1.005); box-shadow: 0 12px 32px rgba(226,75,74,0.18); }
        }
        /* Shimmer scan line */
        @keyframes shimmer3d {
          0%   { background-position: -400% center; }
          100% { background-position:  400% center; }
        }
        /* Food particle float */
        @keyframes particleFloat {
          0%   { transform: translateY(0) rotate(0deg) scale(1);   opacity: 0.7; }
          50%  { transform: translateY(-18px) rotate(10deg) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg) scale(1);   opacity: 0.7; }
        }
        /* Logo glow pulse */
        @keyframes logoGlow {
          0%,100% { filter: drop-shadow(0 0 0px rgba(226,75,74,0)) drop-shadow(0 4px 8px rgba(226,75,74,0.3)); }
          50%     { filter: drop-shadow(0 0 10px rgba(226,75,74,0.7)) drop-shadow(0 4px 12px rgba(226,75,74,0.5)); }
        }
        /* 3D category chip press */
        @keyframes chipPress3d {
          0%   { transform: perspective(300px) rotateX(0deg) scale(1); box-shadow: 0 6px 16px rgba(226,75,74,0.35); }
          50%  { transform: perspective(300px) rotateX(8deg) scale(0.94); box-shadow: 0 2px 6px rgba(226,75,74,0.2); }
          100% { transform: perspective(300px) rotateX(0deg) scale(1); box-shadow: 0 6px 16px rgba(226,75,74,0.35); }
        }
        /* Badge pop spring */
        @keyframes badgePop {
          0%   { transform: scale(0.8) rotate(-5deg); opacity:0; }
          60%  { transform: scale(1.15) rotate(3deg); opacity:1; }
          100% { transform: scale(1) rotate(0deg); opacity:1; }
        }
        /* Ripple on click */
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }
        /* Cart bar slide up */
        @keyframes slideInBottom {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        /* Bounce in for qty badge */
        @keyframes bounceIn {
          0%   { transform: scale(0.3);  opacity: 0; }
          50%  { transform: scale(1.12); opacity: 1; }
          70%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        /* Cart qty pulse */
        @keyframes cartPulse {
          0%,100% { transform: scale(1); }
          30%     { transform: scale(1.1); }
          60%     { transform: scale(0.96); }
        }
        /* Order status glow ring */
        @keyframes statusGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.4); }
          50%     { box-shadow: 0 0 0 8px rgba(226,75,74,0); }
        }
        /* Number counter pop */
        @keyframes numberPop {
          0%   { transform: scale(0.5) rotate(-10deg); opacity:0; }
          70%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity:1; }
        }
        /* Gradient background shift */
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* 3D tilt card idle */
        @keyframes tilt3d {
          0%,100% { transform: perspective(600px) rotateX(0deg) rotateY(0deg); }
          25%     { transform: perspective(600px) rotateX(2deg) rotateY(-3deg); }
          75%     { transform: perspective(600px) rotateX(-2deg) rotateY(3deg); }
        }
        /* Stagger list items */
        @keyframes stagger-in {
          from { opacity:0; transform: translateY(28px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        /* 3D hero card depth */
        @keyframes heroCardDepth {
          0%,100% { transform: perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px); }
          33%     { transform: perspective(800px) rotateY(-2deg) rotateX(1deg) translateZ(8px); }
          66%     { transform: perspective(800px) rotateY(1.5deg) rotateX(-1deg) translateZ(4px); }
        }
        /* Food emoji float around home */
        @keyframes foodOrbit {
          0%   { transform: rotate(0deg) translateX(8px) rotate(0deg) scale(1); }
          100% { transform: rotate(360deg) translateX(8px) rotate(-360deg) scale(1); }
        }
        /* Success order celebration */
        @keyframes celebrationPop {
          0%   { transform: scale(0) rotate(-15deg); opacity:0; }
          40%  { transform: scale(1.2) rotate(5deg);  opacity:1; }
          70%  { transform: scale(0.93) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity:1; }
        }
        /* Skeleton loading shimmer */
        @keyframes skeletonShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        /* Floating label */
        @keyframes labelFloat {
          0%,100% { transform: translateY(0) rotate(-1deg); }
          50%     { transform: translateY(-4px) rotate(1deg); }
        }

        /* ── PREMIUM CARD HOVER 3D ── */
        .fz-vendor-card {
          transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.24s ease;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .fz-vendor-card:active {
          transform: perspective(800px) rotateX(2deg) scale(0.97) translateY(2px) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .fz-vendor-card:hover {
          transform: perspective(800px) rotateX(-1deg) rotateY(1deg) translateY(-6px) scale(1.015);
          box-shadow: 0 20px 48px rgba(0,0,0,0.16), 0 6px 16px rgba(226,75,74,0.15) !important;
        }

        /* ── 3D ADD / ICON BUTTON ── */
        .fz-add-btn {
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.18s ease;
          transform-style: preserve-3d;
        }
        .fz-add-btn:active {
          transform: perspective(300px) rotateX(12deg) scale(0.88) translateY(2px);
          box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
        }
        .fz-add-btn:hover {
          transform: perspective(300px) rotateX(-4deg) translateY(-3px) scale(1.08);
          box-shadow: 0 8px 24px rgba(226,75,74,0.5) !important;
        }

        /* ── NAV ITEM 3D ── */
        .fz-nav-item {
          transition: transform 0.16s cubic-bezier(0.34,1.56,0.64,1);
        }
        .fz-nav-item:active { transform: scale(0.85) translateY(2px) !important; }

        /* ── 3D CATEGORY CHIP ── */
        .fz-cat {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.2s ease;
          transform-style: preserve-3d;
        }
        .fz-cat:active {
          animation: chipPress3d 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .fz-cat-active {
          animation: float3d 4s ease-in-out infinite;
        }

        /* ── RIPPLE BUTTON ── */
        .fz-ripple-btn {
          position: relative; overflow: hidden;
          transition: transform 0.15s ease;
        }
        .fz-ripple-btn:active { transform: scale(0.96); }
        .fz-ripple-btn::after {
          content: '';
          position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.4);
          width: 120px; height: 120px;
          top: 50%; left: 50%;
          transform: scale(0); opacity: 0;
          margin: -60px 0 0 -60px;
          pointer-events: none;
        }
        .fz-ripple-btn:active::after {
          animation: ripple 0.55s ease-out forwards;
        }

        /* ── PREMIUM LOGO GLOW ── */
        .fz-logo { animation: logoGlow 3.5s ease-in-out infinite; }

        /* ── STAGGER ITEMS ── */
        .fz-stagger { animation: stagger-in 0.45s cubic-bezier(0.34,1.2,0.64,1) both; }
        .fz-stagger:nth-child(1)  { animation-delay: 0ms;   }
        .fz-stagger:nth-child(2)  { animation-delay: 55ms;  }
        .fz-stagger:nth-child(3)  { animation-delay: 110ms; }
        .fz-stagger:nth-child(4)  { animation-delay: 165ms; }
        .fz-stagger:nth-child(5)  { animation-delay: 220ms; }
        .fz-stagger:nth-child(6)  { animation-delay: 275ms; }
        .fz-stagger:nth-child(7)  { animation-delay: 330ms; }
        .fz-stagger:nth-child(8)  { animation-delay: 385ms; }
        .fz-stagger:nth-child(9)  { animation-delay: 440ms; }
        .fz-stagger:nth-child(10) { animation-delay: 495ms; }

        /* ── 3D CART FLOAT BAR ── */
        .fz-cart-float { animation: float3d 4.5s ease-in-out infinite; transform-style: preserve-3d; }
        .fz-cart-bar   { animation: slideInBottom 0.45s cubic-bezier(0.34,1.56,0.64,1); }
        .fz-cart-bar:active { transform: scale(0.98); }

        /* ── BADGE POP ── */
        .fz-badge-pop { animation: badgePop 0.45s cubic-bezier(0.34,1.56,0.64,1); }

        /* ── SKELETON SHIMMER ── */
        .fz-skeleton {
          background: linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s ease-in-out infinite;
          border-radius: 10px;
        }

        /* ── PREMIUM HEADER SHIMMER ── */
        .fz-header-shimmer::before {
          content: '';
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer3d 4s ease-in-out infinite;
        }

        /* ── HERO 3D CARD (vendor menu) ── */
        .fz-hero-3d {
          animation: heroCardDepth 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        /* ── FOOD PARTICLE ── */
        .fz-particle { animation: particleFloat var(--dur, 3s) ease-in-out infinite; }
        .fz-particle:nth-child(1) { animation-delay: 0s;    --dur: 3.2s; }
        .fz-particle:nth-child(2) { animation-delay: 0.6s;  --dur: 2.8s; }
        .fz-particle:nth-child(3) { animation-delay: 1.2s;  --dur: 3.6s; }
        .fz-particle:nth-child(4) { animation-delay: 1.8s;  --dur: 2.5s; }
        .fz-particle:nth-child(5) { animation-delay: 2.4s;  --dur: 3.9s; }

        /* ── PREMIUM BANNER GRADIENT ── */
        .fz-gradient-banner {
          background-size: 200% 200%;
          animation: heroBannerShift 6s ease infinite;
        }

        /* ── ORDER SUCCESS CELEBRATION ── */
        .fz-celebrate { animation: celebrationPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }

        /* ── SMOOTH SCROLLBAR HIDE ── */
        .fz-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .fz-scroll::-webkit-scrollbar { display: none; }
        /* ── BOUNCE & ROLL TOGGLE ── */
        @keyframes brPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.5); }
          50%      { box-shadow: 0 0 0 8px rgba(226,75,74,0); }
        }
        @keyframes brBounce {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25%     { transform: translateY(-4px) rotate(-8deg); }
          75%     { transform: translateY(-2px) rotate(6deg); }
        }
        .fz-br-on  { animation: brPulse 2s ease-in-out infinite; }
        .fz-br-icon { animation: brBounce 2.5s ease-in-out infinite; }

        /* ── MULTI-CART TAB ── */
        @keyframes cartslide {
          from { opacity:0; transform: translateX(-12px); }
          to   { opacity:1; transform: translateX(0); }
        }
        .fz-multicart-tab { animation: cartslide 0.3s cubic-bezier(0.34,1.2,0.64,1) both; }

        input, textarea, select, button { font-family: 'Poppins', sans-serif; }
      `}</style>

      {variantPickerItem && (
        <VariantPickerSheet item={variantPickerItem} cart={cart} onAdd={(item, variant) => addVariantToCart(item, variant)} onUpdateQty={(cartId, delta) => updateQty(cartId, delta)} onClose={() => setVariantPickerItem(null)} />
      )}

      {supportReplyPopup && (
        <SupportReplyPopup reply={supportReplyPopup.text} onOpen={handleOpenSupportChat} onDismiss={() => {
          const seenKey = supportReplyPopup.ticketId + '_reply'
          seenRepliesRef.current.add(seenKey)
          try { localStorage.setItem('feedo_seen_replies_' + user?.uid, JSON.stringify([...seenRepliesRef.current])) } catch {}
          setSupportReplyPopup(null)
        }} />
      )}

      {vendorCancelPopup && (
        <VendorCancelPopup
          order={vendorCancelPopup}
          onClose={() => setVendorCancelPopup(null)}
          onViewDetails={() => { setTab('orders'); setSelectedOrder(vendorCancelPopup) }}
        />
      )}

      {showSupportChat && (
        <SupportChatModal user={user} userData={userData} tickets={myTickets} onClose={() => setShowSupportChat(false)} onSendMessage={handleSendSupportMessage} />
      )}

      {/* ── BOUNCE & ROLL INFO MODAL ── */}
      {showBrInfo && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:5000, display:'flex', alignItems:'flex-end', justifyContent:'center', fontFamily:'Poppins,sans-serif' }}
          onClick={e => { if (e.target === e.currentTarget) setShowBrInfo(false) }}>
          <div style={{ background:'#fff', borderRadius:'24px 24px 0 0', padding:'8px 20px 36px', width:'100%', maxWidth:430, boxShadow:'0 -8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'center', paddingTop:8, marginBottom:20 }}>
              <div style={{ width:40, height:4, borderRadius:2, background:'#E5E7EB' }} />
            </div>

            {/* Animated icon */}
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ width:72, height:72, borderRadius:22, background:'linear-gradient(135deg,#FFF1F0,#FFE4E4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(226,75,74,0.25)', animation:'float3d 4s ease-in-out infinite' }}>
                🔄
              </div>
              <div style={{ fontSize:19, fontWeight:900, color:'#1A1A1A', letterSpacing:-0.3 }}>Bounce & Roll</div>
              <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>Smart order recovery system</div>
            </div>

            {/* Steps */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {[
                { icon:'🍽️', title:'You place an order', desc:'Order goes to your chosen restaurant normally.' },
                { icon:'❌', title:'Restaurant cancels', desc:'If the restaurant cancels, Bounce & Roll kicks in automatically.' },
                { icon:'📡', title:'We broadcast to all open restaurants', desc:'All nearby open restaurants get your order request simultaneously.' },
                { icon:'🏆', title:'First to accept wins', desc:'The first restaurant to accept your order gets it — you\'re notified instantly.' },
                { icon:'✅', title:'You confirm or skip', desc:'You see who accepted and can confirm. No extra steps needed.' },
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 14px', background:'#F8F8F8', borderRadius:14 }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1A1A1A', marginBottom:2 }}>{step.title}</div>
                    <div style={{ fontSize:11, color:'#6B7280', lineHeight:1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Current status */}
            <div style={{ background: bounceRollEnabled ? '#ECFDF5' : '#F5F5F5', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1.5px solid ${bounceRollEnabled ? '#86EFAC' : '#E5E7EB'}` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color: bounceRollEnabled ? '#065F46' : '#374151' }}>
                  {bounceRollEnabled ? '🟢 Bounce & Roll is ON' : '⏸️ Bounce & Roll is OFF'}
                </div>
                <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>
                  {bounceRollEnabled ? 'Your cancelled orders will auto-find a new restaurant' : 'Cancelled orders will not be rebroadcast'}
                </div>
              </div>
              <button
                onClick={() => { toggleBounceRoll(); setShowBrInfo(false) }}
                style={{ background: bounceRollEnabled ? '#FEE2E2' : 'linear-gradient(135deg,#E24B4A,#FF6B6A)', color: bounceRollEnabled ? '#DC2626' : '#fff', border:'none', borderRadius:12, padding:'8px 14px', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', flexShrink:0, boxShadow: bounceRollEnabled ? 'none' : '0 4px 12px rgba(226,75,74,0.4)' }}
              >
                {bounceRollEnabled ? 'Turn OFF' : 'Turn ON'}
              </button>
            </div>

            <button onClick={() => setShowBrInfo(false)} style={{ width:'100%', background:'#1A1A1A', color:'#fff', border:'none', padding:'15px 0', borderRadius:16, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}>
              Got it ✓
            </button>
          </div>
        </div>
      )}

      {/* ── BOUNCE & ROLL INCOMING OFFERS ── */}
      {bounceRollEnabled && bounceRollOffers.length > 0 && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:4000, display:'flex', alignItems:'flex-end', justifyContent:'center', fontFamily:'Poppins,sans-serif' }}
          onClick={e => { if (e.target === e.currentTarget) setBounceRollOffers([]) }}>
          <div style={{ background:'#fff', borderRadius:'24px 24px 0 0', padding:'8px 20px 32px', width:'100%', maxWidth:430, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 -8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ display:'flex', justifyContent:'center', paddingTop:8, marginBottom:16 }}>
              <div style={{ width:40, height:4, borderRadius:2, background:'#E5E7EB' }} />
            </div>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#1A0A0A,#2D0808)', borderRadius:16, padding:'16px 18px', marginBottom:16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(226,75,74,0.15)', pointerEvents:'none' }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:'rgba(226,75,74,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, animation:'float3d 3s ease-in-out infinite' }}>🔄</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Bounce & Roll — New Offer!</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:1 }}>A restaurant wants to prepare your order</div>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'8px 12px', fontSize:11, color:'rgba(255,255,255,0.8)' }}>
                  ⚡ Your cancelled order has been picked up by a restaurant. Accept to confirm!
                </div>
              </div>
            </div>

            {bounceRollOffers.map(offer => {
              const vendor = vendors.find(v => v.id === offer.targetVendorUid)
              return (
                <div key={offer.id} style={{ background:'#FAFAFA', borderRadius:18, border:`1.5px solid ${DS.border}`, overflow:'hidden', marginBottom:12, boxShadow:DS.shadow }}>
                  {/* Vendor info */}
                  <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:52, height:52, borderRadius:16, overflow:'hidden', background:'#F0F0F0', flexShrink:0 }}>
                      {vendor?.photo
                        ? <img src={vendor.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🍽️</div>
                      }
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:15, fontWeight:800, color:DS.textPrimary }}>{vendor?.storeName || offer.targetVendorName || 'Restaurant'}</div>
                      <div style={{ fontSize:11, color:DS.textSecondary, marginTop:2 }}>{vendor?.category} · ⭐ {vendor?.rating||4.5}</div>
                      <div style={{ display:'flex', gap:6, marginTop:5, flexWrap:'wrap' }}>
                        {offer.items?.slice(0,2).map((item, i) => (
                          <span key={i} style={{ fontSize:10, background:DS.primaryLight, color:DS.primary, borderRadius:8, padding:'2px 8px', fontWeight:600 }}>{item.qty}× {item.name}</span>
                        ))}
                        {(offer.items?.length||0) > 2 && <span style={{ fontSize:10, color:DS.textMuted }}>+{offer.items.length - 2} more</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:16, fontWeight:900, color:DS.primary }}>₹{offer.total}</div>
                      <div style={{ fontSize:9, color:DS.textMuted, marginTop:2 }}>Total</div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display:'flex', gap:0, borderTop:`1px solid ${DS.border}` }}>
                    <button
                      onClick={async () => {
                        try {
                          // Accept the BR offer — place order with this vendor
                          const { updateDoc: ud, doc: dc } = await import('firebase/firestore')
                          // Mark BR offer as accepted
                          await ud(dc(db, 'bounceRollOffers', offer.id), { status: 'accepted', acceptedAt: serverTimestamp() })
                          // Place a new order with this vendor
                          const billNo = 'FZ-BR-' + Date.now().toString(36).slice(-6).toUpperCase()
                          await placeOrder({
                            userUid: user.uid,
                            userName: userData?.name || '',
                            userPhone: userData?.mobile || '',
                            userEmail: user.email,
                            vendorUid: offer.targetVendorUid,
                            vendorName: offer.targetVendorName || vendor?.storeName || '',
                            items: offer.items || [],
                            subtotal: offer.subtotal || 0,
                            deliveryFee: offer.deliveryFee || 0,
                            total: offer.total || 0,
                            address: offer.address || '',
                            paymentMode: 'COD',
                            billNo,
                            userLat: offer.userLat, userLng: offer.userLng,
                            isBounceRoll: true,
                            originalOrderId: offer.originalOrderId,
                          })
                          setBounceRollOffers(p => p.filter(o => o.id !== offer.id))
                          toast.success(`✅ Order confirmed with ${vendor?.storeName || 'restaurant'}!`)
                        } catch (err) {
                          toast.error('Failed to confirm. Try again.')
                          console.error(err)
                        }
                      }}
                      className="fz-ripple-btn"
                      style={{ flex:2, padding:'14px 0', background:`linear-gradient(135deg,${DS.primary},${DS.primaryDark})`, color:'#fff', border:'none', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                    >
                      ✅ Accept & Confirm Order
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'bounceRollOffers', offer.id), { status: 'declined' })
                          setBounceRollOffers(p => p.filter(o => o.id !== offer.id))
                          toast('Offer declined', { icon: '👋' })
                        } catch {}
                      }}
                      style={{ flex:1, padding:'14px 0', background:'#F5F5F5', color:DS.textSecondary, border:'none', borderLeft:`1px solid ${DS.border}`, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PREMIUM HEADER ── */}
      <div style={{ background:'#FFFFFF', flexShrink:0, boxShadow:'0 1px 0 rgba(0,0,0,0.06)' }}>

        {/* Top row — logo + actions */}
        <div style={{ padding:'12px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <FeedozoneLogo size="md" variant="full" dark={true} />
            {/* Live badge */}
            <div style={{ display:'flex', alignItems:'center', gap:3, background:'#ECFDF5', borderRadius:20, padding:'2px 8px' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#10B981', animation:'livePulse 1.8s ease infinite' }} />
              <span style={{ fontSize:8, fontWeight:800, color:'#065F46', letterSpacing:0.5 }}>LIVE</span>
            </div>
          </div>

          {/* Right action icons */}
          <div style={{ display:'flex', gap:7, alignItems:'center' }}>
            {/* Map */}
            <button onClick={() => setShowMap(true)} className="fz-add-btn" style={{ width:38, height:38, background:'#F5F5F5', border:'none', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🗺️</button>
            {/* Bell */}
            <div onClick={() => setShowNotifs(!showNotifs)} style={{ position:'relative', cursor:'pointer', width:38, height:38, background:'#F5F5F5', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:16 }}>🔔</span>
              {unreadCount > 0 && <div className="fz-badge-pop" style={{ position:'absolute', top:5, right:5, background:DS.primary, color:'#fff', borderRadius:'50%', width:14, height:14, fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{unreadCount}</div>}
            </div>
            <LanguageSwitcher variant="pill" />
          </div>
        </div>

        {/* Location + Bounce & Roll row */}
        <div style={{ padding:'10px 16px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          {/* Location pill */}
          <div onClick={() => setShowLocationPicker(true)} style={{ flex:1, cursor:'pointer', display:'flex', alignItems:'center', gap:8, background:'#F8F8F8', borderRadius:14, padding:'8px 12px', border:`1.5px solid ${DS.border}`, minWidth:0, transition:'border-color 0.2s' }}>
            <div style={{ width:22, height:22, background:'linear-gradient(135deg,#E24B4A,#FF6B6A)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 6px rgba(226,75,74,0.4)' }}>
              <span style={{ fontSize:10, color:'#fff' }}>📍</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:9, fontWeight:700, color:DS.textMuted, letterSpacing:0.8, textTransform:'uppercase', lineHeight:1 }}>Delivering to</div>
              <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:1 }}>
                {locationLoading ? 'Detecting...' : locationName || 'Set Location'}
              </div>
            </div>
            <span style={{ fontSize:11, color:DS.primary, fontWeight:800, flexShrink:0 }}>▾</span>
          </div>

          {/* ── BOUNCE & ROLL TOGGLE ── */}
          <div style={{ flexShrink:0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <button
                onClick={toggleBounceRoll}
                className={bounceRollEnabled ? 'fz-br-on' : ''}
                style={{
                  width:52, height:28, borderRadius:14, border:'none',
                  cursor:'pointer', position:'relative', padding:0,
                  background: bounceRollEnabled
                    ? 'linear-gradient(135deg,#E24B4A,#FF6B6A)'
                    : '#E5E7EB',
                  boxShadow: bounceRollEnabled
                    ? '0 4px 12px rgba(226,75,74,0.45)'
                    : '0 1px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                title={bounceRollEnabled
                  ? 'Bounce & Roll ON — if a restaurant cancels, we find you a new one instantly!'
                  : 'Bounce & Roll OFF'}
              >
                <div style={{
                  position:'absolute', top:3,
                  left: bounceRollEnabled ? 26 : 3,
                  width:22, height:22, borderRadius:11,
                  background:'#fff',
                  boxShadow:'0 2px 6px rgba(0,0,0,0.2)',
                  transition:'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11,
                }}>
                  <span className={bounceRollEnabled ? 'fz-br-icon' : ''}>
                    {bounceRollEnabled ? '🔄' : '⏸️'}
                  </span>
                </div>
              </button>
              <div style={{
                fontSize:8, fontWeight:800, letterSpacing:0.3, whiteSpace:'nowrap',
                textTransform:'uppercase', cursor:'pointer',
                color: bounceRollEnabled ? DS.primary : DS.textMuted,
                textDecorationLine:'underline', textDecorationStyle:'dotted',
              }} onClick={() => setShowBrInfo(true)}>
                {bounceRollEnabled ? 'B&R ON' : 'B&R OFF'} ℹ️
              </div>
            </div>
          </div>
        </div>

        {/* ── MULTI-CART INDICATOR (shown when 2+ vendor carts active) ── */}
        {Object.keys(carts).length >= 2 && (
          <div style={{ margin:'0 16px 10px', background:'linear-gradient(135deg,#1A0A0A,#2D0808)', borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'rgba(226,75,74,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, animation:'cartPulse 2s infinite' }}>🛒</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'#fff' }}>{Object.keys(carts).length} active carts</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:1 }}>{Object.values(carts).map(c=>c.vendor.storeName).join(' · ')}</div>
            </div>
            <button onClick={() => setTab('cart')} style={{ background:DS.primary, border:'none', color:'#fff', borderRadius:10, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
              View →
            </button>
          </div>
        )}

        {freeDeliveryToday && (
          <div style={{ margin:'0 16px 10px', background:'linear-gradient(135deg,#FF9933,#E24B4A)', borderRadius:12, padding:'8px 14px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(226,75,74,0.3)' }}>
            <span style={{ fontSize:15, animation:'float3d 3s ease-in-out infinite' }}>🚩</span>
            <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{t('Free delivery today — Ashadi Ekadashi!','आज मोफत डिलिव्हरी — आषाढी एकादशी!')}</span>
          </div>
        )}

        {showLocationPicker && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', flexDirection:'column', justifyContent:'flex-start' }}
            onClick={(e) => { if(e.target===e.currentTarget) setShowLocationPicker(false) }}>
            <div style={{ background:'#fff', borderRadius:'0 0 24px 24px', padding:20, maxWidth:430, width:'100%', margin:'0 auto', maxHeight:'80vh', overflowY:'auto', boxShadow:DS.shadowLg }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontSize:16, fontWeight:700, color:DS.textPrimary }}>📍 Delivery Location</div>
                <button onClick={() => setShowLocationPicker(false)} style={{ background:'#F3F4F6', border:'none', fontSize:16, cursor:'pointer', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:DS.textSecondary }}>✕</button>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', border:`1.5px solid ${DS.borderMed}`, borderRadius:14, marginBottom:14, background:'#FAFAFA' }}>
                <span style={{ fontSize:15, color:DS.textMuted }}>🔍</span>
                <input autoFocus style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', background:'transparent', color:DS.textPrimary }} placeholder="Search area, colony, city..." value={locationSearch} onChange={e => handleLocationSearch(e.target.value)} />
                {searchingLocation && <span style={{ fontSize:12, color:DS.textMuted }}>...</span>}
              </div>
              <button onClick={handleGetLocation} disabled={locationLoading} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:DS.primaryLight, border:`1px solid #FECACA`, borderRadius:14, cursor:'pointer', marginBottom:14, fontFamily:'Poppins' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:DS.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>📍</div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.primary }}>{locationLoading ? 'Detecting...' : 'Use Current Location'}</div>
                  <div style={{ fontSize:11, color:DS.textMuted, marginTop:1 }}>Using GPS</div>
                </div>
              </button>
              {locationSuggestions.length > 0 && (
                <div>
                  <div style={{ fontSize:11, color:DS.textMuted, marginBottom:8, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>Search Results</div>
                  {locationSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSelectLocation(s)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#fff', border:`1px solid ${DS.border}`, borderRadius:12, cursor:'pointer', marginBottom:8, fontFamily:'Poppins', textAlign:'left' }}>
                      <span style={{ fontSize:16, flexShrink:0, color:DS.primary }}>📍</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:DS.textPrimary }}>{s.name.split(',')[0]}</div>
                        <div style={{ fontSize:11, color:DS.textMuted, marginTop:1 }}>{s.name.split(',').slice(1,3).join(',')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!locationSearch && (
                <div>
                  <div style={{ fontSize:11, color:DS.textMuted, marginBottom:8, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>Popular</div>
                  {['Warananagar', 'Kolhapur', 'Sangli', 'Ichalkaranji', 'Miraj'].map(area => (
                    <button key={area} onClick={() => handleLocationSearch(area)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:'#FAFAFA', border:`1px solid ${DS.border}`, borderRadius:12, cursor:'pointer', marginBottom:6, fontFamily:'Poppins' }}>
                      <span style={{ fontSize:14, color:DS.textMuted }}>🏘️</span><span style={{ fontSize:13, color:DS.textPrimary }}>{area}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(tab==='home' || tab==='vendor-menu') && (
          <div style={{ margin:'0 16px 14px', background:'#FAFAFA', borderRadius:16, display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:`1.5px solid ${DS.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'box-shadow 0.2s ease, border-color 0.2s ease' }}
            onFocus={() => {}} onBlur={() => {}}>
            <div style={{ width:26, height:26, borderRadius:9, background:'linear-gradient(135deg,#FFF1F0,#FFE4E4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:13, color:DS.primary }}>🔍</span>
            </div>
            <input style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', color:DS.textPrimary, background:'transparent', fontWeight:500 }} placeholder="Search restaurants or food..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if (tab==='vendor-menu') setTab('home') }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background:'#F0F0F0', border:'none', cursor:'pointer', fontSize:12, color:DS.textSecondary, padding:0, width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>}
          </div>
        )}

        {tab==='vendor-menu' && selectedVendor && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px 12px' }}>
            <button onClick={() => { setTab('home'); setSearchQuery('') }} style={{ background:DS.primaryLight, border:'none', color:DS.primary, padding:'7px 12px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:4 }}>← Back</button>
            <span style={{ fontSize:14, fontWeight:700, color:DS.textPrimary }}>{selectedVendor.storeName}</span>
            <span style={{ fontSize:10, fontWeight:700, background:selectedVendor.isOpen?DS.successLight:DS.border, color:selectedVendor.isOpen?DS.success:DS.textMuted, padding:'3px 9px', borderRadius:20 }}>{selectedVendor.isOpen ? '● Open' : '● Closed'}</span>
          </div>
        )}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={S.pageContent}>

        {/* ── HOME ── */}
        {tab==='home' && (
          <div style={{ background:DS.bg, minHeight:'100%' }}>
            {/* ── PREMIUM 3D HERO GREETING BANNER ── */}
            <div className="fz-gradient-banner" style={{
              background: 'linear-gradient(135deg,#1A0A0A 0%,#2D0808 35%,#1A1A2E 70%,#0D0D1A 100%)',
              padding:'22px 20px 20px', position:'relative', overflow:'hidden',
            }}>
              {/* 3D depth orbs */}
              <div style={{ position:'absolute', top:-50, right:-30, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(226,75,74,0.18) 0%,transparent 70%)', pointerEvents:'none', animation:'float3d 6s ease-in-out infinite' }} />
              <div style={{ position:'absolute', bottom:-60, left:-20, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle,rgba(226,75,74,0.12) 0%,transparent 70%)', pointerEvents:'none', animation:'float3d 8s ease-in-out infinite reverse' }} />
              <div style={{ position:'absolute', top:'30%', right:'15%', width:80, height:80, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,107,106,0.1) 0%,transparent 70%)', pointerEvents:'none', animation:'float3d 5s ease-in-out infinite 1s' }} />

              {/* Shimmer scan line */}
              <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, background:'linear-gradient(120deg,transparent 20%,rgba(255,255,255,0.04) 50%,transparent 80%)', backgroundSize:'200% 100%', animation:'shimmer3d 5s ease-in-out infinite', pointerEvents:'none' }} />

              {/* Floating food particles */}
              <div style={{ position:'absolute', top:0, right:0, bottom:0, left:0, pointerEvents:'none', overflow:'hidden' }}>
                {[
                  { emoji:'🍕', top:'8%',  right:'8%',  size:22, delay:0 },
                  { emoji:'🍜', top:'55%', right:'18%', size:18, delay:0.8 },
                  { emoji:'🥘', top:'15%', right:'38%', size:20, delay:1.5 },
                  { emoji:'🍚', top:'68%', right:'4%',  size:16, delay:2.2 },
                  { emoji:'🍟', top:'35%', right:'28%', size:19, delay:0.4 },
                ].map((p, i) => (
                  <div key={i} className="fz-particle" style={{
                    position:'absolute', top:p.top, right:p.right,
                    fontSize:p.size, opacity:0.35,
                    animationDelay: `${p.delay}s`,
                    filter:'blur(0.3px)',
                  }}>{p.emoji}</div>
                ))}
              </div>

              {/* Content */}
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:700, letterSpacing:1.2, marginBottom:5, textTransform:'uppercase' }}>
                  {new Date().getHours() < 12 ? '🌅 Good morning' : new Date().getHours() < 17 ? '☀️ Good afternoon' : '🌙 Good evening'}
                  {userData?.name ? `, ${userData.name.split(' ')[0]}` : ''}
                </div>
                <div style={{ fontSize:23, fontWeight:900, color:'#FFFFFF', letterSpacing:-0.5, lineHeight:1.2, marginBottom:12 }}>
                  What are you{' '}
                  <span style={{ background:'linear-gradient(135deg,#FF6B6A,#E24B4A,#FF9933)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', backgroundSize:'200% 200%', animation:'heroBannerShift 3s ease infinite' }}>craving</span>
                  {' '}today?
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.09)', borderRadius:20, padding:'5px 12px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#10B981', animation:'livePulse 1.5s infinite', boxShadow:'0 0 6px rgba(16,185,129,0.6)' }} />
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.85)', fontWeight:700 }}>{openVendors.length} restaurants open</span>
                  </div>
                  <button onClick={() => setShowMap(true)} className="fz-add-btn" style={{ display:'flex', alignItems:'center', gap:5, background:'linear-gradient(135deg,rgba(226,75,74,0.4),rgba(199,50,50,0.3))', borderRadius:20, padding:'5px 12px', border:'1px solid rgba(226,75,74,0.3)', cursor:'pointer', backdropFilter:'blur(8px)' }}>
                    <span style={{ fontSize:11 }}>🗺️</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.9)', fontWeight:700 }}>Map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── DELIVERY STRIP ── */}
            <div style={{ background:'#FFFFFF', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${DS.border}` }}>
              <div style={{ width:34, height:34, borderRadius:11,
                background: freeDeliveryToday
                  ? 'linear-gradient(135deg,#FF9933,#E24B4A)'
                  : 'linear-gradient(135deg,#FFF1F0,#FFE4E4)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                boxShadow: freeDeliveryToday
                  ? '0 4px 14px rgba(226,75,74,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 2px 8px rgba(226,75,74,0.12)',
                animation: freeDeliveryToday ? 'float3d 4s ease-in-out infinite' : 'none',
              }}>
                <span style={{ fontSize:16 }}>🚚</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color: freeDeliveryToday ? DS.primary : DS.textPrimary }}>
                  {freeDeliveryToday ? '🎉 Free delivery today — Ashadi Ekadashi!' : 'Fast delivery within 4km'}
                </div>
                <div style={{ fontSize:10, color:DS.textMuted }}>
                  {freeDeliveryToday ? `On every order · Max ${MAX_DELIVERY_KM}km` : `Fixed or distance-based · Max ${MAX_DELIVERY_KM}km`}
                </div>
              </div>
              {freeDeliveryToday && (
                <div style={{ background:'linear-gradient(135deg,#FF9933,#E24B4A)', borderRadius:20, padding:'4px 10px', boxShadow:'0 4px 12px rgba(226,75,74,0.4)' }}>
                  <span style={{ fontSize:10, fontWeight:800, color:'#fff' }}>FREE</span>
                </div>
              )}
            </div>

            {freeDeliveryToday && <FreeDeliveryOfferBanner lang={lang} />}
            <WhatsAppCommunityBanner />
            {!searchQuery.trim() && <OffersSection compact={true} />}

            {searchQuery.trim() && (
              <div style={{ padding:'12px 16px 4px', fontSize:12, color:DS.textSecondary, fontWeight:500 }}>
                {filteredVendors.length===0 ? `No results for "${searchQuery}"` : `${filteredVendors.length} result${filteredVendors.length>1?'s':''} for "${searchQuery}"`}
              </div>
            )}

            {/* ── CATEGORIES — Zomato-style real food images ── */}
            {!searchQuery.trim() && (
              <div style={{ background:'#FFFFFF', borderBottom:`1px solid ${DS.border}` }}>
                <div style={{ overflowX:'auto', padding:'18px 16px 16px', scrollbarWidth:'none' }}>
                  <div style={{ display:'flex', gap:14, width:'max-content' }}>
                    {CATEGORIES.map((c, i) => {
                      const active = catFilter === c.id
                      return (
                        <div key={c.id} onClick={() => setCatFilter(c.id)}
                          className={`fz-cat fz-stagger ${active ? 'fz-cat-active' : ''}`}
                          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, cursor:'pointer', flexShrink:0, animationDelay:`${i * 45}ms` }}>
                          {/* Image circle */}
                          <div style={{
                            width:64, height:64, borderRadius:22,
                            overflow:'hidden', position:'relative', flexShrink:0,
                            boxShadow: active
                              ? `0 10px 26px rgba(226,75,74,0.5), 0 4px 10px rgba(226,75,74,0.25)`
                              : '0 3px 10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
                            border: `3px solid ${active ? DS.primary : 'rgba(0,0,0,0)'}`,
                            transform: active ? 'scale(1.13) translateY(-4px)' : 'scale(1)',
                            transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                            transformStyle:'preserve-3d',
                          }}>
                            <img
                              src={c.img}
                              alt={c.label}
                              loading="lazy"
                              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.35s ease', transform: active ? 'scale(1.1)' : 'scale(1)' }}
                            />
                            {/* Active tint overlay */}
                            {active && (
                              <div style={{ position:'absolute', inset:0, background:'rgba(226,75,74,0.18)', pointerEvents:'none' }} />
                            )}
                          </div>
                          <span style={{ fontSize:10, fontWeight: active ? 800 : 600, color: active ? DS.primary : DS.textSecondary, whiteSpace:'nowrap', transition:'color 0.2s', letterSpacing: active ? 0 : 0.1 }}>{c.label}</span>
                          {active && (
                            <div style={{ width:22, height:3, background:`linear-gradient(90deg,${DS.primary},#FF6B6A)`, borderRadius:2, animation:'badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1)' }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION HEADER ── */}
            <div style={{ padding:'16px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:17, fontWeight:900, color:DS.textPrimary, letterSpacing:-0.3 }}>
                  {searchQuery.trim() ? '🔍 Search Results' : '🍽️ Restaurants Near You'}
                </div>
                <div style={{ fontSize:11, color:DS.textMuted, marginTop:2, display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:DS.success, display:'inline-block', animation:'livePulse 2s infinite' }} />
                  <span>Within {MAX_DELIVERY_KM}km · {openVendors.length} open now</span>
                </div>
              </div>
              {closedVendors.length > 0 && !showClosedVendors && (
                <button onClick={() => setShowClosedVendors(true)} className="fz-ripple-btn" style={{ background:'linear-gradient(135deg,#F5F5F5,#EFEFEF)', border:'none', color:DS.textSecondary, borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
                  +{closedVendors.length} closed
                </button>
              )}
            </div>

            {openVendors.length === 0 && !searchQuery && (
              <div style={{ textAlign:'center', padding:'52px 28px', color:DS.textMuted }}>
                {/* 3D floating illustration */}
                <div style={{ fontSize:72, marginBottom:16, display:'inline-block', animation:'float3d 4s ease-in-out infinite', filter:'drop-shadow(0 12px 20px rgba(0,0,0,0.15))' }}>🗺️</div>
                {!locationName ? (
                  <>
                    <div style={{ fontSize:17, fontWeight:900, color:DS.textPrimary, marginBottom:8, letterSpacing:-0.3 }}>Set your location first</div>
                    <div style={{ fontSize:13, lineHeight:1.7, marginBottom:20, color:DS.textSecondary, maxWidth:260, margin:'0 auto 20px' }}>Tap the location pin at the top to find restaurants near you.</div>
                    <button onClick={() => setShowLocationPicker(true)} className="fz-ripple-btn fz-add-btn" style={{ background:'linear-gradient(135deg,#E24B4A,#FF6B6A)', color:'#fff', border:'none', padding:'14px 28px', borderRadius:18, fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 8px 24px rgba(226,75,74,0.4)' }}>
                      📍 Set My Location
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:17, fontWeight:900, color:DS.textPrimary, marginBottom:8, letterSpacing:-0.3 }}>No restaurants in {locationName} yet</div>
                    <div style={{ fontSize:13, lineHeight:1.7, marginBottom:20, color:DS.textSecondary, maxWidth:260, margin:'0 auto 20px' }}>FeedoZone is coming to your area soon! 🚀</div>
                    <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                      <button onClick={() => setShowLocationPicker(true)} className="fz-ripple-btn" style={{ background:'#F5F5F5', color:DS.textPrimary, border:'none', padding:'12px 22px', borderRadius:14, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                        📍 Change Location
                      </button>
                      {closedVendors.length > 0 && (
                        <button onClick={() => setShowClosedVendors(true)} className="fz-ripple-btn" style={{ background:DS.primaryLight, color:DS.primary, border:`1.5px solid #FECACA`, padding:'12px 22px', borderRadius:14, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>
                          👀 See {closedVendors.length} closed
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── VENDOR CARDS ── */}
            <div style={{ padding:'0 16px 8px' }}>
              {filteredVendors.map((v, idx) => {
                const vMinOrder = Number(v.minOrderAmount ?? 0)
                const rawCharge = calcDeliveryCharge(v.distance, v.deliveryCharge, v.distanceBasedDelivery)
                const dynamicCharge = freeDeliveryToday ? 0 : rawCharge
                const openIdx = openVendors.findIndex(ov => ov.id === v.id)
                const rankEmoji = openIdx === 0 ? '🥇' : openIdx === 1 ? '🥈' : openIdx === 2 ? '🥉' : null
                return (
                  <div key={v.id}
                    className="fz-vendor-card fz-stagger"
                    onClick={() => openVendor(v)}
                    style={{
                      background:'#FFFFFF', borderRadius:22, overflow:'hidden',
                      marginBottom:20, cursor: v.isOpen ? 'pointer' : 'default',
                      boxShadow:'0 6px 24px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04)',
                      border:`1px solid ${DS.border}`,
                      animationDelay:`${idx * 60}ms`,
                    }}>

                    {/* IMAGE */}
                    <div style={{ height:168, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#FEE2E2,#FECACA)' }}>
                      {v.photo
                        ? <img src={v.photo} alt={v.storeName}
                            style={{ width:'100%', height:'100%', objectFit:'cover',
                              filter: v.isOpen ? 'none' : 'grayscale(55%) brightness(0.88)',
                              transition:'transform 0.5s ease',
                            }} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:54, animation:'float3d 5s ease-in-out infinite' }}>🍽️</span>
                          </div>
                      }
                      {/* Rich gradient overlay */}
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)' }} />

                      {/* Closed overlay */}
                      {!v.isOpen && (
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)' }}>
                          <div style={{ background:'rgba(0,0,0,0.72)', borderRadius:16, padding:'10px 22px', display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
                            <span style={{ fontSize:16 }}>🔒</span>
                            <div>
                              <div style={{ fontSize:13, fontWeight:800, color:'#fff' }}>Closed Now</div>
                              {v.openTime && <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:1 }}>Opens at {v.openTime}</div>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top-left: category + rank */}
                      <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:6 }}>
                        <span style={{
                          background:'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)',
                          color:'#374151', fontSize:10, fontWeight:700,
                          padding:'4px 10px', borderRadius:20,
                          boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
                        }}>{v.category||'Food'}</span>
                        {rankEmoji && (
                          <span style={{
                            background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
                            color:'#fff', fontSize:11, fontWeight:800,
                            padding:'4px 10px', borderRadius:20,
                            boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
                          }}>{rankEmoji}</span>
                        )}
                      </div>

                      {/* Top-right: open/closed pill */}
                      <div style={{ position:'absolute', top:12, right:12 }}>
                        <span style={{
                          background: v.isOpen ? 'rgba(16,185,129,0.92)' : 'rgba(107,114,128,0.85)',
                          backdropFilter:'blur(8px)', color:'#fff',
                          fontSize:10, fontWeight:800, padding:'4px 11px', borderRadius:20,
                          boxShadow: v.isOpen ? '0 3px 10px rgba(16,185,129,0.45)' : '0 2px 6px rgba(0,0,0,0.2)',
                          display:'flex', alignItems:'center', gap:5,
                        }}>
                          <span style={{
                            width:5, height:5, borderRadius:'50%', background:'#fff', display:'inline-block',
                            animation: v.isOpen ? 'livePulse 2s infinite' : 'none',
                            boxShadow: v.isOpen ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
                          }} />
                          {v.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>

                      {/* Bottom: name + rating */}
                      <div style={{ position:'absolute', bottom:14, left:14, right:14, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:18, fontWeight:900, color:'#fff', lineHeight:1.2, textShadow:'0 2px 10px rgba(0,0,0,0.5)', marginBottom:2 }}>{v.storeName}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', fontWeight:500 }}>{v.category}</div>
                        </div>
                        <div style={{
                          background:'rgba(255,255,255,0.92)', backdropFilter:'blur(10px)',
                          borderRadius:12, padding:'5px 10px',
                          display:'flex', alignItems:'center', gap:4,
                          boxShadow:'0 3px 10px rgba(0,0,0,0.15)',
                          flexShrink:0, marginLeft:10,
                        }}>
                          <span style={{ fontSize:13, color:'#F59E0B' }}>★</span>
                          <span style={{ fontSize:13, fontWeight:900, color:'#1A1A1A' }}>{v.rating||4.5}</span>
                        </div>
                      </div>
                    </div>

                    {/* INFO ROW */}
                    <div style={{ padding:'13px 16px 15px' }}>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:12, color:DS.textSecondary, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
                          <span>🕐</span> 20–35 min
                        </span>
                        {v.distance !== null && (
                          <span style={{ fontSize:12, color:DS.textSecondary, display:'flex', alignItems:'center', gap:4, fontWeight:500 }}>
                            <span>📍</span> {v.distance < 1 ? `${Math.round(v.distance*1000)}m` : `${v.distance.toFixed(1)}km`}
                          </span>
                        )}
                        <span style={{
                          fontSize:11, fontWeight:800, borderRadius:12, padding:'4px 11px',
                          background: dynamicCharge===0
                            ? 'linear-gradient(135deg,#D1FAE5,#A7F3D0)'
                            : 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
                          color: dynamicCharge===0 ? '#065F46' : '#78350F',
                          boxShadow: dynamicCharge===0
                            ? '0 2px 6px rgba(16,185,129,0.2)'
                            : '0 2px 6px rgba(245,158,11,0.15)',
                        }}>
                          {freeDeliveryToday && rawCharge > 0 ? '🎉 Free today' : dynamicCharge===0 ? '🎉 Free delivery' : `🚚 ₹${dynamicCharge}`}
                        </span>
                        {vMinOrder > 0 && (
                          <span style={{ fontSize:11, fontWeight:700, background:'linear-gradient(135deg,#DBEAFE,#BFDBFE)', color:'#1E3A8A', borderRadius:12, padding:'4px 10px' }}>
                            Min ₹{vMinOrder}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Toggle closed */}
              {closedVendors.length > 0 && openVendors.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  <button onClick={() => setShowClosedVendors(s => !s)} className="fz-ripple-btn"
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'14px 0', borderRadius:18, border:`1.5px solid ${showClosedVendors ? '#FECACA' : DS.borderMed}`, cursor:'pointer', fontFamily:'Poppins', background: showClosedVendors ? DS.primaryLight : '#FFFFFF', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', transition:'all 0.2s' }}>
                    <span style={{ fontSize:16 }}>{showClosedVendors ? '🙈' : '👀'}</span>
                    <span style={{ fontSize:13, fontWeight:700, color: showClosedVendors ? DS.primary : DS.textSecondary }}>
                      {showClosedVendors ? 'Hide closed restaurants' : `See ${closedVendors.length} closed restaurant${closedVendors.length>1?'s':''}`}
                    </span>
                    {!showClosedVendors && <span style={{ fontSize:10, background:DS.border, color:DS.textSecondary, borderRadius:20, padding:'2px 8px', fontWeight:700 }}>{closedVendors.length}</span>}
                  </button>
                </div>
              )}

              {/* Coming soon footer */}
              {!searchQuery.trim() && openVendors.length > 0 && (
                <div style={{ marginTop:4, marginBottom:28, background:'linear-gradient(135deg,#FAFAFA,#F5F5F5)', borderRadius:22, padding:'20px 20px', border:`1.5px dashed ${DS.borderMed}`, display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ width:54, height:54, borderRadius:18, background:'linear-gradient(135deg,#FFF1F0,#FFE4E4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0, animation:'float3d 4.5s ease-in-out infinite', boxShadow:'0 6px 18px rgba(226,75,74,0.22)' }}>🍽️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:DS.warning, animation:'pulse 1.5s infinite' }} />
                      <span style={{ fontSize:9, fontWeight:800, color:DS.warning, letterSpacing:0.8, textTransform:'uppercase' }}>Coming Soon</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:800, color:DS.textPrimary, lineHeight:1.4 }}>More restaurants joining FeedoZone!</div>
                    <div style={{ fontSize:11, color:DS.textMuted, marginTop:3 }}>Stay tuned for exciting new options 🚀</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VENDOR MENU ── */}
        {tab==='vendor-menu' && selectedVendor && (() => {
          const vendorDist = (userLat && userLng && selectedVendor.location?.lat && selectedVendor.location?.lng)
            ? getDistance(userLat, userLng, selectedVendor.location.lat, selectedVendor.location.lng)
            : null
          const rawVendorCharge = calcDeliveryCharge(vendorDist, selectedVendor.deliveryCharge, selectedVendor.distanceBasedDelivery)
          const dynamicCharge = freeDeliveryToday ? 0 : rawVendorCharge

          const availableItemsAll = menuItems.filter(i => i.available !== false)
          const menuMaxPrice = availableItemsAll.reduce((max, item) => {
            if (item.hasVariants && item.variants?.length) {
              const vmax = Math.max(...item.variants.map(v => v.price))
              return Math.max(max, vmax)
            }
            return Math.max(max, item.price || 0)
          }, 100)
          const sliderCeiling = Math.ceil(menuMaxPrice / 50) * 50 || 500

          const effectiveSliderMax = priceSliderMax >= 999 ? sliderCeiling : priceSliderMax

          const getItemPrice = (item) => {
            if (item.hasVariants && item.variants?.length) return Math.min(...item.variants.map(v => v.price))
            return item.price || 0
          }

          const priceRange = PRICE_CHIPS.find(c => c.id === priceChip) || PRICE_CHIPS[0]

          const applyPriceFilters = (items) => {
            let filtered = items.filter(item => {
              const p = getItemPrice(item)
              const chipOk = p >= priceRange.min && p <= priceRange.max
              const sliderOk = effectiveSliderMax >= sliderCeiling ? true : p <= effectiveSliderMax
              return chipOk && sliderOk
            })
            if (priceSort === 'low_high') filtered = [...filtered].sort((a,b) => getItemPrice(a) - getItemPrice(b))
            else if (priceSort === 'high_low') filtered = [...filtered].sort((a,b) => getItemPrice(b) - getItemPrice(a))
            return filtered
          }

          const isPriceFiltered = priceChip !== 'all' || priceSort !== 'default' || effectiveSliderMax < sliderCeiling
          const filterActiveCount = (priceChip !== 'all' ? 1 : 0) + (priceSort !== 'default' ? 1 : 0) + (effectiveSliderMax < sliderCeiling ? 1 : 0)

          return (
              <div style={{ background:'#fff', minHeight:'100%' }}>

              {/* ── PREMIUM 3D RESTAURANT HERO ── */}
              <div className="fz-hero-3d" style={{ height:210, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#1A0A0A,#2D0808)' }}>
                {selectedVendor.photo
                  ? <img src={selectedVendor.photo} alt={selectedVendor.storeName}
                      style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:72, animation:'float3d 5s ease-in-out infinite', filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}>🍽️</span>
                    </div>
                }
                {/* Multi-layer gradient */}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />

                {/* Shimmer scan */}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.06) 50%,transparent 70%)', backgroundSize:'200% 100%', animation:'shimmer3d 5s ease-in-out infinite', pointerEvents:'none' }} />

                {/* Free delivery badge */}
                {freeDeliveryToday && (
                  <div style={{ position:'absolute', top:14, right:14, background:'linear-gradient(135deg,#FF9933,#E24B4A)', color:'#fff', fontSize:10, fontWeight:900, padding:'6px 13px', borderRadius:22, display:'flex', alignItems:'center', gap:5, boxShadow:'0 4px 14px rgba(226,75,74,0.5), 0 1px 0 rgba(255,255,255,0.2)', animation:'float3d 4s ease-in-out infinite' }}>
                    🚩 FREE DELIVERY
                  </div>
                )}

                {/* Bottom info */}
                <div style={{ position:'absolute', bottom:16, left:16, right:16, color:'#fff' }}>
                  <div style={{ fontSize:22, fontWeight:900, lineHeight:1.2, textShadow:'0 3px 12px rgba(0,0,0,0.6)', marginBottom:8 }}>{selectedVendor.storeName}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{selectedVendor.category}</span>
                    <span style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.15)', boxShadow:'0 2px 6px rgba(0,0,0,0.15)' }}>⭐ {selectedVendor.rating||4.5}</span>
                    <span style={{
                      background: selectedVendor.isOpen ? 'rgba(16,185,129,0.88)' : 'rgba(107,114,128,0.85)',
                      backdropFilter:'blur(8px)', color:'#fff', fontSize:10, fontWeight:800,
                      padding:'3px 10px', borderRadius:20,
                      boxShadow: selectedVendor.isOpen ? '0 2px 8px rgba(16,185,129,0.4)' : 'none',
                      display:'flex', alignItems:'center', gap:4,
                    }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', display:'inline-block', animation: selectedVendor.isOpen ? 'livePulse 2s infinite' : 'none' }} />
                      {selectedVendor.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info strip */}
              <div style={{ padding:'12px 16px', borderBottom:`1px solid ${DS.border}`, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', background:'#FFFFFF' }}>
                <span style={{ fontSize:12, color:DS.textSecondary, display:'flex', alignItems:'center', gap:4, fontWeight:500 }}>🕐 20–35 min</span>
                {freeDeliveryToday ? (
                  <span style={{ fontSize:11, fontWeight:800, background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', color:'#78350F', borderRadius:12, padding:'4px 11px', display:'flex', alignItems:'center', gap:5, boxShadow:'0 1px 4px rgba(245,158,11,0.2)' }}>
                    🚚 {rawVendorCharge > 0 && <span style={{ textDecoration:'line-through', opacity:0.5 }}>₹{rawVendorCharge}</span>} 🎉 Free today
                  </span>
                ) : (
                  <span style={{ fontSize:11, fontWeight:800, background: dynamicCharge===0 ? 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' : 'linear-gradient(135deg,#FEF3C7,#FDE68A)', color: dynamicCharge===0 ? '#065F46' : '#78350F', borderRadius:12, padding:'4px 11px', boxShadow: dynamicCharge===0 ? '0 1px 4px rgba(16,185,129,0.2)' : '0 1px 4px rgba(245,158,11,0.15)' }}>
                    🚚 {dynamicCharge===0 ? 'Free delivery 🎉' : `₹${dynamicCharge}`}
                  </span>
                )}
                {vendorDist !== null && <span style={{ fontSize:11, color:DS.success, fontWeight:700, display:'flex', alignItems:'center', gap:3 }}>📍 {vendorDist < 1 ? `${vendorDist*1000|0}m` : `${vendorDist.toFixed(1)}km`}</span>}
                {Number(selectedVendor.minOrderAmount) > 0 && <span style={{ fontSize:11, fontWeight:700, background:'linear-gradient(135deg,#DBEAFE,#BFDBFE)', color:'#1E3A8A', borderRadius:12, padding:'4px 10px', boxShadow:'0 1px 4px rgba(59,130,246,0.15)' }}>🛒 Min ₹{selectedVendor.minOrderAmount}</span>}
              </div>

              {freeDeliveryToday && (
                <div style={{ margin:'10px 16px 0', background:'linear-gradient(135deg,#fff7ed,#fef3c7)', borderRadius:14, padding:'11px 14px', display:'flex', alignItems:'center', gap:10, border:'1.5px solid #FDE68A', boxShadow:'0 3px 12px rgba(245,158,11,0.15)' }}>
                  <div style={{ fontSize:22, flexShrink:0, animation:'float3d 3s ease-in-out infinite' }}>🚩</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:800, color:'#92400e' }}>{t('Ashadi Ekadashi Offer: Free Delivery','आषाढी एकादशी ऑफर: मोफत डिलिव्हरी')}</div>
                    <div style={{ fontSize:10, color:'#a16207', marginTop:1 }}>{t('Delivery charge is waived on this order today only','आजच्या ऑर्डरवर डिलिव्हरी चार्ज माफ')}</div>
                  </div>
                </div>
              )}

              {/* Vendor-specific offers */}
              <div style={{ marginTop:10 }}>
                <OffersSection vendorId={selectedVendor.id} compact={true} />
              </div>
              {selectedVendor.packingCharges > 0 && (
                <div style={{ margin:'10px 16px 0', background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, borderWidth:1.5, borderStyle:'solid', borderColor:'#fbbf24', boxShadow:'0 2px 8px rgba(251,191,36,0.2)' }}>
                  <div style={{ fontSize:20, flexShrink:0 }}>⭐</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>Packing Charges: ₹{selectedVendor.packingCharges}</div>
                    <div style={{ fontSize:10, color:'#a16207', marginTop:1 }}>Additional packing charges will be added to your order</div>
                  </div>
                  <div style={{ background:'#fbbf24', color:'#78350f', fontSize:10, fontWeight:800, borderRadius:20, padding:'3px 8px', whiteSpace:'nowrap' }}>⭐ NOTE</div>
                </div>
              )}

              {!selectedVendor.isOpen && (
                <div style={{ background:'#fee2e2', borderWidth:1, borderStyle:'solid', borderColor:'#fca5a5', margin:'12px 16px', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🔒</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#991b1b' }}>This restaurant is currently closed</div>
                    <div style={{ fontSize:11, color:'#b91c1c', marginTop:2 }}>{selectedVendor.openTime?`Opens at ${selectedVendor.openTime} · Come back then!`:'You cannot order right now'}</div>
                  </div>
                </div>
              )}

              <div style={{ padding:'8px 0' }}>
                {(() => {
                  const availableItems = menuItems.filter(i => i.available !== false)
                  const cats = ['All', ...Array.from(new Set(availableItems.map(i => i.category).filter(Boolean)))]

                  const catFilteredItems = menuCatFilter === 'All' ? availableItems : availableItems.filter(i => i.category === menuCatFilter)
                  const filteredItems = applyPriceFilters(catFilteredItems)

                  return (
                    <>
                      {vendorCombos.length > 0 && menuCatFilter === 'All' && !isPriceFiltered && (
                        <div style={{ padding:'0 16px', marginBottom:4 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 0 10px' }}>
                            <div style={{ background:'linear-gradient(135deg,#1a1a1a,#2d1f00)', borderRadius:8, padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}>
                              <span style={{ fontSize:13 }}>🍱</span>
                              <span style={{ fontSize:11, fontWeight:800, color:'#fbbf24', letterSpacing:0.3 }}>COMBO OFFERS</span>
                            </div>
                            <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
                            <span style={{ fontSize:10, color:'#9ca3af', fontWeight:600 }}>{vendorCombos.length} combo{vendorCombos.length>1?'s':''}</span>
                          </div>
                          {vendorCombos.map(combo => <ComboCard key={combo.id} combo={combo} />)}
                        </div>
                      )}

                      {cats.length > 1 && (
                        <div style={{ overflowX:'auto', paddingBottom:2 }}>
                          <div style={{ display:'flex', gap:8, padding:'8px 16px', width:'max-content' }}>
                            {vendorCombos.length > 0 && (
                              <button onClick={() => setMenuCatFilter('__combos__')} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:menuCatFilter==='__combos__'?700:500, background:menuCatFilter==='__combos__'?'#1a1a1a':'#f3f4f6', color:menuCatFilter==='__combos__'?'#fbbf24':'#6b7280', whiteSpace:'nowrap', transition:'all 0.2s' }}>
                                🍱 Combos <span style={{ opacity:0.7, fontSize:10 }}>({vendorCombos.length})</span>
                              </button>
                            )}
                            {cats.map(cat => {
                              const isActive = menuCatFilter === cat
                              const count = cat==='All' ? availableItems.length : availableItems.filter(i => i.category===cat).length
                              return (
                                <button key={cat} onClick={() => setMenuCatFilter(cat)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins', fontSize:12, fontWeight:isActive?700:500, background:isActive?'#E24B4A':'#f3f4f6', color:isActive?'#fff':'#6b7280', boxShadow:isActive?'0 4px 12px rgba(226,75,74,0.3)':'none', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                                  {cat} {count > 0 && <span style={{ opacity:isActive?0.8:0.6, fontSize:10 }}>({count})</span>}
                                </button>
                              )
                            })}
                          </div>
                          <div style={{ height:1, background:'#f3f4f6', marginTop:4 }} />
                        </div>
                      )}

                      {menuCatFilter !== '__combos__' && (
                        <div style={{ padding:'10px 16px 8px', display:'flex', gap:8, alignItems:'center', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                          <button
                            onClick={() => setShowPriceSheet(true)}
                            style={{
                              display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
                              borderRadius:20, border:'none', cursor:'pointer', fontFamily:'Poppins',
                              background: filterActiveCount > 0 ? '#E24B4A' : '#f3f4f6',
                              color: filterActiveCount > 0 ? '#fff' : '#374151',
                              fontSize:12, fontWeight:600, flexShrink:0, transition:'all 0.2s',
                              boxShadow: filterActiveCount > 0 ? '0 2px 8px rgba(226,75,74,0.3)' : 'none'
                            }}
                          >
                            <span style={{ fontSize:13 }}>⚙️</span>
                            Filter & Sort
                            {filterActiveCount > 0 && (
                              <span style={{ background:'rgba(255,255,255,0.3)', borderRadius:20, padding:'1px 7px', fontSize:10, fontWeight:800 }}>
                                {filterActiveCount}
                              </span>
                            )}
                          </button>

                          <div style={{ display:'flex', gap:6, overflowX:'auto', flex:1 }}>
                            {priceChip !== 'all' && (
                              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#fff0f0', borderRadius:20, padding:'5px 10px', flexShrink:0, borderWidth:1, borderStyle:'solid', borderColor:'#fecaca' }}>
                                <span style={{ fontSize:11, fontWeight:600, color:'#E24B4A', whiteSpace:'nowrap' }}>{PRICE_CHIPS.find(c=>c.id===priceChip)?.label}</span>
                                <button onClick={() => setPriceChip('all')} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:10, padding:0, lineHeight:1, display:'flex', alignItems:'center' }}>✕</button>
                              </div>
                            )}
                            {priceSort !== 'default' && (
                              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#f0f9ff', borderRadius:20, padding:'5px 10px', flexShrink:0, borderWidth:1, borderStyle:'solid', borderColor:'#bae6fd' }}>
                                <span style={{ fontSize:11, fontWeight:600, color:'#0284c7', whiteSpace:'nowrap' }}>{SORT_OPTIONS.find(o=>o.id===priceSort)?.icon} {SORT_OPTIONS.find(o=>o.id===priceSort)?.label}</span>
                                <button onClick={() => setPriceSort('default')} style={{ background:'none', border:'none', cursor:'pointer', color:'#0284c7', fontSize:10, padding:0, lineHeight:1, display:'flex', alignItems:'center' }}>✕</button>
                              </div>
                            )}
                            {effectiveSliderMax < sliderCeiling && (
                              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#faf5ff', borderRadius:20, padding:'5px 10px', flexShrink:0, borderWidth:1, borderStyle:'solid', borderColor:'#e9d5ff' }}>
                                <span style={{ fontSize:11, fontWeight:600, color:'#7c3aed', whiteSpace:'nowrap' }}>Max ₹{effectiveSliderMax}</span>
                                <button onClick={() => setPriceSliderMax(sliderCeiling)} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:10, padding:0, lineHeight:1, display:'flex', alignItems:'center' }}>✕</button>
                              </div>
                            )}
                          </div>

                          {isPriceFiltered && (
                            <span style={{ fontSize:11, color:'#9ca3af', flexShrink:0 }}>{filteredItems.length} items</span>
                          )}
                        </div>
                      )}

                      {menuCatFilter === '__combos__' && (
                        <div style={{ padding:'0 16px' }}>
                          <div style={{ padding:'14px 0 10px', fontSize:13, fontWeight:700, color:'#1f2937' }}>🍱 All Combo Offers</div>
                          {vendorCombos.map(combo => <ComboCard key={combo.id} combo={combo} />)}
                        </div>
                      )}

                      {menuCatFilter !== '__combos__' && (
                        <div style={{ padding:'0 16px' }}>
                          {filteredItems.length === 0 && (
                            <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>
                              {menuItems.length === 0
                                ? 'No menu items yet'
                                : isPriceFiltered
                                  ? <div>
                                      <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
                                      <div style={{ fontWeight:600, color:'#374151', marginBottom:6 }}>No items match your filter</div>
                                      <button
                                        onClick={() => { setPriceChip('all'); setPriceSort('default'); setPriceSliderMax(sliderCeiling) }}
                                        style={{ background:'#E24B4A', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginTop:4 }}
                                      >Clear Filters</button>
                                    </div>
                                  : `No items in ${menuCatFilter}`
                              }
                            </div>
                          )}

                          {filteredItems.length > 0 && (
                            menuCatFilter === 'All' && cats.length > 2 && priceSort === 'default' && priceChip === 'all' && effectiveSliderMax >= sliderCeiling ? (
                              cats.filter(c => c !== 'All').map(cat => {
                                const catItems = applyPriceFilters(availableItems.filter(i => i.category === cat))
                                if (catItems.length === 0) return null
                                return (
                                  <div key={cat}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'16px 0 8px' }}>
                                      <div style={{ fontSize:13, fontWeight:800, color:'#1f2937', letterSpacing:0.2 }}>{cat}</div>
                                      <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
                                      <span style={{ fontSize:10, color:'#9ca3af', fontWeight:500 }}>{catItems.length} item{catItems.length>1?'s':''}</span>
                                    </div>
                                    {catItems.map(item => <MenuItemCard key={item.id} item={item} />)}
                                  </div>
                                )
                              })
                            ) : (
                              filteredItems.map(item => <MenuItemCard key={item.id} item={item} />)
                            )
                          )}
                        </div>
                      )}
                    </>
                  )

                  function MenuItemCard({ item }) {
                    const vendorClosed = !selectedVendor.isOpen
                    const hasVariants = item.hasVariants && item.variants?.length >= 2
                    const inCartSimple = !hasVariants ? cart.find(c => c.id === item.id) : null
                    const variantCartEntries = hasVariants
                      ? item.variants.map(v => ({ variant: v, cartItem: cart.find(c => c.id === `${item.id}_${v.label}`) }))
                      : []
                    const totalVariantQty = variantCartEntries.reduce((s, e) => s + (e.cartItem?.qty || 0), 0)
                    const anyVariantInCart = totalVariantQty > 0

                    return (
                      <div style={{ display:'flex', gap:12, padding:'14px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f7f7f7', alignItems:'flex-start' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                            <VegDot isVeg={item.isVeg !== false} />
                            <span style={{ fontSize:13, fontWeight:600, color:vendorClosed?'#9ca3af':'#1f2937' }}>{item.name}</span>
                            {hasVariants && <span style={{ fontSize:9, fontWeight:700, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', borderRadius:10, padding:'2px 7px' }}>⚡ {item.variants.length} sizes</span>}
                          </div>
                          {item.description && <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4, lineHeight:1.5 }}>{item.description}</div>}

                          {hasVariants ? (
                            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:4 }}>
                              {item.variants.map((v, vi) => (
                                <div key={vi} style={{ background:'#faf5ff', borderRadius:8, padding:'3px 8px', borderWidth:1, borderStyle:'solid', borderColor:'#e9d5ff', display:'flex', gap:4, alignItems:'center' }}>
                                  <span style={{ fontSize:10, fontWeight:600, color:'#374151' }}>{v.label}</span>
                                  <span style={{ fontSize:11, fontWeight:800, color:'#7c3aed' }}>₹{v.price}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize:14, fontWeight:700, color:vendorClosed?'#9ca3af':'#E24B4A' }}>₹{item.price}</div>
                          )}

                          {hasVariants && anyVariantInCart && !vendorClosed && (
                            <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:5 }}>
                              {variantCartEntries.filter(e => e.cartItem).map(({ variant, cartItem }) => (
                                <div key={variant.label} style={{ display:'flex', alignItems:'center', gap:5, background:'#f0effe', borderRadius:8, padding:'4px 8px', borderWidth:1, borderStyle:'solid', borderColor:'#c4b5fd' }}>
                                  <span style={{ fontSize:10, fontWeight:700, color:'#7c3aed' }}>{variant.label}</span>
                                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                    <button onClick={() => updateQty(`${item.id}_${variant.label}`, -1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:14, fontWeight:700, padding:0, lineHeight:1 }}>−</button>
                                    <span style={{ fontSize:11, fontWeight:800, color:'#7c3aed', minWidth:12, textAlign:'center' }}>{cartItem.qty}</span>
                                    <button onClick={() => addVariantToCart(item, variant)} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:14, fontWeight:700, padding:0, lineHeight:1 }}>+</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ position:'relative', flexShrink:0 }}>
                          <div style={{ width:90, height:90, borderRadius:12, overflow:'hidden', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', filter:vendorClosed?'grayscale(60%)':'none' }}>
                            {item.photo ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:28 }}>🍛</span>}
                          </div>
                          <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)' }}>
                            {vendorClosed ? (
                              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#f3f4f6', borderWidth:1, borderStyle:'solid', borderColor:'#d1d5db', borderRadius:20, padding:'5px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', cursor:'not-allowed', whiteSpace:'nowrap' }}>
                                <span style={{ fontSize:10 }}>🔒</span><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af' }}>Closed</span>
                              </div>
                            ) : hasVariants ? (
                              anyVariantInCart ? (
                                <button onClick={() => setVariantPickerItem(item)} style={{ background:'#7c3aed', color:'#fff', border:'none', borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 2px 8px rgba(124,58,237,0.35)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                                  ⚡ {totalVariantQty} added
                                </button>
                              ) : (
                                <button onClick={() => setVariantPickerItem(item)} style={{ background:'#fff', color:'#7c3aed', borderWidth:1.5, borderStyle:'solid', borderColor:'#7c3aed', padding:'5px 18px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 2px 8px rgba(0,0,0,0.12)', whiteSpace:'nowrap' }}>
                                  ADD ⚡
                                </button>
                              )
                            ) : inCartSimple ? (
                              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', borderRadius:20, padding:'4px 10px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                                <button onClick={() => updateQty(item.id,-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16, fontWeight:700, padding:0, lineHeight:1 }}>−</button>
                                <span style={{ fontSize:12, fontWeight:700, color:'#E24B4A', minWidth:14, textAlign:'center' }}>{inCartSimple.qty}</span>
                                <button onClick={() => addToCart(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16, fontWeight:700, padding:0, lineHeight:1 }}>+</button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(item)} style={{ background:'#fff', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:'5px 18px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>ADD</button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                })()}
              </div>

              {/* ── VENDOR INFO ── */}
              <div style={{ margin:'20px 0 100px', background:'#fff' }}>
                <div style={{ padding:'0 16px 12px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1f2937', letterSpacing:0.2 }}>Restaurant Info</div>
                </div>
                <div style={{ display:'flex', padding:'14px 16px', gap:12, borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', flexWrap:'wrap' }}>
                  {[
                    { val:`⭐ ${selectedVendor.rating||4.5}`, sub:'Rating' },
                    { val:'Shortly', sub:'Delivery time' },
                    { val:dynamicCharge===0?'FREE':('₹'+dynamicCharge), sub:'Delivery fee', color:dynamicCharge===0?'#16a34a':'#1f2937' },
                    { val:selectedVendor.isOpen?'Open':'Closed', sub:'Status', color:selectedVendor.isOpen?'#16a34a':'#dc2626' },
                  ].map(s => (
                    <div key={s.sub} style={{ flex:1, minWidth:70, textAlign:'center', padding:'10px 8px', background:'#f9fafb', borderRadius:10 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:s.color||'#1f2937' }}>{s.val}</div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{s.sub}</div>
                    </div>
                  ))}
                  {vendorDist !== null && (
                    <div style={{ flex:1, minWidth:70, textAlign:'center', padding:'10px 8px', background:'#f0fdf4', borderRadius:10 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#16a34a' }}>{vendorDist < 1 ? `${Math.round(vendorDist*1000)}m` : `${vendorDist.toFixed(1)}km`}</div>
                      <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>Distance</div>
                    </div>
                  )}
                  {Number(selectedVendor.minOrderAmount) > 0 && (
                    <div style={{ flex:1, minWidth:70, textAlign:'center', padding:'10px 8px', background:'#eff6ff', borderRadius:10, borderWidth:1, borderStyle:'solid', borderColor:'#bfdbfe' }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1e40af' }}>₹{selectedVendor.minOrderAmount}</div>
                      <div style={{ fontSize:10, color:'#3b82f6', marginTop:3 }}>Min. order</div>
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🚚</span></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>DELIVERY CHARGE</div>
                    <div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>
                      {freeDeliveryToday
                        ? (rawVendorCharge > 0
                            ? `🎉 Free today (Ashadi Ekadashi) — usually ₹${rawVendorCharge}`
                            : 'Free delivery for all orders! 🎉')
                        : selectedVendor.distanceBasedDelivery
                          ? `Distance-based · You pay ₹${dynamicCharge}${vendorDist !== null ? ` for ${vendorDist.toFixed(1)}km` : ''}`
                          : dynamicCharge === 0 ? 'Free delivery for all orders! 🎉' : `Fixed ₹${dynamicCharge} for all orders`
                      }
                    </div>
                  </div>
                </div>

                {selectedVendor.address && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'flex-start' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>📍</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>ADDRESS</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500, lineHeight:1.4 }}>{selectedVendor.address}</div></div>
                  </div>
                )}

                {selectedVendor.openTime && selectedVendor.closeTime && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🕐</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>OPENING HOURS</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>{selectedVendor.openTime} – {selectedVendor.closeTime}</div></div>
                    <div style={{ background:selectedVendor.isOpen?'#dcfce7':'#fee2e2', borderRadius:20, padding:'4px 10px' }}><span style={{ fontSize:11, fontWeight:600, color:selectedVendor.isOpen?'#16a34a':'#dc2626' }}>{selectedVendor.isOpen?'Open Now':'Closed'}</span></div>
                  </div>
                )}

                {selectedVendor.gstNo && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fefce8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🏛️</span></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>GST NUMBER</div>
                      <div style={{ fontSize:13, color:'#1f2937', fontWeight:600, letterSpacing:0.5 }}>{selectedVendor.gstNo}</div>
                    </div>
                    <div style={{ background:'#fef9c3', borderRadius:20, padding:'4px 10px', borderWidth:1, borderStyle:'solid', borderColor:'#fde047' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#854d0e' }}>GST Registered</span>
                    </div>
                  </div>
                )}

                {selectedVendor.upiId && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>💳</span></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>UPI ID</div>
                      <div style={{ fontSize:13, color:'#1f2937', fontWeight:600 }}>{selectedVendor.upiId}</div>
                    </div>
                    <button onClick={() => { navigator.clipboard?.writeText(selectedVendor.upiId).then(() => toast.success('UPI ID copied!')).catch(() => {}) }} style={{ background:'#dcfce7', border:'none', borderRadius:20, padding:'6px 12px', fontSize:11, fontWeight:600, color:'#16a34a', cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:4 }}>📋 Copy</button>
                  </div>
                )}

                {selectedVendor.fssai && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>🏛️</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>FSSAI LICENCE</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>{selectedVendor.fssai}</div></div>
                    <div style={{ background:'#dcfce7', borderRadius:20, padding:'4px 10px' }}><span style={{ fontSize:11, fontWeight:600, color:'#16a34a' }}>✓ Verified</span></div>
                  </div>
                )}

                {selectedVendor.phone && (
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', alignItems:'center' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:17 }}>📞</span></div>
                    <div style={{ flex:1 }}><div style={{ fontSize:11, color:'#9ca3af', marginBottom:3, fontWeight:500 }}>CONTACT</div><div style={{ fontSize:13, color:'#1f2937', fontWeight:500 }}>+91 {selectedVendor.phone}</div></div>
                    <button onClick={() => callVendor(selectedVendor.phone)} style={{ background:'#E24B4A', color:'#fff', border:'none', borderRadius:20, padding:'8px 18px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:5 }}>📞 Call</button>
                  </div>
                )}
              </div>

              {/* REVIEWS */}
              <div style={{ background:'#fff', borderTopWidth:8, borderTopStyle:'solid', borderTopColor:'#f7f7f7', marginTop:8 }}>
                <div style={{ padding:'16px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1f2937' }}>Ratings & Reviews</div>
                    {reviews.length > 0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                        <span style={{ fontSize:16, fontWeight:700, color:'#1f2937' }}>{(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)}</span>
                        <div style={{ display:'flex', gap:1 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:13, color:s<=Math.round(reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length)?'#f59e0b':'#e5e7eb' }}>★</span>)}</div>
                        <span style={{ fontSize:12, color:'#9ca3af' }}>({reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setReviewVendor(selectedVendor); setShowReview(true) }} style={{ background:'transparent', color:'#E24B4A', borderWidth:1.5, borderStyle:'solid', borderColor:'#E24B4A', borderRadius:20, padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>✍️ Rate Us</button>
                </div>
                {reviews.length === 0 && <div style={{ textAlign:'center', padding:'24px 16px 32px' }}><div style={{ fontSize:36, marginBottom:8 }}>⭐</div><div style={{ fontSize:13, color:'#9ca3af' }}>No reviews yet</div><div style={{ fontSize:12, color:'#d1d5db', marginTop:4 }}>Be the first to review!</div></div>}
                {reviews.map(r => (
                  <div key={r.id} style={{ padding:'14px 16px', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#f7f7f7' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{r.userName?.[0]?.toUpperCase()||'U'}</span></div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{r.userName}</div>
                          <div style={{ fontSize:10, color:'#9ca3af' }}>{r.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})||''}</div>
                        </div>
                        <div style={{ display:'flex', gap:2, marginTop:3 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:13, color:s<=r.rating?'#f59e0b':'#e5e7eb' }}>★</span>)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, paddingLeft:46 }}>{r.text}</div>
                  </div>
                ))}
                <div style={{ height:100 }} />
              </div>
            </div>
          )
        })()}

        {/* ── CART ── */}
        {tab==='cart' && (
          <div style={{ padding:'16px 16px 24px', background:DS.bg, minHeight:'100%' }}>

            {/* ── MULTI-CART SECTION ── */}
            {(() => {
              // Build a unified cart list: main cart + all carts
              const hasMulti = Object.keys(carts).length > 0
              if (!hasMulti && !cartVendor) return null  // nothing at all

              // If only one restaurant (main cart only), show normally — skip tabs
              if (!hasMulti) return null

              // Multi-restaurant: show tabs
              return (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:DS.textMuted, marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>
                    🛒 Multiple Restaurants
                  </div>

                  {/* Tab pills */}
                  <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6, scrollbarWidth:'none' }}>
                    {/* Main cart tab (Restaurant 1) */}
                    {cartVendor && cart.length > 0 && (
                      <button
                        onClick={() => setActiveCartVendorId(null)}
                        className="fz-multicart-tab"
                        style={{ flexShrink:0, padding:'9px 14px', borderRadius:14, border:`2px solid ${activeCartVendorId === null ? DS.primary : DS.border}`, background: activeCartVendorId === null ? DS.primaryLight : '#fff', cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:8, boxShadow: activeCartVendorId === null ? `0 4px 12px rgba(226,75,74,0.2)` : DS.shadow, transition:'all 0.2s' }}
                      >
                        <div style={{ width:24, height:24, borderRadius:8, overflow:'hidden', background:'#F0F0F0', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {cartVendor.photo ? <img src={cartVendor.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:13 }}>🍽️</span>}
                        </div>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontSize:11, fontWeight:800, color: activeCartVendorId === null ? DS.primary : DS.textPrimary, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cartVendor.storeName}</div>
                          <div style={{ fontSize:9, color:DS.textMuted }}>{cartCount} items · ₹{cartTotal}</div>
                        </div>
                        {activeCartVendorId === null && <div style={{ width:7, height:7, borderRadius:'50%', background:DS.primary, flexShrink:0 }} />}
                      </button>
                    )}

                    {/* Additional vendor cart tabs */}
                    {Object.entries(carts).map(([vid, vc]) => (
                      <button
                        key={vid}
                        onClick={() => setActiveCartVendorId(vid)}
                        className="fz-multicart-tab"
                        style={{ flexShrink:0, padding:'9px 14px', borderRadius:14, border:`2px solid ${activeCartVendorId === vid ? DS.primary : DS.border}`, background: activeCartVendorId === vid ? DS.primaryLight : '#fff', cursor:'pointer', fontFamily:'Poppins', display:'flex', alignItems:'center', gap:8, position:'relative', boxShadow: activeCartVendorId === vid ? `0 4px 12px rgba(226,75,74,0.2)` : DS.shadow, transition:'all 0.2s' }}
                      >
                        <div style={{ width:24, height:24, borderRadius:8, overflow:'hidden', background:'#F0F0F0', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {vc.vendor?.photo ? <img src={vc.vendor.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:13 }}>🍽️</span>}
                        </div>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontSize:11, fontWeight:800, color: activeCartVendorId === vid ? DS.primary : DS.textPrimary, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{vc.vendor?.storeName}</div>
                          <div style={{ fontSize:9, color:DS.textMuted }}>{vc.items.reduce((s,i)=>s+i.qty,0)} items · ₹{vc.items.reduce((s,i)=>s+i.price*i.qty,0)}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); removeMultiCart(vid) }} style={{ position:'absolute', top:-6, right:-6, width:17, height:17, borderRadius:'50%', background:'#EF4444', color:'#fff', border:'2px solid #fff', cursor:'pointer', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>✕</button>
                        {activeCartVendorId === vid && <div style={{ width:7, height:7, borderRadius:'50%', background:DS.primary, flexShrink:0 }} />}
                      </button>
                    ))}
                  </div>

                  {/* Active multi-cart items (only for non-main carts) */}
                  {activeCartVendorId && carts[activeCartVendorId] && (
                    <div style={{ marginTop:14 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:DS.textPrimary, marginBottom:10 }}>
                        🛒 {carts[activeCartVendorId].vendor?.storeName}
                      </div>
                      <div style={{ background:'#FFFFFF', borderRadius:16, overflow:'hidden', marginBottom:12, boxShadow:DS.shadow }}>
                        {carts[activeCartVendorId].items.map((item, i, arr) => (
                          <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 16px', borderBottom: i < arr.length-1 ? `1px solid ${DS.border}` : 'none' }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, color:DS.textPrimary }}>{item.name}</div>
                              <div style={{ fontSize:11, color:DS.textMuted, marginTop:1 }}>₹{item.price} each</div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:10 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7, background:DS.primaryLight, borderRadius:22, padding:'5px 10px', border:`1.5px solid ${DS.primary}` }}>
                                <button onClick={() => updateMultiCartQty(activeCartVendorId, item.id, -1)} style={{ background:'none', border:'none', cursor:'pointer', color:DS.primary, fontSize:17, fontWeight:700, padding:0, lineHeight:1 }}>−</button>
                                <span style={{ fontSize:13, fontWeight:700, color:DS.primary, minWidth:16, textAlign:'center' }}>{item.qty}</span>
                                <button onClick={() => updateMultiCartQty(activeCartVendorId, item.id, 1)} style={{ background:'none', border:'none', cursor:'pointer', color:DS.primary, fontSize:17, fontWeight:700, padding:0, lineHeight:1 }}>+</button>
                              </div>
                              <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary }}>₹{item.price*item.qty}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <MultiCartOrderPanel
                        vendorId={activeCartVendorId}
                        carts={carts}
                        removeMultiCart={removeMultiCart}
                        user={user}
                        userData={userData}
                        deliveryName={deliveryName}
                        deliveryPhone={deliveryPhone}
                        deliveryHostel={deliveryHostel}
                        deliveryAddress={deliveryAddress}
                        userLat={userLat}
                        userLng={userLng}
                        DS={DS}
                      />
                    </div>
                  )}

                  {/* Info note */}
                  {activeCartVendorId === null && (
                    <div style={{ marginTop:10, background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius:12, padding:'10px 14px', fontSize:11, color:'#1E40AF', display:'flex', gap:8, alignItems:'flex-start', border:'1px solid #BFDBFE' }}>
                      <span style={{ fontSize:14, flexShrink:0 }}>ℹ️</span>
                      <span>Scroll down to view and checkout Restaurant 1 items. Tap the other restaurant tab to manage it separately.</span>
                    </div>
                  )}
                </div>
              )
            })()}

            <div style={{ fontSize:18, fontWeight:800, color:DS.textPrimary, marginBottom:4 }}>Your Cart</div>
            {cartVendor && <div style={{ fontSize:12, color:DS.textSecondary, marginBottom:14 }}>from <strong style={{ color:DS.primary }}>{cartVendor.storeName}</strong></div>}

            {cartVendor && cartVendor.distanceKm !== null && cartVendor.distanceKm !== undefined && (
              deliveryFeeWaived ? (
                <div style={{ background:'linear-gradient(135deg,#fff7ed,#fef3c7)', borderRadius:14, padding:'12px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10, border:`1.5px solid #FDE68A` }}>
                  <span style={{ fontSize:18 }}>🚩</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>Free delivery — Ashadi Ekadashi offer!</div>
                    <div style={{ fontSize:11, color:'#a16207' }}>Usually ₹{cartVendor.rawDeliveryCharge}, ₹0 for you today</div>
                  </div>
                </div>
              ) : (
                <div style={{ background:DS.warningLight, borderRadius:14, padding:'12px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:10, border:`1px solid #FDE68A` }}>
                  <span style={{ fontSize:18 }}>🚚</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>{cartVendor.distanceBasedDelivery ? 'Distance-based delivery' : 'Delivery charge'}</div>
                    <div style={{ fontSize:11, color:'#a16207' }}>
                      {cartVendor.distanceBasedDelivery ? `${cartVendor.distanceKm.toFixed(1)}km · ₹${deliveryFee}` : deliveryFee===0 ? 'Free delivery 🎉' : `₹${deliveryFee} delivery`}
                    </div>
                  </div>
                </div>
              )
            )}

            {cart.length===0 && (
              <div style={{ textAlign:'center', color:DS.textMuted, padding:'48px 24px' }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🛒</div>
                <div style={{ fontSize:15, fontWeight:700, color:DS.textPrimary, marginBottom:6 }}>Your cart is empty</div>
                <div style={{ fontSize:13, color:DS.textSecondary }}>Browse restaurants and add items!</div>
              </div>
            )}

            {/* Cart items */}
            <div style={{ background:'#FFFFFF', borderRadius:16, overflow:'hidden', marginBottom:14, boxShadow:DS.shadow }}>
              {cart.map((item, i) => (
                <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom: i < cart.length-1 ? `1px solid ${DS.border}` : 'none' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:DS.textPrimary }}>{item.name}</div>
                    <div style={{ fontSize:12, color:DS.textMuted, marginTop:2 }}>₹{item.price} each{item.isVariant?' · variant':''}</div>
                    {item.isCombo && item.comboItems && <div style={{ fontSize:10, color:DS.textMuted, marginTop:3 }}>{item.comboItems.map(ci=>`${ci.qty>1?ci.qty+'× ':''}${ci.name}`).join(' · ')}</div>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, background: item.isVariant ? '#FAF5FF' : DS.primaryLight, borderRadius:24, padding:'5px 10px', border:`1.5px solid ${item.isVariant ? '#7C3AED' : DS.primary}` }}>
                      <button onClick={() => updateQty(item.id,-1)} style={{ background:'none', border:'none', cursor:'pointer', color: item.isVariant ? '#7C3AED' : DS.primary, fontSize:18, fontWeight:700, padding:0, lineHeight:1, width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                      <span style={{ fontSize:13, fontWeight:700, minWidth:16, textAlign:'center', color: item.isVariant ? '#7C3AED' : DS.primary }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id,1)} style={{ background:'none', border:'none', cursor:'pointer', color: item.isVariant ? '#7C3AED' : DS.primary, fontSize:18, fontWeight:700, padding:0, lineHeight:1, width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, minWidth:52, textAlign:'right', color:DS.textPrimary }}>₹{item.price*item.qty}</div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && !showCheckout && (
              <>
                {minOrder > 0 && (
                  <div style={{ marginBottom:14, background: meetsMinOrder ? DS.successLight : DS.infoLight, borderRadius:14, padding:'12px 14px', border:`1px solid ${meetsMinOrder ? '#86EFAC' : '#BFDBFE'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:15 }}>{meetsMinOrder ? '✅' : '🛒'}</span>
                        <span style={{ fontSize:12, fontWeight:700, color: meetsMinOrder ? DS.success : DS.info }}>{meetsMinOrder ? 'Minimum order met!' : `Add ₹${minOrderShortfall} more to checkout`}</span>
                      </div>
                      <span style={{ fontSize:11, color:DS.textMuted, fontWeight:600 }}>₹{cartTotal} / ₹{minOrder}</span>
                    </div>
                    <div style={{ height:5, background: meetsMinOrder ? '#BBF7D0' : '#DBEAFE', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(100, Math.round(cartTotal/minOrder*100))}%`, background: meetsMinOrder ? DS.success : DS.info, borderRadius:99, transition:'width 0.4s ease' }} />
                    </div>
                  </div>
                )}
                <div style={{ background:'#FFFFFF', borderRadius:16, padding:'14px 16px', marginBottom:14, boxShadow:DS.shadow }}>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, marginBottom:12 }}>Order Summary</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:DS.textSecondary }}>Subtotal</span><span style={{ fontSize:13, fontWeight:600, color:DS.textPrimary }}>₹{cartTotal}</span></div>
                  {discountAmount > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontSize:13, color:DS.success, fontWeight:600 }}>🏷️ Discount ({activeOffer?.discountType==='percentage'?`${activeOffer.discountValue}%`:`₹${activeOffer?.discountValue}`} off)</span>
                      <span style={{ fontSize:13, color:DS.success, fontWeight:700 }}>−₹{discountAmount}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:13, color:DS.textSecondary }}>Delivery fee</span>
                    {deliveryFeeWaived
                      ? <span style={{ fontSize:13, display:'flex', alignItems:'center', gap:5 }}><span style={{ textDecoration:'line-through', color:DS.textMuted }}>₹{cartVendor.rawDeliveryCharge}</span><span style={{ color:DS.success, fontWeight:700 }}>FREE 🎉</span></span>
                      : <span style={{ fontSize:13, fontWeight:600, color: deliveryFee===0 ? DS.success : DS.textPrimary }}>{deliveryFee===0?'Free 🎉':('₹'+deliveryFee)}</span>
                    }
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:`1.5px solid ${DS.border}` }}>
                    <span style={{ fontSize:15, fontWeight:700, color:DS.textPrimary }}>Total</span>
                    <span style={{ fontSize:15, fontWeight:800, color: discountAmount>0 ? DS.success : DS.primary }}>₹{finalTotal}</span>
                  </div>
                  {discountAmount > 0 && <div style={{ marginTop:8, background:DS.successLight, borderRadius:9, padding:'6px 10px', textAlign:'center' }}><span style={{ fontSize:11, color:DS.success, fontWeight:700 }}>🎉 You save ₹{discountAmount} on this order!</span></div>}
                </div>
                {vendorOffers.length > 0 && (
                  <div style={{ background:'#FFFFFF', borderRadius:16, padding:'14px 16px', marginBottom:14, boxShadow:DS.shadow }}>
                    <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, marginBottom:10 }}>🏷️ Offers & Coupons</div>
                    {autoBestOffer && !appliedOffer && discountAmount > 0 && (
                      <div style={{ background:DS.successLight, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:10, border:`1.5px solid #86EFAC` }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>🏷️</span>
                        <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700, color:'#166534' }}>Applied: {autoBestOffer.title}</div><div style={{ fontSize:10, color:DS.success, marginTop:1 }}>You save ₹{discountAmount}!</div></div>
                        <span style={{ fontSize:11, fontWeight:800, color:DS.success, background:'#BBF7D0', padding:'3px 8px', borderRadius:20 }}>−₹{discountAmount}</span>
                      </div>
                    )}
                    {appliedOffer && (
                      <div style={{ background:DS.successLight, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:10, border:`1.5px solid #86EFAC` }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>✅</span>
                        <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700, color:'#166534' }}>{appliedOffer.couponCode} · {appliedOffer.title}</div><div style={{ fontSize:10, color:DS.success, marginTop:1 }}>Saving ₹{discountAmount}!</div></div>
                        <button onClick={handleRemoveCoupon} style={{ fontSize:11, color:'#DC2626', background:'#FEE2E2', border:'none', borderRadius:8, padding:'4px 8px', cursor:'pointer', fontFamily:'Poppins', fontWeight:600 }}>Remove</button>
                      </div>
                    )}
                    {!appliedOffer && vendorOffers.some(o => o.couponCode) && (
                      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                        <input style={{ flex:1, padding:'11px 14px', border:`1.5px solid ${couponError ? '#FCA5A5' : DS.borderMed}`, borderRadius:12, fontSize:13, fontFamily:'Poppins', outline:'none', color:DS.textPrimary, background:'#FAFAFA' }} placeholder="Enter coupon code" value={manualCoupon} onChange={e => { setManualCoupon(e.target.value.toUpperCase()); setCouponError('') }} onKeyDown={e => e.key==='Enter' && handleApplyCoupon()} />
                        <button onClick={handleApplyCoupon} style={{ padding:'11px 18px', background:DS.primary, color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap' }}>Apply</button>
                      </div>
                    )}
                    {couponError && <div style={{ fontSize:11, color:'#DC2626', marginBottom:6 }}>⚠️ {couponError}</div>}
                    {vendorOffers.filter(o => !o.couponCode || o.couponCode==='').slice(0,2).map(o => {
                      const eligible = !o.minOrder || cartTotal >= o.minOrder
                      const disc = computeDiscount(o, cartTotal)
                      return (
                        <div key={o.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:12, marginBottom:4, background: eligible ? DS.successLight : '#FAFAFA', border:`1px solid ${eligible ? '#BBF7D0' : DS.border}`, opacity: eligible ? 1 : 0.65 }}>
                          <span style={{ fontSize:13 }}>🏷️</span>
                          <div style={{ flex:1 }}><div style={{ fontSize:11, fontWeight:700, color: eligible ? '#166534' : DS.textSecondary }}>{o.title}</div><div style={{ fontSize:10, color:DS.textMuted }}>{eligible ? `Saves ₹${disc}` : `Add ₹${o.minOrder-cartTotal} more`}{o.minOrder>0&&` · Min ₹${o.minOrder}`}</div></div>
                          {eligible && <span style={{ fontSize:10, fontWeight:700, color:DS.success, background:'#BBF7D0', padding:'2px 7px', borderRadius:20 }}>−₹{disc}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
                <button onClick={() => { if (!meetsMinOrder) { toast.error(`Add ₹${minOrderShortfall} more to meet the ₹${minOrder} minimum order`, { icon: '🛒', duration: 3000 }); return }; setShowCheckout(true) }} className="fz-ripple-btn" style={{ width:'100%', background: meetsMinOrder ? `linear-gradient(135deg,${DS.primary},${DS.primaryDark})` : '#9CA3AF', color:'#fff', border:'none', padding:'17px 0', borderRadius:18, fontSize:15, fontWeight:800, cursor: meetsMinOrder ? 'pointer' : 'not-allowed', fontFamily:'Poppins', boxShadow: meetsMinOrder ? `0 6px 22px rgba(226,75,74,0.45), 0 2px 8px rgba(226,75,74,0.2)` : 'none', transition:'all 0.2s ease' }}>
                  {meetsMinOrder ? `Proceed to Checkout · ₹${finalTotal}` : `Add ₹${minOrderShortfall} more to checkout`}
                </button>
              </>
            )}
            {cart.length > 0 && showCheckout && (
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:DS.textPrimary, marginBottom:16 }}>🚚 Delivery Details</div>
                <div style={{ background:'#FFFFFF', borderRadius:16, padding:'16px', marginBottom:14, boxShadow:DS.shadow, display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    { label:'Your Name *', placeholder:'Full name', value:deliveryName, onChange: e=>setDeliveryName(e.target.value), type:'text' },
                    { label:'Hostel / Building', placeholder:"e.g. Hostel B...", value:deliveryHostel, onChange: e=>setDeliveryHostel(e.target.value), type:'text' },
                    { label:'Room / Address *', placeholder:'e.g. Room 204...', value:deliveryAddress, onChange: e=>setDeliveryAddress(e.target.value), type:'text' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize:11, color:DS.textSecondary, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{f.label}</label>
                      <input type={f.type} style={{ width:'100%', marginTop:6, padding:'12px 14px', border:`1.5px solid ${DS.borderMed}`, borderRadius:12, fontSize:14, fontFamily:'Poppins', outline:'none', boxSizing:'border-box', color:DS.textPrimary, background:'#FAFAFA' }} placeholder={f.placeholder} value={f.value} onChange={f.onChange} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:11, color:DS.textSecondary, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>Phone Number *</label>
                    <div style={{ position:'relative', marginTop:6 }}>
                      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:DS.textSecondary, pointerEvents:'none', fontWeight:600 }}>+91</span>
                      <input style={{ width:'100%', padding:'12px 14px 12px 50px', border:`1.5px solid ${DS.borderMed}`, borderRadius:12, fontSize:14, fontFamily:'Poppins', outline:'none', boxSizing:'border-box', color:DS.textPrimary, background:'#FAFAFA' }} placeholder="Mobile number" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value.replace(/\D/g,'').slice(0,10))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:DS.textSecondary, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>Order Note</label>
                    <textarea style={{ width:'100%', marginTop:6, padding:'12px 14px', border:`1.5px solid ${DS.borderMed}`, borderRadius:12, fontSize:14, fontFamily:'Poppins', outline:'none', boxSizing:'border-box', resize:'none', minHeight:56, lineHeight:1.5, color:DS.textPrimary, background:'#FAFAFA' }} placeholder="Less spicy, extra roti..." value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} />
                  </div>
                </div>
                <div style={{ background:'#FFFFFF', borderRadius:16, padding:'14px 16px', marginBottom:14, boxShadow:DS.shadow }}>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, marginBottom:12 }}>Bill Summary</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:DS.textSecondary }}>Subtotal</span><span style={{ fontSize:13, fontWeight:600 }}>₹{cartTotal}</span></div>
                  {discountAmount > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:DS.success, fontWeight:600 }}>🏷️ {activeOffer?.title||'Offer'}</span><span style={{ fontSize:13, color:DS.success, fontWeight:700 }}>−₹{discountAmount}</span></div>}
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:13, color:DS.textSecondary }}>Delivery fee</span>
                    {deliveryFeeWaived ? <span style={{ fontSize:13, display:'flex', alignItems:'center', gap:5 }}><span style={{ textDecoration:'line-through', color:DS.textMuted }}>₹{cartVendor.rawDeliveryCharge}</span><span style={{ color:DS.success, fontWeight:700 }}>FREE 🎉</span></span> : <span style={{ fontSize:13, fontWeight:600 }}>{deliveryFee===0?'Free 🎉':('₹'+deliveryFee)}</span>}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:`1.5px solid ${DS.border}` }}>
                    <span style={{ fontSize:15, fontWeight:700, color:DS.textPrimary }}>Total</span>
                    <span style={{ fontSize:16, fontWeight:800, color:DS.primary }}>₹{finalTotal}</span>
                  </div>
                </div>
                {deliveryFeeWaived && <div style={{ background:DS.warningLight, borderRadius:12, padding:'10px 12px', fontSize:12, color:'#92400e', marginBottom:12, display:'flex', alignItems:'center', gap:8, border:`1px solid #FDE68A` }}><span style={{ fontSize:15 }}>🚩</span><span>{t('Ashadi Ekadashi — delivery is free!','आषाढी एकादशी — डिलिव्हरी मोफत!')}</span></div>}
                {discountAmount > 0 && <div style={{ background:DS.successLight, borderRadius:12, padding:'10px 12px', fontSize:12, color:'#166534', marginBottom:12, display:'flex', alignItems:'center', gap:8, border:`1.5px solid #86EFAC` }}><span style={{ fontSize:16 }}>🏷️</span><div><div style={{ fontWeight:700 }}>{activeOffer?.title} applied!</div><div style={{ fontSize:10, marginTop:1, color:DS.success }}>₹{discountAmount} discount on your order</div></div></div>}
                <div style={{ background:DS.warningLight, borderRadius:12, padding:'10px 14px', fontSize:12, color:'#78350f', marginBottom:14, display:'flex', alignItems:'center', gap:8, border:`1px solid #FDE68A` }}>
                  <span style={{ fontSize:15 }}>�</span><span>Payment: <strong>Cash on Delivery (COD)</strong></span>
                </div>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="fz-ripple-btn" style={{ width:'100%', background: placingOrder ? '#FCA5A5' : `linear-gradient(135deg,${DS.primary},${DS.primaryDark})`, color:'#fff', border:'none', padding:'17px 0', borderRadius:18, fontSize:15, fontWeight:800, cursor: placingOrder ? 'not-allowed' : 'pointer', fontFamily:'Poppins', marginBottom:10, boxShadow: placingOrder ? 'none' : `0 6px 22px rgba(226,75,74,0.45), 0 2px 8px rgba(226,75,74,0.2)`, transition:'all 0.2s ease' }}>
                  {placingOrder ? '⏳ Placing Order...' : `🎉 Place Order · ₹${finalTotal}`}
                </button>
                <button onClick={() => setShowCheckout(false)} style={{ width:'100%', background:'transparent', color:DS.primary, border:`1.5px solid #FECACA`, padding:'13px 0', borderRadius:14, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>← Back to Cart</button>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS LIST ── */}
        {tab==='orders' && !selectedOrder && (
          <div style={{ background:DS.bg, minHeight:'100%' }}>
            <div style={{ padding:'16px 16px 10px', fontSize:18, fontWeight:800, color:DS.textPrimary }}>My Orders</div>
            {orders.length===0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', color:DS.textMuted }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🛍️</div>
                <div style={{ fontSize:15, fontWeight:700, color:DS.textPrimary, marginBottom:6 }}>No orders yet!</div>
                <div style={{ fontSize:13 }}>Order something delicious 🍽️</div>
              </div>
            )}
            <div style={{ padding:'0 16px 80px' }}>
              {orders.map(o => {
                const isActive = !['delivered','cancelled'].includes(o.status)
                const statusStyle = {
                  delivered:        { bg:'#D1FAE5', color:'#065F46', label:'Delivered' },
                  cancelled:        { bg:'#FEE2E2', color:'#991B1B', label:'Cancelled' },
                  out_for_delivery: { bg:'#DBEAFE', color:'#1E40AF', label:'🛵 Out for Delivery' },
                  preparing:        { bg:'#FEF3C7', color:'#92400E', label:'Preparing' },
                  accepted:         { bg:'#ECFDF5', color:'#065F46', label:'Accepted' },
                  pending:          { bg:'#FFF7ED', color:'#C2410C', label:'Pending' },
                }[o.status] || { bg:DS.border, color:DS.textSecondary, label:o.status }
                return (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ background:'#FFFFFF', borderRadius:18, padding:'14px 16px', marginBottom:12, cursor:'pointer', boxShadow:DS.shadow, border:`1px solid ${isActive ? '#FECACA' : DS.border}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:DS.textPrimary }}>{o.vendorName}</div>
                        <div style={{ fontSize:11, color:DS.textMuted, marginTop:2 }}>{o.createdAt?.toDate?.()?.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})||''}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20, background:statusStyle.bg, color:statusStyle.color }}>{statusStyle.label}</span>
                    </div>
                    <div style={{ fontSize:12, color:DS.textSecondary, marginBottom:8 }}>{o.items?.slice(0,2).map(i=>i.qty+'x '+i.name).join(', ')}{o.items?.length>2?` +${o.items.length-2} more`:''}</div>
                    {o.status === 'cancelled' && o.cancellationReason && (
                      <div style={{ background:'#FFF5F5', borderLeft:`3px solid #DC2626`, borderRadius:8, padding:'8px 10px', marginBottom:8, display:'flex', gap:7 }}>
                        <span style={{ fontSize:12, flexShrink:0 }}>🚫</span>
                        <div>
                          <div style={{ fontSize:9, fontWeight:700, color:'#DC2626', letterSpacing:0.5 }}>{o.cancelledBy==='vendor'?'CANCELLED BY RESTAURANT':o.cancelledBy==='user'?'YOU CANCELLED':'CANCELLED'}</div>
                          <div style={{ fontSize:11, color:'#7F1D1D', lineHeight:1.45 }}>{o.cancellationReason}</div>
                        </div>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <span style={{ fontSize:15, fontWeight:800, color:DS.primary }}>₹{o.total}</span>
                      <span style={{ fontSize:11, color: isActive ? DS.primary : DS.textMuted, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                        {o.status==='out_for_delivery' && <span style={{ width:6, height:6, borderRadius:'50%', background:DS.primary, display:'inline-block', animation:'livePulse 1s infinite' }} />}
                        {isActive ? (o.status==='out_for_delivery' ? 'Live Track →' : 'Track Order →') : 'Tap for details →'}
                      </span>
                    </div>
                    <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
                    <div style={{ display:'flex', gap:8 }}>
                      <div onClick={e => { e.stopPropagation(); setBillOrder(o); setShowBill(true) }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:'#FAFAFA', borderRadius:10, padding:'8px 0', border:`1px solid ${DS.border}`, cursor:'pointer' }}>
                        <span style={{ fontSize:13 }}>🧾</span><span style={{ fontSize:11, fontWeight:600, color:DS.textSecondary }}>View Bill</span>
                      </div>
                      {o.status==='delivered' && (
                        <div onClick={e => { e.stopPropagation(); const v=vendors.find(x=>x.id===o.vendorUid); if(v){setReviewVendor(v);setReviewRating(5);setShowReview(true)} }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:DS.warningLight, borderRadius:10, padding:'8px 0', border:`1px solid #FDE68A`, cursor:'pointer' }}>
                          <span style={{ fontSize:13 }}>⭐</span><span style={{ fontSize:11, fontWeight:600, color:DS.warning }}>Rate Now</span>
                        </div>
                      )}
                      <CancelOrderButton order={o} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab==='orders' && selectedOrder && (
          <LiveOrderTracking order={selectedOrder} userLat={userLat} userLng={userLng} onClose={() => setSelectedOrder(null)} />
        )}

        {/* ── PROFILE ── */}
        {tab==='profile' && (
          <div style={{ background:DS.bg, minHeight:'100%', paddingBottom:80 }}>
            {/* Hero card */}
            <div style={{ background:'linear-gradient(135deg,#E24B4A 0%,#C73232 100%)', padding:'32px 20px 28px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-40, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
              <div style={{ position:'absolute', bottom:-50, left:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
              <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:64, height:64, borderRadius:20, background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800, color:'#fff', border:'2.5px solid rgba(255,255,255,0.35)', flexShrink:0 }}>
                  {userData?.name ? userData.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '👤'}
                </div>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{userData?.name||'FeedoZone User'}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginTop:3 }}>{user?.email}</div>
                  {locationName && <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:4, display:'flex', alignItems:'center', gap:4 }}><span>📍</span>{locationName}</div>}
                </div>
              </div>
              {freeDeliveryToday && (
                <div style={{ position:'relative', zIndex:1, marginTop:16, background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, backdropFilter:'blur(4px)' }}>
                  <span style={{ fontSize:18 }}>🚩</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color:'#fff' }}>Ashadi Ekadashi Special</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.85)' }}>Free delivery on every order today</div>
                  </div>
                </div>
              )}
            </div>

            {/* Info section */}
            <div style={{ padding:'16px 16px 0' }}>
              <div style={{ background:'#FFFFFF', borderRadius:18, overflow:'hidden', boxShadow:DS.shadow, marginBottom:14 }}>
                {[
                  {icon:'👤', label:'Full Name', value:userData?.name},
                  {icon:'📧', label:'Email', value:userData?.email||user?.email},
                  {icon:'📱', label:'Mobile', value:userData?.mobile ? `+91 ${userData.mobile}` : null},
                  {icon:'🏠', label:'Address', value:userData?.address},
                  {icon:'📅', label:'Member Since', value:userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : null},
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i<arr.length-1 ? `1px solid ${DS.border}` : 'none' }}>
                    <div style={{ width:36, height:36, borderRadius:11, background:DS.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{row.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:10, color:DS.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:0.4, marginBottom:1 }}>{row.label}</div>
                      <div style={{ fontSize:13, color: row.value ? DS.textPrimary : DS.textMuted, fontWeight: row.value ? 600 : 400 }}>{row.value||'Not added'}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location card */}
              <div style={{ background:'#FFFFFF', borderRadius:18, padding:'14px 16px', marginBottom:14, boxShadow:DS.shadow }}>
                <div style={{ fontSize:12, fontWeight:700, color:DS.textPrimary, marginBottom:4 }}>📍 Delivery Location</div>
                <div style={{ fontSize:13, color:DS.textSecondary, marginBottom:12 }}>{locationName || 'Not detected yet'}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowLocationPicker(true)} style={{ flex:1, background:DS.primary, color:'#fff', border:'none', padding:'10px 0', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>📍 Change</button>
                  <button onClick={() => setShowMap(true)} style={{ flex:1, background:DS.primaryLight, color:DS.primary, border:`1px solid #FECACA`, padding:'10px 0', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins' }}>🗺️ View Map</button>
                </div>
              </div>

              {/* Language */}
              <div style={{ background:'#FFFFFF', borderRadius:18, padding:'14px 16px', marginBottom:14, boxShadow:DS.shadow, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:11, background:DS.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌐</div>
                  <span style={{ fontSize:13, fontWeight:600, color:DS.textPrimary }}>{tt('lang.label')}</span>
                </div>
                <LanguageSwitcher variant="ghost" />
              </div>

              {/* Help & Legal */}
              <div style={{ background:'#FFFFFF', borderRadius:18, overflow:'hidden', boxShadow:DS.shadow, marginBottom:14 }}>
                {[
                  {icon:'💬', label:'Contact Support', sub:'Chat with our team', badge: supportUnreadCount > 0 ? supportUnreadCount : null, action: handleOpenSupportChat},
                  {icon:'🟢', label:'Join WhatsApp Community', sub:'Exclusive coupons & offers', action:()=>{ try { window.open(WHATSAPP_COMMUNITY_URL, '_blank', 'noopener,noreferrer') } catch {} }},
                  {icon:'📜', label:'Terms & Conditions', sub:'Our terms of service', action:()=>setShowTerms(true)},
                  {icon:'🔒', label:'Privacy Policy', sub:'How we handle your data', action:()=>setShowPrivacy(true)},
                ].map((item,i,arr) => (
                  <button key={item.label} onClick={item.action} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'transparent', border:'none', borderBottom: i<arr.length-1 ? `1px solid ${DS.border}` : 'none', cursor:'pointer', fontFamily:'Poppins', textAlign:'left' }}>
                    <div style={{ width:36, height:36, borderRadius:11, background:DS.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, position:'relative' }}>
                      {item.icon}
                      {item.badge && <div style={{ position:'absolute', top:-4, right:-4, background:DS.primary, color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{item.badge}</div>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:DS.textPrimary, display:'flex', alignItems:'center', gap:6 }}>
                        {item.label}
                        {item.badge && <span style={{ fontSize:9, background:'#FEE2E2', color:'#DC2626', padding:'1px 6px', borderRadius:10, fontWeight:700 }}>NEW REPLY</span>}
                      </div>
                      <div style={{ fontSize:11, color:DS.textMuted, marginTop:1 }}>{item.sub}</div>
                    </div>
                    <span style={{ fontSize:16, color:DS.textMuted }}>›</span>
                  </button>
                ))}
              </div>

              {/* Logout */}
              <button onClick={() => { localStorage.removeItem('feedo_location'); logoutUser() }} style={{ width:'100%', background:'#FFFFFF', color:'#DC2626', border:`1.5px solid #FECACA`, padding:'14px 0', borderRadius:16, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:DS.shadow }}>
                👋 Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── REVIEW MODAL ── */}
      {showReview && reviewVendor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:998, display:'flex', flexDirection:'column', justifyContent:'flex-end', fontFamily:'Poppins,sans-serif' }} onClick={e=>{if(e.target===e.currentTarget)setShowReview(false)}}>
          <div style={{ background:'#fff', borderRadius:'24px 24px 0 0', padding:'8px 20px 32px', maxWidth:430, width:'100%', margin:'0 auto', boxShadow:DS.shadowLg }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16, paddingTop:8 }}><div style={{ width:40, height:4, borderRadius:2, background:DS.border }} /></div>
            <div style={{ fontSize:17, fontWeight:800, color:DS.textPrimary, marginBottom:4 }}>Rate your experience</div>
            <div style={{ fontSize:13, color:DS.textSecondary, marginBottom:20 }}>{reviewVendor.storeName}</div>
            <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:16 }}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setReviewRating(s)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:38, color:s<=reviewRating ? '#F59E0B' : DS.border, transition:'all 0.15s', transform:s<=reviewRating ? 'scale(1.15)' : 'scale(1)' }}>★</button>
              ))}
            </div>
            <div style={{ textAlign:'center', fontSize:14, fontWeight:700, color:DS.primary, marginBottom:16 }}>
              {['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'][reviewRating]}
            </div>
            <textarea placeholder="Share your experience..." value={reviewText} onChange={e=>setReviewText(e.target.value)} rows={3} style={{ width:'100%', padding:'13px 14px', border:`1.5px solid ${DS.borderMed}`, borderRadius:14, fontSize:13, fontFamily:'Poppins', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:16, lineHeight:1.5, color:DS.textPrimary, background:'#FAFAFA' }} />
            <button onClick={handleSubmitReview} disabled={submittingReview} style={{ width:'100%', background:submittingReview ? '#FCA5A5' : DS.primary, color:'#fff', border:'none', padding:'15px 0', borderRadius:16, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:`0 4px 18px rgba(226,75,74,0.4)` }}>{submittingReview ? 'Submitting...' : '⭐ Submit Review'}</button>
          </div>
        </div>
      )}

      {/* ── ORDER SUCCESS ── */}
      {orderSuccess && (
        <div style={{ position:'fixed', inset:0, background:'#fff', zIndex:999, overflowY:'auto', fontFamily:'Poppins,sans-serif', maxWidth:430, margin:'0 auto', animation:'fadeInScale 0.4s cubic-bezier(0.34,1.2,0.64,1)' }}>
          {/* Hero */}
          <div style={{ background:'linear-gradient(135deg,#0D9488 0%,#059669 50%,#10B981 100%)', padding:'56px 24px 36px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
            {/* Decorative orbs */}
            <div style={{ position:'absolute', top:-50, right:-30, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-70, left:-20, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
            {/* Shimmer */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%)', backgroundSize:'200% 100%', animation:'shimmer3d 3s ease-in-out infinite', pointerEvents:'none' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              {/* Checkmark with 3D bounce */}
              <div style={{ width:90, height:90, borderRadius:28, background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:46, margin:'0 auto 18px', border:'3px solid rgba(255,255,255,0.35)', animation:'bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)', transform:'perspective(400px) rotateX(0deg)', transformStyle:'preserve-3d' }}>✅</div>
              <div style={{ fontSize:26, fontWeight:900, marginBottom:6, textShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>Order Placed! 🎉</div>
              <div style={{ fontSize:14, opacity:0.9, marginBottom:16 }}>Your food is being prepared</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'7px 18px', backdropFilter:'blur(8px)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                <span style={{ fontSize:13, fontWeight:800 }}>Order #{orderSuccess.orderId?.slice(-6)?.toUpperCase()}</span>
              </div>
              {(orderSuccess.freeDeliveryOffer || orderSuccess.discountAmount > 0) && (
                <div style={{ marginTop:12, display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                  {orderSuccess.freeDeliveryOffer && (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'5px 14px', backdropFilter:'blur(4px)' }}>
                      <span style={{ fontSize:12 }}>🚩</span><span style={{ fontSize:11, fontWeight:700 }}>Free Delivery</span>
                    </div>
                  )}
                  {orderSuccess.discountAmount > 0 && (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'5px 14px', backdropFilter:'blur(4px)' }}>
                      <span style={{ fontSize:12 }}>🏷️</span><span style={{ fontSize:11, fontWeight:700 }}>Saved ₹{orderSuccess.discountAmount}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div style={{ padding:20 }}>
            {orderSuccess.vendorPhone && (
              <div style={{ background:'#FAFAFA', borderRadius:20, padding:16, marginBottom:16, border:`1px solid ${DS.border}`, boxShadow:DS.shadow }}>
                <div style={{ fontSize:11, fontWeight:700, color:DS.textMuted, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>📞 Contact Restaurant</div>
                <div style={{ fontSize:13, color:DS.textSecondary, marginBottom:12 }}>Call or WhatsApp <strong style={{ color:DS.textPrimary }}>{orderSuccess.vendorName}</strong>:</div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>notifyVendorWhatsApp(orderSuccess.vendorPhone,{userName:orderSuccess.userName,userPhone:orderSuccess.userPhone||'',address:orderSuccess.address,items:orderSuccess.items,subtotal:orderSuccess.subtotal,deliveryFee:orderSuccess.deliveryFee,total:orderSuccess.total})} className="fz-ripple-btn" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 0', background:'#25D366', border:'none', borderRadius:16, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 4px 16px rgba(37,211,102,0.4)' }}>
                    <span style={{ fontSize:18 }}>💬</span><span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>WhatsApp</span>
                  </button>
                  <button onClick={()=>callVendor(orderSuccess.vendorPhone)} className="fz-ripple-btn" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 0', background:DS.primary, border:'none', borderRadius:16, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 4px 16px rgba(226,75,74,0.4)' }}>
                    <span style={{ fontSize:18 }}>📞</span><span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Call</span>
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => { setBillOrder(orderSuccess); setShowBill(true) }} className="fz-ripple-btn" style={{ width:'100%', background:'#1A1A1A', color:'#fff', border:'none', padding:'16px 0', borderRadius:18, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}>🧾 View Digital Bill</button>
            <button onClick={()=>{const latestOrder=orders[0];setOrderSuccess(null);setTab('orders');if(latestOrder)setTimeout(()=>setSelectedOrder(latestOrder),100)}} className="fz-ripple-btn" style={{ width:'100%', background:DS.primary, color:'#fff', border:'none', padding:'16px 0', borderRadius:18, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', marginBottom:10, boxShadow:`0 6px 20px rgba(226,75,74,0.45)` }}>📋 Track My Order</button>
            <button onClick={()=>{setOrderSuccess(null);setTab('home')}} style={{ width:'100%', background:'transparent', color:DS.textSecondary, border:`1.5px solid ${DS.borderMed}`, padding:'14px 0', borderRadius:16, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>🏠 Back to Home</button>
          </div>
        </div>
      )}

      {/* ── TERMS ── */}
      {showTerms && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget)setShowTerms(false)}}>
          <div style={{ background:'#fff', borderRadius:'24px 24px 0 0', maxHeight:'88vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif', boxShadow:DS.shadowLg }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${DS.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1, borderRadius:'24px 24px 0 0' }}>
              <div><div style={{ fontSize:16, fontWeight:800, color:DS.textPrimary }}>📜 Terms & Conditions</div><div style={{ fontSize:11, color:DS.textMuted, marginTop:2 }}>Please read carefully</div></div>
              <button onClick={()=>setShowTerms(false)} style={{ background:DS.border, border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 48px' }}>
              {[
                { title:'1. Acceptance of Terms', body:'By using FeedoZone, you agree to be bound by these terms and conditions.' },
                { title:'2. Eligibility', body:'You must be 18 years or older, or have parental / guardian consent to use FeedoZone.' },
                { title:'3. Location Requirement', body:'FeedoZone requires location access to show nearby restaurants and calculate delivery charges. Restaurants beyond 4km are not available.' },
                { title:'4. Orders & Payments', body:'All orders are subject to restaurant availability. Payment is Cash on Delivery (COD) only.' },
                { title:'5. Delivery Charges', body:'Charges are set by each restaurant — fixed or distance-based (₹10/km up to ₹40/4km). Festival promotions may temporarily waive charges.' },
                { title:'6. Cancellation Policy', body:'Users may cancel within 5 minutes of placing an order. Cancellations after 5 minutes are not permitted.' },
                { title:'7. User Responsibilities', body:'You are responsible for providing accurate delivery details including address and contact number.' },
                { title:'8. Prohibited Conduct', body:'Users must not misuse the platform, place fraudulent orders, or abuse vendors or delivery personnel.' },
                { title:'9. Intellectual Property', body:'All content, logos, and branding on FeedoZone are the property of FeedoZone.' },
                { title:'10. Changes to Terms', body:'FeedoZone reserves the right to update these terms at any time without prior notice.' },
              ].map((section, i) => (
                <div key={i} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, marginBottom:5 }}>{section.title}</div>
                  <div style={{ fontSize:12, color:DS.textSecondary, lineHeight:1.8 }}>{section.body}</div>
                </div>
              ))}
              <div style={{ marginTop:10, padding:'12px 14px', background:'#FAFAFA', borderRadius:12, border:`1px solid ${DS.border}` }}>
                <div style={{ fontSize:11, color:DS.textMuted, lineHeight:1.6 }}>Last updated: June 2025 · FeedoZone, Warananagar, Kolhapur, Maharashtra, India</div>
              </div>
              <button onClick={()=>setShowTerms(false)} style={{ width:'100%', background:DS.primary, color:'#fff', border:'none', padding:'15px 0', borderRadius:16, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', marginTop:16, boxShadow:`0 4px 18px rgba(226,75,74,0.4)` }}>I Understand ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY ── */}
      {showPrivacy && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget)setShowPrivacy(false)}}>
          <div style={{ background:'#fff', borderRadius:'24px 24px 0 0', maxHeight:'88vh', overflowY:'auto', maxWidth:430, width:'100%', margin:'0 auto', fontFamily:'Poppins,sans-serif', boxShadow:DS.shadowLg }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${DS.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1, borderRadius:'24px 24px 0 0' }}>
              <div><div style={{ fontSize:16, fontWeight:800, color:DS.textPrimary }}>🔒 Privacy Policy</div><div style={{ fontSize:11, color:DS.textMuted, marginTop:2 }}>How we handle your data</div></div>
              <button onClick={()=>setShowPrivacy(false)} style={{ background:DS.border, border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding:'20px 20px 48px' }}>
              {[
                { title:'1. Information We Collect', body:'We collect your name, email, phone number, delivery address, and GPS location when you register or place an order.' },
                { title:'2. Location Data', body:'Location is required to show nearby restaurants and calculate delivery charges. It is not tracked continuously or in the background.' },
                { title:'3. How We Use Your Data', body:'Your data is used solely to process orders, facilitate delivery, improve your experience, and send relevant notifications.' },
                { title:'4. Data Storage & Security', body:'Your data is securely stored using Google Firebase with industry-standard encryption.' },
                { title:'5. Push Notifications', body:'With your permission, we send notifications for order updates. You can disable them at any time.' },
                { title:'6. Sharing of Information', body:'We may share your order details with the restaurant vendor solely to fulfill your order.' },
                { title:'7. Data Retention', body:'We retain data while your account is active. You may request deletion via Support.' },
                { title:'8. Your Rights', body:'You have the right to access, correct, or delete your personal data. Contact us through the Support section.' },
                { title:'9. Changes to This Policy', body:'We may update this policy from time to time. Continued use constitutes acceptance.' },
              ].map((section, i) => (
                <div key={i} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, marginBottom:5 }}>{section.title}</div>
                  <div style={{ fontSize:12, color:DS.textSecondary, lineHeight:1.8 }}>{section.body}</div>
                </div>
              ))}
              <div style={{ marginTop:10, padding:'12px 14px', background:DS.successLight, borderRadius:12, border:`1px solid #BBF7D0`, display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>🔐</span>
                <div style={{ fontSize:11, color:'#166534', lineHeight:1.6 }}>Your privacy matters to us. FeedoZone will never sell your data.</div>
              </div>
              <button onClick={()=>setShowPrivacy(false)} style={{ width:'100%', background:DS.primary, color:'#fff', border:'none', padding:'15px 0', borderRadius:16, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', marginTop:16, boxShadow:`0 4px 18px rgba(226,75,74,0.4)` }}>Got It ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREMIUM 3D CART BAR ── */}
      {(cart.length > 0 || Object.keys(carts).length > 0) && (tab==='home' || tab==='vendor-menu') && (
        <div onClick={() => setTab('cart')}
          className="fz-cart-bar fz-ripple-btn"
          style={{
            background:'linear-gradient(135deg,#E24B4A 0%,#FF6B6A 40%,#C73232 100%)',
            backgroundSize:'200% 200%',
            color:'#fff', padding:'13px 20px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            cursor:'pointer', flexShrink:0,
            boxShadow:'0 -8px 32px rgba(226,75,74,0.5), 0 -1px 0 rgba(255,255,255,0.05)',
          }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:14, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)', animation:'float3d 3.5s ease-in-out infinite' }}>
              <span style={{ fontSize:20, animation:'cartPulse 2.5s ease-in-out infinite' }}>🛒</span>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:900, letterSpacing:-0.2 }}>
                {cartCount + multiCartTotalCount} item{(cartCount + multiCartTotalCount)>1?'s':''} in cart
                {Object.keys(carts).length > 0 && (
                  <span style={{ fontSize:10, background:'rgba(255,255,255,0.25)', borderRadius:20, padding:'1px 7px', marginLeft:6, fontWeight:700 }}>
                    {1 + Object.keys(carts).length} restaurants
                  </span>
                )}
              </div>
              <div style={{ fontSize:10, opacity:0.78, marginTop:1 }}>
                {Object.keys(carts).length > 0
                  ? [cartVendor?.storeName, ...Object.values(carts).map(c=>c.vendor?.storeName)].filter(Boolean).join(' + ')
                  : `${cartVendor?.storeName || ''}${deliveryFeeWaived ? ' · 🎉 Free delivery' : ''}`}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:17, fontWeight:900, letterSpacing:-0.3 }}>₹{finalTotal}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:12, padding:'7px 14px', display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:800, boxShadow:'0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
              View Cart <span>→</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PREMIUM BOTTOM NAV ── */}
      <div style={S.bottomNav}>
        {[
          {id:'home',    icon: active => active ? '🏠' : '🏠', label: tt('nav.home')},
          {id:'orders',  icon: active => active ? '📋' : '📋', label: tt('nav.orders')},
          {id:'cart',    icon: active => active ? '🛒' : '🛒', label: `${tt('nav.cart')}${(cartCount+multiCartTotalCount)>0?` (${cartCount+multiCartTotalCount})`:''}`},
          {id:'profile', icon: active => active ? '👤' : '👤', label: tt('nav.profile')},
        ].map(item => {
          const active = tab === item.id
          return (
            <button key={item.id} className="fz-nav-item" style={S.bnItem(active)} onClick={() => setTab(item.id)}>
              <div style={{
                width:30, height:30, borderRadius:10,
                background: active
                  ? 'linear-gradient(135deg,#FFF1F0,#FFE4E4)'
                  : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: active ? 'scale(1.08)' : 'scale(1)',
                boxShadow: active ? '0 2px 8px rgba(226,75,74,0.2)' : 'none',
              }}>
                <span style={{ fontSize:19, filter: active ? 'none' : 'grayscale(20%)' }}>{item.icon(active)}</span>
              </div>
              <span style={{ fontSize:10, fontWeight: active ? 800 : 500, color: active ? DS.primary : DS.textMuted, letterSpacing:0.1, transition:'color 0.15s' }}>{item.label}</span>
              {active && <div style={{ width:18, height:3, borderRadius:2, background:'linear-gradient(90deg,#E24B4A,#FF6B6A)', animation:'badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1)' }} />}
            </button>
          )
        })}
        {supportUnreadCount > 0 && (
          <button className="fz-nav-item" style={S.bnItem(false)} onClick={handleOpenSupportChat}>
            <div style={{ position:'relative', width:30, height:30, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:19 }}>🎧</span>
              <div className="fz-badge-pop" style={{ position:'absolute', top:-2, right:-2, background:DS.primary, color:'#fff', borderRadius:'50%', width:15, height:15, fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff', boxShadow:'0 2px 6px rgba(226,75,74,0.5)', animation:'statusGlow 2s ease infinite' }}>{supportUnreadCount}</div>
            </div>
            <span style={{ fontSize:10, color:DS.primary, fontWeight:700 }}>Support</span>
          </button>
        )}
      </div>

      {showBill && billOrder && (
        <UserBill order={billOrder} onClose={() => { setShowBill(false); setBillOrder(null) }} />
      )}

      {showCancelConfirm && orderToCancel && (
        <CancelConfirmModal order={orderToCancel} onConfirm={handleCancelOrder} onClose={() => { setShowCancelConfirm(false); setOrderToCancel(null) }} loading={cancellingOrder} />
      )}

      {showMap && userLat && userLng && (
        <MapModal userLat={userLat} userLng={userLng} vendors={vendors} onClose={() => setShowMap(false)} freeDeliveryToday={freeDeliveryToday} />
      )}

      {/* ── PRICE FILTER BOTTOM SHEET ── */}
      {showPriceSheet && selectedVendor && (
        <PriceFilterSheet
          onClose={() => setShowPriceSheet(false)}
          priceChip={priceChip}
          setPriceChip={setPriceChip}
          priceSort={priceSort}
          setPriceSort={setPriceSort}
          menuMaxPrice={menuItems.filter(i => i.available !== false).reduce((max, item) => {
            if (item.hasVariants && item.variants?.length) return Math.max(max, ...item.variants.map(v => v.price))
            return Math.max(max, item.price || 0)
          }, 100)}
          priceSliderMax={priceSliderMax}
          setPriceSliderMax={setPriceSliderMax}
        />
      )}

      {/* ══════════════════════════════════════
          ── (Floating download pill removed) ──
      ══════════════════════════════════════ */}

    </div>
  )
}
