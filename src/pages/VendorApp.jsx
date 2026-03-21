import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser, getVendorOrders, getMenuItems, updateOrderStatus, updateVendorStore, addMenuItem, updateMenuItem, deleteMenuItem } from '../firebase/services'
import toast from 'react-hot-toast'

const STATUS_NEXT = { pending:'accepted', accepted:'preparing', preparing:'ready', ready:'out_for_delivery', out_for_delivery:'delivered' }
const STATUS_LABEL = { pending:'Accept Order', accepted:'Start Preparing', preparing:'Mark Ready', ready:'Out for Delivery', out_for_delivery:'Mark Delivered' }

export default function VendorApp() {
  const { user, userData } = useAuth()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({ name:'', price:'', category:'Thali' })

  useEffect(() => {
    if (!user) return
    setIsOpen(userData?.isOpen || false)
    const u1 = getVendorOrders(user.uid, setOrders)
    const u2 = getMenuItems(user.uid, setMenuItems)
    return () => { u1(); u2() }
  }, [user, userData])

  const toggleStore = async () => {
    const val = !isOpen
    setIsOpen(val)
    await updateVendorStore(user.uid, { isOpen: val })
    toast.success(val ? '🟢 Store is now Open!' : '🔴 Store is now Closed')
  }

  const handleStatus = async (orderId, current) => {
    const next = STATUS_NEXT[current]
    if (!next) return
    await updateOrderStatus(orderId, next)
    toast.success(`Order → ${next.replace('_',' ')}`)
  }

  const handleReject = async (orderId) => {
    await updateOrderStatus(orderId, 'cancelled')
    toast.error('Order rejected')
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return toast.error('Fill name and price')
    if (isNaN(newItem.price) || Number(newItem.price) <= 0) return toast.error('Enter valid price')
    await addMenuItem(user.uid, { ...newItem, price: Number(newItem.price) })
    setNewItem({ name:'', price:'', category:'Thali' })
    setShowAddItem(false)
    toast.success('Item added to menu!')
  }

  const liveOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const pastOrders = orders.filter(o => ['delivered','cancelled'].includes(o.status))
  const todayRevenue = orders.filter(o => o.status==='delivered').reduce((s,o) => s+(o.total||0), 0)

  const inp = { width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', marginTop:4 }
  const sel = { ...inp, cursor:'pointer' }

  return (
    <div style={{ maxWidth:430, margin:'0 auto', background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'Poppins,sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#1a1a1a', padding:16, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{userData?.storeName || 'My Store'}</div>
            <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>Prep: {userData?.prepTime||20} min · {userData?.category||'Food'}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color: isOpen?'#4ade80':'#9ca3af' }}>{isOpen?'Open':'Closed'}</span>
            <div onClick={toggleStore} style={{ width:44, height:24, background: isOpen?'#16a34a':'#6b7280', borderRadius:12, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
              <div style={{ position:'absolute', width:18, height:18, background:'#fff', borderRadius:'50%', top:3, left: isOpen?23:3, transition:'left 0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display:'flex', background:'#111', overflowX:'auto', flexShrink:0 }}>
        {[
          { id:'orders', label:`Orders${liveOrders.length>0?` (${liveOrders.length})`:''}` },
          { id:'menu', label:'Menu' },
          { id:'earnings', label:'Earnings' },
          { id:'settings', label:'Settings' }
        ].map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)} style={{
            flexShrink:0, padding:'11px 16px', fontSize:12, fontWeight:500,
            color: tab===t2.id?'#E24B4A':'#888',
            borderBottom: tab===t2.id?'2px solid #E24B4A':'2px solid transparent',
            background:'transparent', border:'none',
            borderBottom: tab===t2.id?'2px solid #E24B4A':'2px solid transparent',
            cursor:'pointer', fontFamily:'Poppins', whiteSpace:'nowrap'
          }}>{t2.label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <>
            {liveOrders.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:32, fontSize:13 }}>No active orders right now</div>
            )}
            {liveOrders.map(order => (
              <div key={order.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>#{order.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{order.userName} · {order.userPhone}</div>
                    <div style={{ fontSize:11, color:'#6b7280' }}>📍 {order.address}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:10,
                    background: order.status==='pending'?'#fef3c7':'#dbeafe',
                    color: order.status==='pending'?'#92400e':'#1e40af'
                  }}>{order.status?.replace('_',' ')}</span>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>
                  {order.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}
                </div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:10 }}>₹{order.total} · COD</div>
                <div style={{ display:'flex', gap:8 }}>
                  {order.status === 'pending' && (
                    <button onClick={() => handleReject(order.id)} style={{ background:'transparent', color:'#E24B4A', border:'1px solid #E24B4A', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins' }}>
                      Reject
                    </button>
                  )}
                  {STATUS_NEXT[order.status] && (
                    <button onClick={() => handleStatus(order.id, order.status)} style={{ flex:1, background: order.status==='pending'?'#E24B4A':'#1a1a1a', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>
                      {STATUS_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {pastOrders.length > 0 && (
              <>
                <div style={{ fontSize:12, color:'#9ca3af', margin:'8px 0 6px', textTransform:'uppercase', letterSpacing:0.5 }}>Past Orders</div>
                {pastOrders.slice(0,10).map(order => (
                  <div key={order.id} style={{ background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:10, padding:12, marginBottom:8, opacity:0.7 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <div style={{ fontSize:12 }}>#{order.id.slice(-6).toUpperCase()} · {order.items?.length} item(s)</div>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10,
                        background: order.status==='delivered'?'#d1fae5':'#fee2e2',
                        color: order.status==='delivered'?'#065f46':'#991b1b'
                      }}>{order.status}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, marginTop:4 }}>₹{order.total}</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* MENU TAB */}
        {tab === 'menu' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:13, color:'#6b7280' }}>{menuItems.length} items in menu</span>
              <button onClick={() => setShowAddItem(!showAddItem)} style={{ background:'#E24B4A', color:'#fff', border:'none', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>
                + Add Item
              </button>
            </div>

            {showAddItem && (
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, padding:14, marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>New Menu Item</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input style={inp} placeholder="Item name *" value={newItem.name} onChange={e => setNewItem(p=>({...p,name:e.target.value}))} />
                  <input style={inp} type="number" placeholder="Price (₹) *" value={newItem.price} onChange={e => setNewItem(p=>({...p,price:e.target.value}))} />
                  <select style={sel} value={newItem.category} onChange={e => setNewItem(p=>({...p,category:e.target.value}))}>
                    {['Thali','Biryani','Chinese','Snacks','Drinks','Sweets','Roti','Rice'].map(c=><option key={c}>{c}</option>)}
                  </select>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleAddItem} style={{ flex:1, background:'#E24B4A', color:'#fff', border:'none', padding:10, borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>Add Item</button>
                    <button onClick={() => setShowAddItem(false)} style={{ flex:1, background:'transparent', color:'#6b7280', border:'1px solid #e5e7eb', padding:10, borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'Poppins' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {menuItems.length === 0 && !showAddItem && (
              <div style={{ textAlign:'center', color:'#9ca3af', padding:32, fontSize:13 }}>No items yet. Add your first menu item!</div>
            )}

            {menuItems.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>₹{item.price} · {item.category}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div onClick={() => updateMenuItem(user.uid, item.id, { available: !item.available })} style={{ width:40, height:22, background: item.available?'#16a34a':'#d1d5db', borderRadius:11, cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                    <div style={{ position:'absolute', width:16, height:16, background:'#fff', borderRadius:'50%', top:3, left: item.available?21:3, transition:'left 0.2s' }} />
                  </div>
                  <button onClick={() => { deleteMenuItem(user.uid, item.id); toast.success('Item deleted') }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#dc2626', padding:4 }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* EARNINGS TAB */}
        {tab === 'earnings' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:"Today's Sales", val:`₹${todayRevenue.toLocaleString()}`, sub:`${orders.filter(o=>o.status==='delivered').length} delivered` },
                { label:"Total Orders", val:orders.length, sub:`${liveOrders.length} active` },
                { label:"COD Collected", val:`₹${todayRevenue.toLocaleString()}`, sub:"pending settlement" },
                { label:"Menu Items", val:menuItems.length, sub:`${menuItems.filter(m=>m.available).length} available` }
              ].map(s => (
                <div key={s.label} style={{ background:'#f9fafb', borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontWeight:600 }}>{s.val}</div>
                  <div style={{ fontSize:10, color:'#16a34a', marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#f9fafb', borderRadius:10, padding:12 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Recent Delivered Orders</div>
              {orders.filter(o=>o.status==='delivered').slice(0,5).map(o => (
                <div key={o.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #e5e7eb' }}>
                  <span style={{ fontSize:12 }}>{o.userName} · {o.items?.length} item(s)</span>
                  <span style={{ fontSize:12, fontWeight:600 }}>₹{o.total}</span>
                </div>
              ))}
              {orders.filter(o=>o.status==='delivered').length === 0 && (
                <div style={{ fontSize:12, color:'#9ca3af', textAlign:'center', padding:16 }}>No delivered orders yet</div>
              )}
            </div>
          </>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'#f9fafb', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Store Info</div>
              {[
                { label:'Store Name', val:userData?.storeName },
                { label:'Email', val:userData?.email },
                { label:'Phone / WhatsApp', val:userData?.phone },
                { label:'Address', val:userData?.address },
                { label:'Category', val:userData?.category },
                { label:'Subscription Plan', val:userData?.plan }
              ].map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #e5e7eb' }}>
                  <span style={{ fontSize:12, color:'#6b7280' }}>{f.label}</span>
                  <span style={{ fontSize:12, fontWeight:500 }}>{f.val || '—'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => logoutUser()} style={{ width:'100%', background:'transparent', color:'#E24B4A', border:'1px solid #E24B4A', padding:12, borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Poppins', fontWeight:500 }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
