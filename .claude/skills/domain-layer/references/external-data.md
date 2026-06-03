# 外部响应数据

外部接口返回的数据不可信。即使后端文档声明字段必填，运行时仍可能出现字段缺失、`undefined` 或 `null`。

## 核心约定

- 业务模型保持表达业务事实，不为了迎合外部响应批量改成 `?:`
- 原始接口响应用 `ExternalData<T>` 表达“字段可能缺失或为 `null`”
- Service 保持原始请求与原始响应类型，不做业务兜底
- Controller 负责把原始响应归一化为业务模型，并在无法恢复时抛项目错误类

## 类型工具

共享类型位于 `domain/_shared/types`：

```ts
export type ExternalData<T> =
  T extends readonly (infer Item)[]
    ? ExternalData<Item>[] | null
    : T extends object
      ? { [Key in keyof T]?: ExternalData<T[Key]> | null }
      : T | null
```

## 使用方式

```ts
import type { ExternalData } from '@domain/_shared'

export type RawMaterialItem = ExternalData<MaterialItem>
```

如果接口 envelope 本身也来自外部：

```ts
type RawListResponse = ExternalData<{
  items: MaterialItem[]
  total: number
}>
```

## 归一化边界

```ts
function normalizeItem(raw: RawMaterialItem): MaterialItem {
  return {
    id: raw?.id ?? '',
    name: raw?.name ?? '未命名',
    createdAt: raw?.createdAt ?? '',
  }
}
```

归一化策略应贴近业务语义：能给安全默认值就给默认值；不能恢复的关键字段应抛 `ValidationError` 或业务错误，而不是让 `null` 继续流入 UI。
