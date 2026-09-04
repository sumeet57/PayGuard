import { motion } from 'framer-motion'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

// ─── Button ───────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  const variants = {
    primary: 'text-white hover:opacity-90',
    outline: 'border border-surface text-muted hover:text-primary hover:border-highlight',
    ghost: 'text-muted hover:text-primary hover:bg-surface-alt',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-mono font-bold
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]}
        ${className}
      `}
      style={variant === 'primary' ? { backgroundColor: 'var(--color-highlight)' } : {}}
      {...props}
    >
      {loading && <AiOutlineLoading3Quarters size={14} className="animate-spin" />}
      {children}
    </motion.button>
  )
}

// ─── Badge ────────────────────────────────────────────
export function Badge({ children, color = 'orange' }) {
  return (
    <span className={`tag-pill ${color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}`}>
      {children}
    </span>
  )
}

// ─── Spinner ─────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="rounded-full border-2 border-surface"
        style={{
          width: size,
          height: size,
          borderTopColor: 'var(--color-highlight)',
        }}
      />
    </div>
  )
}

// ─── Page Loader ──────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size={36} />
      <p className="text-sm text-muted font-mono">Loading...</p>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────
export function SectionHeader({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="tag-pill mb-4 inline-block"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-black font-display text-primary mb-3"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted max-w-xl text-base leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && <div className="text-4xl text-muted mb-2">{icon}</div>}
      <h3 className="text-lg font-bold font-display text-primary">{title}</h3>
      {description && <p className="text-muted text-sm max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────
export function Divider({ className = '' }) {
  return <hr className={`border-t border-surface ${className}`} />
}

// ─── Input ────────────────────────────────────────────
export function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-mono uppercase tracking-wide text-muted">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">{icon}</span>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-xl border border-surface bg-surface-alt text-primary
            placeholder:text-muted text-sm font-mono
            focus:outline-none focus:border-highlight transition-colors
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  )
}