# 实战案例

## 案例 1: 全局按钮统一样式

需求：所有按钮字体加粗、字号 16、py 14。

```tsx
// ✅ Level 1 ConfigProvider
<ConfigProvider
  theme={{
    components: {
      Button: { fontWeight: 600, contentFontSize: 16, paddingBlock: 14 },
    },
  }}
>

// ❌ 每个按钮重复 className
<Button className="font-semibold text-base py-3.5">提交</Button>
<Button className="font-semibold text-base py-3.5">取消</Button>
```

## 案例 2: 三色主题切换

```css
/* ✅ Level 2 */
:root[data-theme='blue']   { --platform-primary: #1e40af; }
:root[data-theme='green']  { --platform-primary: #047857; }
:root[data-theme='purple'] { --platform-primary: #6d28d9; }
```

```tsx
<div className="border-[var(--platform-primary)]" />

document.documentElement.setAttribute('data-theme', 'green')

// ❌ 硬编码不响应切换
<div className="border-blue-700" />
```

## 案例 3: 单个 Input 字号变大

```tsx
// ✅ Level 3 styles
<Input
  styles={{ input: { fontSize: 18, fontWeight: 500 } }}
  classNames={{ input: 'placeholder:text-gray-400' }}
/>

// ❌ 选择器穿透 antd 内部
<Input className="[&_.ant-input]:text-lg" />
```

## 案例 4: 卡片悬停效果

```tsx
// ✅ Level 4 Tailwind + Variables
<div className="
  flex items-center gap-2 rounded-2xl
  border-2 border-[var(--platform-secondary)]
  transition-colors duration-200
  hover:border-[var(--platform-primary)]
  hover:bg-blue-500/5
" />

// ❌ 内联 style 冗长
<div style={{ display: 'flex', borderRadius: '1rem', /* ... */ }} />
```

## 案例 5: Upload.Dragger 边框

```scss
/* ✅ Level 5 SCSS + :global + 注释 */
.material-uploader {
  // 覆盖原因：拖拽区域边框样式无 API
  :global(.ant-upload-drag) {
    border: 2px dashed var(--platform-secondary);
    &:hover { border-color: var(--platform-primary); }
  }
}

/* ❌ 全局覆盖 + !important */
.ant-upload-drag { border: 2px dashed #3b82f6 !important; }
```

## 总览

| 案例 | 级别 | 关键约束 |
|---|---|---|
| 1. 全局按钮 | 1 | components 配置 |
| 2. 三色主题 | 2 | data-theme + 变量 |
| 3. 单 Input | 3 | styles / classNames |
| 4. 卡片悬停 | 4 | Tailwind + 变量 |
| 5. Upload 边框 | 5 | `:global` + 注释 |
