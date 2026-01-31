import type { RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

/**
 * 为每个测试创建新的 QueryClient
 * 防止测试之间的状态泄漏
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * 测试用 Provider 包装器
 */
function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * 自定义渲染函数，使用所有必要的 Provider 包装组件
 * 使用此函数代替 @testing-library/react 的 render
 *
 * @example
 * ```tsx
 * import { render, screen } from '@/__tests__/test-utils'
 *
 * test('renders component', () => {
 *   render(<MyComponent />)
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// 从 testing-library 重新导出所有内容
export * from '@testing-library/react'

// 用自定义 render 覆盖默认 render
export { customRender as render }

// 导出 QueryClient 创建函数供高级用例使用
export { createTestQueryClient }
