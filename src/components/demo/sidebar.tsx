'use client'

import type { DemoNavCategory } from '@/config/demo-nav'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type SidebarProps = {
  navConfig: DemoNavCategory[]
  onItemClick?: () => void
}

export function Sidebar({ navConfig, onItemClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-6 py-6">
      {navConfig.map(category => (
        <div key={category.category} className="space-y-2">
          {/* Category Header */}
          <div className="flex items-center gap-2 px-4">
            <div className="text-muted-foreground">{category.icon}</div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {category.category}
            </h4>
          </div>

          {/* Category Items */}
          <div className="space-y-0.5">
            {category.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    'relative block rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-bg"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/8 to-transparent"
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="active-bar"
                      className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
