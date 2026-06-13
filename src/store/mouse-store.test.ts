import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useMouseStore } from './mouse-store'

describe('useMouseStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMouseStore.setState({ x: 0, y: 0 })
  })

  it('should have initial state of x=0 and y=0', () => {
    const state = useMouseStore.getState()

    expect(state.x).toBe(0)
    expect(state.y).toBe(0)
  })

  it('should set x and y when update is called with coordinates', () => {
    const { update } = useMouseStore.getState()

    act(() => {
      update(12, 24)
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(12)
    expect(state.y).toBe(24)
  })

  it('should keep the latest coordinates after multiple updates', () => {
    const { update } = useMouseStore.getState()

    act(() => {
      update(1, 2)
      update(3, 4)
      update(5, 6)
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(5)
    expect(state.y).toBe(6)
  })

  it('should allow direct state updates via setState', () => {
    act(() => {
      useMouseStore.setState({ x: 100, y: 200 })
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(100)
    expect(state.y).toBe(200)
  })

  it('should preserve update function after setState', () => {
    act(() => {
      useMouseStore.setState({ x: 10, y: 20 })
    })

    const { update } = useMouseStore.getState()

    act(() => {
      update(30, 40)
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(30)
    expect(state.y).toBe(40)
  })
})
