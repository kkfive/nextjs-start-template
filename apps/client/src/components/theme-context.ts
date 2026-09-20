'use client'

import { createContext, useContext } from 'react'

// 单主题收敛：保留联合类型与 context 结构，作为日后扩展自定义主题的写法参照。
// 新增主题时：扩展此联合类型 + 在 styles/tailwind.css 增加 [data-theme='<id>'] 变量块。
export type ColorTheme = 'warm'
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
