# 依赖注入规范

## 核心原则

`@kkfive/domain-core` 的 Service/Controller 必须通过参数接收 `HttpService` 实例，禁止直接 import 任何具体实例。具体实例由各 app 的 Domain 适配层注入。

## 为什么需要依赖注入

同一份 `@kkfive/domain-core` 纯逻辑要被多个 app 消费：
- **`apps/client`（浏览器）**：注入 `httpClient`（来自该 app 的 `src/service/index.client.ts`）
- **`apps/admin`（SSR）**：注入服务端实例（来自该 app 的 `src/service/index.server.ts`）
- **`apps/api`（Hono）**：同进程直调 Controller，不经过 HttpService

共享包代码需要支持多种环境，因此不能硬编码使用哪个实例。

## 参数顺序约定

**`http: HttpService` 始终作为第一个参数**，形成肌肉记忆。

```typescript
// ✅ 正确：http 始终作为第一个参数
getList: async (http: HttpService, query?: ListQuery) => { ... }
getDetail: async (http: HttpService, id: string) => { ... }
create: async (http: HttpService, data: CreateRequest) => { ... }

// ❌ 错误：http 不是第一个参数
getList: async (query?: ListQuery, http: HttpService) => { ... }
```

## 共享包 Service 层示例

```typescript
// packages/domain-core/src/material/service.ts
import type { HttpService } from '@kkfive/http-client'
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
}
```

## 共享包 Controller 层示例

```typescript
// packages/domain-core/src/material/controller.ts
import type { HttpService } from '@kkfive/http-client'
import { materialService } from './service'

export const materialController = {
  getList: async (
    http: HttpService,
    query?: Material.ListQuery,
  ): Promise<Material.ListResponse> => {
    return materialService.getList(http, query)
  },

  createAndRefresh: async (
    http: HttpService,
    data: Material.CreateRequest,
  ) => {
    const created = await materialController.create(http, data)
    const list = await materialController.getList(http)
    return { created, list }
  },
}
```

## 适配层注入实例（apps/client）

适配层负责把该 app 的 HttpService 实例绑定到共享包的 Controller：

```typescript
// apps/client/domain/material/index.ts
import { materialController } from '@kkfive/domain-core/material'
import { httpClient } from '@/service/index.client'

// 注入浏览器实例，供 hooks 与页面使用
export const Controller = {
  getList: (query?: Material.ListQuery) => materialController.getList(httpClient, query),
  getDetail: (id: string) => materialController.getDetail(httpClient, id),
}
```

## Hooks 层（Next.js apps 专属，内部注入）

Hooks 层是该 app 适配层里唯一可以引用具体实例的地方，因为 Hooks 只在 Client Components 中使用。

```typescript
// apps/client/domain/material/hooks.ts
import { httpClient } from '@/service/index.client'
import { materialController } from '@kkfive/domain-core/material'

export function useMaterialList(query?: Material.ListQuery) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(query),
    queryFn: () => materialController.getList(httpClient, query),
  })
}
```

## 使用场景

### Server Component（手动注入服务端实例）

```typescript
// apps/client/src/app/(platform)/material/page.tsx
import { httpServer } from '@/service/index.server'
import { materialController } from '@kkfive/domain-core/material'

export default async function MaterialPage() {
  const data = await materialController.getList(httpServer)
  return <div>{data.items.length}</div>
}
```

### Client Component（使用 Hooks）

```typescript
// apps/client/src/app/(platform)/material/page.tsx
'use client'
import { useMaterialList } from '@domain/material'

export default function MaterialPage() {
  const { data } = useMaterialList()
  return <div>{data?.items.length}</div>
}
```

### apps/api（Hono 同进程直调，无注入）

```typescript
// apps/api/src/routes/material.ts
import { materialController } from '@kkfive/domain-core/material'

app.get('/materials', async (c) => {
  // 同进程直调，不经过 HttpService
  const data = await materialController.getList(/* db client or internal caller */)
  return c.json(data)
})
```

## 禁止的模式

```typescript
// ❌ 错误：在共享包 Service 中 import 任何具体实例
import { httpClient } from '@/service/index.client'

export const materialService = {
  getList: async () => {
    return httpClient.get('/api/materials') // 锁死某一 app 的实例
  },
}
```

```typescript
// ❌ 错误：在共享包里 import @/service 或 @/lib
// 共享包不应感知任何 app 的内部路径，只接受注入
```
