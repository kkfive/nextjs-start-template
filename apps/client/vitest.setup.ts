import React from 'react'
import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// 模拟 Next.js 路由
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// 模拟 Next.js Image 组件
vi.mock('next/image', () => ({
  default: (props: { src: string, alt: string }) => {
    return React.createElement('img', props)
  },
}))
