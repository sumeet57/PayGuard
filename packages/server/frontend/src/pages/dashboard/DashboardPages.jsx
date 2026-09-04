import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGrid, FiUser, FiKey, FiLogOut, FiPlus, FiTrash2, FiCopy, FiCheckCircle, FiLock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { keyAPI, userAPI } from '../../api/services'
import { Button, Input, Spinner, EmptyState } from '../../components/common/UI'

const sidebarLinks = [
  { to: '/dashboard', end: true, icon: FiGrid, label: 'Overview' },
  { to: '/dashboard/api-keys', icon: FiKey, label: 'API Keys' },
  { to: '/dashboard/profile', icon: FiUser, label: 'Profile' },
]

export function DashboardLayout() {
  const { isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={32} /></div>
  if (!isAuthenticated) return <Navigate to="/auth/login" state={{ from: { pathname: '/dashboard' } }} replace />

  const handleLogout = async () => {
    await logout()
    navigate('/')
    toast.info('Logged out.')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 flex-shrink-0">
          <nav className="flex md:flex-col gap-1">
            {sidebarLinks.map(({ to, end, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-mono transition-all ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-muted hover:text-primary hover:bg-surface-alt'
                  }`
                }
                style={({ isActive }) => isActive ? { backgroundColor: 'var(--color-highlight)' } : {}}
              >
                <Icon size={15} />
                <span className="hidden sm:block">{label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-mono text-muted hover:text-red-400 hover:bg-surface-alt transition-all md:mt-4"
            >
              <FiLogOut size={15} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function DashboardOverview() {
  const { user } = useAuth()
  const [keysCount, setKeysCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchStats = async () => {
      try {
        const res = await keyAPI.getAll()
        if (isMounted) {
          setKeysCount(res.data.keys?.length || res.data?.length || 0)
        }
      } catch {
        // Silent catch for overview panel
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchStats()
    return () => { isMounted = false }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-black font-display text-primary mb-6">
        Hey, {user?.name?.split(' ')[0]} 👋
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-surface rounded-xl p-5">
          <div className="text-2xl font-black font-mono text-accent mb-1">
            {loading ? <Spinner size={20} /> : `${keysCount} / 5`}
          </div>
          <div className="text-xs text-muted">Active API Keys</div>
        </div>
        <div className="bg-card border border-surface rounded-xl p-5">
          <div className="text-2xl font-black font-mono text-accent mb-1">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
          </div>
          <div className="text-xs text-muted">Member since</div>
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardApiKeys() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyLabel, setKeyLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null)

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true)
      const res = await keyAPI.getAll()
    
      setKeys(res.data.keys || res.data || [])
    } catch {
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleCreateKey = async (e) => {
    e.preventDefault()
    if (!keyLabel.trim()) {
      toast.error('Label is required')
      return
    }
    setCreating(true)
    try {
      const res = await keyAPI.create({ label: keyLabel })
      toast.success('API Key generated!')
      setNewlyCreatedKey(res.data.data?.key || res.data?.key)
      setKeyLabel('')
      fetchKeys()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = async (id) => {
    try {
      await keyAPI.delete(id)
      toast.success('API Key deleted')
      setKeys(prev => prev.filter(k => k._id !== id))
    } catch {
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.info('Copied to clipboard!')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h2 className="text-xl font-black font-display text-primary mb-6">API Keys</h2>
        
        <form onSubmit={handleCreateKey} className="bg-card border border-surface rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Key Label"
                placeholder="e.g. Production Backend"
                value={keyLabel}
                onChange={e => setKeyLabel(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              loading={creating} 
              disabled={keys.length >= 5}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <FiPlus size={16} /> Generate Key
            </Button>
          </div>
          {keys.length >= 5 && (
            <p className="text-xs text-red-400 mt-2 font-mono">
              Maximum limit reached (5/5 keys). Delete an existing key to generate a new one.
            </p>
          )}
        </form>

        {newlyCreatedKey && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
              <FiCheckCircle /> Save your API key now. 
            </p>
            <div className="flex items-center justify-between gap-2 mt-2">
              <code className="text-sm font-mono break-all text-primary">{newlyCreatedKey}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(newlyCreatedKey)}>
                <FiCopy size={14} />
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <Spinner size={28} />
        ) : keys.length === 0 ? (
          <EmptyState icon="🔑" title="No API keys" description="Generate a key to access API services." />
        ) : (
          <div className="space-y-3">
           {keys.map((key) => (
  <div key={key._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-surface rounded-xl gap-4">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="font-bold text-primary text-sm">{key.label}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${key.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {key.valid ? 'Active' : 'Disabled'}
        </span>
      </div>
      
      {/* Key Display */}
      {key.key && (
        <p className="text-xs font-mono text-primary bg-surface-alt px-2.5 py-1 rounded-md break-all select-all inline-block border border-surface">
          {key.key}
        </p>
      )}

      <p className="text-xs text-muted font-mono">
        Expires: {new Date(key.expirationDate).toLocaleDateString()}
      </p>
    </div>

    <div className="flex items-center gap-2 self-end sm:self-center">
      {/* Copy Button */}
      {key.key && (
        <Button size="sm" variant="outline" onClick={() => copyToClipboard(key.key)}>
          <FiCopy size={14} />
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => handleDeleteKey(key._id)} className="hover:text-red-400">
        <FiTrash2 size={14} />
      </Button>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function DashboardProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await userAPI.updateProfile(form)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally { setSaving(false) }
  }


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h2 className="text-xl font-black font-display text-primary mb-6">Profile</h2>
        <form onSubmit={handleProfileSave} className="bg-card border border-surface rounded-2xl p-6 space-y-4">
          <Input label="Name" type="text" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </div>

    
    </motion.div>
  )
}