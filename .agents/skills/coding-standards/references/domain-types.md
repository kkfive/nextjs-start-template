# Domain 层类型定义规范

**文件放置**：跨 app 契约放 `packages/contracts/src/{module}/`（Zod schema + `z.infer`）；业务 calls 与 app 专属扩展类型放所属 `src/features/<feature>/`。

## 规范

1. 使用 `export type` 导出类型，禁止 `declare namespace`。
2. 优先使用 `type`，不要使用 `interface`。
3. 共享包 `index.ts` 必须包含 `export type * from './type'`。
4. 业务代码通过 `import type` 引入需要的类型。
5. 只有第三方库扩展或全局类型扩展才使用 `.d.ts`。
6. 跨 app 共享的 schema/类型放 `@kkfive/contracts`，app 专属类型留各 app。

## 示例（共享包）

```typescript
// packages/contracts/src/schemas/material.ts
import { z } from 'zod'

export const materialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
})

export const materialListResponseSchema = z.object({
  items: z.array(materialItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

export const createMaterialRequestSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
})

// z.infer 推导类型，单一真源
export type MaterialItem = z.infer<typeof materialItemSchema>
export type MaterialListResponse = z.infer<typeof materialListResponseSchema>
export type CreateMaterialRequest = z.infer<typeof createMaterialRequestSchema>
```

```typescript
// apps/client/src/features/material/model/calls.ts
import { unwrapData } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'

export async function fetchMaterialList() {
  const response = await rpcClient.materials.$get()
  return unwrapData(await response.json())
}
```

## 示例（app 专属类型扩展）

```typescript
// apps/client/src/features/material/model/types.ts
import type { MaterialItem } from '@kkfive/contracts'
export type MaterialItemWithPosts = MaterialItem & { posts: Post[] }
```

## 常见场景处理

| 场景 | 做法 |
|------|------|
| 使用第三方库类型 | 在 `type.ts` 顶部 `import type` |
| 引用同模块类型 | 直接使用当前文件中的类型名 |
| 引用其他模块类型 | `import type { OtherType } from '@kkfive/contracts'` |
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
