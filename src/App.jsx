import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import UserApp from './pages/UserApp'
import VendorApp from './pages/VendorApp'
import FounderApp from './pages/FounderApp'
import FounderLoginPage from './pages/FounderLoginPage'
import ManagerApp from './pages/ManagerApp'
import ManagerLoginPage from './pages/ManagerLoginPage'
import PrivacyPolicy from './pages/privacy-policy'
import DeleteAccount from './pages/delete-account'
import FounderProfile from './pages/FounderProfile'
import WikiFeedozone from './pages/WikiFeedozone'
import WikiSantosh from './pages/WikiSantosh'
import { FeedozonePill } from './components/FeedozoneLogo'

export default function App() {
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const path = window.location.pathname

    if (path === '/founder-login') return
    if (path === '/manager-login') return
    if (path === '/privacy-policy') return
    if (path === '/delete-account') return
    if (path === '/founder-profile') return
    if (path === '/wiki') return
    if (path === '/wiki/santosh-sangnod') return

    if (!user) {
      if (path !== '/login') window.location.replace('/login')
      return
    }

    const role = userData?.role
    if (role === 'founder' && !path.startsWith('/founder')) {
      window.location.replace('/founder')
    } else if (role === 'manager' && !path.startsWith('/manager')) {
      window.location.replace('/manager')
    } else if (role === 'vendor' && !path.startsWith('/vendor')) {
      window.location.replace('/vendor')
    } else if (role === 'user' && !path.startsWith('/home')) {
      window.location.replace('/home')
    } else if (!role && path !== '/login') {
      window.location.replace('/login')
    }
  }, [loading, user, userData])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'Poppins,sans-serif', background:'#FAFAFA' }}>
      <FeedozonePill size="lg" style={{ marginBottom:28, animation:'splashPulse 2s ease-in-out infinite' }} />
      <div style={{ width:36, height:36, border:'3px solid #FECACA', borderTopColor:'#E24B4A', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <div style={{ fontSize:12, color:'#9CA3AF', marginTop:14, fontWeight:500 }}>Loading FeedoZone...</div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes splashPulse {
          0%,100% { transform: scale(1);    box-shadow: 0 6px 24px rgba(226,75,74,0.45); }
          50%     { transform: scale(1.04); box-shadow: 0 10px 32px rgba(226,75,74,0.65); }
        }
      `}</style>
    </div>
  )

  const path = window.location.pathname

  if (path === '/privacy-policy') return <PrivacyPolicy />
  if (path === '/delete-account') return <DeleteAccount />
  if (path === '/founder-login') return <FounderLoginPage />
  if (path === '/manager-login') return <ManagerLoginPage />
  if (path === '/founder-profile') return <FounderProfile />
  if (path === '/wiki') return <WikiFeedozone />
  if (path === '/wiki/santosh-sangnod') return <WikiSantosh />

  if (!user || path === '/login') return <LoginPage />

  const role = userData?.role
  if (role === 'founder' && path.startsWith('/founder')) return <FounderApp />
  if (role === 'manager' && path.startsWith('/manager')) return <ManagerApp />
  if (role === 'vendor' && path.startsWith('/vendor')) return <VendorApp />
  if (role === 'user' && path.startsWith('/home')) return <UserApp />

  return <LoginPage />
}