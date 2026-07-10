# 文件结构规范

## 核心原则

1. **两层分离**：业务纯逻辑在 `@kkfive/domain-core`，运行环境适配在各 app 的 `domain/`
2. **统一结构**：共享包内所有模块使用相同的文件组织方式
3. **渐进式扩展**：小模块使用单文件，大模块在目录下添加文件
4. **向后兼容**：通过 index.ts 统一导出，保持 API 稳定

## 共享包结构（`packages/domain-core/src/{module}/`）

业务纯逻辑，框架无关。

```
packages/domain-core/src/
└── {module}/
    ├── const/
    │   └── api.ts          # API 端点配置：每操作一个 { url, method } 对象（必需）
    ├── type.ts             # 类型定义（从 @kkfive/contracts 扩展）（必需）
    ├── service.ts          # 原始请求，注入 HttpService（必需）
    ├── controller.ts       # 业务编排（必需）
    └── index.ts            # 统一导出（必需）
```

### 文件职责

#### const/api.ts

每操作一个独立配置对象，命名为方法名；不放 Query Keys（共享包框架无关）。

```typescript
// packages/domain-core/src/material/const/api.ts
export const getList = { url: '/api/materials', method: 'GET' as const }
export const getDetail = { url: (id: string) => `/api/materials/${id}`, method: 'GET' as const }
export const create = { url: '/api/materials', method: 'POST' as const }
```

#### service.ts（注入 HttpService）

命名函数 + `service` 对象（对象名固定为 `service`），从 `const/api.ts` 取 `{ url, method }` 调用：

```typescript
// packages/domain-core/src/material/service.ts
import type { HttpService } from '@kkfive/http-client'
import { getList as getListApi, create as createApi } from './const/api'
import type { CreateRequest, ListQuery } from './type'

async function getList(http: HttpService, query?: ListQuery) {
  const { url, method } = getListApi
  return http.request<Material.ListResponse>(url, { method, params: query })
}

async function create(http: HttpService, data: CreateRequest) {
  const { url, method } = createApi
  return http.request<Material.Item>(url, { method, json: data })
}

export const service = { getList, create }
```

#### controller.ts

命名导出函数，编排 Service；由 `index.ts` 聚合为 `Controller` 命名空间：

```typescript
// packages/domain-core/src/material/controller.ts
import type { HttpService } from '@kkfive/http-client'
import { service } from './service'
import type { ListQuery } from './type'

export async function getList(http: HttpService, query?: ListQuery) {
  return service.getList(http, query)
}
```

#### index.ts

`Controller` 命名空间 + `service` + type：

```typescript
// packages/domain-core/src/material/index.ts
export * as Controller from './controller'
export { service } from './service'
export type * from './type'
```

## 适配层结构（`apps/{app}/domain/{module}/`）

运行环境适配，文件精简。

```
apps/{app}/domain/
└── {module}/
    ├── index.ts            # re-export @kkfive/domain-core/{module} + 暴露 app 专属 hooks
    └── hooks.ts            # Next.js apps 专属：React Query 包装 + 内联 Query Keys（api 无此文件）
```

### 适配层 index.ts

只 re-export 共享包 + 暴露 hooks；实例在调用点（hooks / Server Component）注入，不在适配层预绑定：

```typescript
// apps/client/domain/material/index.ts
export * from '@kkfive/domain-core/material'                       // re-export 共享包
export { useMaterialList, useCreateMaterial } from './hooks'       // app 专属 hooks
```

### 适配层 hooks.ts（仅 Next.js apps）

内联 `QUERY_KEYS`，通过 `Controller` 命名空间调用，内部注入该 app 的 HttpService 实例：

```typescript
// apps/client/domain/material/hooks.ts
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { Controller } from '@kkfive/domain-core/material'

const QUERY_KEYS = {
  all: ['material'] as const,
  list: (query?: ListQuery) => [...QUERY_KEYS.all, 'list', query] as const,
}

export function useMaterialList(query?: ListQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.list(query),
    queryFn: () => Controller.getList(httpClient, query),
  })
}
```

> `apps/api/domain/{module}/index.ts` 只 re-export 共享包，无 hooks、无实例注入——路由同进程直调 Controller。

## 扩展结构（大模块可选）

当共享包内单文件超过 200 行时，可在该模块目录下拆分：

```
packages/domain-core/src/{module}/
├── types/              # 拆分类型（api.ts / model.ts / index.ts）
├── services/           # 拆分服务（list.ts / crud.ts / index.ts）
├── controllers/        # 拆分控制器
└── index.ts
```

## 扩展决策树

```
需要添加新功能？
├─ 共享包内单文件是否超过 200 行？
│  ├─ 否 → 继续在单文件中添加
│  └─ 是 → 在共享包该模块目录下拆分
├─ 该功能是否跨 app 复用？
│  ├─ 是 → 写进 @kkfive/domain-core
│  └─ 否 → 留在对应 app 的 src/lib 或 domain 适配层
└─ 是否需要 React Query？
   ├─ Next.js app → 写进该 app 的 domain/{module}/hooks.ts（Query Keys 内联在此）
   └─ apps/api → 无 hooks，路由直调 Controller
```
