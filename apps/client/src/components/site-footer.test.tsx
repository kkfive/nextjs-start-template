import type { SiteFooterData } from './site-footer-model'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteFooterView } from './site-footer'

function data(overrides: Partial<SiteFooterData> = {}): SiteFooterData {
  return {
    brand: { name: 'Test Brand' },
    copyright: '© Test',
    ...overrides,
  }
}

describe('siteFooterView', () => {
  // Footer 氛围层包含 ParticleCanvas，需要 stub jsdom 缺失的浏览器 API。
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }))
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
    })
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })
  it('无链接分组时保留品牌和稳定元信息', () => {
    render(<SiteFooterView data={data()} />)
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Test Brand')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© Test')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('少量分组按标题提供导航语义', () => {
    render(<SiteFooterView data={data({ groups: [{ id: 'main', title: '主导航', links: [{ label: '首页', href: '/' }] }] })} />)
    expect(screen.getByRole('navigation', { name: '主导航' })).toHaveTextContent('首页')
  })

  it('丰富数据呈现分组、友链、联系方式、合规和构建信息', () => {
    render(
      <SiteFooterView data={data({
        groups: [{ id: 'docs', title: '文档', links: [{ label: '指南', href: '/guide' }] }],
        friends: [{ label: '朋友', href: 'https://example.com', external: true }],
        contacts: [{ label: '邮件', value: 'hi@example.com', href: 'mailto:hi@example.com' }],
        compliance: [{ label: '备案', href: '#' }],
        version: 'V2',
        build: 'BUILD 9',
      })}
      />,
    )
    expect(screen.getByRole('navigation', { name: '友情链接' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '联系' })).toBeInTheDocument()
    expect(screen.getByText('备案')).toBeInTheDocument()
    expect(screen.getByText('V2 · BUILD 9')).toBeInTheDocument()
  })
})
