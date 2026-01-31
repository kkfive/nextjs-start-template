'use client'

import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'
import * as React from 'react'
import { BusinessError } from '@/lib/request/error'

/**
 * 全局错误处理函数
 * 在 useQuery/useMutation 的 meta 中设置 skipGlobalErrorHandler: true 可跳过
 */
function handleGlobalError(error: Error, skipGlobalErrorHandler?: boolean) {
  if (skipGlobalErrorHandler) {
    return
  }

  if (error instanceof BusinessError) {
    // TODO: 替换为实际的 toast 组件
    console.error(`[业务错误] ${error.message}`, { code: error.code })
  }
  else {
    console.error(`[请求错误] ${error.message}`)
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        handleGlobalError(error, query.meta?.skipGlobalErrorHandler as boolean)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        handleGlobalError(error, mutation.meta?.skipGlobalErrorHandler as boolean)
      },
    }),
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  }
  else {
    if (!browserQueryClient)
      browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
