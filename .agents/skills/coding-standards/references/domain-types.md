# Domain 层类型定义规范

**文件命名**：`domain/{module}/type.ts`

## 规范

1. 使用 `export type` 导出类型，禁止 `declare namespace`。
2. 优先使用 `type`，不要使用 `interface`。
3. `index.ts` 必须包含 `export type * from './type'`。
4. 业务代码通过 `import type` 引入需要的类型。
5. 只有第三方库扩展或全局类型扩展才使用 `.d.ts`。

## 示例

```typescript
// domain/material/type.ts
export type ListResponse = {
  items: Item[]
  total: number
  page: number
  pageSize: number
}

export type Item = {
  id: string
  name: string
  createdAt: string
}

export type CreateRequest = {
  name: string
  category?: string
}

export type ListQuery = {
  page?: number
  pageSize?: number
  keyword?: string
}
```

```typescript
// domain/material/index.ts
export { MATERIAL_API, MATERIAL_QUERY_KEYS } from './const/api'
export { materialService } from './service'
export { materialController } from './controller'
export type * from './type'
```

```typescript
// domain/material/service.ts
import type { CreateRequest, ListQuery, ListResponse } from './type'
import type { HttpService } from '@/lib/request'

export const materialService = {
  getList: async (http: HttpService, query?: ListQuery): Promise<ListResponse> => {
    return http.get('/api/materials', { params: query })
  },

  create: async (http: HttpService, data: CreateRequest) => {
    return http.post('/api/materials', data)
  },
}
```

## 常见场景处理

| 场景 | 做法 |
|------|------|
| 使用第三方库类型 | 在 `type.ts` 顶部 `import type` |
| 引用同模块类型 | 直接使用当前文件中的类型名 |
| 引用其他模块类型 | `import type { OtherType } from '@domain/other'` |
| Schema 推导类型 | 可以在 `type.ts` 中 `import type { z } from 'zod'` 后使用 `z.infer` |
| 全局类型扩展 | 放到 `typings/*.d.ts` |

## 反模式

```typescript
// 错误：Domain 类型不再使用全局 namespace
declare namespace Material {
  type Item = { id: string }
}

// 错误：项目规范优先 type
export interface Item {
  id: string
}
```
