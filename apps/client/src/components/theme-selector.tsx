'use client'

import type { ColorTheme } from '@/components/theme-context'
import { cn } from '@kkfive/ui'
import { LucideCheck, LucideChevronDown } from '@kkfive/ui/components/icon'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/components/theme-context'

type ThemeOption = {
  id: ColorTheme
  number: string
  name: string
  description: string
  swatches: [string, string]
}

const themes: ThemeOption[] = [
  { id: 'warm', number: '01', name: '暖砂', description: '暖白纸面与橙红点缀', swatches: ['#FAF9F6', '#E4572E'] },
  { id: 'ocean', number: '02', name: '浅滩', description: '冷白纸面与青碧点缀', swatches: ['#F7F9F8', '#0E7C7B'] },
  { id: 'sunset', number: '03', name: '暮色', description: '米白纸面与焦橙点缀', swatches: ['#FAF5EF', '#C24E2B'] },
  { id: 'midnight', number: '04', name: '星野', description: '冷灰纸面与靛蓝点缀', swatches: ['#F6F7F9', '#3B5BDB'] },
  { id: 'forest', number: '05', name: '苔原', description: '绿调纸面与苔绿点缀', swatches: ['#F7F8F3', '#4F772D'] },
]

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const currentTheme = themes.find(theme => theme.id === colorTheme) ?? themes[0]

  useEffect(() => {
    if (!open)
      return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
        return
      const items = [...(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])]
      if (!items.length)
        return
      event.preventDefault()
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
      const targetIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowDown'
            ? (currentIndex + 1 + items.length) % items.length
            : (currentIndex - 1 + items.length) % items.length
      items[targetIndex]?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    panelRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(value => !value)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="选择配色主题"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex rounded-full border border-border p-0.5" aria-hidden>
          <span className="size-2.5 rounded-l-full" style={{ backgroundColor: currentTheme.swatches[0] }} />
          <span className="size-2.5 rounded-r-full" style={{ backgroundColor: currentTheme.swatches[1] }} />
        </span>
        <span className="meta-mono hidden md:inline">{currentTheme.name}</span>
        <LucideChevronDown className={cn('size-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="关闭配色主题菜单"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={panelRef}
              role="menu"
              aria-label="配色主题"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-border/70 bg-card/95 p-1.5 shadow-soft backdrop-blur-xl"
            >
              <div className="meta-mono px-3 py-2 text-muted-foreground">配色主题 / 05</div>
              {themes.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={colorTheme === theme.id}
                  aria-current={colorTheme === theme.id}
                  onClick={() => {
                    setColorTheme(theme.id)
                    setOpen(false)
                    triggerRef.current?.focus()
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted',
                    colorTheme === theme.id && 'bg-accent/8',
                  )}
                >
                  <span className="flex shrink-0 rounded-full border border-border p-0.5" aria-hidden>
                    <span className="size-3 rounded-l-full" style={{ backgroundColor: theme.swatches[0] }} />
                    <span className="size-3 rounded-r-full" style={{ backgroundColor: theme.swatches[1] }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="meta-mono text-accent">{theme.number}</span>
                      <span className="text-sm font-semibold">{theme.name}</span>
                    </span>
                    <span className="block text-xs text-muted-foreground">{theme.description}</span>
                  </span>
                  {colorTheme === theme.id && <LucideCheck className="size-4 shrink-0 text-accent" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
