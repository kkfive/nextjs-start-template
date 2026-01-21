'use client'

import { Loader2 } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

interface ResponseViewerProps {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: any
  statusCode?: number
  latency?: number
  isExpanded?: boolean
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  status,
  data,
  statusCode,
  latency,
  isExpanded = true,
}) => {
  const getBorderColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500/50 bg-green-50/50 dark:bg-green-950/10'
      case 'error':
        return 'border-red-500/50 bg-red-50/50 dark:bg-red-950/10'
      case 'loading':
        return 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/10'
      case 'idle':
      default:
        return 'border-gray-300 bg-gray-50/50 dark:bg-gray-900/50'
    }
  }

  if (status === 'idle' && !data) {
    return (
      <div className={cn('rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500')}>
        等待请求发送...
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border-2 p-4 transition-colors duration-200', getBorderColor())}>
      <div className="flex items-center justify-between text-xs font-medium tracking-wider text-gray-500 uppercase">
        <div className="flex items-center gap-2">
          <span>Response Body</span>
          {status === 'loading' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
        </div>
        <div className="flex gap-3">
          {statusCode !== undefined && (
            <span className={cn(
              'rounded px-1.5 py-0.5 font-bold',
              statusCode >= 200 && statusCode < 300 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30',
            )}
            >
              Status:
              {' '}
              {statusCode}
            </span>
          )}
          {latency !== undefined && (
            <span className="text-gray-400">
              Time:
              {' '}
              {latency}
              ms
            </span>
          )}
        </div>
      </div>

      <div className={cn(
        'relative overflow-hidden transition-all duration-300',
        isExpanded ? 'max-h-none' : 'max-h-24',
      )}
      >
        {status === 'loading' && !data
          ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )
          : (
              <pre className={cn(
                'scrollbar-thin overflow-auto rounded bg-black/5 p-2 font-mono text-xs dark:bg-white/5',
                isExpanded ? 'max-h-60' : 'max-h-24',
              )}
              >
                {data ? JSON.stringify(data, null, 2) : '// No data received'}
              </pre>
            )}

        {!isExpanded && data && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-gray-50/90 to-transparent dark:from-gray-900/90" />
        )}
      </div>
    </div>
  )
}

export default ResponseViewer
