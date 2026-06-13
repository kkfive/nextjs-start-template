'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LucideChevronRight,
  LucideHome,
} from '@/components/ui/icon'
import { demoNavConfig } from '@/config/demo-nav'

type DemoWrapperProps = {
  children: React.ReactNode
  title?: string
  description?: string
}

export function DemoWrapper({ children, title, description }: DemoWrapperProps) {
  const pathname = usePathname()

  let demoTitle = title
  let demoDescription = description
  let categoryName = ''

  if (!title || !description) {
    for (const category of demoNavConfig) {
      const item = category.items.find(i => i.href === pathname)
      if (item) {
        demoTitle = demoTitle || item.name
        demoDescription = demoDescription || item.description
        categoryName = category.category
        break
      }
    }
  }

  return (
    <div className="relative mx-auto min-h-[calc(100vh-4rem-4rem)] max-w-6xl space-y-6 px-6 py-8">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-0 -right-20 size-64 rounded-full bg-gradient-to-bl from-[var(--gradient-from)] to-transparent opacity-[0.04] blur-3xl" />

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground">
              <LucideHome className="size-3.5" />
            </Link>
            <LucideChevronRight className="size-3.5 opacity-50" />
            <Link href="/demo" className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground">
              Demo
            </Link>
            {categoryName && (
              <>
                <LucideChevronRight className="size-3.5 opacity-50" />
                <span className="text-muted-foreground/60">{categoryName}</span>
              </>
            )}
            {demoTitle && (
              <>
                <LucideChevronRight className="size-3.5 opacity-50" />
                <span className="font-medium text-foreground">{demoTitle}</span>
              </>
            )}
          </nav>

          {/* Page Header */}
          {(demoTitle || demoDescription) && (
            <div className="space-y-2">
              {demoTitle && (
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {demoTitle}
                </h1>
              )}
              {demoDescription && (
                <p className="text-muted-foreground">{demoDescription}</p>
              )}
            </div>
          )}

          {/* Demo Content */}
          <div className="card-elevated rounded-xl border border-border/50 bg-card p-6 sm:p-8">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
