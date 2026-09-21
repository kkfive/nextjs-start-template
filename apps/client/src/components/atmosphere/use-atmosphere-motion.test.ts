import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAtmosphereMotion } from './use-atmosphere-motion'

function createMatchMediaControllers() {
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>()
  const matches = new Map<string, boolean>([
    ['(prefers-reduced-motion: reduce)', false],
    ['(max-width: 768px)', false],
  ])

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches.get(query) ?? false,
    media: query,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (!listeners.has(query))
        listeners.set(query, new Set())
      listeners.get(query)!.add(listener)
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.get(query)?.delete(listener)
    },
    onchange: null,
    dispatchEvent: () => true,
  }))

  return {
    reduced: { setMatches: (value: boolean) => {
      matches.set('(prefers-reduced-motion: reduce)', value)
      listeners.get('(prefers-reduced-motion: reduce)')?.forEach(listener => listener({ matches: value } as MediaQueryListEvent))
    } },
    mobile: { setMatches: (value: boolean) => {
      matches.set('(max-width: 768px)', value)
      listeners.get('(max-width: 768px)')?.forEach(listener => listener({ matches: value } as MediaQueryListEvent))
    } },
  }
}

describe('useAtmosphereMotion', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('reduced-motion 时关闭视差并保持静态', () => {
    const controllers = createMatchMediaControllers()
    controllers.reduced.setMatches(true)
    const { result } = renderHook(() => useAtmosphereMotion())
    expect(result.current.reducedMotion).toBe(true)
    expect(result.current.parallaxEnabled).toBe(false)
  })

  it('移动端降低粒子密度', () => {
    const controllers = createMatchMediaControllers()
    controllers.mobile.setMatches(true)
    const { result } = renderHook(() => useAtmosphereMotion())
    expect(result.current.mobile).toBe(true)
    expect(result.current.density).toBeLessThan(1)
  })
})
