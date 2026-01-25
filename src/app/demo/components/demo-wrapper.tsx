'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { demoNavConfig } from '../config/demo-nav'

interface DemoWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function DemoWrapper({ children, title, description }: DemoWrapperProps) {
  const pathname = usePathname()

  // Auto-find demo config from pathname
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
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-600">
        <Link href="/" className="hover:text-neutral-900">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/demo" className="hover:text-neutral-900">
          Demo
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="size-4" />
            <span className="text-neutral-400">{categoryName}</span>
          </>
        )}
        {demoTitle && (
          <>
            <ChevronRight className="size-4" />
            <span className="font-medium text-neutral-900">{demoTitle}</span>
          </>
        )}
      </nav>

      {/* Page Header */}
      {(demoTitle || demoDescription) && (
        <div className="space-y-2">
          {demoTitle && (
            <h1 className="text-3xl font-bold tracking-tight">{demoTitle}</h1>
          )}
          {demoDescription && (
            <p className="text-neutral-600">{demoDescription}</p>
          )}
        </div>
      )}

      {/* Demo Content */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}
