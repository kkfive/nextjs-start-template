'use client'

import type { HttpMethod } from '@/components/ui/method-badge'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { MethodBadge } from '@/components/ui/method-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { ResponseViewer } from './response-viewer'

type ScenarioCardProps = {
  title: string
  description: string
  method: HttpMethod
  endpoint: string
  mode: 'server' | 'client'
  initialData?: unknown
  requestAction?: () => Promise<unknown>
  expectedStatus: 'success' | 'business-error' | 'http-error'
}

const statusConfig = {
  'success': {
    border: 'border-green-500/30',
    bg: 'bg-green-500/[0.03]',
    badge: 'bg-green-500/10 text-green-600',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  'business-error': {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/[0.03]',
    badge: 'bg-orange-500/10 text-orange-600',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  'http-error': {
    border: 'border-red-500/30',
    bg: 'bg-red-500/[0.03]',
    badge: 'bg-red-500/10 text-red-600',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
}

export function ScenarioCard({
  title,
  description,
  method,
  endpoint,
  mode,
  initialData,
  requestAction,
  expectedStatus,
}: ScenarioCardProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    mode === 'server' ? 'success' : 'idle',
  )
  const [data, setData] = useState<unknown>(initialData)
  const [statusCode, setStatusCode] = useState<number | undefined>()
  const [latency, setLatency] = useState<number | undefined>()

  const config = statusConfig[expectedStatus]

  const handleRequest = async () => {
    if (!requestAction)
      return

    setStatus('loading')
    const startTime = Date.now()

    try {
      const result = await requestAction()
      setData(result)
      setStatus('success')
      setStatusCode(200)
      setLatency(Date.now() - startTime)
    }
    catch (error) {
      setData(error)
      setStatus('error')
      if (error instanceof Error && 'statusCode' in error) {
        setStatusCode(error.statusCode as number)
      }
      else {
        setStatusCode(500)
      }
      setLatency(Date.now() - startTime)
    }
  }

  const isClientIdle = mode === 'client' && status === 'idle'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'space-y-4 rounded-2xl border bg-card p-5 transition-colors duration-200',
        config.border,
        config.bg,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            <StatusBadge type={mode} />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', config.badge)}>
          {config.icon}
        </div>
      </div>

      {/* Endpoint */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <MethodBadge method={method} />
        <code className="truncate font-mono text-xs text-muted-foreground">
          {endpoint}
        </code>
      </div>

      {/* Client Action Button */}
      {mode === 'client' && requestAction && (
        <motion.button
          onClick={handleRequest}
          disabled={status === 'loading'}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
            'bg-primary text-primary-foreground shadow-sm',
            'hover:shadow-md',
            'disabled:cursor-wait disabled:opacity-60',
          )}
        >
          {status === 'loading'
            ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  请求中...
                </span>
              )
            : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  发送请求
                </span>
              )}
        </motion.button>
      )}

      {/* Response */}
      <AnimatePresence>
        {!isClientIdle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ResponseViewer
              status={status}
              data={data}
              statusCode={statusCode}
              latency={latency}
              isExpanded={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
