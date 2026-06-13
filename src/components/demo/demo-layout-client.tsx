'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { createContext, useEffect, useState } from 'react'
import { LucideMenu, LucideX } from '@/components/ui/icon'
import { demoNavConfig } from '@/config/demo-nav'
import { Sidebar } from './sidebar'

type SidebarContextValue = {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function DemoLayoutClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/10">
        {/* Mobile Header */}
        <header className="sticky top-16 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={toggle}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <LucideMenu className="size-5" />
          </button>
          <h1 className="text-base font-semibold">功能演示</h1>
        </header>

        {/* Mobile Drawer Overlay + Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={close}
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-border/40 bg-background lg:hidden"
              >
                <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
                  <h2 className="text-base font-semibold">导航</h2>
                  <button
                    onClick={close}
                    className="rounded-lg p-2 transition-colors hover:bg-muted"
                    aria-label="Close sidebar"
                  >
                    <LucideX className="size-5" />
                  </button>
                </div>
                <Sidebar navConfig={demoNavConfig} onItemClick={close} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop: flex row with sticky sidebar */}
        <div className="lg:flex">
          {/* Desktop Sidebar */}
          <aside className="hidden shrink-0 lg:block lg:w-60">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border/40 bg-background/50">
              <div className="border-b border-border/40 p-4">
                <h2 className="text-base font-semibold">功能演示</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  探索模板功能示例
                </p>
              </div>
              <Sidebar navConfig={demoNavConfig} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
