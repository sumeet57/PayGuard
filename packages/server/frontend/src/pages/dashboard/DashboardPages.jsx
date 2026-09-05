import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiTrash2, FiCopy, FiCheckCircle, FiBook, FiLogOut } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { keyAPI } from '../../api/services'
import { Button, Input, Spinner, EmptyState } from '../../components/common/UI'

export function DashboardPages() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()

  // State
  const [keys, setKeys] = useState([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [keyLabel, setKeyLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null)

  // Fetch API Keys
  const fetchKeys = useCallback(async () => {
    try {
      setLoadingKeys(true)
      const res = await keyAPI.getAll()
      setKeys(res.data.keys || res.data || [])
    } catch {
      toast.error('Failed to load API keys')
    } finally {
      setLoadingKeys(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchKeys()
    }
  }, [isAuthenticated, fetchKeys])

  // Handlers
  const handleLogout = async () => {
    await logout()
    navigate('/')
    toast.info('Logged out.')
  }

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
      setKeys((prev) => prev.filter((k) => k._id !== id))
    } catch {
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.info('Copied to clipboard!')
  }

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!isAuthenticated) {
    window.location.href = '/auth'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-7xl mx-auto py-4 px-4 sm:px-6">
      
      {/* TOP NAVBAR TOOLBAR */}
      <div className="flex items-center justify-between pb-6 border-b border-surface">
        <div className="font-display font-bold text-lg text-primary">Dashboard</div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border border-surface text-muted hover:text-primary hover:bg-surface-alt transition-all"
          >
            <FiBook size={14} />
            <span>Documentation</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all"
          >
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW */}
      <section>
        <h1 className="text-2xl font-black font-display text-primary mb-6">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-surface rounded-xl p-5">
            <div className="text-2xl font-black font-mono text-accent mb-1">
              {loadingKeys ? <Spinner size={20} /> : `${keys.length} / 5`}
            </div>
            <div className="text-xs text-muted">Active API Keys</div>
          </div>

          <div className="bg-card border border-surface rounded-xl p-5">
            <div className="text-2xl font-black font-mono text-accent mb-1">
              {user?.aiRequests ? user.aiRequests : 0}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              You have used {user?.aiRequests ? user.aiRequests : 0} out of 100 AI usage requests.
            </p>
            <p className="text-[11px] text-muted font-mono mt-1">
              Contact support if you need more (payguard@sumeet.app)
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: API KEYS */}
      <section className="space-y-6">
        <h2 className="text-xl font-black font-display text-primary">API Keys</h2>

        <form onSubmit={handleCreateKey} className="bg-card border border-surface rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Key Label"
                placeholder="e.g. Production Backend"
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
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
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
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

        {loadingKeys ? (
          <Spinner size={28} />
        ) : keys.length === 0 ? (
          <EmptyState icon="🔑" title="No API keys" description="Generate a key to access API services." />
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-surface rounded-xl gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-primary text-sm">{key.label}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        key.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {key.valid ? 'Active' : 'Disabled'}
                    </span>
                  </div>

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
                  {key.key && (
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(key.key)}>
                      <FiCopy size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteKey(key._id)}
                    className="hover:text-red-400"
                  >
                    <FiTrash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: READ-ONLY PROFILE */}
      <section className="space-y-6">
        <h2 className="text-xl font-black font-display text-primary">Profile</h2>
        <div className="bg-card border border-surface rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-xs text-muted font-mono block mb-1">Full Name</span>
            <p className="text-sm font-bold text-primary">{user?.name || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-muted font-mono block mb-1">Email Address</span>
            <p className="text-sm font-bold text-primary font-mono">{user?.email || '—'}</p>
          </div>
        </div>
      </section>

    </motion.div>
  )
}