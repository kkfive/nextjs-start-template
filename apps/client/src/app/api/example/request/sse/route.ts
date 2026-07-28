import type { NextRequest } from 'next/server'

type SseRequestBody = {
  count?: number
  interval?: number
  topic?: string
}

const encoder = new TextEncoder()

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatSseEvent(id: number | undefined, event: string, data: unknown) {
  return `${id === undefined ? '' : `id: ${id}\n`}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function wait(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, duration)
    signal.addEventListener('abort', () => {
      clearTimeout(timeout)
      resolve()
    }, { once: true })
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as SseRequestBody
  const count = clamp(Number(body.count ?? 5), 1, 12)
  const interval = clamp(Number(body.interval ?? 450), 100, 2000)
  const topic = body.topic || 'request stream'

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(formatSseEvent(0, 'status', {
        type: 'start',
        message: `开始推送 ${topic}`,
        total: count,
      })))

      for (let index = 1; index <= count; index += 1) {
        await wait(interval, request.signal)
        if (request.signal.aborted) {
          controller.close()
          return
        }
        controller.enqueue(encoder.encode(formatSseEvent(index, 'message', {
          type: 'chunk',
          index,
          total: count,
          content: `第 ${index} 段流式内容`,
          progress: Math.round((index / count) * 100),
          timestamp: new Date().toISOString(),
        })))
      }

      controller.enqueue(encoder.encode(formatSseEvent(undefined, 'done', '[DONE]')))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  })
}
