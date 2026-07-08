'use client'

import type { ColorTheme } from '@/components/theme-provider'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import {
  LucideCheck,
  LucideChevronDown,
  LucidePalette,
} from '@/components/ui/icon'
import { cn } from '@/lib/utils'

type ThemeOption = {
  id: ColorTheme
  name: string
  description: string
  gradient: string
}

const themes: ThemeOption[] = [
  {
    id: 'warm',
    name: '暖色',
    description: '温暖典雅的 editorial 风格',
    gradient: 'from-amber-400 to-orange-300',
  },
  {
    id: 'ocean',
    name: '海洋',
    description: '清新专业的蓝绿色调',
    gradient: 'from-cyan-400 to-blue-400',
  },
  {
    id: 'sunset',
    name: '日落',
    description: '热情活力的橙红渐变',
    gradient: 'from-orange-400 to-rose-400',
  },
  {
    id: 'midnight',
    name: '午夜',
    description: '深邃神秘的紫蓝科技',
    gradient: 'from-violet-400 to-purple-400',
  },
  {
    id: 'forest',
    name: '森林',
    description: '自然清新的绿色调',
    gradient: 'from-emerald-400 to-teal-400',
  },
]

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const currentTheme = themes.find(t => t.id === colorTheme) ?? themes[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="选择主题"
      >
        <LucidePalette className="size-4" />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <LucideChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-border/60 bg-popover p-1.5 shadow-lg"
            >
              <div className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
                配色方案
              </div>
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                    colorTheme === theme.id
                      ? 'bg-primary/8 text-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <div
                    className={cn(
                      'size-5 rounded-full bg-gradient-to-br',
                      theme.gradient,
                    )}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{theme.name}</div>
                    <div className="text-xs text-muted-foreground">{theme.description}</div>
                  </div>
                  {colorTheme === theme.id && (
                    <LucideCheck className="size-4 text-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
