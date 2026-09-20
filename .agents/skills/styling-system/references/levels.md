# 5 级方案模板

各级触发条件与禁止跳级见 `rules/priority-order.md`；本文件只给每级的位置与最小模板。

## Level 1: ConfigProvider（全局 / 全实例）

位置：`src/app/providers.tsx`（Client Wrapper），应用根只有一个。

```tsx
<ConfigProvider theme={{ token: { borderRadius: 8 }, components: { Button: { fontWeight: 600 } } }}>
```

暗色：`theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}`。token 可用值以当前 antd 官方文档为准。

## Level 2: CSS Variables（主题切换 / 暗色 / 跨组件复用）

位置：`src/styles/tailwind.css`（Tailwind v4 入口）。

```css
:root { --platform-primary: #1e40af; }
:root[data-theme='green'] { --platform-primary: #047857; }
.dark { --background: 222 84% 5%; }
```

约定：变体集中在 `data-theme` / `.dark` 选择器下；前缀 `--platform-*`（全局）、`--{场景}-*`（业务）；切换用 `setAttribute('data-theme', ...)` / `classList.toggle('dark')`；组件中 `border-[var(--platform-primary)]` 引用。

## Level 3: 组件 API props（单实例特殊化）

```tsx
<Input styles={{ input: { fontSize: 18 } }} classNames={{ input: 'placeholder:text-gray-400' }} />
```

**必查当前 antd 官方文档**确认该组件支持 `styles`/`classNames` 及部位 key；多处重复时升级 Level 1。

## Level 4: Tailwind className（布局 / 间距 / 响应式 / 简单状态）

```tsx
<div className="flex items-center gap-2 rounded-2xl border-2 border-[var(--platform-secondary)]" />
```

颜色用 `var(--...)`；utility 合法性由 eslint tailwindcss 插件校验；同样 className 3+ 处重复升级 Level 1。

## Level 5: SCSS 覆盖（仅限：内部元素无 API / 伪元素 / 复杂伪类）

```scss
.material-uploader {
  // 覆盖原因：拖拽区域边框样式无 API
  :global(.ant-upload-drag) {
    border: 2px dashed var(--platform-secondary);
  }
}
```

硬规范：`:global()` 包裹、每处注释原因、禁 `!important`、颜色用 Variables、作用域到组件根。同一组件 3+ 处 `:global(.ant-*)` 时先查新版 antd 是否已支持对应 API。
