# 图标使用规范

本项目使用 **Iconify + Tailwind CSS** 方案，通过 `@iconify/tailwind4` 插件实现图标的按需加载。

**禁止**：直接安装 `lucide-react`、`react-icons` 等图标库

## 使用方式

```typescript
// 从统一入口导入图标组件
import { LucideHome, LucideArrowRight } from '@/components/ui/icon'

// 在 JSX 中使用，支持 className 自定义样式
<LucideHome className="size-5 text-blue-500" />
```

## 添加新图标

1. 在 `src/components/ui/icon/index.ts` 中添加导出：

```typescript
import { CreateIcon } from './create-icon'

// 命名规则：{图标集}{图标名} (PascalCase)
// 图标类名格式：icon-[{图标集}--{图标名}]
export const LucideSearch = CreateIcon('icon-[lucide--search]')
export const MdiAccount = CreateIcon('icon-[mdi--account]')
```

2. 图标集查询：[Iconify 图标库](https://icon-sets.iconify.design/)

## 常用图标集

| 图标集 | 前缀 | 说明 |
|--------|------|------|
| Lucide | `lucide--` | 简洁线性图标，推荐首选 |
| Material Design | `mdi--` | Material 风格图标 |
| Heroicons | `heroicons--` | Tailwind 官方图标 |
| EOS Icons | `eos-icons--` | 包含加载动画等 |

## 核心原则

- **统一入口**：所有图标通过 `@/components/ui/icon` 导入
- **按需加载**：Iconify 自动按需加载图标
- **类型安全**：图标组件有完整的 TypeScript 类型
- **样式灵活**：支持 Tailwind className 自定义样式
