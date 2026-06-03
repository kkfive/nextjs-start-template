'use client'

import type { HttpMethod } from '@/components/ui/method-badge'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ResponseViewer } from '@/components/domain/request/response-viewer'
import { MethodBadge } from '@/components/ui/method-badge'
import { cn } from '@/lib/utils'

type RequestPlaygroundProps = {
  title: string
  description: string
  method: HttpMethod
  endpoint: string
  requestFn: () => Promise<unknown>
  configDisplay?: Record<string, unknown>
  expectedStatus?: 'success' | 'business-error' | 'http-error'
  children?: React.ReactNode
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

export function RequestPlayground({
  title,
  description,
  method,
  endpoint,
  requestFn,
  configDisplay,
  expectedStatus = 'success',
  children,
}: RequestPlaygroundProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [data, setData] = useState<unknown>(null)
  const [statusCode, setStatusCode] = useState<number | undefined>()
  const [latency, setLatency] = useState<number | undefined>()
  const [errorDetails, setErrorDetails] = useState<{
    name?: string
    message: string
    code?: number | string
    data?: unknown
    isBusinessError?: boolean
    isNetworkError?: boolean
    isHTTPError?: boolean
    is4xxError?: boolean
    is5xxError?: boolean
    isTimeout?: boolean
    responseStatus?: number
    toJSON?: Record<string, unknown>
  } | null>(null)

  const config = statusConfig[expectedStatus]

  const handleRequest = async () => {
    setStatus('loading')
    setData(null)
    setErrorDetails(null)
    setStatusCode(undefined)
    const startTime = Date.now()

    try {
      const result = await requestFn()
      setData(result)
      setStatus('success')
      setStatusCode(200)
      setLatency(Date.now() - startTime)
    }
    catch (error) {
      setStatus('error')
      setLatency(Date.now() - startTime)

      // Extract error details
      const err = error as Error & {
        code?: number | string
        data?: unknown
        isBusinessError?: boolean
        response?: { status?: number }
        toJSON?: () => Record<string, unknown>
        statusCode?: number
      }
      const responseStatus = err.response?.status
      const isHTTPError = err.name === 'HTTPError'
      const isTimeout = err.name === 'TimeoutError'
      const isNetworkError = err.name === 'NetworkError'

      setErrorDetails({
        name: err.name,
        message: err.message,
        code: err.code,
        data: err.data,
        isBusinessError: err.isBusinessError,
        isNetworkError,
        isHTTPError,
        is4xxError: responseStatus !== undefined && responseStatus >= 400 && responseStatus < 500,
        is5xxError: responseStatus !== undefined && responseStatus >= 500 && responseStatus < 600,
        isTimeout,
        responseStatus,
        toJSON: err.toJSON?.(),
      })

      if (responseStatus) {
        setStatusCode(responseStatus)
      }
      else if (err.statusCode) {
        setStatusCode(err.statusCode)
      }
      else if (err.code && typeof err.code === 'number' && err.code >= 100 && err.code < 600) {
        setStatusCode(err.code)
      }

      // Also set data to show error in response viewer
      setData(error)
    }
  }

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
        <code className="truncate font-mono text-xs text-muted-foreground">{endpoint}</code>
      </div>

      {/* Config Display */}
      {configDisplay && Object.keys(configDisplay).length > 0 && (
        <div className="rounded-lg bg-muted/30 px-3 py-2">
          <div className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">请求配置</div>
          <pre className="overflow-auto font-mono text-[11px] leading-relaxed text-muted-foreground">
            {JSON.stringify(configDisplay, null, 2)}
          </pre>
        </div>
      )}

      {/* Children (e.g. parameter controls) */}
      {children}

      {/* Action Button */}
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

      {/* Response */}
      <AnimatePresence>
        {status !== 'idle' && (
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

      {/* Error Details */}
      <AnimatePresence>
        {errorDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="rounded-xl border border-red-500/30 bg-red-500/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-red-600">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                错误详情分析
              </div>

              {/* Error Flags */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {errorDetails.isBusinessError && (
                  <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600">业务错误</span>
                )}
                {errorDetails.isNetworkError && (
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">网络错误</span>
                )}
                {errorDetails.isHTTPError && (
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">HTTP 错误</span>
                )}
                {errorDetails.is4xxError && (
                  <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600">4xx 客户端错误</span>
                )}
                {errorDetails.is5xxError && (
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">5xx 服务端错误</span>
                )}
                {errorDetails.isTimeout && (
                  <span className="rounded-md bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-600">超时错误</span>
                )}
              </div>

              {/* Error Properties */}
              <div className="space-y-1.5">
                {errorDetails.name && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0 text-muted-foreground">name:</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-red-600">{errorDetails.name}</code>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 shrink-0 text-muted-foreground">message:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-red-600">{errorDetails.message}</code>
                </div>
                {errorDetails.code !== undefined && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0 text-muted-foreground">code:</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-red-600">{String(errorDetails.code)}</code>
                  </div>
                )}
                {errorDetails.responseStatus !== undefined && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0 text-muted-foreground">status:</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-red-600">{errorDetails.responseStatus}</code>
                  </div>
                )}
                {errorDetails.data !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-16 shrink-0 text-muted-foreground">data:</span>
                      <span className="text-[10px] text-muted-foreground">HTTPError 预解析响应体</span>
                    </div>
                    <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-[10px] leading-relaxed dark:bg-white/[0.04]">
                      {JSON.stringify(errorDetails.data, null, 2)}
                    </pre>
                  </div>
                )}
                {errorDetails.toJSON && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-16 shrink-0 text-muted-foreground">toJSON:</span>
                      <span className="text-[10px] text-muted-foreground">序列化后的错误对象</span>
                    </div>
                    <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-[10px] leading-relaxed dark:bg-white/[0.04]">
                      {JSON.stringify(errorDetails.toJSON, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
