'use client'

import type { ReactNode } from 'react'
import { Component } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 错误边界组件 - 捕获子组件树中的 JavaScript 错误
 *
 * 用于防止单个组件错误导致整个应用崩溃
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example 自定义错误 UI
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>出错了: {error.message}</p>
 *       <button onClick={reset}>重试</button>
 *     </div>
 *   )}
 * >
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到控制台
    console.error('ErrorBoundary caught:', error, errorInfo)

    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // 使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      // 默认错误 UI
      return (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <div className="text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">组件加载失败</h3>
            <p className="mb-4 text-sm text-gray-600">{this.state.error.message}</p>
            <Button type="primary" onClick={this.reset}>
              重试
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
