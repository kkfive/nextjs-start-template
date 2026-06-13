# Hooks 层规范

## 职责

Hooks 层封装 React Query，提供：
- 统一的查询和变更逻辑
- 统一的错误处理和成功提示
- 统一的缓存失效策略
- 类型安全的 options 参数

## 核心规则

1. **内部注入 httpClient**：Hooks 只在 Client Components 中使用
2. **统一错误处理**：使用 toast 提示
3. **统一缓存失效**：变更后刷新相关查询

## 查询 Hooks

```typescript
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { materialController } from './controller'
import { MATERIAL_QUERY_KEYS } from './const/api'

/**
 * 获取材料列表
 * Hook 内部自动注入 httpClient
 */
export function useMaterialList(
  query?: Material.ListQuery,
  options?: Omit<UseQueryOptions<Material.ListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(query),
    queryFn: () => materialController.getList(httpClient, query),
    ...options,
  })
}

/**
 * 获取材料详情
 * Hook 内部自动注入 httpClient
 */
export function useMaterialDetail(
  id: string,
  options?: Omit<UseQueryOptions<Material.Item>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.detail(id),
    queryFn: () => materialController.getDetail(httpClient, id),
    enabled: !!id,
    ...options,
  })
}
```

## 变更 Hooks

```typescript
import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { toast } from '@/components/ui/sonner'
import { materialController } from './controller'
import { MATERIAL_QUERY_KEYS } from './const/api'

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
      materialController.create(httpClient, data),
    onSuccess: (data, variables, context) => {
      toast.success('创建成功')
      queryClient.invalidateQueries({
        queryKey: MATERIAL_QUERY_KEYS.lists(),
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
      materialController.update(httpClient, id, data),
    onSuccess: (data, variables, context) => {
      toast.success('更新成功')
      queryClient.invalidateQueries({
        queryKey: MATERIAL_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: MATERIAL_QUERY_KEYS.detail(variables.id),
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
      materialController.delete(httpClient, id),
    onSuccess: (data, variables, context) => {
      toast.success('删除成功')
      queryClient.invalidateQueries({
        queryKey: MATERIAL_QUERY_KEYS.lists(),
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
'use client'

import { useMaterialList, useCreateMaterial } from '@/domain/material'

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
| Server Component | 直接调用 Controller |

## 禁止的模式

```typescript
// ❌ 错误：在 Hooks 中使用 httpServer
import { httpServer } from '@/service/index.server'

export function useMaterialList() {
  return useQuery({
    queryFn: () => materialController.getList(httpServer), // 错误！
  })
}
```

```typescript
// ❌ 错误：在 Hooks 中接收 http 参数
export function useMaterialList(http: HttpService) {
  return useQuery({
    queryFn: () => materialController.getList(http), // 错误！
  })
}
```
