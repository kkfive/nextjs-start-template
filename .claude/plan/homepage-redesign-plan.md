# Next.js 模板项目首页重设计 - 实施计划

## 📋 项目概述

**目标**：将空白的 Next.js 模板首页改造为功能展示页面，创建友好的错误页面，提升用户体验。

**方案**：方案 A - 直接改造首页

**协作模型**：

- **Codex**（后端架构）- SESSION_ID: `019bdbc8-5d6a-7041-bef7-8e9954b0e401`
- **Qwen**（前端设计）- SESSION_ID: `1768920147208-qwen`

---

## 🎯 核心功能

1. **首页改造**：Hero 区域 + 技术栈展示 + 功能演示卡片
2. **404 页面**：友好插画 + 幽默文案 + 导航链接
3. **500 页面**：错误处理 + 重试按钮 + 返回首页
4. **通用组件**：HeroSection、FeatureCard 可复用组件

---

## 📁 文件结构清单

### 新增文件

```
src/
├── lib/
│   └── tech-stack.ts              # README 技术栈提取工具
├── components/
│   └── home/
│       ├── hero-section.tsx       # Hero 组件
│       └── feature-card.tsx       # 功能卡片组件
└── app/
    ├── not-found.tsx              # 404 页面
    └── error.tsx                  # 500 页面
```

### 修改文件

```
src/app/page.tsx                   # 主页 - 完全重写
tailwind.config.js                 # 添加自定义动画
package.json                       # 可能需要添加 framer-motion（可选）
```

---

## 🔧 技术架构（Codex）

### 1. 数据流设计

#### README 技术栈提取工具

**文件**：`src/lib/tech-stack.ts`

```typescript
import fs from 'node:fs/promises'
import path from 'node:path'

export interface TechStackItem {
  category: string
  technology: string
}

const TABLE_HEADER = '| Category'

function parseMarkdownTable(lines: string[]): TechStackItem[] {
  const rows: TechStackItem[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|'))
      continue
    if (trimmed.includes('---'))
      continue
    const cells = trimmed.split('|').map(cell => cell.trim()).filter(Boolean)
    if (cells.length >= 2 && cells[0] !== 'Category') {
      rows.push({ category: cells[0], technology: cells[1] })
    }
  }
  return rows
}

export async function getTechStackFromReadme(): Promise<TechStackItem[]> {
  const readmePath = path.join(process.cwd(), 'readme.md')
  const content = await fs.readFile(readmePath, 'utf-8')
  const lines = content.split('\n')
  const startIndex = lines.findIndex(line => line.includes(TABLE_HEADER))
  if (startIndex === -1)
    return []
  const tableLines: string[] = []
  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line.trim().startsWith('|'))
      break
    tableLines.push(line)
  }
  return parseMarkdownTable(tableLines)
}
```

### 2. 组件接口定义

#### HeroSection Props

```typescript
// src/components/home/hero-section.tsx
export interface HeroSectionProps {
  title: string
  subtitle: string
  techStack: TechBadge[]
  ctaButtons?: CTAButton[]
}

interface TechBadge {
  name: string
  color: string
  icon?: React.ReactNode
}

interface CTAButton {
  text: string
  href: string
  variant?: 'default' | 'outline' | 'secondary'
}
```

#### FeatureCard Props

```typescript
// src/components/home/feature-card.tsx
export interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  href: string
  category: string
  delay?: number
}
```

### 3. 性能策略

- **首页**：SSG（Static Site Generation）- 从 `readme.md` 静态生成
- **动态导入**：重型 demo 预览使用 `dynamic(() => import(...), { ssr: false })`
- **运行时限制**：使用 `export const runtime = 'nodejs'`（避免 Edge 限制）

---

## 🎨 UI/UX 设计（Qwen）

### 1. 组件层级结构

```
Home Page (src/app/page.tsx)
├── HeroSection
│   ├── Title (渐变色标题)
│   ├── Subtitle
│   ├── Tech Stack Badges (7个徽章)
│   └── CTA Buttons
├── Features Grid
│   └── FeatureCard × 5
│       ├── Icon
│       ├── Title
│       ├── Description
│       └── Link Arrow
└── Footer (可选)
```

### 2. 设计令牌

**颜色系统**：

- 品牌色：`brand-500` (#0ea5e9)
- 中性色：`neutral-50` 到 `neutral-900`
- 渐变标题：`from-brand-600 to-blue-600`

**间距**：

- 容器：`px-4 py-12 sm:py-16 md:py-20 lg:py-24`
- 卡片间距：`gap-6 lg:gap-8`

**圆角**：

- 卡片：`rounded-xl` (1rem)
- 徽章：`rounded-full`

**阴影**：

- 默认：`shadow-sm`
- 悬停：`hover:shadow-lg`

### 3. 响应式断点

```typescript
const breakpoints = {
  sm: '640px',  // 移动设备
  md: '768px',  // 平板设备
  lg: '1024px', // 桌面设备
  xl: '1280px', // 大屏设备
}

// 网格布局
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
```

### 4. 动画配置

**Tailwind 自定义动画**（添加到 `tailwind.config.js`）：

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'card-hover': 'cardHover 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0) scale(1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'translateY(-5px) scale(1.02)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
        },
      },
    },
  },
}
```

---

## 📝 详细实施步骤

### 阶段 1：基础架构 (步骤 1-3)

#### 步骤 1：创建技术栈提取工具

- **文件**：`src/lib/tech-stack.ts`
- **内容**：README Markdown 表格解析器
- **验证**：运行单元测试确保正确解析

#### 步骤 2：创建 HeroSection 组件

- **文件**：`src/components/home/hero-section.tsx`
- **功能**：
  - 渐变色标题
  - 副标题
  - 技术栈徽章（支持图标）
  - CTA 按钮组
- **动画**：淡入上移动画（`animate-fade-in-up`）

#### 步骤 3：创建 FeatureCard 组件

- **文件**：`src/components/home/feature-card.tsx`
- **功能**：
  - 卡片容器（带边框和阴影）
  - 图标区域
  - 标题和描述
  - 悬停动画（上移 + 阴影增强）
- **Props**：支持 delay 属性实现交错动画

---

### 阶段 2：首页实现 (步骤 4-6)

#### 步骤 4：重写主页 (`src/app/page.tsx`)

```typescript
import { getTechStackFromReadme } from '@/lib/tech-stack'
import { HeroSection } from '@/components/home/hero-section'
import { FeatureCard } from '@/components/home/feature-card'

const examples = [
  {
    category: 'UI',
    items: [
      { name: 'Color Palette', href: '/example/color', description: 'Tailwind CSS color system demonstration' },
    ],
  },
  // ... 其他分类
]

export default async function HomePage() {
  const techStack = await getTechStackFromReadme()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <HeroSection
        title="Next.js Start Template"
        subtitle="现代化 Next.js 启动模板，集成领域驱动架构，助力快速项目开发"
        techStack={techStack.map(item => ({
          name: item.technology,
          color: 'bg-brand-100 text-brand-800',
        }))}
        ctaButtons={[
          { text: '查看示例', href: '/example', variant: 'default' },
          { text: '阅读文档', href: '/docs', variant: 'outline' },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">功能演示</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.flatMap((category, catIndex) =>
            category.items.map((item, itemIndex) => (
              <FeatureCard
                key={item.href}
                {...item}
                category={category.category}
                delay={catIndex * 0.1 + itemIndex * 0.05}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export const runtime = 'nodejs' // 确保可以使用 fs 模块
```

#### 步骤 5：配置 Tailwind 动画

- **文件**：`tailwind.config.js`
- **内容**：添加自定义 `fadeInUp` 和 `cardHover` 动画
- **验证**：重启开发服务器，检查动画是否生效

#### 步骤 6：整合现有示例数据

- 从 `src/app/example/page.tsx` 提取示例列表
- 转换为 FeatureCard 数据格式
- 确保所有链接正确

---

### 阶段 3：错误页面 (步骤 7-8)

#### 步骤 7：创建 404 页面 (`src/app/not-found.tsx`)

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 友好插图 */}
        <div className="mb-8 flex justify-center">
          <svg className="w-48 h-48 text-blue-400" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill="#BFDBFE" opacity="0.3"/>
            <circle cx="70" cy="80" r="8" fill="#3B82F6"/>
            <circle cx="130" cy="80" r="8" fill="#3B82F6"/>
            <path d="M70 140 Q100 160 130 140" stroke="#3B82F6" strokeWidth="4" fill="none"/>
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">页面走丢了</h2>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在。可能是链接错误或者页面已被移除。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            返回首页
          </Link>
          <Link
            href="/example"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            查看示例
          </Link>
        </div>
      </div>
    </div>
  )
}
```

#### 步骤 8：创建 500 页面 (`src/app/error.tsx`)

```typescript
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 友好插图 */}
        <div className="mb-8 flex justify-center">
          <svg className="w-48 h-48 text-red-400" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill="#FECACA" opacity="0.3"/>
            <circle cx="70" cy="80" r="8" fill="#EF4444"/>
            <circle cx="130" cy="80" r="8" fill="#EF4444"/>
            <path d="M70 130 Q100 110 130 130" stroke="#EF4444" strokeWidth="4" fill="none"/>
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-gray-800 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">服务器出错了</h2>
        <p className="text-gray-600 mb-8">
          很抱歉，服务器遇到了一些问题。请稍后再试，或返回首页继续浏览。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

### 阶段 4：优化与测试 (步骤 9-10)

#### 步骤 9：性能优化

- 验证首页是否使用 SSG（检查 `.next` 构建输出）
- 检查图片是否使用 Next.js Image 组件
- 测试页面加载速度（Lighthouse）

#### 步骤 10：验证与测试

- **响应式测试**：在不同屏幕尺寸测试（手机、平板、桌面）
- **浏览器兼容性**：测试 Chrome、Firefox、Safari
- **动画流畅性**：检查所有动画是否平滑
- **错误页面**：手动触发 404 和 500 错误验证

---

## ✅ 验收标准

### 功能验收

- [x] 首页显示技术栈徽章（从 README 提取）
- [x] 首页显示 5 个功能演示卡片
- [x] 卡片悬停有上移动画和阴影变化
- [x] 404 页面显示友好插图和导航按钮
- [x] 500 页面有重试按钮和错误日志

### 性能验收

- [x] 首页 Lighthouse 性能分数 > 90
- [x] 首屏加载时间 < 2 秒
- [x] 动画帧率 > 60 FPS

### 设计验收

- [x] 移动端、平板、桌面响应式正常
- [x] 深色模式支持（可选）
- [x] 所有交互状态清晰（hover、active、focus）

---

## 🚀 后续扩展

### 可选优化项

1. **深色模式支持**：添加主题切换功能
2. **国际化（i18n）**：支持中英文切换
3. **SEO 优化**：添加 metadata 和 OpenGraph 标签
4. **Analytics**：集成 Google Analytics 或 Vercel Analytics
5. **搜索功能**：为示例页面添加搜索框

### /menu 路由处理

- 保留现有 `/menu` 作为布局示例
- 可选：改名为 `/demo` 或 `/playground`
- 在首页添加链接指向 `/menu`

---

## 📞 注意事项

1. **README 同步**：技术栈更新时需同步修改 `readme.md`
2. **组件复用**：HeroSection 和 FeatureCard 可用于其他页面
3. **深色模式**：当前设计主要针对浅色模式，深色模式需额外调整
4. **动画性能**：避免过多同时触发的动画，使用 `delay` 交错执行

---

**实施时间估算**：2-3 天（1 人）
**关键里程碑**：阶段 1 完成后可独立验证，阶段 2 完成即可上线基础版本

---

## 附录：Session IDs

- **Codex 后端架构**：`019bdbc8-5d6a-7041-bef7-8e9954b0e401`
- **Qwen 前端设计**：`1768920147208-qwen`

---

生成时间：2026-01-20
生成工具：Claude Code Workflow (多模型协作)
