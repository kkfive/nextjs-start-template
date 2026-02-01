---
name: coding-standards
description: TypeScript 和 React 编码规范 - 层级依赖、UI 导入、Domain 类型定义、React 组件模式、错误处理、图标使用、测试规范。用于编写 Domain 层代码、创建 React 组件、解决导入依赖问题。
user-invocable: true
---

# Coding Standards

## S - Scope
- Target: TypeScript、React、Domain 层、测试
- Cover: 层级依赖、UI 组件导入、类型定义、组件模式、错误处理、图标、测试
- Avoid: 违反层级依赖、直接导入第三方 UI 库、使用箭头函数定义组件

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
层级依赖 | Domain 层禁止导入规则 | `references/layer-dependency.md`
UI 导入规范 | 统一通过 `@/components/ui/*` 导入 | `references/ui-import-rules.md`
TypeScript 规范 | 类型定义文件选择 | `references/typescript-rules.md`
Domain 类型 | `declare namespace` 规范 | `references/domain-types.md`
React 组件 | 函数声明、客户端标记 | `references/react-patterns.md`
错误处理 | 使用项目错误类 | `references/error-handling.md`
图标使用 | Iconify + Tailwind 方案 | `references/icon-usage.md`
测试规范 | vitest + MSW | `references/testing.md`

## P - Process
1. **识别层级**：确定代码所在层级（domain/、src/components/、src/app/）
2. **检查依赖**：
   - Domain 层：只能导入 `@/lib/*` 和外部库
   - 应用层：通过 `@/components/ui/*` 使用 UI 组件
3. **选择类型定义方式**：
   - Domain 层业务类型 → `type.d.ts` + `declare namespace`
   - 工具类型 → `type.ts` + `export type`
4. **编写组件**：使用 `export function` 而非箭头函数
5. **处理错误**：使用项目定义的错误类（ApiError、AppError、ValidationError）
6. **添加图标**：从 `@/components/ui/icon` 导入
7. **编写测试**：测试文件与源文件同目录，使用 vitest + MSW

## O - Output
- 推荐代码模式及层级选择理由
- 提供代码示例（类型定义、组件定义、错误处理）
- 指出违反规范的代码和正确做法
- 包含验证清单（依赖检查、类型安全、测试覆盖）

## 核心规范

### 层级依赖

```
❌ domain/ → @/components/*
❌ domain/ → @/hooks/*
✅ domain/ → @/lib/*
✅ src/app/ → @/components/ui/*
```

### UI 组件导入

```typescript
// ✅ 正确：通过 ui/ 层导入
import { Button } from '@/components/ui/button'

// ❌ 错误：直接导入第三方库
import { Button } from 'antd'
```

### Domain 类型定义

```typescript
// domain/{module}/type.d.ts
declare namespace Material {
  interface ExtractionResult {
    coreInfo: CoreInfo
  }
}

// ❌ 禁止 import 和 export
```

### React 组件

```typescript
// ✅ 使用函数声明
export function Component() { ... }

// ❌ 不使用箭头函数
export const Component = () => { ... }
```
