import { describe, expect, it } from 'vitest'
import { cn, isExternalLink, to } from './utils'

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('to (promise wrapper)', () => {
  it('should return [null, data] on success', async () => {
    const promise = Promise.resolve('success')
    const [error, data] = await to(promise)

    expect(error).toBeNull()
    expect(data).toBe('success')
  })

  it('should return [error, undefined] on failure', async () => {
    const promise = Promise.reject(new Error('failed'))
    const [error, data] = await to(promise)

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('failed')
    expect(data).toBeUndefined()
  })

  it('should extend error with errorExt', async () => {
    const promise = Promise.reject(new Error('failed'))
    const [error] = await to(promise, { code: 'ERR_001' })

    expect(error).toHaveProperty('code', 'ERR_001')
  })
})

describe('isExternalLink', () => {
  it('should return false for empty string', () => {
    expect(isExternalLink('')).toBe(false)
  })

  it('should return false for internal paths starting with /', () => {
    expect(isExternalLink('/about')).toBe(false)
    expect(isExternalLink('/users/123')).toBe(false)
  })

  it('should return false for hash links', () => {
    expect(isExternalLink('#section')).toBe(false)
  })

  it('should return true for external URLs', () => {
    expect(isExternalLink('https://example.com')).toBe(true)
    expect(isExternalLink('http://example.com')).toBe(true)
    expect(isExternalLink('mailto:test@example.com')).toBe(true)
  })
})
