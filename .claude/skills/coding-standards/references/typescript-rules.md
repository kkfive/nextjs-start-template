# TypeScript 规范

## 类型定义文件选择

| 场景 | 文件类型 | 原因 |
|------|----------|------|
| Domain 层业务类型 | `type.d.ts` + `declare namespace` | 全局可用，避免导入，框架无关 |
| 工具类型 | `type.ts` + `export type` | 需要显式导入，避免全局污染 |
| 第三方库扩展 | `.d.ts` + `declare module` | TypeScript 模块扩展机制 |

## 基本规则

```typescript
// 优先使用 type 而非 interface (除非需要 extends)
type UserData = {
  id: string
  name: string
}

// 避免 any，使用 unknown 或具体类型
// ❌ const data: any = await fetch()
// ✅ const data: unknown = await fetch()
```

## 特殊情况：何时使用 export type

仅在以下场景使用 `type.ts` + `export type`（非 Domain 层）：

```typescript
// src/lib/types/utility.ts - 工具类型
export type Nullable<T> = T | null
export type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never

// typings/axios.d.ts - 第三方库扩展
import 'axios'
declare module 'axios' {
  export interface AxiosRequestConfig {
    customField?: string
  }
}
```
