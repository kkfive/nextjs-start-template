import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMouseStore } from '../model/mouse-store'
import ZustandMousePage from './zustand-mouse-page'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const Component = tag as keyof React.JSX.IntrinsicElements
      const { animate: _animate, transition: _transition, ...domProps } = props
      return <Component {...domProps}>{children}</Component>
    },
  }),
  useReducedMotion: () => false,
}))

vi.mock('@/features/demo/navigation/components/demo-wrapper', () => ({
  DemoWrapper: ({ children }: React.PropsWithChildren) => <main>{children}</main>,
}))

describe('zustandMousePage lifecycle', () => {
  let nextFrame = 1
  let frames: Map<number, FrameRequestCallback>

  beforeEach(() => {
    useMouseStore.setState({ x: 0, y: 0 })
    frames = new Map()
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrame++
      frames.set(id, callback)
      return id
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const flushFrame = () => {
    const pending = [...frames.entries()]
    frames.clear()
    pending.forEach(([, callback]) => callback(performance.now()))
  }

  it('合并 mousemove、暂停后停止更新并在恢复后继续', () => {
    render(<ZustandMousePage />)

    fireEvent.mouseMove(window, { clientX: 100, clientY: 200 })
    fireEvent.mouseMove(window, { clientX: 300, clientY: 400 })
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    act(flushFrame)
    expect(useMouseStore.getState()).toMatchObject({ x: 300, y: 400 })

    fireEvent.click(screen.getByRole('button', { name: '跟踪中' }))
    fireEvent.mouseMove(window, { clientX: 500, clientY: 600 })
    expect(frames).toHaveLength(0)
    expect(useMouseStore.getState()).toMatchObject({ x: 300, y: 400 })

    fireEvent.click(screen.getByRole('button', { name: '已暂停' }))
    fireEvent.mouseMove(window, { clientX: 700, clientY: 800 })
    act(flushFrame)
    expect(useMouseStore.getState()).toMatchObject({ x: 700, y: 800 })
  })

  it('卸载时取消待执行 RAF 并清理监听器', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<ZustandMousePage />)
    fireEvent.mouseMove(window, { clientX: 10, clientY: 20 })

    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1)
    expect(removeListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(frames).toHaveLength(0)
  })
})
