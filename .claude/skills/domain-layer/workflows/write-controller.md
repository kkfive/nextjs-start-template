# 写 Controller（业务编排）

Controller 把多个 Service 调用编排为业务能力，并完成字段转换、错误语义翻译。

## 模板

```ts
// domain/material/controller.ts
import type { HttpService } from '@/lib/http'
import { service } from './service'
import type * as Material from './type'

export async function getList(http: HttpService, query?: Material.ListQuery) {
  const res = await service.getList(http, query)
  return {
    items: res.items.map(normalizeItem),
    total: res.total,
  }
}

export async function getDetail(http: HttpService, id: string) {
  const item = await service.getDetail(http, id)
  return normalizeItem(item)
}

export async function create(http: HttpService, data: Material.CreateRequest) {
  if (!data.name?.trim()) {
    throw new ValidationError('material.name.required')
  }
  return service.create(http, data)
}

function normalizeItem(raw: Material.RawItem): Material.Item {
  return {
    id: raw?.id ?? '',
    name: raw?.name ?? '未命名',
    createdAt: raw?.created_at ? new Date(raw.created_at).toISOString() : '',
  }
}
```

## 入口导出（关键）

```ts
// domain/material/index.ts
export * as Controller from './controller'
export type * from './type'
export * from './const/api'
```

调用：

```ts
import { Controller as Material } from '@/domain/material'
const list = await Material.getList(http, { keyword })
```

## 硬约束

1. **命名函数导出**（不要 `export const`，不要 `class`）
2. **`http: HttpService` 永远第一参**
3. **不依赖具体环境实例**（不要 `import { httpClient } from '@/service/index.client'`）
4. **错误用项目错误类**：`ApiError` / `AppError` / `ValidationError`
5. **字段转换在 Controller**，Service 保持原始
6. **外部响应在 Controller 归一化**：字段缺失或 `null` 时给业务默认值，关键字段不可恢复时抛项目错误类

## 何时跳过 Controller

只有"一次调用、零转换"的场景才允许 hooks/页面直接调 Service —— 但通常仍走 Controller 以便未来扩展。

完整示例见 `references/examples.md`。
外部响应的空值处理见 `references/external-data.md`。
