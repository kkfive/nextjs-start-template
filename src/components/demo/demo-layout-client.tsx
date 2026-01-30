'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { createContext, useEffect, useState } from 'react'
import { demoNavConfig } from '@/config/demo-nav'
import { Sidebar } from './sidebar'

interface SidebarContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function DemoLayoutClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when mobile drawer is open
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
      <div className="min-h-screen bg-neutral-50">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-neutral-200 bg-white px-4 lg:hidden">
          <button
            onClick={toggle}
            className="rounded-lg p-2 hover:bg-neutral-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="text-lg font-semibold">Demo Examples</h1>
        </header>

        {/* Mobile Drawer Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ x: '-100%', opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                transition: { type: 'spring', stiffness: 300, damping: 30 },
              }}
              exit={{ x: '-100%', opacity: 0 }}
              className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-neutral-200 bg-white lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <button
                  onClick={close}
                  className="rounded-lg p-2 hover:bg-neutral-100"
                  aria-label="Close sidebar"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <Sidebar navConfig={demoNavConfig} onItemClick={close} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-neutral-200 bg-neutral-50/50 backdrop-blur-sm lg:block">
          <div className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 px-4 py-4 backdrop-blur-sm">
            <h2 className="text-lg font-semibold">Demo Examples</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Explore template features
            </p>
          </div>
          <Sidebar navConfig={demoNavConfig} />
        </aside>

        {/* Main Content */}
        <main className="lg:pl-64">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
