'use client'

import { LucideLayers } from '@kkfive/ui/components/icon'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { demoNavConfig } from '../model/nav'
import { CommandCenter } from './command-center'

export function DemoLayoutClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  // 路由变化时关闭命令中心
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // ⌘K / Ctrl+K 全局切换
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(current => !current)
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  // 打开期间：锁定背景滚动、Escape 关闭、关闭后焦点恢复触发器
  useEffect(() => {
    if (!isOpen)
      return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (event.key !== 'Tab')
        return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length)
        return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [isOpen])

  const close = () => setIsOpen(false)

  return (
    <div>
      {/* 统一的悬浮命令中心触发器：桌面与移动同一入口，不再占用正文空间 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="打开演示索引"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className="glass fixed right-4 bottom-5 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border/60 px-4 text-sm font-medium shadow-glass transition-transform duration-150 active:scale-95"
      >
        <LucideLayers className="size-4" aria-hidden />
        <span className="hidden sm:inline">演示索引</span>
        <kbd className="hidden rounded-md border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
        <span className="sr-only sm:hidden">演示索引</span>
      </button>

      {/* 命令中心：桌面居中面板，移动近全屏底部弹层 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="demo-command-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              key="demo-command-dialog"
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="演示索引"
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 380 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col px-3 pb-3 sm:inset-0 sm:m-auto sm:size-fit sm:max-h-[80dvh] sm:w-full sm:max-w-2xl sm:p-0"
            >
              <CommandCenter navConfig={demoNavConfig} onClose={close} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
