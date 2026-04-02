import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('caflow-theme') as Theme | null
    return stored ?? 'system'
  })

  const getResolved = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return t
  }

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getResolved(theme))

  useEffect(() => {
    const root = document.documentElement
    const resolved = getResolved(theme)
    setResolvedTheme(resolved)

    root.classList.remove('light', 'dark')
    root.classList.add(resolved)

    if (theme !== 'system') {
      localStorage.setItem('caflow-theme', theme)
    } else {
      localStorage.removeItem('caflow-theme')
    }
  }, [theme])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolvedTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
