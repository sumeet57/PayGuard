import { createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('engineeor-theme', 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : 'light')
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}