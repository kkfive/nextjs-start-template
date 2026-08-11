# 命名规范

## 文件与目录

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 目录 | kebab-case | `user-profile/`, `form-validation/` |
| React 组件文件 | kebab-case | `hitokoto-card.tsx`, `scenario-card.tsx` |
| App UI 封装文件 | kebab-case | `page-button.tsx`, `material-modal.tsx` |
| 工具/服务文件 | kebab-case | `app-error.ts`, `http-client.ts` |
| Contracts 类型定义 | `type.ts` (固定名称) | `contracts/src/{module}/type.ts` |
| 工具类型定义 | kebab-case + `.ts` | `utility-types.ts`, `request-types.ts` |
| 全局类型扩展 | kebab-case + `.d.ts` | `axios.d.ts`, `window.d.ts` |
| 测试文件 | `{name}.test.ts(x)` | `utils.test.ts`, `button.test.tsx` |
| 常量文件 | kebab-case | `api.ts`, `site-features.tsx` |

基础 UI 由业务代码直接从 `@kkfive/ui/components/*` 消费，不在 app 内建立纯 re-export 目录。只有改变默认 props、限制 API、注入主题或组合控件等真实加工时，才在 app 的 `src/components/` 或所属 feature 中新增 kebab-case 组件文件。

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

业务 calls 放在 app feature 的 `model/calls.ts`：

```typescript
import { unwrapData } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'
export async function fetchMaterial(id: string) {
  const response = await rpcClient.materials[':id'].$get({ param: { id } })
  return unwrapData(await response.json())
}
```

**说明**：
- 共享包类型在 `@kkfive/contracts` 用 `export type` 显式导出（zod-first）
- 业务代码通过 `import type` 引用类型，避免全局类型污染
- 跨包引用走 package 公开 export；业务 calls 与 hooks 通过 app 内 `@/*` 别名引用

## 组件 Props

```typescript
// 组件 Props 命名: {ComponentName}Props
type HitokotoCardProps = {
  initialData: Hitokoto
}

// 简单 Props 可与组件放在同一文件
// apps/{app}/src/components/page-button.tsx
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
}
```
