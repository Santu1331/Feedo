import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import UserApp from './pages/UserApp'
import VendorApp from './pages/VendorApp'
import FounderApp from './pages/FounderApp'
import FounderLoginPage from './pages/FounderLoginPage'
import PrivacyPolicy from './pages/privacy-policy'
import DeleteAccount from './pages/delete-account'

export default function App() {
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const path = window.location.pathname

    // ← ADD THIS: don't redirect away from founder-login page
    if (path === '/founder-login') return
    if (path === '/privacy-policy') return
    if (path === '/delete-account') return

    if (!user) {
      if (path !== '/login') window.location.replace('/login')
      return
    }

    const role = userData?.role
    if (role === 'founder' && !path.startsWith('/founder')) {
      window.location.replace('/founder')
    } else if (role === 'vendor' && !path.startsWith('/vendor')) {
      window.location.replace('/vendor')
    } else if (role === 'user' && !path.startsWith('/home')) {
      window.location.replace('/home')
    } else if (!role && path !== '/login') {
      window.location.replace('/login')
    }
  }, [loading, user, userData])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'Poppins,sans-serif' }}>
      <div style={{ fontSize:28, fontWeight:700, color:'#E24B4A', marginBottom:16 }}>Feedo</div>
      <div style={{ width:32, height:32, border:'3px solid #FCEBEB', borderTopColor:'#E24B4A', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const path = window.location.pathname

  // ← ADD THIS: show founder login page at /founder-login
  if (path === '/privacy-policy') return <PrivacyPolicy />
  if (path === '/delete-account') return <DeleteAccount />
  if (path === '/founder-login') return <FounderLoginPage />

  if (!user || path === '/login') return <LoginPage />

  const role = userData?.role
  if (role === 'founder' && path.startsWith('/founder')) return <FounderApp />
  if (role === 'vendor' && path.startsWith('/vendor')) return <VendorApp />
  if (role === 'user' && path.startsWith('/home')) return <UserApp />

  return <LoginPage />
}