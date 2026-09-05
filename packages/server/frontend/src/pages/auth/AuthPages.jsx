import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.07) 0%, transparent 60%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex justify-center mb-8">
          <span className="text-3xl font-black font-display" style={{ color: 'var(--color-text)' }}>
            pay<span style={{ color: 'var(--color-highlight)' }}>guard</span>
          </span>
        </Link>

        <div className="bg-card border border-surface rounded-2xl p-8">
          <h1 className="text-xl font-black font-display text-primary mb-1">{title}</h1>
          <p className="text-sm text-muted mb-8">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [loading, setLoading] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        await googleLogin(tokenResponse.access_token)
        toast.success('Welcome back!')
        window.location.href = "/dashboard"
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Google sign-in failed')
        console.error('Backend Google Auth Error:', err)
      } finally {
        setLoading(false)
      }
    },
    onError: (errorResponse) => {
      toast.error('Google Sign-In failed')
      console.error('Google Sign-In Error:', errorResponse)
    },
  })

  return (
    <AuthLayout
      title="Welcome to payguard "
      subtitle="Sign in or create an account with Google to get a free API key and start using the PayGuard API."
    >
      <div className="flex justify-center my-2">
        <button
          onClick={() => login()}
          disabled={loading}
          className="w-full flex items-center cursor-pointer hover:scale-97 justify-center gap-3 py-3 px-4 rounded-3xl bg-surface-alt border border-surface text-primary text-sm font-semibold transition-all duration-200 hover:border-[var(--color-highlight)] shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={20} />
          <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>
      </div>
    </AuthLayout>
  )
}