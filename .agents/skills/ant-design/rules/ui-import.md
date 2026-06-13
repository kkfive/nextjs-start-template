# UI 组件导入规范

业务代码必须通过项目内 UI 适配层导入 antd 组件，不能直接 import。

## 规则

```tsx
// ✅ 业务代码
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Table } from '@/components/ui/table'

// ❌ 业务代码不允许
import { Button } from 'antd'
```

## 适配层例外

- `src/components/ui/**` 内部允许 `import { Button } from 'antd'`（它就是适配层）
- `src/app/layout.tsx` 中的 `ConfigProvider` 作为应用根可直接 import（已在项目规范中明确）

## 为什么

- **稳定入口**：业务代码不直接绑定第三方 API，未来替换/封装时改一处
- **样式策略统一**：UI 层可以注入项目主题、Token、ClassNames
- **类型与默认值收敛**：UI 层可以做默认 `size`、`bordered` 等收敛

## 校验

`pnpm run lint` 会拒绝 `domain/` 与 `src/app/` 中直接 `from 'antd'` 的导入。修复方式：
- 该组件还没有 UI 适配 → 在 `src/components/ui/<component>/` 新增适配文件
- 该组件已有适配 → 改 import 路径

详细 UI 层组织见 `/coding-standards` 与 `/project-architecture`。
