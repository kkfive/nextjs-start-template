import { describe, expect, it } from 'vitest'
import { BusinessError } from './error'

describe('businessError', () => {
  it('should create an error with message', () => {
    const error = new BusinessError('Something went wrong')

    expect(error.message).toBe('Something went wrong')
    expect(error.name).toBe('BusinessError')
  })

  it('should be an instance of Error', () => {
    const error = new BusinessError('Test error')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(BusinessError)
  })

  it('should store error code', () => {
    const error = new BusinessError('Unauthorized', {
      code: 401,
      response: { status: 401, data: null },
    })

    expect(error.code).toBe(401)
  })

  it('should store response data', () => {
    const responseData = {
      status: 400,
      data: { field: 'email', message: 'Invalid email' },
    }

    const error = new BusinessError('Validation failed', {
      code: 400,
      response: responseData,
    })

    expect(error.response).toEqual(responseData)
  })

  it('should store request options', () => {
    const options = {
      method: 'POST' as const,
      json: { email: 'test@example.com' },
    }

    const error = new BusinessError('Request failed', {
      code: 500,
      response: { status: 500, data: null },
      options,
    })

    expect(error.options).toEqual(options)
  })

  it('should handle missing options', () => {
    const error = new BusinessError('Simple error')

    expect(error.code).toBeUndefined()
    expect(error.response).toBeUndefined()
    expect(error.options).toBeUndefined()
  })

  it('should have correct stack trace', () => {
    const error = new BusinessError('Stack test')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('BusinessError')
  })
})
