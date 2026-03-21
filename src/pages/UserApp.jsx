import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, getAllVendors, getMenuItems, placeOrder, getUserOrders } from '../firebase/services'
import toast from 'react-hot-toast'

const S = {
  shell: { maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' },
  redHdr: { background:'#E24B4A', color:'#fff', padding:'16px', flexShrink:0 },
  pageContent: { flex:1, overflowY:'auto' },
  bottomNav: { display:'flex', borderTop:'1px solid #e5e7eb', background:'#fff', flexShrink:0 },
  bnItem: (active) => ({ flex:1, padding:'10px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', border:'none', background:'transparent', fontFamily:'Poppins,sans-serif' }),
  card: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden', marginBottom:12, cursor:'pointer' },
  badge: (color) => ({ background:color==='green'?'#d1fae5':color==='red'?'#fee2e2':'#fef3c7', color:color==='green'?'#065f46':color==='red'?'#991b1b':'#92400e', fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:10 }),
}

const STATUS_NEXT = { pending:'accepted', accepted:'preparing', preparing:'ready', ready:'out_for_delivery', out_for_delivery:'delivered' }
const CATEGORIES = ['All','Thali','Biryani','Chinese','Snacks','Juice','Sweets']

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
  const [lang, setLang] = useState('en')
  const [address, setAddress] = useState('')
  const [hostel, setHostel] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)

  const t = (en, mr) => lang === 'mr' ? mr : en

  useEffect(() => { return getAllVendors(setVendors) }, [])
  useEffect(() => { if (!user) return; return getUserOrders(user.uid, setOrders) }, [user])
  useEffect(() => {
    if (!selectedVendor) return
    return getMenuItems(selectedVendor.id, setMenuItems)
  }, [selectedVendor])

  const openVendor = (v) => { setSelectedVendor(v); setTab('vendor-menu') }

  const addToCart = (item) => {
    if (cartVendor && cartVendor.id !== selectedVendor.id) {
      toast.error('Clear cart first — you already have items from ' + cartVendor.storeName)
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
    if (!address && !hostel) return toast.error('Enter delivery address or hostel')
    try {
      await placeOrder({
        userUid: user.uid,
        userName: userData?.name || user.email.split('@')[0],
        userPhone: userData?.phone || '',
        userEmail: user.email,
        vendorUid: cartVendor.id,
        vendorName: cartVendor.storeName,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal: cartTotal,
        deliveryFee: 30,
        total: cartTotal + 30,
        address: hostel ? `${hostel} — ${address}` : address,
        paymentMode: 'COD'
      })
      toast.success('🎉 Order placed successfully!')
      setCart([]); setCartVendor(null); setShowCheckout(false)
      setAddress(''); setHostel('')
      setTab('orders')
    } catch (err) {
      toast.error('Failed to place order. Try again.')
    }
  }

  const filteredVendors = vendors.filter(v =>
    catFilter === 'All' || v.category === catFilter
  )

  const inp = { width:'100%', padding:'11px 13px', border:'1px solid #e5e7eb', borderRadius:9, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:6 }

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
            <input style={{ border:'none', outline:'none', fontSize:14, flex:1, fontFamily:'Poppins' }} placeholder={t('Search restaurants or food...','रेस्टॉरंट शोधा...')} />
          </div>
        )}
        {tab === 'vendor-menu' && selectedVendor && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
            <button onClick={() => setTab('home')} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>← Back</button>
            <span style={{ fontSize:14, fontWeight:600 }}>{selectedVendor.storeName}</span>
            <span style={{ fontSize:11, background: selectedVendor.isOpen?'#16a34a':'#dc2626', color:'#fff', padding:'2px 8px', borderRadius:10 }}>
              {selectedVendor.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={S.pageContent}>

        {/* HOME */}
        {tab === 'home' && (
          <div>
            <div style={{ display:'flex', gap:8, padding:'12px 16px 4px', overflowX:'auto' }}>
              {CATEGORIES.map(c => (
                <div key={c} onClick={() => setCatFilter(c)} style={{
                  flexShrink:0, background: catFilter===c?'#E24B4A':'#FCEBEB',
                  color: catFilter===c?'#fff':'#A32D2D',
                  border:'1px solid #F7C1C1', borderRadius:20,
                  padding:'6px 14px', fontSize:12, fontWeight:500, cursor:'pointer'
                }}>{c}</div>
              ))}
            </div>
            <div style={{ padding:'12px 16px 4px', fontSize:15, fontWeight:600 }}>{t('Vendors Near You','तुमच्या जवळचे विक्रेते')}</div>
            {filteredVendors.length === 0 && (
              <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>No vendors available yet</div>
            )}
            <div style={{ padding:'0 16px' }}>
              {filteredVendors.map(v => (
                <div key={v.id} style={S.card} onClick={() => openVendor(v)}>
                  <div style={{ height:80, background:'linear-gradient(135deg,#fee2e2,#fecaca)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    <span style={{ fontSize:36 }}>🍽️</span>
                    <span style={{ position:'absolute', top:8, left:8, background:'#E24B4A', color:'#fff', fontSize:10, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>{v.category || 'Food'}</span>
                    <span style={{ position:'absolute', top:8, right:8, background: v.isOpen?'#16a34a':'#dc2626', color:'#fff', fontSize:9, padding:'2px 6px', borderRadius:10 }}>
                      {v.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1f2937' }}>{v.storeName}</div>
                    <div style={{ display:'flex', gap:10, marginTop:4 }}>
                      <span style={{ fontSize:11, color:'#f59e0b' }}>⭐ {v.rating || 4.5}</span>
                      <span style={{ fontSize:11, color:'#6b7280' }}>{v.prepTime || 20}-{(v.prepTime||20)+15} min</span>
                      <span style={{ fontSize:11, color:'#6b7280' }}>₹30 delivery</span>
                    </div>
                    {v.address && <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>📍 {v.address}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height:80 }} />
          </div>
        )}

        {/* VENDOR MENU */}
        {tab === 'vendor-menu' && selectedVendor && (
          <div style={{ padding:'0 16px 80px' }}>
            <div style={{ padding:'12px 0 4px', fontSize:13, color:'#6b7280' }}>
              {selectedVendor.address} · Prep {selectedVendor.prepTime || 20} min
            </div>
            {!selectedVendor.isOpen && (
              <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:10, fontSize:13, margin:'8px 0' }}>
                ⚠️ This store is currently closed. You can still browse the menu.
              </div>
            )}
            {menuItems.length === 0 && (
              <div style={{ textAlign:'center', padding:40, color:'#9ca3af', fontSize:13 }}>No menu items added yet</div>
            )}
            {menuItems.filter(i => i.available).map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{item.category}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#E24B4A', marginTop:2 }}>₹{item.price}</div>
                </div>
                {(() => {
                  const inCart = cart.find(c => c.id === item.id)
                  return inCart ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={() => updateQty(item.id,-1)} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid #E24B4A', background:'transparent', color:'#E24B4A', cursor:'pointer', fontSize:16, fontWeight:600 }}>-</button>
                      <span style={{ fontSize:13, fontWeight:600, minWidth:16, textAlign:'center' }}>{inCart.qty}</span>
                      <button onClick={() => addToCart(item)} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'#E24B4A', color:'#fff', cursor:'pointer', fontSize:16, fontWeight:600 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} style={{ background:'#E24B4A', color:'#fff', border:'none', padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                      ADD
                    </button>
                  )
                })()}
              </div>
            ))}
          </div>
        )}

        {/* CART */}
        {tab === 'cart' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>
              {t('Your Cart','तुमची कार्ट')} {cartVendor && `· ${cartVendor.storeName}`}
            </div>
            {cart.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>
                Cart is empty. Browse vendors to add items!
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f3f4f6' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>₹{item.price} each</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => updateQty(item.id,-1)} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid #E24B4A', background:'transparent', color:'#E24B4A', cursor:'pointer', fontSize:16 }}>-</button>
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
                  <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid #e5e7eb', paddingTop:8 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Total</span><span style={{ fontSize:14, fontWeight:600 }}>₹{cartTotal + 30}</span>
                  </div>
                </div>
                <button onClick={() => setShowCheckout(true)} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins' }}>
                  Proceed to Checkout · ₹{cartTotal + 30}
                </button>
              </>
            )}

            {cart.length > 0 && showCheckout && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Delivery Details</div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Hostel Name</label>
                  <input style={inp} placeholder="e.g. Hostel B, Men's Hostel..." value={hostel} onChange={e => setHostel(e.target.value)} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Room Number / Address</label>
                  <input style={inp} placeholder="e.g. Room 204 or Full address" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div style={{ background:'#fef3c7', borderRadius:9, padding:'10px 12px', fontSize:12, color:'#78350f', marginBottom:12 }}>
                  💵 Payment: <strong>Cash on Delivery (COD)</strong>
                </div>
                <button onClick={handlePlaceOrder} style={{ width:'100%', background:'#E24B4A', color:'#fff', border:'none', padding:14, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Poppins', marginBottom:8 }}>
                  🎉 Place Order · ₹{cartTotal + 30}
                </button>
                <button onClick={() => setShowCheckout(false)} style={{ width:'100%', background:'transparent', color:'#E24B4A', border:'1px solid #E24B4A', padding:11, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>
                  Back to Cart
                </button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>{t('My Orders','माझे ऑर्डर')}</div>
            {orders.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:40, fontSize:13 }}>No orders yet. Order something delicious!</div>
            )}
            {orders.map(o => (
              <div key={o.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{o.vendorName}</div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:10,
                    background: o.status==='delivered'?'#d1fae5':o.status==='cancelled'?'#fee2e2':o.status==='preparing'?'#dbeafe':'#fef3c7',
                    color: o.status==='delivered'?'#065f46':o.status==='cancelled'?'#991b1b':o.status==='preparing'?'#1e40af':'#92400e'
                  }}>{o.status?.replace('_',' ')}</span>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>
                  {o.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>₹{o.total}</span>
                  <span style={{ fontSize:11, color:'#9ca3af' }}>
                    {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || ''}
                  </span>
                </div>
                {o.address && <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>📍 {o.address}</div>}
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div style={{ padding:16 }}>
            <div style={{ textAlign:'center', padding:'20px 0 16px' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px' }}>👤</div>
              <div style={{ fontSize:16, fontWeight:600 }}>{userData?.name || 'User'}</div>
              <div style={{ fontSize:13, color:'#6b7280' }}>{user?.email}</div>
            </div>
            <div style={{ background:'#f9fafb', borderRadius:10, padding:12, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13 }}>Language</span>
                <button onClick={() => setLang(l => l==='en'?'mr':'en')} style={{ background:'#FCEBEB', color:'#A32D2D', border:'none', padding:'5px 12px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>
                  {lang==='en'?'Switch to Marathi':'English वर जा'}
                </button>
              </div>
            </div>
            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', border:'1px solid #E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (tab === 'home' || tab === 'vendor-menu') && (
        <div onClick={() => setTab('cart')} style={{ background:'#E24B4A', color:'#fff', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', flexShrink:0 }}>
          <span style={{ fontSize:13 }}>{cartCount} item{cartCount>1?'s':''} · ₹{cartTotal}</span>
          <strong style={{ fontSize:14 }}>View Cart →</strong>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={S.bottomNav}>
        {[
          { id:'home', icon:'🏠', label:t('Home','मुख्यपृष्ठ') },
          { id:'orders', icon:'📋', label:t('Orders','ऑर्डर') },
          { id:'cart', icon:'🛒', label:`${t('Cart','कार्ट')}${cartCount>0?` (${cartCount})`:''}` },
          { id:'profile', icon:'👤', label:t('Profile','प्रोफाइल') }
        ].map(item => (
          <button key={item.id} style={S.bnItem(tab===item.id)} onClick={() => setTab(item.id)}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:10, color: tab===item.id?'#E24B4A':'#6b7280', fontWeight:500 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
