# 样式自定义规范

本文档定义项目中样式自定义的优先级顺序和最佳实践。

## 核心原则

**样式自定义 5 级优先级**（从高到低）：

```
1. ConfigProvider (全局主题配置)
   ├─ theme.token (Design Token)
   └─ theme.components (组件级主题)

2. CSS Variables (设计系统 Token)
   ├─ 平台主题变量 (--platform-*)
   ├─ 业务主题变量 (--auth-*, --dashboard-*)
   └─ 主题变体 (data-theme)

3. 组件 API props (组件实例配置)
   ├─ style (内联样式)
   ├─ styles (多部位样式，Ant Design 5.x+)
   └─ classNames (多部位类名，Ant Design 5.x+)

4. className + Tailwind (工具类样式)
   ├─ Tailwind 工具类
   ├─ CSS Variables 引用 (var(--platform-primary))
   └─ 响应式修饰符

5. SCSS 覆盖 (最后手段)
   ├─ 组件内部元素无法通过 API 访问
   ├─ 伪元素、伪类样式
   └─ 必须添加注释说明覆盖原因
```

## 决策流程

```
需要自定义样式
    |
    ├─ 影响所有组件？
    |   └─ YES → ConfigProvider (theme.token)
    |
    ├─ 影响某类组件的所有实例？
    |   └─ YES → ConfigProvider (theme.components)
    |
    ├─ 需要主题切换/多变体？
    |   └─ YES → CSS Variables (--platform-*, data-theme)
    |
    ├─ 单个组件实例？
    |   ├─ 查阅组件 API 文档
    |   ├─ 有 style/styles/classNames API？
    |   |   └─ YES → 使用组件 API props
    |   └─ NO → 继续
    |
    ├─ 常见样式调整（间距/尺寸/颜色）？
    |   └─ YES → className + Tailwind
    |
    └─ 组件内部元素/伪元素？
        └─ YES → SCSS 覆盖 (添加注释说明原因)
```

## 优先级详解

### 1. ConfigProvider (全局主题配置)

**使用场景**：
- 影响所有组件的全局样式
- 某类组件的所有实例需要统一样式
- 建立设计系统的基础 Token

**配置位置**：`src/app/layout.tsx`

**示例**：

```typescript
// src/app/layout.tsx
<ConfigProvider
  theme={{
    // 全局 Design Token
    token: {
      borderRadius: 8,           // 所有组件的圆角
      controlHeight: 40,         // 所有表单控件的高度
      colorBorder: '#e2e8f0',    // 所有边框颜色
      colorPrimary: '#3b82f6',   // 主题色
    },
    // 组件级主题
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
```

**优势**：
- 一处配置，全局生效
- 类型安全，有 TypeScript 提示
- 符合设计系统理念

### 2. CSS Variables (设计系统 Token)

**使用场景**：
- 需要主题切换（蓝色/绿色/紫色主题）
- 需要暗色模式支持
- 跨组件复用的颜色/尺寸值
- 业务场景特定的主题变量

**配置位置**：`src/styles/tailwind.css`

**示例**：

```css
/* src/styles/tailwind.css */

/* 基础 Token */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

/* 平台主题变量 */
:root {
  --platform-primary: #1e40af;
  --platform-secondary: #93c5fd;
  --platform-accent: #3b82f6;
}

/* 主题变体 */
:root[data-theme='blue'] {
  --platform-primary: #1e40af;
  --platform-secondary: #93c5fd;
}

:root[data-theme='green'] {
  --platform-primary: #047857;
  --platform-secondary: #6ee7b7;
}

:root[data-theme='purple'] {
  --platform-primary: #6d28d9;
  --platform-secondary: #c4b5fd;
}

/* 业务场景主题 */
:root {
  --auth-primary: #1e40af;
  --auth-bg: #eff6ff;
  --dashboard-primary: #047857;
}

/* 暗色模式 */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

**组件中使用**：

```tsx
// 使用 Tailwind 引用 CSS Variables
<div className="border-[var(--platform-primary)]
                bg-[var(--auth-bg)]
                hover:border-[var(--platform-accent)]">
  内容
</div>

// 或在 style 中使用
<div style={{ borderColor: 'var(--platform-primary)' }}>
  内容
</div>
```

**优势**：
- 支持主题切换
- 支持暗色模式
- 运行时可修改
- 语义化命名

### 3. 组件 API props (组件实例配置)

**使用场景**：
- 单个组件实例需要特殊样式
- 组件提供了 `style`/`styles`/`classNames` API
- 需要精确控制组件内部元素样式

**Ant Design 5.x+ 新 API**：

| API | 用途 | 示例 |
|-----|------|------|
| `style` | 组件根元素内联样式 | `style={{ width: 300 }}` |
| `styles` | 多部位样式对象 | `styles={{ input: { fontSize: 18 } }}` |
| `classNames` | 多部位类名对象 | `classNames={{ input: 'font-medium' }}` |

**示例**：

```tsx
// Input 组件多部位样式
<Input
  placeholder="请输入"
  styles={{
    input: { fontSize: 18, fontWeight: 500 },
    prefix: { color: '#3b82f6' },
    suffix: { color: '#64748b' },
  }}
  classNames={{
    input: 'placeholder:text-gray-400',
    prefix: 'mr-2',
  }}
/>

// Button 组件样式
<Button
  type="primary"
  style={{ width: '100%' }}
  styles={{
    icon: { fontSize: 20 },
  }}
  classNames={{
    icon: 'mr-2',
  }}
>
  提交
</Button>

// Form.Item 样式
<Form.Item
  label="用户名"
  styles={{
    label: { fontWeight: 600 },
  }}
  classNames={{
    label: 'text-gray-700',
  }}
>
  <Input />
</Form.Item>
```

**查阅 API 文档**：

使用组件前，必须先查阅 Ant Design 官方文档，确认是否支持 `styles`/`classNames` API：

- [Ant Design 5.x 文档](https://ant.design/components/overview-cn/)
- 搜索组件页面的 "API" 部分
- 查找 `styles` 和 `classNames` 属性说明

**优势**：
- 类型安全，有 TypeScript 提示
- 精确控制组件内部元素
- 不依赖内部类名，版本升级稳定

### 4. className + Tailwind (工具类样式)

**使用场景**：
- 快速调整间距、尺寸、颜色
- 响应式布局
- 常见样式组合
- 组件 API 不支持的样式属性

**示例**：

```tsx
// 布局和间距
<div className="flex items-center gap-2 p-4 rounded-2xl">
  内容
</div>

// 响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">
  内容
</div>

// 结合 CSS Variables
<div className="border-2 border-[var(--platform-secondary)]
                hover:border-[var(--platform-primary)]
                hover:bg-blue-500/5">
  内容
</div>

// 复杂样式组合
<div className="flex min-h-[40px] cursor-pointer items-center gap-2
                rounded-2xl border-2 border-dashed
                border-[var(--platform-secondary)]
                transition-colors duration-200
                hover:border-[var(--platform-primary)]
                hover:bg-blue-500/5">
  内容
</div>
```

**优势**：
- 快速开发
- 响应式支持
- 工具类可复用
- 与 CSS Variables 结合使用

### 5. SCSS 覆盖 (最后手段)

**使用场景**（仅限以下情况）：
- 组件内部元素无法通过 API 访问
- 需要自定义伪元素（`::before`、`::after`）
- 需要自定义伪类（`:hover`、`:focus` 等复杂状态）
- 第三方组件没有提供样式 API

**规范要求**：
1. **必须添加注释**说明覆盖原因
2. 使用 CSS Modules 或作用域类名，避免全局污染
3. 避免使用 `!important`
4. 使用 CSS Variables 而非硬编码颜色

**示例**：

```scss
// src/components/domain/material/material-uploader.scss

.material-uploader {
  // 覆盖原因：antd Upload 组件的拖拽区域无法通过 API 自定义边框样式
  :global(.ant-upload-drag) {
    border: 2px dashed var(--platform-secondary);
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--platform-primary);
      background-color: rgba(59, 130, 246, 0.05);
    }
  }

  // 覆盖原因：需要自定义上传图标的颜色，组件 API 不支持
  :global(.ant-upload-drag-icon) {
    color: var(--platform-primary);
  }
}
```

```tsx
// 组件中导入 SCSS
import './material-uploader.scss'

export function MaterialUploader() {
  return (
    <div className="material-uploader">
      <Upload.Dragger>
        上传文件
      </Upload.Dragger>
    </div>
  )
}
```

**注意事项**：
- 使用 `:global()` 包裹 antd 类名，避免 CSS Modules 转换
- 选择器尽量具体，避免影响其他组件
- 优先使用 CSS Variables，便于主题切换

## 实际案例

### 案例 1: 全局按钮样式

**需求**：所有按钮字体加粗、字号 16px、垂直内边距 14px

```typescript
// ✅ 正确：ConfigProvider
<ConfigProvider
  theme={{
    components: {
      Button: {
        fontWeight: 600,
        contentFontSize: 16,
        paddingBlock: 14,
      },
    },
  }}
>
  <App />
</ConfigProvider>

// ❌ 错误：每个按钮都写 className
<Button className="font-semibold text-base py-3.5">提交</Button>
<Button className="font-semibold text-base py-3.5">取消</Button>
```

**原因**：全局样式应该在 ConfigProvider 中配置，避免重复代码。

### 案例 2: 主题色切换

**需求**：支持蓝色/绿色/紫色三种主题切换

```typescript
// ✅ 正确：CSS Variables + data-theme
// src/styles/tailwind.css
:root[data-theme='blue'] {
  --platform-primary: #1e40af;
  --platform-secondary: #93c5fd;
}

:root[data-theme='green'] {
  --platform-primary: #047857;
  --platform-secondary: #6ee7b7;
}

:root[data-theme='purple'] {
  --platform-primary: #6d28d9;
  --platform-secondary: #c4b5fd;
}

// 组件中使用
<div className="border-[var(--platform-primary)]
                bg-[var(--platform-secondary)]">
  内容
</div>

// 切换主题
document.documentElement.setAttribute('data-theme', 'green')

// ❌ 错误：硬编码颜色
<div className="border-blue-700 bg-blue-100">内容</div>
```

**原因**：CSS Variables 支持运行时切换，硬编码颜色无法动态修改。

### 案例 3: 单个组件样式调整

**需求**：某个 Input 组件需要更大的字号和加粗字体

```typescript
// ✅ 正确：使用组件 API
<Input
  placeholder="请输入"
  styles={{
    input: { fontSize: 18, fontWeight: 500 },
    prefix: { color: '#3b82f6' },
  }}
  classNames={{
    input: 'placeholder:text-gray-400',
  }}
/>

// ❌ 错误：直接覆盖 antd 类名
<Input
  className="[&_.ant-input]:text-lg [&_.ant-input]:font-medium"
  placeholder="请输入"
/>
```

**原因**：
- 组件 API 类型安全，有 TypeScript 提示
- 不依赖内部类名，版本升级稳定
- 直接覆盖类名脆弱，antd 升级可能失效

### 案例 4: 快速样式调整

**需求**：创建一个带边框、圆角、悬停效果的卡片

```typescript
// ✅ 正确：Tailwind + CSS Variables
<div className="flex items-center gap-2 rounded-2xl border-2
                border-[var(--platform-secondary)]
                transition-colors duration-200
                hover:border-[var(--platform-primary)]
                hover:bg-blue-500/5">
  内容
</div>

// ❌ 错误：内联样式
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderRadius: '1rem',
  border: '2px solid var(--platform-secondary)',
  transition: 'border-color 0.2s, background-color 0.2s',
}}>
  内容
</div>
```

**原因**：
- Tailwind 工具类简洁、可复用
- 内联样式冗长、难以维护
- Tailwind 支持响应式和伪类

### 案例 5: 组件内部元素样式

**需求**：自定义 Upload.Dragger 的边框样式和悬停效果

```scss
// ✅ 正确：SCSS 覆盖 + 注释说明
// material-uploader.scss
.material-uploader {
  // 覆盖原因：antd Upload 组件的拖拽区域无法通过 API 自定义边框样式
  :global(.ant-upload-drag) {
    border: 2px dashed var(--platform-secondary);
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--platform-primary);
      background-color: rgba(59, 130, 246, 0.05);
    }
  }
}

// ❌ 错误：全局覆盖 + 无注释 + 硬编码颜色
.ant-upload-drag {
  border: 2px dashed #3b82f6 !important;
}

.ant-upload-drag:hover {
  border-color: #1e40af !important;
  background-color: #eff6ff !important;
}
```

**原因**：
- 全局覆盖会影响所有 Upload 组件
- 缺少注释导致后续维护困难
- 硬编码颜色无法主题切换
- `!important` 破坏样式优先级

## 反模式警告

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| ❌ 直接覆盖 antd 类名 | 脆弱，版本升级易失效 | 先查阅组件 API 文档，使用 `styles`/`classNames` |
| ❌ 使用 `!important` | 破坏样式优先级，难以维护 | 提高选择器权重或使用 CSS Variables |
| ❌ 全局样式污染 | 影响其他组件 | 使用 CSS Modules 或作用域类名 |
| ❌ 硬编码颜色值 | 无法主题切换 | 使用 CSS Variables (`var(--platform-primary)`) |
| ❌ 过度使用内联样式 | 无法复用，难以维护 | 使用 className 或 CSS Variables |
| ❌ 无注释的样式覆盖 | 后续维护困难 | 添加注释说明覆盖原因 |
| ❌ 每个组件重复写样式 | 代码冗余，难以统一修改 | 使用 ConfigProvider 或 CSS Variables |
| ❌ 混用多种方案 | 优先级混乱，难以调试 | 遵循决策流程，选择最合适的方案 |

## 常见问题

### Q1: 什么时候使用 ConfigProvider，什么时候使用 CSS Variables？

**ConfigProvider**：
- Ant Design 组件的全局样式
- 需要类型安全和 TypeScript 提示
- 设计系统的基础 Token

**CSS Variables**：
- 需要主题切换或暗色模式
- 跨组件复用的颜色/尺寸值
- 业务场景特定的主题变量
- 非 Ant Design 组件的样式

### Q2: 组件 API 不支持某个样式属性怎么办？

1. 先查阅最新版本的 Ant Design 文档，确认是否有新增 API
2. 如果 API 不支持，使用 `className` + Tailwind
3. 如果 Tailwind 无法实现，使用 SCSS 覆盖（添加注释）

### Q3: 如何避免样式覆盖失效？

1. 优先使用组件 API，不依赖内部类名
2. 使用 CSS Variables 而非硬编码值
3. 避免使用 `!important`
4. 使用具体的选择器，避免全局污染

### Q4: 如何处理第三方组件（非 Ant Design）的样式？

1. 查阅第三方组件文档，确认是否有样式 API
2. 如果有 `className` 或 `style` props，优先使用
3. 如果没有，使用 SCSS 覆盖（添加注释）
4. 使用 CSS Variables 保持主题一致性

### Q5: 什么时候可以使用 `!important`？

**几乎不应该使用**。如果遇到样式优先级问题：
1. 提高选择器权重（如 `.parent .child` 而非 `.child`）
2. 使用 CSS Variables 覆盖
3. 检查是否有其他样式冲突

**唯一例外**：覆盖第三方库的 `!important` 样式（极少见）

## 工具和资源

- [Ant Design 5.x 文档](https://ant.design/components/overview-cn/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [CSS Variables (MDN)](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- 项目配置：`src/app/layout.tsx` (ConfigProvider)
- 项目配置：`src/styles/tailwind.css` (CSS Variables)
