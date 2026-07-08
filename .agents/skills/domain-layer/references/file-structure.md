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
    │   └── api.ts          # API 常量 + Query Keys（必需）
    ├── type.ts             # 类型定义（从 @kkfive/contracts 扩展）（必需）
    ├── service.ts          # 原始请求，注入 HttpService（必需）
    ├── controller.ts       # 业务编排（必需）
    └── index.ts            # 统一导出（必需）
```

### 文件职责

#### const/api.ts

```typescript
export const MATERIAL_API = {
  LIST: '/api/materials',
  DETAIL: (id: string) => `/api/materials/${id}`,
} as const

export const MATERIAL_QUERY_KEYS = {
  all: () => ['material'] as const,
  lists: () => [...MATERIAL_QUERY_KEYS.all(), 'list'] as const,
  list: (query?: Material.ListQuery) => [...MATERIAL_QUERY_KEYS.lists(), query] as const,
} as const
```

#### service.ts（注入 HttpService）

```typescript
// packages/domain-core/src/material/service.ts
import type { HttpService } from '@kkfive/http-client'
import type { CreateRequest, ListQuery } from './type'

export const materialService = {
  getList: async (http: HttpService, query?: ListQuery) => { ... },
  create: async (http: HttpService, data: CreateRequest) => { ... },
}
```

#### controller.ts

```typescript
// packages/domain-core/src/material/controller.ts
import type { HttpService } from '@kkfive/http-client'
import { materialService } from './service'

export const materialController = {
  getList: async (http: HttpService, query?: ListQuery) => {
    return materialService.getList(http, query)
  },
}
```

#### index.ts

```typescript
// packages/domain-core/src/material/index.ts
export * from './const/api'
export { materialService } from './service'
export { materialController } from './controller'
export type * from './type'
```

## 适配层结构（`apps/{app}/domain/{module}/`）

运行环境适配，文件精简。

```
apps/{app}/domain/
└── {module}/
    ├── index.ts            # re-export @kkfive/domain-core/{module} + 注入实例
    └── hooks.ts            # Next.js apps 专属：React Query 包装（api 无此文件）
```

### 适配层 index.ts

```typescript
// apps/client/domain/material/index.ts
export * from '@kkfive/domain-core/material'   // re-export 共享包
export { useMaterialList, useCreateMaterial } from './hooks'  // app 专属 hooks
```

### 适配层 hooks.ts（仅 Next.js apps）

```typescript
// apps/client/domain/material/hooks.ts
import { httpClient } from '@/service/index.client'
import { materialController } from '@kkfive/domain-core/material'

export function useMaterialList(query?: ListQuery) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(query),
    queryFn: () => materialController.getList(httpClient, query),
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
   ├─ Next.js app → 写进该 app 的 domain/{module}/hooks.ts
   └─ apps/api → 无 hooks，路由直调 Controller
```
