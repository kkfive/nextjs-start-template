'use client'

import { LucideMoon, LucideSun } from '@kkfive/ui/components/icon'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/components/theme-context'

export function ThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme()

  return (
    <button
      onClick={toggleMode}
      className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={resolvedMode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolvedMode}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="inline-flex"
        >
          {resolvedMode === 'dark' ? <LucideSun className="size-4" /> : <LucideMoon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
