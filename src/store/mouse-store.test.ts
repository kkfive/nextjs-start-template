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

  it('should increment x and y when update is called', () => {
    const { update } = useMouseStore.getState()

    act(() => {
      update()
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(1)
    expect(state.y).toBe(1)
  })

  it('should increment multiple times', () => {
    const { update } = useMouseStore.getState()

    act(() => {
      update()
      update()
      update()
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(3)
    expect(state.y).toBe(3)
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
      update()
    })

    const state = useMouseStore.getState()
    expect(state.x).toBe(11)
    expect(state.y).toBe(21)
  })
})
