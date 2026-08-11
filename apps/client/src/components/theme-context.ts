'use client'

import { createContext, useContext } from 'react'

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

export const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
