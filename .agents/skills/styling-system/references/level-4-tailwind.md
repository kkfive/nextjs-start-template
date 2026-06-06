# Level 4: Tailwind className

## 适用

- 布局、间距、尺寸、对齐
- 响应式（`sm:` / `md:` / `lg:`）
- 简单状态（`hover:` / `focus:`）
- 组件 API 不覆盖的视觉属性

## 模板

```tsx
// 布局 + 间距
<div className="flex items-center gap-2 p-4 rounded-2xl" />

// 响应式
<div className="w-full md:w-1/2 lg:w-1/3" />

// 状态 + CSS Variables 复合
<div className="
  border-2 border-[var(--platform-secondary)]
  hover:border-[var(--platform-primary)]
  hover:bg-blue-500/5
" />
```

## 与 Variables 配合

主题相关的颜色用 `var(--...)`：

```tsx
<div className="
  bg-[var(--auth-bg)]
  text-[var(--platform-primary)]
  hover:bg-[var(--platform-secondary)]/20
" />
```

## 何时不用 Tailwind

- 全局生效 → 升级到 Level 1
- 主题切换 → Level 2 + 在 Tailwind 中引用变量
- 单实例的内部子部位 → Level 3 组件 API
- 伪元素 / antd 内部元素 → Level 5 SCSS

## 反例

```tsx
// ❌ 用 Tailwind 写大量内联样式来回避 ConfigProvider
<Button className="font-semibold text-base py-3.5">提交</Button>
<Button className="font-semibold text-base py-3.5">取消</Button>

// ✅ 升级到 ConfigProvider
```

```tsx
// ❌ 内联 style 复杂布局
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '1rem' }} />

// ✅ Tailwind
<div className="flex items-center gap-2 rounded-2xl" />
```

## 检查

- [ ] 颜色没硬编码，用 Variables
- [ ] 同样 className 没在 3+ 处重复（重复时升级 ConfigProvider）
- [ ] 响应式与状态用 Tailwind 前缀而非 JS 切换
