# TypeScript 规范

## 类型定义文件选择

| 场景 | 文件类型 | 原因 |
|------|----------|------|
| 共享包业务类型 | `packages/domain-core/src/{module}/type.ts` + `export type` | 显式导入导出，避免全局污染 |
| 跨 app 共享契约 | `packages/contracts/`（schemas / types / errors） | 单一真源，客户端服务端共用 |
| 通用工具类型 | `packages/utils/src/` 或 `@kkfive/contracts/types/` | 显式导入，避免全局污染 |
| app 专属类型 | 各 app 的 `domain/{module}/type.ts` 或 `src/lib/` | 仅该 app 使用 |
| 第三方库扩展 | 各 app 的 `typings/*.d.ts` + `declare module` | TypeScript 模块扩展机制 |

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

共享包类型使用 `type.ts` + `export type`：

```typescript
// packages/domain-core/src/user/type.ts
export type User = {
  id: string
  name: string
}

// packages/contracts/types/common.ts - 跨 app 共享工具类型
export type Nullable<T> = T | null
export type AsyncReturnType<T> = T extends (...args: unknown[]) => Promise<infer R> ? R : never
```

仅第三方库扩展使用 `.d.ts`：

```typescript
// apps/{app}/typings/axios.d.ts - 第三方库扩展
import 'axios'
declare module 'axios' {
  export interface AxiosRequestConfig {
    customField?: string
  }
}
```
