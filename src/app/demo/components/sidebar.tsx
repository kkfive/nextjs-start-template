'use client'

import type { DemoNavCategory } from '../config/demo-nav'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
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
            <div className="text-neutral-500">{category.icon}</div>
            <h4 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              {category.category}
            </h4>
          </div>

          {/* Category Items */}
          <div className="space-y-1">
            {category.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    'relative block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-blue-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  )}
                >
                  {/* Active Indicator with Framer Motion */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 rounded-lg bg-blue-50"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Item Content */}
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
