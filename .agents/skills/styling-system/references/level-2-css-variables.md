# Level 2: CSS Variables（主题切换 / 暗色）

## 适用

- 用户可切换的多主题（蓝/绿/紫）
- 暗色模式
- 跨组件复用的颜色 / 尺寸
- 业务场景专属变量（auth、dashboard 等）

## 定义位置

`src/styles/tailwind.css` 或专门的 `src/styles/tokens.css`。

## 模板

```css
/* 基础 Token（shadcn 风格 HSL） */
:root {
  --background: 0 0% 100%;
  --foreground: 222 84% 5%;
  --primary: 221 83% 53%;
}

/* 平台变量 */
:root {
  --platform-primary: #1e40af;
  --platform-secondary: #93c5fd;
  --platform-accent: #3b82f6;
}

/* 主题变体 */
:root[data-theme='green'] {
  --platform-primary: #047857;
  --platform-secondary: #6ee7b7;
}

:root[data-theme='purple'] {
  --platform-primary: #6d28d9;
  --platform-secondary: #c4b5fd;
}

/* 业务场景 */
:root {
  --auth-primary: #1e40af;
  --auth-bg: #eff6ff;
}

/* 暗色 */
.dark {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
}
```

## 切换

```ts
// 主题
document.documentElement.setAttribute('data-theme', 'green')

// 暗色
document.documentElement.classList.toggle('dark')
```

## 在组件中使用

```tsx
// Tailwind 任意值
<div className="border-[var(--platform-primary)] bg-[var(--auth-bg)]" />

// 行内 style
<div style={{ borderColor: 'var(--platform-primary)' }} />
```

## 命名约定

| 前缀 | 含义 |
|---|---|
| `--platform-*` | 平台全局变量 |
| `--auth-*` / `--dashboard-*` | 业务场景 |
| `--{component}-*` | 组件级专属 |

## 反例

```tsx
// ❌ 硬编码：主题切换不响应
<div className="border-blue-700 bg-blue-100" />

// ✅
<div className="border-[var(--platform-primary)] bg-[var(--auth-bg)]" />
```

## 检查

- [ ] 颜色统一从变量取
- [ ] 主题变体在 `data-theme` 下定义，不在组件里
- [ ] 暗色模式在 `.dark` 选择器下集中定义
- [ ] 变量命名按场景分组
