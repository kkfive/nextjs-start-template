# 文件结构规范

## 核心原则

1. **统一结构**：所有模块使用相同的文件组织方式
2. **渐进式扩展**：小模块使用单文件，大模块在目录下添加文件
3. **向后兼容**：通过 index.ts 统一导出，保持 API 稳定

## 基础结构（所有模块必需）

```
domain/
└── {module}/
    ├── const/
    │   └── api.ts          # API 常量 + Query Keys（必需）
    ├── type.d.ts           # 类型定义（必需）
    ├── service.ts          # 服务层（必需）
    ├── controller.ts       # 控制器层（必需）
    ├── hooks.ts            # React Query 封装（推荐）
    ├── schema.ts           # 表单验证（可选）
    └── index.ts            # 统一导出（必需）
```

## 扩展结构（大模块可选）

当单文件超过 200 行时，可以创建目录进行拆分：

```
domain/
└── {module}/
    ├── const/api.ts
    ├── types/              # 可选：拆分类型定义
    │   ├── api.ts          # API 类型
    │   ├── model.ts        # 业务模型类型
    │   └── index.ts        # 统一导出
    ├── services/           # 可选：拆分服务层
    │   ├── list.ts         # 列表服务
    │   ├── crud.ts         # CRUD 服务
    │   └── index.ts        # 统一导出
    ├── controllers/        # 可选：拆分控制器层
    │   ├── list.ts
    │   ├── crud.ts
    │   └── index.ts
    ├── hooks/              # 可选：拆分 Hooks
    │   ├── queries.ts      # 查询 Hooks
    │   ├── mutations.ts    # 变更 Hooks
    │   └── index.ts
    └── index.ts
```

## 文件职责

### const/api.ts

```typescript
// API 端点
export const MATERIAL_API = {
  LIST: '/api/materials',
  DETAIL: (id: string) => `/api/materials/${id}`,
  CREATE: '/api/materials',
  UPDATE: (id: string) => `/api/materials/${id}`,
  DELETE: (id: string) => `/api/materials/${id}`,
} as const

// Query Keys（函数式）
export const MATERIAL_QUERY_KEYS = {
  all: () => ['material'] as const,
  lists: () => [...MATERIAL_QUERY_KEYS.all(), 'list'] as const,
  list: (query?: Material.ListQuery) => [...MATERIAL_QUERY_KEYS.lists(), query] as const,
  details: () => [...MATERIAL_QUERY_KEYS.all(), 'detail'] as const,
  detail: (id: string) => [...MATERIAL_QUERY_KEYS.details(), id] as const,
} as const
```

### type.d.ts

```typescript
declare namespace Material {
  // 响应类型
  type ListResponse = { items: Item[], total: number }
  type Item = { id: string, name: string }
  type CreateResponse = { id: string }

  // 请求类型
  type CreateRequest = { name: string }
  type UpdateRequest = { name?: string }
  type ListQuery = { page?: number, keyword?: string }
}
```

### service.ts

```typescript
import type { HttpService } from '@/lib/request'

export const materialService = {
  getList: async (http: HttpService, query?: Material.ListQuery) => { ... },
  getDetail: async (http: HttpService, id: string) => { ... },
  create: async (http: HttpService, data: Material.CreateRequest) => { ... },
  update: async (http: HttpService, id: string, data: Material.UpdateRequest) => { ... },
  delete: async (http: HttpService, id: string) => { ... },
}
```

### controller.ts

```typescript
import type { HttpService } from '@/lib/request'
import { materialService } from './service'

export const materialController = {
  // 直接透传
  getList: async (http: HttpService, query?: Material.ListQuery) => {
    return materialService.getList(http, query)
  },

  // 业务编排
  createAndRefresh: async (http: HttpService, data: Material.CreateRequest) => {
    const created = await materialController.create(http, data)
    const list = await materialController.getList(http)
    return { created, list }
  },
}
```

### hooks.ts

```typescript
import { httpClient } from '@/service/index.client'

export function useMaterialList(query?: Material.ListQuery) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(query),
    queryFn: () => materialController.getList(httpClient, query),
  })
}

export function useCreateMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Material.CreateRequest) =>
      materialController.create(httpClient, data),
    onSuccess: () => {
      toast.success('创建成功')
      queryClient.invalidateQueries({ queryKey: MATERIAL_QUERY_KEYS.lists() })
    },
  })
}
```

### index.ts

```typescript
// ⚠️ 注意：type.d.ts 使用 declare namespace，是全局声明，不需要导出
// 直接使用 Material.xxx 即可，无需 import

export { MATERIAL_API, MATERIAL_QUERY_KEYS } from './const/api'
export { materialService } from './service'
export { materialController } from './controller'
export { useMaterialList, useCreateMaterial, ... } from './hooks'
```

## 扩展决策树

```
需要添加新功能？
├─ 单文件是否超过 200 行？
│  ├─ 否 → 继续在单文件中添加
│  └─ 是 → 考虑拆分
│      ├─ 创建对应目录（types/services/controllers/hooks）
│      ├─ 将相关代码移到目录下
│      └─ 更新 index.ts 导出路径
└─ 已有目录？
   └─ 是 → 在目录下添加新文件
```
