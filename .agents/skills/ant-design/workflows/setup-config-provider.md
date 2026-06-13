# ConfigProvider + 主题初始化

## 步骤

1. **应用根挂 ConfigProvider**（`src/app/layout.tsx` 或专门的 `providers.tsx`）
2. **设置 locale**：中文用 `antd/locale/zh_CN`
3. **配置 theme.token / theme.components**：调主色、圆角、字号
4. **可选 algorithm**：暗色模式 `theme.darkAlgorithm`
5. **SSR 时套 StyleProvider**：见 `workflows/nextjs-ssr.md`

## 模板

```tsx
// src/app/layout.tsx 或 src/app/providers.tsx
'use client'

import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontFamily: 'var(--font-sans)',
        },
        components: {
          Button: { fontWeight: 600 },
          Table: { rowHoverBg: '#fafafa' },
        },
        algorithm: theme.defaultAlgorithm, // 或 theme.darkAlgorithm
      }}
    >
      {children}
    </ConfigProvider>
  )
}
```

## 主题优先级（与项目 styling-system 一致）

1. **ConfigProvider theme** — 全局调色与组件 token
2. **CSS Variables** — 跨主题动态切换
3. **组件 API props** — 单实例覆盖
4. **Tailwind** — 布局与基础 utility
5. **SCSS** — 仅当上述都做不到（避免）

不要直接覆盖 `.ant-*` 类名。

## 检查

- [ ] 应用根只有一个 ConfigProvider
- [ ] `locale` 已配；不需要的字段省略
- [ ] 暗色模式通过 `algorithm` 切换，不通过 `.dark .ant-*`
- [ ] SSR 项目套了 StyleProvider（见 nextjs-ssr.md）
- [ ] React 19 严格模式下 `Modal.confirm` 等静态方法已替换为 `App.useApp()` hook

详细 token 参考 `references/antd-v6.md`。
