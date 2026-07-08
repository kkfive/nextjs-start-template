import { http as mswHttp } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TEST_BASE_URL } from '@/__tests__/mocks/handlers'
import { server } from '@/__tests__/mocks/server'

type TestChunk = {
  type: 'start' | 'chunk'
  content?: string
}

const encoder = new TextEncoder()

function createSseResponse() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('id: 1\nevent: message\ndata: {"type":"start","content":"hello"}\n\n'))
      controller.enqueue(encoder.encode('id: 2\nevent: message\ndata: {"type":"chunk","content":" world"}\n\n'))
      controller.enqueue(encoder.encode('event: done\ndata: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
    },
  })
}

describe('sse request service', () => {
  beforeAll(() => server.listen())

  afterEach(() => {
    server.resetHandlers()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterAll(() => server.close())

  it('should consume text/event-stream through @kkfive/request client.sse', async () => {
    let requestBody: unknown

    server.use(
      mswHttp.post(`${TEST_BASE_URL}/api/example/request/sse`, async ({ request }) => {
        requestBody = await request.json()

        return createSseResponse()
      }),
    )
    vi.stubEnv('NEXT_PUBLIC_API_URL', TEST_BASE_URL)
    vi.stubEnv('SKIP_ENV_VALIDATION', 'true')

    const { createRequestSseStream } = await import('./index.sse')
    const stream = createRequestSseStream<TestChunk>('/api/example/request/sse', {
      topic: 'vitest',
    })
    const events = []

    for await (const event of stream) {
      events.push(event)
    }

    expect(requestBody).toEqual({ topic: 'vitest' })
    expect(events.map(event => ({
      id: event.id,
      data: event.data,
    }))).toEqual([
      {
        id: '1',
        data: { type: 'start', content: 'hello' },
      },
      {
        id: '2',
        data: { type: 'chunk', content: ' world' },
      },
    ])
  })
})
