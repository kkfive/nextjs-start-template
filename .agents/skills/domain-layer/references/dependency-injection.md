# 依赖注入规范

## 核心原则

Domain 层必须通过参数接收 `HttpService` 实例，禁止直接 import 全局 http 实例。

## 为什么需要依赖注入

Next.js App Router 存在两个运行时环境：
- **Server Components**: 使用 `httpServer`（从 `@/service/index.server` 导入）
- **Client Components**: 使用 `httpClient`（从 `@/service/index.client` 导入）

Domain 层代码需要同时支持这两种环境，因此不能硬编码使用哪个实例。

## 参数顺序约定

**`http: HttpService` 始终作为第一个参数**，形成肌肉记忆。

```typescript
// ✅ 正确：http 始终作为第一个参数
getList: async (http: HttpService, query?: ListQuery) => { ... }
getDetail: async (http: HttpService, id: string) => { ... }
create: async (http: HttpService, data: CreateRequest) => { ... }
update: async (http: HttpService, id: string, data: UpdateRequest) => { ... }
delete: async (http: HttpService, id: string) => { ... }

// ❌ 错误：http 不是第一个参数
getList: async (query?: ListQuery, http: HttpService) => { ... }
```

## Service 层示例

```typescript
// domain/material/service.ts
import type { HttpService } from '@/lib/request'
import { MATERIAL_API } from './const/api'

export const materialService = {
  getList: async (
    http: HttpService,
    query?: Material.ListQuery,
  ): Promise<Material.ListResponse> => {
    return http.get(MATERIAL_API.LIST, { searchParams: query })
  },

  getDetail: async (
    http: HttpService,
    id: string,
  ): Promise<Material.Item> => {
    return http.get(MATERIAL_API.DETAIL(id))
  },

  create: async (
    http: HttpService,
    data: Material.CreateRequest,
  ): Promise<Material.CreateResponse> => {
    return http.post(MATERIAL_API.CREATE, { json: data })
  },
}
```

## Controller 层示例

```typescript
// domain/material/controller.ts
import type { HttpService } from '@/lib/request'
import { materialService } from './service'

export const materialController = {
  // 直接透传
  getList: async (
    http: HttpService,
    query?: Material.ListQuery,
  ): Promise<Material.ListResponse> => {
    return materialService.getList(http, query)
  },

  // 业务编排
  createAndRefresh: async (
    http: HttpService,
    data: Material.CreateRequest,
  ): Promise<{ created: Material.CreateResponse, list: Material.ListResponse }> => {
    const created = await materialController.create(http, data)
    const list = await materialController.getList(http)
    return { created, list }
  },
}
```

## Hooks 层（内部注入）

Hooks 层是唯一可以硬编码 http 实例的地方，因为 Hooks 只在 Client Components 中使用。

```typescript
// domain/material/hooks.ts
import { httpClient } from '@/service/index.client' // Client 环境专用

export function useMaterialList(query?: Material.ListQuery) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(query),
    queryFn: () => materialController.getList(httpClient, query), // 注入 httpClient
  })
}
```

## 使用场景

### Server Component

```typescript
// src/app/(platform)/material/page.tsx
import { httpServer } from '@/service/index.server'
import { materialController } from '@/domain/material'

export default async function MaterialPage() {
  const data = await materialController.getList(httpServer)
  return <div>{data.items.length}</div>
}
```

### Client Component（使用 Hooks）

```typescript
// src/app/(platform)/material/page.tsx
'use client'
import { useMaterialList } from '@/domain/material'

export default function MaterialPage() {
  const { data } = useMaterialList() // Hook 内部自动注入 httpClient
  return <div>{data?.items.length}</div>
}
```

### Client Component（直接调用 Controller）

```typescript
// src/app/(platform)/material/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { materialController, MATERIAL_QUERY_KEYS } from '@/domain/material'

export default function MaterialPage() {
  const { data } = useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(),
    queryFn: () => materialController.getList(httpClient), // 手动注入 httpClient
  })
  return <div>{data?.items.length}</div>
}
```

## 禁止的模式

```typescript
// ❌ 错误：直接 import 全局实例
import { http } from '@/service/index.base'

export const materialService = {
  getList: async () => {
    return http.get('/api/materials') // 无法适配不同环境
  },
}
```

```typescript
// ❌ 错误：在 Service/Controller 中 import httpClient/httpServer
import { httpClient } from '@/service/index.client'

export const materialService = {
  getList: async () => {
    return httpClient.get('/api/materials') // 只能在 Client 环境使用
  },
}
```
