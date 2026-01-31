# 编码规范

## 层级依赖

```
禁止的导入:
❌ domain/ → @/components/*
❌ domain/ → @/hooks/*
❌ domain/ → @/store/*
❌ domain/ → @/app/*

允许的导入:
✅ domain/ → @/lib/*
✅ src/components/domain/ → @domain/*
✅ src/components/domain/ → @/components/ui/*
```

## TypeScript

```typescript
// 优先使用 type 而非 interface (除非需要 extends)
interface UserData {
  id: string
  name: string
}

// 使用 type.d.ts 声明命名空间类型
// domain/example/hitokoto/type.d.ts
declare namespace Hitokoto {
  interface Hitokoto {
    id: number
    hitokoto: string
  }
}

// 避免 any，使用 unknown 或具体类型
// ❌ const data: any = await fetch()
// ✅ const data: unknown = await fetch()
```

## React 组件

```tsx
// 使用函数声明，不使用箭头函数
// ✅
export function HitokotoCard({ initialData }: HitokotoCardProps) {
  return <div>...</div>
}

// ❌
export const HitokotoCard = ({ initialData }: HitokotoCardProps) => {
  return <div>...</div>
}

// 客户端组件必须标记 'use client'
'use client'
export function ClientComponent() { ... }
```

## 错误处理

```typescript
// 使用项目定义的错误类
import { ApiError, AppError, ValidationError } from '@/lib/errors'

// API 错误处理
try {
  const data = await service.getData(http)
}
catch (error) {
  if (error instanceof ApiError) {
    // 处理 API 错误
  }
  throw error
}
```

## 测试

```typescript
// 测试文件与源文件同目录
// src/lib/utils.ts → src/lib/utils.test.ts

import { render, screen } from '@testing-library/react'
// 使用 vitest + testing-library
import { describe, expect, it } from 'vitest'

// Mock 使用 MSW
// src/__tests__/mocks/handlers.ts
```

## 图标使用

本项目使用 **Iconify + Tailwind CSS** 方案，通过 `@iconify/tailwind4` 插件实现图标的按需加载。

**禁止**：直接安装 `lucide-react`、`react-icons` 等图标库

### 使用方式

```typescript
// 从统一入口导入图标组件
import { LucideHome, LucideArrowRight } from '@/components/ui/icon'

// 在 JSX 中使用，支持 className 自定义样式
<LucideHome className="size-5 text-blue-500" />
```

### 添加新图标

1. 在 `src/components/ui/icon/index.ts` 中添加导出：

```typescript
import { CreateIcon } from './create-icon'

// 命名规则：{图标集}{图标名} (PascalCase)
// 图标类名格式：icon-[{图标集}--{图标名}]
export const LucideSearch = CreateIcon('icon-[lucide--search]')
export const MdiAccount = CreateIcon('icon-[mdi--account]')
```

2. 图标集查询：[Iconify 图标库](https://icon-sets.iconify.design/)

### 常用图标集

| 图标集 | 前缀 | 说明 |
|--------|------|------|
| Lucide | `lucide--` | 简洁线性图标，推荐首选 |
| Material Design | `mdi--` | Material 风格图标 |
| Heroicons | `heroicons--` | Tailwind 官方图标 |
| EOS Icons | `eos-icons--` | 包含加载动画等 |
