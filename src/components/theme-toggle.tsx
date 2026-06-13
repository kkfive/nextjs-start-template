'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/components/theme-provider'
import {
  LucideMoon,
  LucideSun,
} from '@/components/ui/icon'

export function ThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme()

  return (
    <button
      onClick={toggleMode}
      className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={resolvedMode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: resolvedMode === 'dark' ? 0 : 90, opacity: resolvedMode === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <LucideMoon className="size-4" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: resolvedMode === 'light' ? 0 : -90, opacity: resolvedMode === 'light' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <LucideSun className="size-4" />
      </motion.div>
    </button>
  )
}
