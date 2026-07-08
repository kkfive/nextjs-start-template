export const dynamic = 'force-dynamic'

type SseRequestBody = {
  count?: number
  interval?: number
  topic?: string
}

const encoder = new TextEncoder()

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatSseEvent(id: number, data: unknown, event = 'message') {
  return `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

async function readRequestBody(request: Request): Promise<SseRequestBody> {
  try {
    return await request.json() as SseRequestBody
  }
  catch {
    return {}
  }
}

export async function POST(request: Request) {
  const body = await readRequestBody(request)
  const count = clamp(Number(body.count ?? 5), 1, 12)
  const interval = clamp(Number(body.interval ?? 450), 100, 2000)
  const topic = body.topic || 'request stream'

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(formatSseEvent(0, {
        type: 'start',
        message: `开始推送 ${topic}`,
        total: count,
      }, 'status')))

      for (let index = 1; index <= count; index += 1) {
        await new Promise(resolve => setTimeout(resolve, interval))
        controller.enqueue(encoder.encode(formatSseEvent(index, {
          type: 'chunk',
          index,
          total: count,
          content: `第 ${index} 段流式内容`,
          progress: Math.round((index / count) * 100),
          timestamp: new Date().toISOString(),
        })))
      }

      controller.enqueue(encoder.encode('event: done\ndata: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  })
}
