# Level 1: ConfigProvider（全局主题）

## 适用

- 影响所有 antd 组件的全局 token
- 某类组件（Button、Input、Form 等）的所有实例
- 类型安全的设计系统起点

## 配置位置

`src/app/layout.tsx` 或 `src/app/providers.tsx`（Client Wrapper）。

## 模板

```tsx
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      borderRadius: 8,
      controlHeight: 40,
      colorPrimary: '#3b82f6',
      colorBorder: '#e2e8f0',
    },
    components: {
      Input: {
        paddingBlock: 14,
        paddingInline: 16,
        fontSize: 16,
      },
      Button: {
        fontWeight: 600,
        contentFontSize: 16,
      },
      Form: {
        labelFontSize: 14.4,
        labelColor: '#1e293b',
      },
    },
  }}
>
  {children}
</ConfigProvider>
```

## 暗色 / 多主题算法

```tsx
import { theme } from 'antd'

<ConfigProvider
  theme={{
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { /* ... */ },
  }}
/>
```

需要彻底动态切换（用户可改）时配合 CSS Variables（第 2 级）。

## 优势

- 一处配置全局生效
- TypeScript 提示完整
- 不依赖内部类名
- 主题算法自动派生派生色

## 反例

```tsx
// ❌ 每个 Input 都重写一遍
<Input style={{ paddingBlock: 14 }} />
<Input style={{ paddingBlock: 14 }} />

// ✅ 第 1 级 components.Input.paddingBlock 一次性
```

## 检查

- [ ] 应用根只有一个 ConfigProvider
- [ ] 没有为单实例硬编码 token 值（属于第 3 级）
- [ ] 主题切换需求已识别 → 考虑配合第 2 级 CSS Variables
