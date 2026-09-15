import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'tokorakyat-theme'

/**
 * Resolves the initial theme:
 * 1. Check localStorage for a saved preference
 * 2. Fall back to system preference
 * 3. Default to 'light'
 */
function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch { /* ignore */ }
  return 'system'
}

/**
 * Resolves 'system' into an actual 'light' or 'dark' value
 * by checking the OS prefers-color-scheme media query.
 */
function resolveSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Applies the resolved theme to <html> element.
 */
function applyTheme(resolved) {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  // The actual resolved theme ('light' or 'dark')
  const resolved = theme === 'system' ? resolveSystemTheme() : theme

  // Apply .dark class whenever resolved theme changes
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Listen for OS theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(resolveSystemTheme())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch { /* ignore */ }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setTheme])

  const value = {
    theme,          // 'light' | 'dark' | 'system'
    resolved,       // 'light' | 'dark'  (actual applied)
    setTheme,       // setTheme('light') | setTheme('dark') | setTheme('system')
    toggleTheme,    // flip between light ↔ dark
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
