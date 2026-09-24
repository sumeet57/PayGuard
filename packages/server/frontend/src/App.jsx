import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'


// import AuthPage from './pages/auth/AuthPages'
// import {
//   DashboardPages
// } from './pages/dashboard/DashboardPages'


// // oauth2 imports
// import { GoogleOAuthProvider } from '@react-oauth/google'
// import TermsAndConditions from './pages/policies/TermsAndConditions'
// import PrivacyStatement from './pages/policies/PrivacyStatement'
// import RefundPolicy from './pages/policies/RefundPolicy'
// import Contact from './pages/policies/Contact'
// import Shipping from './pages/policies/Shipping'
// import About from './pages/policies/About'

function ToastWrapper() {
  const { isDark } = useTheme()
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3500}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      theme={isDark ? 'dark' : 'light'}
      toastStyle={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '13px',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        color: 'var(--color-text)',
      }}
    />
  )
}

const clientid = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>

        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route path="/" element={<HomePage />} />



              <Route path="*" element={<HomePage />} />
            </Route>


          </Routes>
          <ToastWrapper />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>

  )
}