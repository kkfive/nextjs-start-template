# 图标使用规范

本项目使用 **Iconify + Tailwind CSS** 方案，通过 `@iconify/tailwind4` 插件实现图标的按需加载。其他图标库（lucide-react、react-icons 等）由 eslint `no-restricted-imports` 拦截。

## 使用方式

```typescript
// 从共享 UI 的稳定 export 导入
import { LucideArrowRight, LucideHome } from '@kkfive/ui/components/icon'

// 在 JSX 中使用，支持 className 自定义样式
<LucideHome className="size-5 text-blue-500" />
```

## 添加新图标

1. 在 `packages/ui/src/components/icon/index.ts` 中添加导出：

```typescript
import { CreateIcon } from './create-icon'

// 命名规则：{图标集}{图标名} (PascalCase)
// 图标类名格式：icon-[{图标集}--{图标名}]
export const LucideSearch = CreateIcon('icon-[lucide--search]')
export const MdiAccount = CreateIcon('icon-[mdi--account]')
```

2. 图标集查询：[Iconify 图标库](https://icon-sets.iconify.design/)

## 常用图标集

图标集查询：[Iconify 图标库](https://icon-sets.iconify.design/)。首选 Lucide（`lucide--`，简洁线性），其次 Material Design（`mdi--`）、Heroicons（`heroicons--`）。

## 核心原则

- 统一入口 `@kkfive/ui/components/icon`；Iconify 按需加载，支持 className 自定义样式
