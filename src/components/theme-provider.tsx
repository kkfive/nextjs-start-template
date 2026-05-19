'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export type ColorTheme = 'warm' | 'ocean' | 'sunset' | 'midnight' | 'forest'
export type Mode = 'light' | 'dark' | 'system'

type ThemeProviderState = {
  colorTheme: ColorTheme
  mode: Mode
  resolvedMode: 'light' | 'dark'
  setColorTheme: (theme: ColorTheme) => void
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveMode(mode: Mode): 'light' | 'dark' {
  return mode === 'system' ? getSystemMode() : mode
}

export function ThemeProvider({
  children,
  defaultColorTheme = 'warm',
  defaultMode = 'system',
}: {
  children: React.ReactNode
  defaultColorTheme?: ColorTheme
  defaultMode?: Mode
}) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(defaultColorTheme)
  const [mode, setModeState] = useState<Mode>(defaultMode)
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Apply theme to DOM
  const applyTheme = useCallback((ct: ColorTheme, rm: 'light' | 'dark') => {
    const html = document.documentElement
    html.setAttribute('data-theme', ct)
    html.classList.toggle('dark', rm === 'dark')
  }, [])

  useEffect(() => {
    setMounted(true)
    const storedColorTheme = localStorage.getItem('color-theme') as ColorTheme | null
    const storedMode = localStorage.getItem('mode') as Mode | null

    const initialColorTheme = storedColorTheme || defaultColorTheme
    const initialMode = storedMode || defaultMode

    setColorThemeState(initialColorTheme)
    setModeState(initialMode)

    const resolved = resolveMode(initialMode)
    setResolvedMode(resolved)
    applyTheme(initialColorTheme, resolved)
  }, [defaultColorTheme, defaultMode, applyTheme])

  // Listen for system mode changes
  useEffect(() => {
    if (!mounted)
      return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (mode === 'system') {
        const resolved = getSystemMode()
        setResolvedMode(resolved)
        applyTheme(colorTheme, resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode, colorTheme, mounted, applyTheme])

  const setColorTheme = useCallback((newTheme: ColorTheme) => {
    localStorage.setItem('color-theme', newTheme)
    setColorThemeState(newTheme)

    const resolved = resolveMode(mode)
    setResolvedMode(resolved)
    applyTheme(newTheme, resolved)
  }, [mode, applyTheme])

  const setMode = useCallback((newMode: Mode) => {
    localStorage.setItem('mode', newMode)
    setModeState(newMode)

    const resolved = resolveMode(newMode)
    setResolvedMode(resolved)
    applyTheme(colorTheme, resolved)
  }, [colorTheme, applyTheme])

  const toggleMode = useCallback(() => {
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
  }, [resolvedMode, setMode])

  return (
    <ThemeProviderContext.Provider
      value={{ colorTheme, mode, resolvedMode, setColorTheme, setMode, toggleMode }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
