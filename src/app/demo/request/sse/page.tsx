'use client'

import type { RequestSseEvent } from '@/service/index.sse'
import { useRef, useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import {
  LucidePause,
  LucidePlay,
  LucideRadio,
  LucideSquare,
} from '@/components/ui/icon'
import { createRequestSseStream } from '@/service/index.sse'

type StreamMode = 'iteration' | 'emitter'

type StreamChunk = {
  type: 'start' | 'chunk'
  message?: string
  index?: number
  total: number
  content?: string
  progress?: number
  timestamp?: string
}

type StreamEventItem = {
  id: string
  event: string
  data: StreamChunk
}

const modeConfig: Record<StreamMode, { label: string, description: string }> = {
  iteration: {
    label: 'Async iteration',
    description: 'for await...of 顺序消费流事件',
  },
  emitter: {
    label: 'Emitter',
    description: 'on(data/error/close) 监听流事件',
  },
}

function getEventContent(event: RequestSseEvent<StreamChunk>) {
  return event.data.content || event.data.message || ''
}

export default function SseRequestPage() {
  const [mode, setMode] = useState<StreamMode>('iteration')
  const [count, setCount] = useState(5)
  const [interval, setIntervalMs] = useState(450)
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle')
  const [events, setEvents] = useState<StreamEventItem[]>([])
  const [content, setContent] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const isStreaming = status === 'streaming'
  const progress = events.reduce((value, item) => item.data.progress ?? value, 0)

  const appendEvent = (event: RequestSseEvent<StreamChunk>) => {
    setEvents(previous => [
      ...previous,
      {
        id: event.id || String(previous.length + 1),
        event: event.event || 'message',
        data: event.data,
      },
    ])
    setContent(previous => `${previous}${getEventContent(event)}`)
  }

  const resetState = () => {
    setEvents([])
    setContent('')
    setErrorMessage('')
    setStatus('streaming')
  }

  const createStream = (signal: AbortSignal) => {
    return createRequestSseStream<StreamChunk>(
      '/api/example/request/sse',
      {
        count,
        interval,
        topic: modeConfig[mode].label,
      },
      {
        signal,
      },
    )
  }

  const startIteration = async (signal: AbortSignal) => {
    const stream = createStream(signal)
    for await (const event of stream) {
      appendEvent(event)
    }
  }

  const startEmitter = async (signal: AbortSignal) => {
    const stream = createStream(signal)
    stream.on('data', appendEvent)
    await stream.done
  }

  const handleStart = async () => {
    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    resetState()

    try {
      if (mode === 'iteration') {
        await startIteration(abortController.signal)
      }
      else {
        await startEmitter(abortController.signal)
      }
      setStatus('done')
    }
    catch (error) {
      if (abortController.signal.aborted) {
        setStatus('idle')
        return
      }
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
    finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }

  const handleCancel = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setStatus('idle')
  }

  return (
    <DemoWrapper>
      <div className="space-y-8">
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-accent/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LucideRadio className="size-4.5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">SSE 流式请求</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                使用 @kkfive/request 的 sse 方法连接本地 text/event-stream 端点，并展示两种消费模式的事件结果。
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="space-y-5 rounded-2xl border border-border/50 bg-card p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">流配置</h3>
              <p className="text-xs text-muted-foreground">POST /api/example/request/sse</p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              {(['iteration', 'emitter'] as const).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  disabled={isStreaming}
                  className={`rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    mode === item
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="block font-medium">{modeConfig[item].label}</span>
                  <span className="mt-0.5 block text-[10px]">{modeConfig[item].description}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 rounded-xl bg-muted/30 p-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">事件数量</label>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {count}
                    {' '}
                    条
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={count}
                  disabled={isStreaming}
                  onChange={event => setCount(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/20 accent-primary disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">事件间隔</label>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {interval}
                    ms
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={interval}
                  disabled={isStreaming}
                  onChange={event => setIntervalMs(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/20 accent-primary disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={isStreaming}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md disabled:cursor-wait disabled:opacity-60"
              >
                {isStreaming ? <LucidePause className="size-4" /> : <LucidePlay className="size-4" />}
                {isStreaming ? '接收中' : '开始流'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isStreaming}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="取消流"
              >
                <LucideSquare className="size-4" />
              </button>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">实时响应</h3>
                <p className="text-xs text-muted-foreground">
                  {modeConfig[mode].label}
                  {' '}
                  ·
                  {' '}
                  {events.length}
                  {' '}
                  events
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                status === 'streaming'
                  ? 'bg-blue-500/10 text-blue-600'
                  : status === 'done'
                    ? 'bg-green-500/10 text-green-600'
                    : status === 'error'
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-muted text-muted-foreground'
              }`}
              >
                {status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {progress}
                  %
                </span>
                <span>{events.length ? `${events.length}/${count + 1}` : '0 events'}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/[0.03] p-3 text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="rounded-xl bg-muted/30 p-4">
              <div className="mb-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">拼接内容</div>
              <p className="min-h-12 text-sm leading-relaxed text-foreground">
                {content || '等待流事件...'}
              </p>
            </div>

            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
              {events.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                  暂无事件
                </div>
              )}
              {events.map(item => (
                <div key={`${item.event}-${item.id}`} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                      {item.event}
                      #
                      {item.id}
                    </span>
                    {item.data.progress !== undefined && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {item.data.progress}
                        %
                      </span>
                    )}
                  </div>
                  <pre className="overflow-auto font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DemoWrapper>
  )
}
