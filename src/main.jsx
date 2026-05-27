import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import { LanguageProvider } from './i18n/LanguageContext'
import App from './App'
import './index.css'

// No BrowserRouter needed — App handles routing directly
ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <AuthProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Poppins, sans-serif', fontSize: '13px' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E24B4A', secondary: '#fff' } }
        }}
      />
    </AuthProvider>
  </LanguageProvider>
)
