'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  type: 'server' | 'client'
  className?: string
}

export function StatusBadge({ type, className }: StatusBadgeProps) {
  const isServer = type === 'server'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        isServer
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        className
      )}
    >
      {isServer ? 'Server' : 'Client'}
    </span>
  )
}
