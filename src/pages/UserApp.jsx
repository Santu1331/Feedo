import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, getAllVendors, getMenuItems, placeOrder, getUserOrders } from '../firebase/services'
import toast from 'react-hot-toast'

const S = {
  shell: { maxWidth:430, margin:'0 auto', background:'#f7f7f7', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' },
  redHdr: { background:'#E24B4A', color:'#fff', padding:'16px', flexShrink:0 },
  // pageContent fills remaining space, bottom nav is fixed height
  pageContent: { flex:1, overflowY:'auto', paddingBottom:60 },
  bottomNav: { display:'flex', borderTop:'1px solid #e5e7eb', background:'#fff', flexShrink:0, position:'sticky', bottom:0, zIndex:100 },
  bnItem: () => ({ flex:1, padding:'10px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', border:'none', background:'transparent', fontFamily:'Poppins,sans-serif' }),
}

const CATEGORIES = ['All','Thali','Biryani','Chinese','Snacks','Juice','Sweets']

// Veg / Non-veg dot — Zomato style
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

export default function UserApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('home')
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [cartVendor, setCartVendor] = useState(null)
  const [orders, setOrders] = useState([])
  const [catFilter, setCatFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [lang, setLang] = useState('en')
  const [showCheckout, setShowCheckout] = useState(false)

  // Checkout fields
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryHostel, setDeliveryHostel] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const t = (en, mr) => lang === 'mr' ? mr : en

  useEffect(() => { return getAllVendors(setVendors) }, [])
  useEffect(() => { if (!user) return; return getUserOrders(user.uid, setOrders) }, [user])
  useEffect(() => {
    if (!selectedVendor) return
    return getMenuItems(selectedVendor.id, setMenuItems)
  }, [selectedVendor])

  // Auto-fill delivery details from profile
  useEffect(() => {
    if (userData) {
      setDeliveryName(userData.name || '')
      setDeliveryPhone(userData.mobile || '')
      setDeliveryAddress(userData.address || '')
    }
  }, [userData])

  const openVendor = (v) => { setSelectedVendor(v); setTab('vendor-menu') }

  const addToCart = (item) => {
    if (cartVendor && cartVendor.id !== selectedVendor.id) {
      toast.error('Clear cart first — items from ' + cartVendor.storeName)
      return
    }
    setCartVendor(selectedVendor)
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
    toast.success(item.name + ' added!')
  }

  const updateQty = (itemId, delta) => {
    setCart(prev => {
      const updated = prev.map(c => c.id === itemId ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0)
      if (updated.length === 0) setCartVendor(null)
      return updated
    })
  }

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const handlePlaceOrder = async () => {
    if (!deliveryName.trim()) return toast.error('Enter your name')
    if (!deliveryPhone.trim()) return toast.error('Enter phone number')
    if (!deliveryAddress.trim() && !deliveryHostel.trim()) return toast.error('Enter delivery address')
    try {
      const fullAddress = [
        deliveryHostel.trim(),
        deliveryAddress.trim(),
        deliveryNote.trim() ? `Note: ${deliveryNote.trim()}` : ''
      ].filter(Boolean).join(' · ')

      await placeOrder({
        userUid: user.uid,
        userName: deliveryName.trim(),
        userPhone: deliveryPhone.trim(),
        userEmail: user.email,
        vendorUid: cartVendor.id,
        vendorName: cartVendor.storeName,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal: cartTotal,
        deliveryFee: 30,
        total: cartTotal + 30,
        address: fullAddress,
        paymentMode: 'COD'
      })
      toast.success('🎉 Order placed successfully!')
      setCart([]); setCartVendor(null); setShowCheckout(false)
      setDeliveryNote(''); setDeliveryHostel('')
      setTab('orders')
    } catch {
      toast.error('Failed to place order. Try again.')
    }
  }

  // Search + filter
  const filteredVendors = vendors.filter(v => {
    const matchCat = catFilter === 'All' || v.category === catFilter
    const q = searchQuery.toLowerCase().trim()
    const matchSearch = !q ||
      v.storeName?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q) ||
      v.address?.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const inp = {
    width:'100%', padding:'11px 13px',
    borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb',
    borderRadius:9, fontSize:13,
    fontFamily:'Poppins,sans-serif', outline:'none',
    marginTop:6, boxSizing:'border-box', background:'#fff'
  }

  return (
    <div style={S.shell}>

      {/* ── HEADER ── */}
      <div style={S.redHdr}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:24, fontWeight:700, letterSpacing:-0.5 }}>{t('Feedo','फिडो')}</div>
            <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>Warananagar, Kolhapur</div>
          </div>
          <button onClick={() => setLang(l => l==='en'?'mr':'en')} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Poppins' }}>
            {lang==='en'?'मराठी':'English'}
          </button>
        </div>

        {(tab === 'home' || tab === 'vendor-menu') && (
          <div style={{ background:'#fff', borderRadius:10, display:'flex', alignItems:'center', gap:8, padding:'10px 14px', marginTop:12 }}>
            <span style={{ fontSize:16 }}>🔍</span>
            <input
              style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins', color:'#1f2937' }}
              placeholder={t('Search restaurants or food...','रेस्टॉरंट शोधा...')}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (tab==='vendor-menu') setTab('home') }}
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery('')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9ca3af', padding:0 }}>✕</button>
            )}
          </div>
        )}

        {tab === 'vendor-menu' && selectedVendor && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
            <button onClick={() => { setTab('home'); setSearchQuery('') }} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>← Back</button>
            <span style={{ fontSize:14, fontWeight:600 }}>{selectedVendor.storeName}</span>
            <span style={{ fontSize:11, background: selectedVendor.isOpen?'#16a34a':'#dc2626', color:'#fff', padding:'2px 8px', borderRadius:10 }}>
              {selectedVendor.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={S.pageContent}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <div style={{ background:'#fff', minHeight:'100%' }}>
            {searchQuery.trim() && (
              <div style={{ padding:'10px 16px 0', fontSize:12, color:'#6b7280' }}>
                {filteredVendors.length === 0 ? `No results for "${searchQuery}"` : `${filteredVendors.length} result${filteredVendors.length>1?'s':''} for "${searchQuery}"`}
              </div>
            )}
            {!searchQuery.trim() && (
              <div style={{ display:'flex', gap:8, padding:'12px 16px 4px', overflowX:'auto' }}>
                {CATEGORIES.map(c => (
                  <div key={c} onClick={() => setCatFilter(c)} style={{
                    flexShrink:0, background: catFilter===c?'#E24B4A':'#fff',
                    color: catFilter===c?'#fff':'#6b7280',
                    borderWidth:1, borderStyle:'solid', borderColor: catFilter===c?'#E24B4A':'#e5e7eb',
                    borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:500, cursor:'pointer'
                  }}>{c}</div>
                ))}
              </div>
            )}
            <div style={{ padding:'12px 16px 6px', fontSize:15, fontWeight:600, color:'#1f2937' }}>
              {searchQuery.trim() ? '🔍 Search Results' : t('Vendors Near You','तुमच्या जवळचे विक्रेते')}
            </div>
            {filteredVendors.length === 0 && !searchQuery.trim() && (
              <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>No vendors available yet</div>
            )}
            <div style={{ padding:'0 16px' }}>
              {filteredVendors.map(v => (
                <div key={v.id} onClick={() => openVendor(v)} style={{ background:'#fff', borderRadius:16, overflow:'hidden', marginBottom:16, cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', borderWidth:1, borderStyle:'solid', borderColor:'#f3f4f6' }}>
                  <div style={{ height:140, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
                    {v.photo
                      ? <img src={v.photo} alt={v.storeName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }}>
                          <span style={{ fontSize:40 }}>🍽️</span>
                          <span style={{ fontSize:11, color:'#E24B4A', fontWeight:500 }}>No photo yet</span>
                        </div>
                    }
                    <div style={{ position:'absolute', top:10, left:10, background:'#E24B4A', color:'#fff', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:600 }}>{v.category||'Food'}</div>
                    <div style={{ position:'absolute', top:10, right:10, background: v.isOpen?'#16a34a':'#dc2626', color:'#fff', fontSize:10, padding:'3px 8px', borderRadius:20, fontWeight:600 }}>{v.isOpen?'● Open':'● Closed'}</div>
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1f2937' }}>{v.storeName}</div>
                      <div style={{ background:'#f0fdf4', color:'#16a34a', fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:8 }}>⭐ {v.rating||4.5}</div>
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>{v.category}</div>
                    <div style={{ display:'flex', gap:12, marginTop:8 }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>🕐 {v.prepTime||20}-{(v.prepTime||20)+15} min</span>
                      <span style={{ fontSize:12, color:'#6b7280' }}>₹30 delivery</span>
                    </div>
                    {v.address && <div style={{ fontSize:11, color:'#9ca3af', marginTop:5 }}>📍 {v.address}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VENDOR MENU ── */}
        {tab === 'vendor-menu' && selectedVendor && (
          <div style={{ background:'#fff', minHeight:'100%' }}>
            <div style={{ height:160, position:'relative', background:'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
              {selectedVendor.photo
                ? <img src={selectedVendor.photo} alt={selectedVendor.storeName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:48 }}>🍽️</span></div>
              }
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
              <div style={{ position:'absolute', bottom:12, left:14, color:'#fff' }}>
                <div style={{ fontSize:16, fontWeight:700 }}>{selectedVendor.storeName}</div>
                <div style={{ fontSize:11, opacity:0.9 }}>{selectedVendor.category} · ⭐ {selectedVendor.rating||4.5}</div>
              </div>
            </div>
            <div style={{ padding:'10px 16px', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6', display:'flex', gap:16 }}>
              <span style={{ fontSize:12, color:'#6b7280' }}>🕐 {selectedVendor.prepTime||20}-{(selectedVendor.prepTime||20)+15} min</span>
              <span style={{ fontSize:12, color:'#6b7280' }}>₹30 delivery</span>
            </div>
            {!selectedVendor.isOpen && (
              <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 16px', fontSize:13 }}>⚠️ Store is currently closed.</div>
            )}
            <div style={{ padding:'8px 16px' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#9ca3af', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Menu</div>
              {menuItems.length === 0 && <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>No menu items yet</div>}
              {menuItems.filter(i => i.available).map(item => {
                const inCart = cart.find(c => c.id === item.id)
                return (
                  <div key={item.id} style={{ display:'flex', gap:12, padding:'14px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f7f7f7', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      {/* ── VEG / NON-VEG DOT ── */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <VegDot isVeg={item.isVeg !== false} />
                        <span style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{item.name}</span>
                      </div>
                      {item.description && (
                        <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4, lineHeight:1.5 }}>{item.description}</div>
                      )}
                      <div style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>₹{item.price}</div>
                    </div>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:90, height:90, borderRadius:12, overflow:'hidden', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {item.photo
                          ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <span style={{ fontSize:28 }}>🍛</span>
                        }
                      </div>
                      <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)' }}>
                        {inCart ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', borderRadius:20, padding:'4px 10px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                            <button onClick={() => updateQty(item.id,-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16, fontWeight:700, padding:0, lineHeight:1 }}>−</button>
                            <span style={{ fontSize:12, fontWeight:700, color:'#E24B4A', minWidth:14, textAlign:'center' }}>{inCart.qty}</span>
                            <button onClick={() => addToCart(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E24B4A', fontSize:16, fontWeight:700, padding:0, lineHeight:1 }}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)} style={{ background:'#fff', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:'5px 18px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Poppins', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>ADD</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── CART ── */}
        {tab === 'cart' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>
              {t('Your Cart','तुमची कार्ट')} {cartVendor && `· ${cartVendor.storeName}`}
            </div>
            {cart.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>Cart is empty. Browse vendors!</div>
            )}
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>₹{item.price} each</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => updateQty(item.id,-1)} style={{ width:28, height:28, borderRadius:'50%', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', background:'transparent', color:'#E24B4A', cursor:'pointer', fontSize:16 }}>-</button>
                  <span style={{ fontSize:13, fontWeight:600, minWidth:16, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id,1)} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'#E24B4A', color:'#fff', cursor:'pointer', fontSize:16 }}>+</button>
                </div>
                <div style={{ fontSize:13, fontWeight:600, minWidth:48, textAlign:'right' }}>₹{item.price * item.qty}</div>
              </div>
            ))}

            {cart.length > 0 && !showCheckout && (
              <>
                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, margin:'12px 0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:12 }}>₹{cartTotal}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee</span><span style={{ fontSize:12 }}>₹30</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb', paddingTop:8 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Total</span><span style={{ fontSize:14, fontWeight:600 }}>₹{cartTotal + 30}</span>
                  </div>
                </div>
                <button onClick={() => setShowCheckout(true)} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                  Proceed to Checkout · ₹{cartTotal + 30}
                </button>
              </>
            )}

            {/* ── CHECKOUT ── */}
            {cart.length > 0 && showCheckout && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:14, color:'#1f2937' }}>🚚 Delivery Details</div>

                {/* Name */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Your Name *</label>
                  <input style={inp} placeholder="Full name" value={deliveryName} onChange={e => setDeliveryName(e.target.value)} />
                </div>

                {/* Phone */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Phone Number *</label>
                  <div style={{ position:'relative', marginTop:6 }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#6b7280', pointerEvents:'none' }}>+91</span>
                    <input
                      style={{ ...inp, marginTop:0, paddingLeft:44 }}
                      placeholder="Mobile number"
                      value={deliveryPhone}
                      onChange={e => setDeliveryPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                    />
                  </div>
                </div>

                {/* Hostel */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Hostel / Building Name</label>
                  <input style={inp} placeholder="e.g. Hostel B, Men's Hostel, Flat No..." value={deliveryHostel} onChange={e => setDeliveryHostel(e.target.value)} />
                </div>

                {/* Address */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Room / Full Address *</label>
                  <input style={inp} placeholder="e.g. Room 204, Near Gate..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                </div>

                {/* Note */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Order Note (optional)</label>
                  <textarea
                    style={{ ...inp, minHeight:60, resize:'none', lineHeight:1.5 }}
                    placeholder="e.g. Less spicy, extra roti, call on arrival..."
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                  />
                </div>

                {/* Bill summary */}
                <div style={{ background:'#f9fafb', borderRadius:10, padding:12, marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Subtotal</span><span style={{ fontSize:12 }}>₹{cartTotal}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#6b7280' }}>Delivery fee</span><span style={{ fontSize:12 }}>₹30</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', borderTopWidth:1, borderTopStyle:'solid', borderTopColor:'#e5e7eb', paddingTop:8 }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>Total</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#E24B4A' }}>₹{cartTotal + 30}</span>
                  </div>
                </div>

                <div style={{ background:'#fef3c7', borderRadius:9, padding:'10px 12px', fontSize:12, color:'#78350f', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                  💵 Payment: <strong>Cash on Delivery (COD)</strong>
                </div>

                <button onClick={handlePlaceOrder} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:8 }}>
                  🎉 Place Order · ₹{cartTotal + 30}
                </button>
                <button onClick={() => setShowCheckout(false)} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:11, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>
                  ← Back to Cart
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>{t('My Orders','माझे ऑर्डर')}</div>
            {orders.length === 0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>No orders yet. Order something delicious!</div>}
            {orders.map(o => (
              <div key={o.id} style={{ background:'#fff', borderWidth:1, borderStyle:'solid', borderColor:'#e5e7eb', borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{o.vendorName}</div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:10,
                    background: o.status==='delivered'?'#d1fae5':o.status==='cancelled'?'#fee2e2':o.status==='preparing'?'#dbeafe':'#fef3c7',
                    color: o.status==='delivered'?'#065f46':o.status==='cancelled'?'#991b1b':o.status==='preparing'?'#1e40af':'#92400e'
                  }}>{o.status?.replace('_',' ')}</span>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>{o.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>₹{o.total}</span>
                  <span style={{ fontSize:11, color:'#9ca3af' }}>{o.createdAt?.toDate?.()?.toLocaleDateString('en-IN')||''}</span>
                </div>
                {o.address && <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>📍 {o.address}</div>}
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div style={{ padding:16, background:'#fff', minHeight:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#E24B4A,#ff6b6a)', borderRadius:16, padding:'24px 20px', marginBottom:16, textAlign:'center', color:'#fff' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, margin:'0 auto 10px', borderWidth:3, borderStyle:'solid', borderColor:'rgba(255,255,255,0.4)' }}>
                {userData?.name ? userData.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '👤'}
              </div>
              <div style={{ fontSize:18, fontWeight:700 }}>{userData?.name || 'FeedoZone User'}</div>
              <div style={{ fontSize:12, opacity:0.85, marginTop:3 }}>{user?.email}</div>
            </div>
            <div style={{ background:'#fafafa', borderRadius:12, padding:'4px 16px', marginBottom:16 }}>
              {[
                { icon:'👤', label:'Full Name',   value: userData?.name },
                { icon:'📧', label:'Email',        value: userData?.email || user?.email },
                { icon:'📱', label:'Mobile',       value: userData?.mobile ? `+91 ${userData.mobile}` : null },
                { icon:'🏠', label:'Address',      value: userData?.address },
                { icon:'📍', label:'City / Area',  value: userData?.city },
                { icon:'🎓', label:'College',      value: userData?.college },
                { icon:'📮', label:'Pincode',      value: userData?.pincode },
                { icon:'📅', label:'Member Since', value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : null },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottomWidth:1, borderBottomStyle:'solid', borderBottomColor:'#f3f4f6' }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{row.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:'#9ca3af', marginBottom:1 }}>{row.label}</div>
                    <div style={{ fontSize:13, color: row.value?'#1f2937':'#d1d5db', fontWeight: row.value?500:400 }}>{row.value || 'Not added'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#374151' }}>🌐 Language</span>
              <button onClick={() => setLang(l => l==='en'?'mr':'en')} style={{ background:'#FCEBEB', color:'#A32D2D', border:'none', padding:'5px 12px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>
                {lang==='en'?'Switch to Marathi':'English वर जा'}
              </button>
            </div>
            <div style={{ background:'#f5f3ff', borderRadius:12, padding:'12px 14px', borderWidth:1, borderStyle:'solid', borderColor:'#ddd6fe', display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <span style={{ fontSize:22 }}>🏪</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#6d28d9' }}>Want to sell on FeedoZone?</div>
                <div style={{ fontSize:11, color:'#7c3aed' }}>Register as a vendor partner</div>
              </div>
              <button onClick={() => window.open('https://forms.gle/1arTekd59tidriKcA','_blank')} style={{ padding:'7px 12px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap' }}>Join Now</button>
            </div>
            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', borderWidth:1, borderStyle:'solid', borderColor:'#E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Cart bar — above bottom nav */}
      {cart.length > 0 && (tab === 'home' || tab === 'vendor-menu') && (
        <div onClick={() => setTab('cart')} style={{ background:'#E24B4A', color:'#fff', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', flexShrink:0 }}>
          <span style={{ fontSize:13 }}>{cartCount} item{cartCount>1?'s':''} · ₹{cartTotal}</span>
          <strong style={{ fontSize:14 }}>View Cart →</strong>
        </div>
      )}

      {/* ── BOTTOM NAV — sticky, never overlaps ── */}
      <div style={S.bottomNav}>
        {[
          { id:'home',    icon:'🏠', label:t('Home','मुख्यपृष्ठ') },
          { id:'orders',  icon:'📋', label:t('Orders','ऑर्डर') },
          { id:'cart',    icon:'🛒', label:`${t('Cart','कार्ट')}${cartCount>0?` (${cartCount})`:''}` },
          { id:'profile', icon:'👤', label:t('Profile','प्रोफाइल') }
        ].map(item => (
          <button key={item.id} style={S.bnItem()} onClick={() => setTab(item.id)}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:10, color: tab===item.id?'#E24B4A':'#6b7280', fontWeight: tab===item.id?600:400 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}