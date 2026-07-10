# Hooks 层规范

## 位置

Hooks 层位于**各 Next.js app 的 Domain 适配层**（`apps/{app}/domain/{module}/hooks.ts`），不在 `@kkfive/domain-core` 共享包里。`apps/api` 无 hooks。

## 职责

Hooks 层封装 React Query，提供：
- 统一的查询和变更逻辑
- 统一的错误处理和成功提示
- 统一的缓存失效策略
- 类型安全的 options 参数
- 内联 Query Keys（共享包框架无关，Query Keys 不进共享包）

## 核心规则

1. **内部注入该 app 的 HttpService 实例**：Hooks 只在该 app 的 Client Components 中使用
2. **通过 `Controller` 命名空间调用**：不直接依赖 Controller/service 的内部文件
3. **Query Keys 内联**：在 hooks.ts 顶部定义 `const QUERY_KEYS`，不 import 自共享包
4. **统一错误处理**：使用该 app 的 toast 提示
5. **统一缓存失效**：变更后用 `[...QUERY_KEYS.all, 'list']` 前缀刷新相关查询

## Query Keys 内联

```typescript
// apps/client/domain/material/hooks.ts 顶部
const QUERY_KEYS = {
  all: ['material'] as const,
  list: (query?: Material.ListQuery) => [...QUERY_KEYS.all, 'list', query] as const,
  detail: (id: string) => [...QUERY_KEYS.all, 'detail', id] as const,
}
```

## 查询 Hooks

```typescript
// apps/client/domain/material/hooks.ts
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { Controller } from '@kkfive/domain-core/material'

/**
 * 获取材料列表
 * Hook 内部自动注入该 app 的 httpClient
 */
export function useMaterialList(
  query?: Material.ListQuery,
  options?: Omit<UseQueryOptions<Material.ListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: QUERY_KEYS.list(query),
    queryFn: () => Controller.getList(httpClient, query),
    ...options,
  })
}
```

## 变更 Hooks

```typescript
// apps/client/domain/material/hooks.ts（续）
import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'

/**
 * 创建材料
 * Hook 内部自动注入 httpClient
 */
export function useCreateMaterial(
  options?: Omit<UseMutationOptions<Material.CreateResponse, Error, Material.CreateRequest>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Material.CreateRequest) =>
      Controller.create(httpClient, data),
    onSuccess: (data, variables, context) => {
      toast.success('创建成功')
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.all, 'list'],
      })
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(error.message || '创建失败')
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

/**
 * 更新材料
 * Hook 内部自动注入 httpClient
 */
export function useUpdateMaterial(
  options?: Omit<UseMutationOptions<Material.UpdateResponse, Error, { id: string, data: Material.UpdateRequest }>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) =>
      Controller.update(httpClient, id, data),
    onSuccess: (data, variables, context) => {
      toast.success('更新成功')
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.all, 'list'],
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      })
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(error.message || '更新失败')
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

/**
 * 删除材料
 * Hook 内部自动注入 httpClient
 */
export function useDeleteMaterial(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      Controller.remove(httpClient, id),
    onSuccess: (data, variables, context) => {
      toast.success('删除成功')
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.all, 'list'],
      })
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(error.message || '删除失败')
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}
```

## 使用方式

### 在组件中使用 Hooks

```typescript
// apps/client/src/app/(platform)/material/page.tsx
'use client'

import { useMaterialList, useCreateMaterial } from '@domain/material'

export default function MaterialPage() {
  const { data, isLoading } = useMaterialList()
  const createMutation = useCreateMaterial()

  return (
    <div>
      {isLoading ? <Loading /> : <List items={data?.items} />}
      <Button
        onClick={() => createMutation.mutate({ name: 'New Material' })}
        loading={createMutation.isPending}
      >
        创建
      </Button>
    </div>
  )
}
```

### 自定义 options

```typescript
const { data } = useMaterialList(
  { page: 1, keyword: 'test' },
  {
    staleTime: 5 * 60 * 1000, // 5 分钟内不重新请求
    refetchOnWindowFocus: false,
  },
)

const createMutation = useCreateMaterial({
  onSuccess: (data) => {
    router.push(`/material/${data.id}`)
  },
})
```

## 何时使用 Hooks 层

| 场景 | 推荐方式 |
|------|----------|
| 多个组件需要相同查询 | ✅ 使用 Hooks |
| 需要统一的缓存失效 | ✅ 使用 Hooks |
| 需要统一的错误处理 | ✅ 使用 Hooks |
| 简单的一次性查询 | 直接使用 useQuery |
| 需要高度自定义配置 | 直接使用 useQuery |
| Server Component | 直接调用 Controller（手动注入实例） |
| `apps/api`（Hono） | 无 hooks，路由同进程直调 Controller |

## 禁止的模式

```typescript
// ❌ 错误：把 hooks 写进 @kkfive/domain-core 共享包
// 共享包框架无关，不能依赖 React Query；hooks 留在各 Next.js app 适配层
```

```typescript
// ❌ 错误：从共享包 import Query Keys 常量
// 共享包禁含 react-query；Query Keys 内联在该 app 适配层的 hooks.ts（const QUERY_KEYS）
import { QUERY_KEYS } from '@kkfive/domain-core/material'
```

```typescript
// ❌ 错误：在该 app 的 Hooks 中使用服务端实例
import { httpServer } from '@/service/index.server'

export function useMaterialList() {
  return useQuery({
    queryFn: () => Controller.getList(httpServer), // Hooks 只在 Client 用
  })
}
```

```typescript
// ❌ 错误：在 Hooks 中接收 http 参数
export function useMaterialList(http: HttpService) {
  return useQuery({
    queryFn: () => Controller.getList(http), // 实例应由适配层内部注入
  })
}
```
