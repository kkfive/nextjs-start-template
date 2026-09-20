import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { server } from '@/__tests__/mocks/server'
import { ExampleCard } from './components/example-card'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('example feature', () => {
  it('展示 SSR 首屏数据', () => {
    render(<ExampleCard initialData={{ message: 'example ping', time: 't0' }} />)
    expect(screen.getByText('example ping')).toBeInTheDocument()
  })

  it('点击「再次请求」重新获取并更新视图', async () => {
    // RPC 边界：rpcClient 指向外部 API origin（8787），MSW 按该 URL 隔离外部依赖
    server.use(
      http.get('http://localhost:8787/example/ping', () => HttpResponse.json({
        success: true,
        data: { message: '刷新后的 ping', time: 't1' },
      })),
    )

    render(<ExampleCard initialData={null} />)
    fireEvent.click(screen.getByRole('button', { name: '再次请求' }))

    await waitFor(() => expect(screen.getByText('刷新后的 ping')).toBeInTheDocument())
  })

  it('请求失败时展示错误信息而非崩溃', async () => {
    server.use(
      http.get('http://localhost:8787/example/ping', () => HttpResponse.json({
        success: false,
        code: 500,
        message: 'boom',
        data: null,
      }, { status: 500 })),
    )

    render(<ExampleCard initialData={null} />)
    fireEvent.click(screen.getByRole('button', { name: '再次请求' }))

    await waitFor(() => expect(screen.getByText(/请求失败/)).toBeInTheDocument())
  })
})
