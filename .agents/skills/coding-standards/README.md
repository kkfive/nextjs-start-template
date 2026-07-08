# Coding Standards Skill

TypeScript 和 React 编码规范 Skill

## 用途

提供 TypeScript、React、Domain 层类型定义、错误处理、图标使用、测试等编码规范。

## 使用场景

- 编写 Domain 层代码（类型定义、业务逻辑）
- 创建 React 组件
- 处理错误
- 添加图标
- 编写测试
- 解决导入依赖问题

## 调用方式

```
/coding-standards
```

## 包含内容

- **跨包与应用内依赖规则**：共享包不依赖应用、应用内分层边界
- **UI 组件导入规范**：基础 UI 来自 `@kkfive/ui`，各 app 通过 `@/components/ui/*` 入口
- **TypeScript 规范**：类型定义文件选择
- **Domain 类型定义**：共享包 `type.ts` + `export type` 规范
- **React 组件模式**：函数声明、客户端标记
- **错误处理**：使用项目错误类
- **图标使用**：Iconify + Tailwind 方案
- **测试规范**：vitest + MSW

## 快速示例

### 跨包依赖

```typescript
// ❌ 错误：共享包依赖应用
import { something } from '../../../../apps/client/src/lib'

// ✅ 正确：共享包框架无关，只接受注入
import type { HttpService } from '@kkfive/http-client'
```

### UI 组件导入

```typescript
// ❌ 错误：直接导入第三方库
import { Button } from 'antd'

// ✅ 正确：通过各 app 的 ui/ 入口（底层 @kkfive/ui）
import { Button } from '@/components/ui/button'
```

### Domain 类型定义

```typescript
// packages/domain-core/src/material/type.ts
export type ExtractionResult = {
  coreInfo: CoreInfo
}

// packages/domain-core/src/material/index.ts
export type * from './type'
```

### React 组件

```typescript
// ✅ 使用函数声明
export function Component() {
  return <div>...</div>
}

// ❌ 不使用箭头函数
export const Component = () => {
  return <div>...</div>
}
```

## 相关文档

- `references/layer-dependency.md` - 层级依赖规则
- `references/ui-import-rules.md` - UI 组件导入规范
- `references/typescript-rules.md` - TypeScript 规范
- `references/domain-types.md` - Domain 类型定义
- `references/react-patterns.md` - React 组件模式
- `references/error-handling.md` - 错误处理
- `references/icon-usage.md` - 图标使用
- `references/testing.md` - 测试规范
