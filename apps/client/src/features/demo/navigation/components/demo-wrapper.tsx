'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AtmosphereLayer } from '@/components/atmosphere/atmosphere-layer'
import { demoNavConfig } from '../model/nav'

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
  let expNumber = ''

  for (const [categoryIndex, category] of demoNavConfig.entries()) {
    const itemIndex = category.items.findIndex(i => i.href === pathname)
    if (itemIndex !== -1) {
      const item = category.items[itemIndex]
      demoTitle = demoTitle || item.name
      demoDescription = demoDescription || item.description
      categoryName = category.name
      expNumber = `EXP-${categoryIndex + 1}.${itemIndex + 1}`
      break
    }
  }

  return (
    <div className="px-4 pb-18 sm:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="mx-auto max-w-300"
        >
          <nav className="flex scrollbar-thin items-center gap-1 overflow-x-auto py-2 font-mono text-xs whitespace-nowrap text-muted-foreground" aria-label="面包屑">
            <Link href="/" aria-label="返回首页" className="inline-flex size-11 shrink-0 items-center justify-center transition-colors hover:text-foreground">~</Link>
            <span aria-hidden className="shrink-0 px-0.5">/</span>
            <Link href="/demo" className="inline-flex min-h-11 shrink-0 items-center px-2 transition-colors hover:text-foreground">demo</Link>
            {categoryName && (
              <>
                <span aria-hidden className="shrink-0 px-0.5">/</span>
                <span className="shrink-0 px-1 opacity-60">{categoryName}</span>
              </>
            )}
            {demoTitle && (
              <>
                <span aria-hidden className="shrink-0 px-0.5">/</span>
                <span className="shrink-0 px-1 text-foreground">{demoTitle}</span>
              </>
            )}
          </nav>

          {(demoTitle || demoDescription) && (
            <div className="pb-7">
              <div className="grid gap-3 sm:grid-cols-[auto,1fr] sm:items-start sm:gap-5">
                {expNumber && <span className="meta-mono pt-1 text-accent">{expNumber}</span>}
                <div>
                  {demoTitle && <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{demoTitle}</h1>}
                  {demoDescription && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{demoDescription}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-4xl border border-border/65 bg-canvas/94 px-5 py-6 shadow-soft sm:p-8">
            <AtmosphereLayer intensity="quiet" gridInset="inset-x-[10%] top-[12%] bottom-[14%]" />
            <div className="luminous-divider absolute inset-x-0 top-0 h-px" aria-hidden />
            <div className="relative flex flex-col gap-6">{children}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
