# TypeScript 规范

## 类型定义文件选择

| 场景 | 文件类型 | 原因 |
|------|----------|------|
| Domain 层业务类型 | `type.ts` + `export type` | 显式导入导出，避免全局污染 |
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

## 类型导出

Domain 层和工具类型都使用 `type.ts` + `export type`：

```typescript
// domain/user/type.ts
export type User = {
  id: string
  name: string
}

// src/lib/types/utility.ts - 工具类型
export type Nullable<T> = T | null
export type AsyncReturnType<T> = T extends (...args: unknown[]) => Promise<infer R> ? R : never
```

仅第三方库扩展使用 `.d.ts`：

```typescript

// typings/axios.d.ts - 第三方库扩展
import 'axios'
declare module 'axios' {
  export interface AxiosRequestConfig {
    customField?: string
  }
}
```
