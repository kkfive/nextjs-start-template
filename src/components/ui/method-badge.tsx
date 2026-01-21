'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface MethodBadgeProps {
  method: HttpMethod
  className?: string
}

const methodStyles: Record<HttpMethod, string> = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-tight',
        methodStyles[method],
        className
      )}
    >
      {method}
    </span>
  )
}