# 怎么选优先级

```
需要自定义样式
   │
   ├─ 影响所有组件？
   │  └─ YES → 第 1 级 ConfigProvider theme.token
   │
   ├─ 影响某类组件的所有实例？
   │  └─ YES → 第 1 级 ConfigProvider theme.components
   │
   ├─ 需要主题切换 / 暗色 / 多变体？
   │  └─ YES → 第 2 级 CSS Variables + data-theme
   │
   ├─ 单个组件实例的特殊样式？
   │  ├─ 查阅组件 API 文档（必查）
   │  ├─ 有 styles / classNames API？
   │  │  └─ YES → 第 3 级 组件 API props
   │  └─ NO → 继续
   │
   ├─ 布局 / 间距 / 尺寸 / 简单状态？
   │  └─ YES → 第 4 级 className + Tailwind
   │
   └─ 组件内部元素 / 伪元素 / 伪类？
      └─ YES → 第 5 级 SCSS + :global + 注释
```

## 路由

- 选完级别 → 看对应的 `references/level-N-*.md` 模板
- 不确定 API 是否支持 → 必查官方文档（参见 `/ant-design` 中的 api-query-required）
- 反例 / 常见问题 → `references/gotchas.md`

## 反例：跳级的代价

```tsx
// ❌ 跳到第 5 级覆盖全局 .ant-btn
.ant-btn { font-weight: 600 !important; }

// 后果：所有 Button 都被影响，无法局部覆盖；升级 antd 可能失效

// ✅ 第 1 级
<ConfigProvider theme={{ components: { Button: { fontWeight: 600 } } }}>
```

```tsx
// ❌ 跳到第 4 级硬编码颜色
<div className="border-blue-700 bg-blue-100" />

// 后果：主题切换时颜色不变

// ✅ 第 2 级
<div className="border-[var(--platform-primary)] bg-[var(--auth-bg)]" />
```
