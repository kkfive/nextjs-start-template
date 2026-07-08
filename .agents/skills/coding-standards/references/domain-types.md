# Domain 层类型定义规范

**文件命名**：共享包 `packages/domain-core/src/{module}/type.ts`；跨 app 共享的契约类型在 `packages/contracts/`。

## 规范

1. 使用 `export type` 导出类型，禁止 `declare namespace`。
2. 优先使用 `type`，不要使用 `interface`。
3. 共享包 `index.ts` 必须包含 `export type * from './type'`。
4. 业务代码通过 `import type` 引入需要的类型。
5. 只有第三方库扩展或全局类型扩展才使用 `.d.ts`。
6. 跨 app 共享的 schema/类型放 `@kkfive/contracts`，app 专属类型留各 app。

## 示例（共享包）

```typescript
// packages/domain-core/src/material/type.ts
import type { ExternalData } from '@kkfive/contracts'

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

// 原始响应类型用 ExternalData<T> 表达空值可能
export type RawItem = ExternalData<Item>
```

```typescript
// packages/domain-core/src/material/index.ts
export { MATERIAL_API, MATERIAL_QUERY_KEYS } from './const/api'
export { materialService } from './service'
export { materialController } from './controller'
export type * from './type'
```

```typescript
// packages/domain-core/src/material/service.ts
import type { CreateRequest, ListQuery, ListResponse } from './type'
import type { HttpService } from '@kkfive/http-client'

export const materialService = {
  getList: async (http: HttpService, query?: ListQuery): Promise<ListResponse> => {
    return http.get('/api/materials', { params: query })
  },
}
```

## 示例（app 专属类型扩展）

```typescript
// apps/client/domain/material/type.ts - 扩展业务专属类型
import type { Item } from '@kkfive/domain-core/material'
export type ItemWithPosts = Item & { posts: Post[] }
```

## 常见场景处理

| 场景 | 做法 |
|------|------|
| 使用第三方库类型 | 在 `type.ts` 顶部 `import type` |
| 引用同模块类型 | 直接使用当前文件中的类型名 |
| 引用其他模块类型 | `import type { OtherType } from '@kkfive/domain-core/other'` |
| 跨 app 共享契约 | 放 `@kkfive/contracts/schemas/` 或 `@kkfive/contracts/types/` |
| Schema 推导类型 | 在 `@kkfive/contracts` 中 `z.infer` 推导，单一真源 |
| 全局类型扩展 | 放到各 app 的 `typings/*.d.ts` |

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
