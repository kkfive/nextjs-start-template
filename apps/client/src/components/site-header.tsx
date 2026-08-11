'use client'

import { cn } from '@kkfive/ui'
import { LucideGithub } from '@kkfive/ui/components/icon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeSelector } from '@/components/theme-selector'
import { ThemeToggle } from '@/components/theme-toggle'

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/demo', label: '演示' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)

  // 路由变化时重新显示
  useEffect(() => {
    setHidden(false)
  }, [pathname])

  // 向下滚动隐藏，向上滚动 / 回到顶部显示
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 16) {
        setHidden(false)
      }
      else if (y > lastY + 4) {
        setHidden(true)
      }
      else if (y < lastY - 4) {
        setHidden(false)
      }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 px-4 pt-3 transition-transform duration-300 ease-out sm:px-6',
        hidden ? '-translate-y-[150%]' : 'translate-y-0',
      )}
      onFocus={() => setHidden(false)}
    >
      <div className="glass mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 rounded-full border border-border/60 px-3 shadow-glass sm:px-4">
        {/* Logo */}
        <Link
          href="/"
          className="meta-mono inline-flex min-h-11 items-center rounded-full px-2 text-foreground transition-opacity hover:opacity-70"
        >
          KKFIVE/NST
        </Link>

        {/* 导航 */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="主导航">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={isActive}
                className={cn(
                  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1">
          <Link
            href="https://github.com/kkfive/nextjs-start-template"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="GitHub 仓库"
          >
            <LucideGithub className="size-4" />
          </Link>
          <ThemeSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
