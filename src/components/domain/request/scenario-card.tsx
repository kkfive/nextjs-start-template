'use client'

import type { HttpMethod } from '@/components/ui/method-badge'
import React, { useState } from 'react'
import { MethodBadge } from '@/components/ui/method-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { ResponseViewer } from './response-viewer'

interface ScenarioCardProps {
  title: string
  description: string
  method: HttpMethod
  endpoint: string
  mode: 'server' | 'client'
  initialData?: any
  requestAction?: () => Promise<any>
  expectedStatus: 'success' | 'business-error' | 'http-error'
}

const statusColors = {
  'success': 'border-green-500/50 bg-green-500/5',
  'business-error': 'border-orange-500/50 bg-orange-500/5',
  'http-error': 'border-red-500/50 bg-red-500/5',
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
  const [data, setData] = useState<any>(initialData)
  const [statusCode, setStatusCode] = useState<number | undefined>()
  const [latency, setLatency] = useState<number | undefined>()

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
    catch (error: any) {
      setData(error)
      setStatus('error')
      setStatusCode(error.statusCode || 500)
      setLatency(Date.now() - startTime)
    }
  }

  return (
    <div className={cn('space-y-4 rounded-lg border-2 p-6', statusColors[expectedStatus])}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <StatusBadge type={mode} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <MethodBadge method={method} />
        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">
          {endpoint}
        </code>
      </div>

      {mode === 'client' && requestAction && (
        <button
          onClick={handleRequest}
          disabled={status === 'loading'}
          className={cn(
            'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            'bg-blue-500 text-white hover:bg-blue-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {status === 'loading' ? 'Sending...' : 'Send Request'}
        </button>
      )}

      <ResponseViewer
        status={status}
        data={data}
        statusCode={statusCode}
        latency={latency}
        isExpanded={true}
      />
    </div>
  )
}
