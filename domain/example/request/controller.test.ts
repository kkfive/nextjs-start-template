import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { server } from '@/__tests__/mocks/server'
import { HttpService } from '@/lib/request'
import { BusinessError } from '@/lib/request/error'
import { Controller } from './controller'

describe('controller', () => {
  let httpClient: HttpService

  beforeAll(() => {
    server.listen()
    httpClient = new HttpService()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('unifiedScenario', () => {
    it('should return data for success scenario', async () => {
      const result = await Controller.unifiedScenario(httpClient, 'success')

      expect(result).toEqual({
        a: 1,
        b: 2,
        token: 'test-token',
      })
    })

    it('should throw BusinessError for business-error scenario', async () => {
      await expect(
        Controller.unifiedScenario(httpClient, 'business-error'),
      ).rejects.toThrow(BusinessError)

      try {
        await Controller.unifiedScenario(httpClient, 'business-error')
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError<null>).code).toBe(1001)
        expect((error as BusinessError<null>).message).toBe('Business logic error')
        expect((error as BusinessError<null>).response).toMatchObject({
          success: false,
          code: 1001,
          message: 'Business logic error',
        })
      }
    })

    it('should throw BusinessError for error-400 scenario', async () => {
      await expect(
        Controller.unifiedScenario(httpClient, 'error-400'),
      ).rejects.toThrow(BusinessError)

      try {
        await Controller.unifiedScenario(httpClient, 'error-400')
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError<null>).code).toBe(400)
        expect((error as BusinessError<null>).message).toBe('Bad Request')
      }
    })

    it('should throw BusinessError for error-401 scenario', async () => {
      await expect(
        Controller.unifiedScenario(httpClient, 'error-401'),
      ).rejects.toThrow(BusinessError)

      try {
        await Controller.unifiedScenario(httpClient, 'error-401')
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError<null>).code).toBe(401)
        expect((error as BusinessError<null>).message).toBe('Unauthorized')
      }
    })

    it('should support custom HTTP methods', async () => {
      const result = await Controller.unifiedScenario(
        httpClient,
        'success',
        { method: 'POST' },
      )

      expect(result).toEqual({
        a: 1,
        b: 2,
        token: 'test-token',
      })
    })

    it('should pass request options to BusinessError', async () => {
      const config = { method: 'POST' as const, timeout: 5000 }

      try {
        await Controller.unifiedScenario(httpClient, 'business-error', config)
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError<null>).options).toMatchObject({
          method: 'POST',
        })
      }
    })
  })

  describe('transformData', () => {
    it('should return data for successful response', async () => {
      // const successResponse: HttpResponseSuccess<{ message: string }> = {
      //   success: true,
      //   data: { message: 'Success' },
      // }

      // Access transformData through Controller method behavior
      const result = Controller.unifiedScenario(httpClient, 'success')
      await expect(result).resolves.toBeDefined()
    })

    it('should throw BusinessError for error response', async () => {
      // const errorResponse: HttpResponseError<null> = {
      //   success: false,
      //   code: 500,
      //   message: 'Internal Server Error',
      //   data: null,
      //   errorShowType: 2,
      //   requestId: 'req-500',
      //   timestamp: '2026-01-21T10:00:00Z',
      // }

      // Verify transformData behavior through Controller
      await expect(
        Controller.unifiedScenario(httpClient, 'business-error'),
      ).rejects.toThrow(BusinessError)
    })

    it('should preserve error details in BusinessError', async () => {
      try {
        await Controller.unifiedScenario(httpClient, 'business-error')
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        const businessError = error as BusinessError<null>
        expect(businessError.code).toBe(1001)
        expect(businessError.message).toBe('Business logic error')
        expect(businessError.response).toMatchObject({
          success: false,
          code: 1001,
          errorShowType: 2,
          requestId: 'req-123',
        })
      }
    })

    it('should handle responses with optional fields', async () => {
      const result = await Controller.unifiedScenario(httpClient, 'success')

      expect(result).toHaveProperty('a')
      expect(result).toHaveProperty('b')
      expect(result).toHaveProperty('token')
    })
  })
})
