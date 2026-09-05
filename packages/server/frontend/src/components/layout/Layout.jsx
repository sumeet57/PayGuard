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
      {/* <Navbar /> */}
      <AnimatePresence mode="wait">
        <main
          key={pathname}
          
         
        >
          <Outlet />
        </main>
      </AnimatePresence>
      {/* {!isAuthPage && <Footer />} */}
    </div>
  )
}