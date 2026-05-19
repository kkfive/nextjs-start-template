'use client'

import { motion } from 'framer-motion'
import { LucideLoader2 } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

type ResponseViewerProps = {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: unknown
  statusCode?: number
  latency?: number
  isExpanded?: boolean
}

export function ResponseViewer({
  status,
  data,
  statusCode,
  latency,
  isExpanded = true,
}: ResponseViewerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/[0.03]',
          badgeBg: 'bg-green-500/10',
          badgeText: 'text-green-600',
        }
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/[0.03]',
          badgeBg: 'bg-red-500/10',
          badgeText: 'text-red-600',
        }
      case 'loading':
        return {
          border: 'border-primary/30',
          bg: 'bg-primary/[0.03]',
          badgeBg: 'bg-primary/10',
          badgeText: 'text-primary',
        }
      case 'idle':
      default:
        return {
          border: 'border-border/40',
          bg: 'bg-muted/30',
          badgeBg: 'bg-muted',
          badgeText: 'text-muted-foreground',
        }
    }
  }

  const config = getStatusConfig()

  if (status === 'idle' && !data) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border/40 p-6 text-center">
        <div className="mb-2 flex justify-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted/60">
            <svg className="size-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">等待请求发送...</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-xl border p-4 transition-colors duration-200', config.border, config.bg)}>
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium tracking-wider text-muted-foreground uppercase">Response</span>
          {status === 'loading' && <LucideLoader2 className="size-3.5 animate-spin text-primary" />}
        </div>
        <div className="flex items-center gap-2">
          {statusCode !== undefined && (
            <span className={cn('rounded-md px-2 py-0.5 text-xs font-bold', config.badgeBg, config.badgeText)}>
              HTTP
              {' '}
              {statusCode}
            </span>
          )}
          {latency !== undefined && (
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {latency}
              ms
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={cn('relative overflow-hidden transition-all duration-300', isExpanded ? 'max-h-none' : 'max-h-24')}>
        {status === 'loading' && !data
          ? (
              <div className="flex items-center justify-center py-8">
                <LucideLoader2 className="size-8 animate-spin text-muted-foreground/40" />
              </div>
            )
          : (
              <motion.pre
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-xs leading-relaxed dark:bg-white/[0.04]',
                  isExpanded ? 'max-h-64' : 'max-h-24',
                )}
              >
                {data ? JSON.stringify(data, null, 2) : '// No data received'}
              </motion.pre>
            )}

        {!isExpanded && data !== null && data !== undefined && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-card/90 to-transparent" />
        )}
      </div>
    </div>
  )
}
