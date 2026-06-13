import { delay, HttpResponse, http as mswHttp } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { TEST_BASE_URL } from '@/__tests__/mocks/handlers'
import { server } from '@/__tests__/mocks/server'
import { HttpService } from './index'

describe('httpService', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should create an instance with default options', () => {
    const http = new HttpService()

    expect(http.instance).toBeDefined()
  })

  it('should create an instance with custom options', () => {
    const http = new HttpService({
      prefix: 'https://api.example.com',
      timeout: 5000,
    })

    expect(http.instance).toBeDefined()
  })

  it('should let custom options override service defaults', async () => {
    server.use(
      mswHttp.get(`${TEST_BASE_URL}/api/example/request/slow`, async () => {
        await delay(50)
        return HttpResponse.json({ success: true })
      }),
    )

    const http = new HttpService({
      prefix: TEST_BASE_URL,
      timeout: 1,
    })

    await expect(http.get('api/example/request/slow')).rejects.toThrow('Request timed out')
  })

  it('should make GET requests with prefix', async () => {
    const http = new HttpService({
      prefix: TEST_BASE_URL,
    })

    const data = await http.get<{ success: true, data: { message: string } }>('api/example/request/success')

    expect(data).toEqual({
      success: true,
      data: { message: 'Success response' },
    })
  })

  it('should handle 400 errors', async () => {
    const http = new HttpService({
      prefix: TEST_BASE_URL,
    })

    await expect(http.get('api/example/request/error/400')).rejects.toThrow()
  })

  it('should handle 401 errors', async () => {
    const http = new HttpService({
      prefix: TEST_BASE_URL,
    })

    await expect(http.get('api/example/request/error/401')).rejects.toThrow()
  })

  it('should support POST method', async () => {
    const http = new HttpService()

    // POST method should work (even if endpoint doesn't exist, method is available)
    expect(typeof http.post).toBe('function')
  })

  it('should support PUT method', async () => {
    const http = new HttpService()

    expect(typeof http.put).toBe('function')
  })

  it('should support DELETE method', async () => {
    const http = new HttpService()

    expect(typeof http.delete).toBe('function')
  })

  it('should support PATCH method', async () => {
    const http = new HttpService()

    expect(typeof http.patch).toBe('function')
  })
})
