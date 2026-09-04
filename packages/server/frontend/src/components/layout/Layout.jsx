import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  const isAuthPage = pathname.startsWith('/auth')

  return (
    <div className="noise min-h-screen flex flex-col bg-surface">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={`flex-1 ${!isAuthPage ? 'pt-16' : ''}`}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {!isAuthPage && <Footer />}
    </div>
  )
}