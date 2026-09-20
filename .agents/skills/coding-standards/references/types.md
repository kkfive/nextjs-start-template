# 类型与契约归属

机器已强制（无需在此复述）：`type` 优先于 `interface`、`@ts-ignore` 禁令、禁 `any`、禁空 `catch` —— 均由 eslint error 级拦截。

## 放置规则（项目选择）

| 场景 | 位置 |
|---|---|
| 跨 app 共享契约 | `packages/contracts/src/{module}/`（Zod schema + `z.infer` 单一真源） |
| 业务 calls 与 app 专属扩展类型 | 所属 `src/features/<feature>/` |
| 通用工具类型 | `packages/utils/src/` 或 `@kkfive/contracts/types/` |
| 第三方库 / 全局类型扩展 | 各 app `typings/*.d.ts` + `declare module`（仅此场景用 `.d.ts`） |

## 导出约定

- 共享包类型用 `export type`；`index.ts` 用 `export type * from './type'` 一次全暴露（`export *` 不会被 erasable types 正确处理）
- 业务代码用 `import type` 引入
- 禁止 `declare namespace`；错误类有 throw/instanceof 行为，放各 app `src/lib/errors/`，契约包只放错误响应数据形状（`ErrorResponseSchema`）

## 示例（zod-first 契约）

```typescript
// packages/contracts/src/schemas/material.ts
import { z } from 'zod'

export const materialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
})

// z.infer 推导类型，单一真源
export type MaterialItem = z.infer<typeof materialItemSchema>
```

```typescript
// apps/client/src/features/material/model/types.ts — app 专属扩展
import type { MaterialItem } from '@kkfive/contracts'
export type MaterialItemWithPosts = MaterialItem & { posts: Post[] }
```
