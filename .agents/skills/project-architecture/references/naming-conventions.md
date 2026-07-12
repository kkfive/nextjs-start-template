# 命名规范

## 文件与目录

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 目录 | kebab-case | `user-profile/`, `form-validation/` |
| React 组件文件 | kebab-case | `hitokoto-card.tsx`, `scenario-card.tsx` |
| UI 组件目录 | kebab-case + `/index.tsx` | `button/index.tsx`, `modal/index.tsx` |
| 工具/服务文件 | kebab-case | `app-error.ts`, `http-client.ts` |
| Contracts 类型定义 | `type.ts` (固定名称) | `contracts/src/{module}/type.ts` |
| 工具类型定义 | kebab-case + `.ts` | `utility-types.ts`, `request-types.ts` |
| 全局类型扩展 | kebab-case + `.d.ts` | `axios.d.ts`, `window.d.ts` |
| 测试文件 | `{name}.test.ts(x)` | `utils.test.ts`, `button.test.tsx` |
| 常量文件 | kebab-case | `api.ts`, `site-features.tsx` |

**UI 组件文件结构规范**：

所有 `apps/{app}/src/components/ui/` 下的组件必须使用目录形式：

```
✅ 正确：
apps/{app}/src/components/ui/
├── button/
│   └── index.tsx
├── modal/
│   └── index.tsx
└── sonner/
    └── index.tsx

❌ 错误：
apps/{app}/src/components/ui/
├── button.tsx
├── modal.tsx
└── sonner.tsx
```

## 代码标识符

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| React 组件 | PascalCase | `HitokotoCard`, `ScenarioCard` |
| 函数 | camelCase | `getData`, `handleClick` |
| 变量 | camelCase | `userData`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE 或 camelCase | `API_BASE_URL`, `defaultConfig` |
| 类型/接口 | PascalCase | `UserProfile`, `RequestOptions` |
| Zustand Store | `use{Name}Store` | `useMouseStore` |
| React Hook | `use{Name}` | `useMobile`, `useDebounce` |
| CSS 类名 | Tailwind 优先，自定义用 kebab-case | `text-primary`, `custom-class` |

## 特殊前缀

| 前缀 | 含义 | 示例 |
|------|------|------|
| `_` | 内部/私有模块 | `_shared/`, `_internal/` |
| `index.` | 入口文件 | `index.ts` |
| `use` | React Hook | `useMobile`, `useMouseStore` |

## 共享包模块导出

`packages/contracts/src/{module}/` 标准导出（zod-first 契约源）：

```typescript
// schema.ts — zod schema 定义
import { z } from 'zod'
export const materialSchema = z.object({ /* ... */ })
export type Material = z.infer<typeof materialSchema>
```

`packages/rpc/src/{module}/calls.ts` 标准导出（纯调用函数）：

```typescript
import type { RpcClient } from '@kkfive/rpc'
export async function fetchMaterial(client: RpcClient, id: string) {
  // 调用 hc RPC，返回 unwrapData 后的结果
}
```

各 app 的 React Query hooks `apps/{app}/src/features/{feature}/hooks/use-{module}.ts` 标准模式：

```typescript
// 组合 rpc calls + app 专属 rpc 实例
import { useQuery } from '@tanstack/react-query'
import { fetchMaterial } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'
export function useMaterial(id: string) {
  return useQuery({ queryKey: ['material', id], queryFn: () => fetchMaterial(rpcClient, id) })
}
```

**说明**：
- 共享包类型在 `@kkfive/contracts` 用 `export type` 显式导出（zod-first）
- 业务代码通过 `import type` 引用类型，避免全局类型污染
- 跨包引用走 `@kkfive/rpc`（calls）/ `@kkfive/contracts`（schema + 类型），app 内部走 `@/*` 别名

## 组件 Props

```typescript
// 组件 Props 命名: {ComponentName}Props
type HitokotoCardProps = {
  initialData: Hitokoto
}

// 或使用 props.ts 文件
// apps/{app}/src/components/ui/button/props.ts
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
}
```
