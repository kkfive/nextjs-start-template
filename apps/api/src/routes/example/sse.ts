import type { Context } from 'hono'
import { stream } from 'hono/streaming'

const encoder = new TextEncoder()

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// 帧格式与 @kkfive/http-client 的 parse-sse 对齐：id / event / data
function formatSseEvent(id: number, data: unknown, event = 'message') {
  return `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

type SseRequestBody = {
  count?: number
  interval?: number
  topic?: string
}

/**
 * SSE 流式推送 handler。
 * hc 不支持流式语义，客户端经 @kkfive/http-client 的 .sse() 直连此端点。
 * 用原始 stream 手动写帧，保证与前端解析器格式一致。
 */
export async function handleSseStream(c: Context) {
  const body = await c.req.json().catch(() => ({}) as SseRequestBody)
  const count = clamp(Number(body.count ?? 5), 1, 12)
  const interval = clamp(Number(body.interval ?? 450), 100, 2000)
  const topic = body.topic || 'request stream'

  c.header('Content-Type', 'text/event-stream; charset=utf-8')
  c.header('Cache-Control', 'no-cache, no-transform')
  c.header('Connection', 'keep-alive')
  c.header('X-Accel-Buffering', 'no')

  return stream(c, async (s) => {
    await s.write(encoder.encode(formatSseEvent(0, {
      type: 'start',
      message: `开始推送 ${topic}`,
      total: count,
    }, 'status')))

    for (let index = 1; index <= count; index += 1) {
      await s.sleep(interval)
      await s.write(encoder.encode(formatSseEvent(index, {
        type: 'chunk',
        index,
        total: count,
        content: `第 ${index} 段流式内容`,
        progress: Math.round((index / count) * 100),
        timestamp: new Date().toISOString(),
      })))
    }

    await s.write(encoder.encode('event: done\ndata: [DONE]\n\n'))
  })
}
