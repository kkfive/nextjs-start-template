# 命名规范

## 文件与目录

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 目录 | kebab-case | `user-profile/`, `form-validation/` |
| React 组件文件 | kebab-case | `hitokoto-card.tsx`, `scenario-card.tsx` |
| 工具/服务文件 | kebab-case | `app-error.ts`, `index.base.ts` |
| 类型定义 | `type.d.ts` 或 kebab-case | `type.d.ts`, `request-types.ts` |
| 测试文件 | `{name}.test.ts(x)` | `utils.test.ts`, `button.test.tsx` |
| 常量文件 | kebab-case | `api.ts`, `site-features.tsx` |

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
| `index.` | 入口文件 | `index.ts`, `index.base.ts` |
| `use` | React Hook | `useMobile`, `useMouseStore` |

## 领域模块导出

```typescript
// domain/{module}/index.ts - 标准导出模式
export { Controller } from './controller'
export { service } from './service'
export type * from './type.d'
```

## 组件 Props

```typescript
// 组件 Props 命名: {ComponentName}Props
interface HitokotoCardProps {
  initialData: Hitokoto.Hitokoto
}

// 或使用 props.ts 文件
// src/components/ui/button/props.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean
}
```
