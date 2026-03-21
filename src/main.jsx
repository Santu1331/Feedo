import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import App from './App'
import './index.css'

// No BrowserRouter needed — App handles routing directly
ReactDOM.createRoot(document.getElementById('root')).render(
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
)
