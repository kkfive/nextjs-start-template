# UI 组件导入规范

**核心原则**：基础 UI 组件统一来自 `@kkfive/ui` 共享包；各 app 通过自己的 `src/components/ui/*` 作为项目 UI 入口（底层 re-export 或扩展 `@kkfive/ui`）。业务代码不直接绑定第三方 UI 库。

## 包结构

```
packages/ui/                     基础 UI（shadcn 二次封装 + 自实现，不含 antd）
  components/                     Button、Input、Dialog、Select 等
  tokens/                         设计 token
  utils/                          cn()、createIcon 等

apps/{app}/src/components/ui/     各 app 的 UI 入口（re-export @kkfive/ui + 按需扩展）
apps/{app}/src/components/common/ 通用功能组件（可复用，不依赖特定 domain）
apps/{app}/src/components/domain/ 领域 UI（结合 Domain 适配层）
```

## 导入规则（Next.js apps）

| 层级 | UI 组件导入规则 | 示例 |
|------|----------------|------|
| `src/app/` | ✅ 通过 `@/components/ui/*`（底层 `@kkfive/ui`） | `import { Button } from '@/components/ui/button'` |
| `src/components/domain/` | ✅ 通过 `@/components/ui/*` 或直接 `@kkfive/ui` | `import { Modal } from '@/components/ui/modal'` |
| `src/components/common/` | ✅ 通过 `@/components/ui/*` 或 `@kkfive/ui` | `import { toast } from '@/components/ui/sonner'` |
| `src/components/ui/` | ✅ re-export / 扩展 `@kkfive/ui` | `export { Button } from '@kkfive/ui'` |

## antd 的特殊处理

`@kkfive/ui` **不含 antd**。antd 由各 app 按需自行安装：
- 各 app 的 `package.json` 自行声明 antd 依赖
- ConfigProvider / 主题 token 各 app 自治
- 业务代码用 antd 时，经该 app 的 `src/components/ui/*` 封装后再用，不直接在业务代码 `from 'antd'`

## 为什么这样设计

- **共享基础**：多个 app 复用同一套基础控件（来自 `@kkfive/ui`），避免重复封装
- **统一入口**：各 app 通过自己的 `ui/` 层统一管理，便于按 app 扩展
- **易于替换**：更换底层 UI 库时只需修改 `@kkfive/ui` 或各 app 的 `ui/` 层
- **antd 隔离**：antd 不进共享包，避免与 app 内 antd 体系冲突；各 app 自治

## 组件文件结构规范

各 app 下所有 UI 组件必须使用 `目录/index.tsx` 的形式：

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

## 各 app UI 入口封装示例

```typescript
// apps/client/src/components/ui/button/index.tsx - re-export @kkfive/ui
export { Button } from '@kkfive/ui'
export type { ButtonProps } from '@kkfive/ui'

// apps/client/src/components/ui/custom-button/index.tsx - 自定义扩展
import { Button as UiButton } from '@kkfive/ui'
import type { ButtonProps as UiButtonProps } from '@kkfive/ui'

export type CustomButtonProps = UiButtonProps & {
  variant?: 'primary' | 'secondary'
}

export function CustomButton({ variant, ...props }: CustomButtonProps) {
  return <UiButton {...props} />
}
```
