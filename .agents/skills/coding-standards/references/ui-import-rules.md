# UI 组件导入规范

**核心原则**：所有层级必须通过 `@/components/ui/*` 使用 UI 组件，禁止直接导入第三方 UI 库（如 antd、sonner 等）

## 导入规则

| 层级 | UI 组件导入规则 | 示例 |
|------|----------------|------|
| `src/app/` | ✅ 必须通过 `@/components/ui/*` | `import { Button } from '@/components/ui/button'` |
| `src/components/domain/` | ✅ 必须通过 `@/components/ui/*` | `import { Modal } from '@/components/ui/modal'` |
| `src/components/common/` | ✅ 必须通过 `@/components/ui/*` | `import { toast } from '@/components/ui/sonner'` |
| `src/components/ui/` | ✅ 封装或透传第三方 UI 组件 | `export { Button } from 'antd'` |

## 为什么这样设计

- **统一入口**：所有 UI 组件通过 `ui/` 层统一管理
- **易于替换**：更换 UI 库时只需修改 `ui/` 层
- **可扩展**：需要自定义时直接在 `ui/` 层修改
- **类型安全**：统一的类型导出

## 组件文件结构规范

所有 UI 组件必须使用 `目录/index.tsx` 的形式，禁止直接在 `ui/` 目录下创建 `.tsx` 文件：

```
✅ 正确：
src/components/ui/
├── button/
│   └── index.tsx
├── modal/
│   └── index.tsx
└── sonner/
    └── index.tsx

❌ 错误：
src/components/ui/
├── button.tsx
├── modal.tsx
└── sonner.tsx
```

## 透传封装示例

```typescript
// src/components/ui/button/index.tsx - 透传 antd Button
/**
 * Button 组件 - 透传 Ant Design Button
 *
 * 用于触发操作和提交表单
 */
export { Button } from 'antd'
export type { ButtonProps } from 'antd'

// src/components/ui/sonner/index.tsx - 透传 sonner
/**
 * toast 函数 - 显示 Toast 通知
 *
 * 用于在应用中显示临时通知消息
 */
export { toast, Toaster } from 'sonner'
export type { ToasterProps } from 'sonner'
```

## 自定义封装示例

```typescript
// src/components/ui/custom-button/index.tsx - 自定义样式
import { Button as AntdButton } from 'antd'
import type { ButtonProps as AntdButtonProps } from 'antd'

export type CustomButtonProps = AntdButtonProps & {
  variant?: 'primary' | 'secondary'
}

export function CustomButton({ variant, ...props }: CustomButtonProps) {
  // 自定义逻辑
  return <AntdButton {...props} />
}
```
