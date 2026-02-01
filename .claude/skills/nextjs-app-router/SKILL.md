---
name: nextjs-app-router
description: Next.js 14+ App Router - Server Components、流式渲染、并行路由、数据获取、性能优化、Metadata。用于构建 Next.js 应用、实现 SSR/SSG、优化 React Server Components。
user-invocable: true
---

# Next.js App Router

## S - Scope（范围）
- Target: Next.js 14+ App Router 架构
- Cover: Server Components、Client Components、流式渲染、并行路由、拦截路由、数据获取、缓存策略、Server Actions、API Routes、性能优化、Metadata、项目结构
- Avoid: Pages Router 模式（旧版路由系统）

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
渲染模式 | Server/Client Components、决策树、Static/Dynamic、Streaming | 内置于本文档
文件约定 | layout、page、loading、error、route 等 | 内置于本文档
数据获取 | fetch、缓存、重新验证策略 | 内置于本文档
路由模式 | 并行路由、拦截路由、动态路由、路由组 | 内置于本文档
API Routes | Route Handlers、HTTP 方法、最佳实践 | 内置于本文档
性能优化 | Image 优化、Bundle 优化、动态导入 | 内置于本文档
Metadata | 静态/动态 Metadata、SEO 最佳实践 | 内置于本文档
项目结构 | 推荐目录结构、路由组织 | 内置于本文档

## P - Process（流程）
1. **确定渲染模式**: 使用决策树选择 Server 或 Client Component
2. **设置文件结构**: 使用 layout.tsx、page.tsx、loading.tsx、error.tsx 等约定文件
3. **实现数据获取**: 在 Server Components 中直接使用 async/await
4. **配置缓存策略**: 使用 `next.revalidate`、`next.tags` 控制缓存
5. **添加 Suspense 边界**: 使用 `<Suspense>` 实现流式渲染
6. **实现 Server Actions**: 使用 `'use server'` 处理表单提交和数据变更
7. **优化性能**: 使用 next/image、动态导入、Bundle 分析
8. **配置 Metadata**: 设置 SEO 友好的 title、description、OG 图片

## O - Output（输出）
- 推荐的文件结构和组件模式
- 数据获取和缓存策略
- Server/Client Components 的正确使用方式
- 性能优化建议（流式渲染、并行数据获取）
- 常见陷阱和解决方案

## 核心概念

### 1. 渲染模式

#### 决策树

```
需要以下功能吗？
│
├── useState、useEffect、事件处理器
│   └── Client Component ('use client')
│
├── 直接数据获取、无交互
│   └── Server Component（默认）
│
└── 两者都需要？
    └── 拆分：Server 父组件 + Client 子组件
```

#### 渲染模式对比

| 模式 | 位置 | 使用场景 |
| --- | --- | --- |
| **Server Components** | 服务器 | 数据获取、重计算、密钥 |
| **Client Components** | 浏览器 | 交互、hooks、浏览器 API |
| **Static** | 构建时 | 很少变化的内容 |
| **Dynamic** | 请求时 | 个性化或实时数据 |
| **Streaming** | 渐进式 | 大页面、慢数据源 |

### 2. 文件约定

```
app/
├── layout.tsx       # 共享 UI 包装器
├── page.tsx         # 路由 UI
├── loading.tsx      # 加载 UI (Suspense)
├── error.tsx        # 错误边界
├── not-found.tsx    # 404 UI
├── route.ts         # API 端点
├── template.tsx     # 重新挂载的 layout
├── default.tsx      # 并行路由回退
└── opengraph-image.tsx  # OG 图片生成
```

## 快速参考

### 常见模式

```typescript
// 模式 1: Server Component 数据获取
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // ISR: 每小时重新验证
  })
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <main>
      <h1>产品列表</h1>
      <ProductGrid products={products} />
    </main>
  )
}

// 模式 2: Client Component 交互
// components/AddToCartButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { addToCart } from '@/app/actions/cart'

export function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await addToCart(productId)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isPending}>
        {isPending ? '添加中...' : '加入购物车'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

// 模式 3: Server Actions
// app/actions/cart.ts
'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function addToCart(productId: string) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) {
    redirect('/login')
  }

  try {
    await db.cart.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      update: { quantity: { increment: 1 } },
      create: { sessionId, productId, quantity: 1 },
    })

    revalidateTag('cart')
    return { success: true }
  } catch (error) {
    return { error: '添加失败' }
  }
}

// 模式 4: 流式渲染 (Suspense)
// app/product/[id]/page.tsx
import { Suspense } from 'react'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  return (
    <div>
      <ProductHeader product={product} />

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={id} />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={id} />
      </Suspense>
    </div>
  )
}

// 模式 5: 并行路由
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside>{analytics}</aside>
      <aside>{team}</aside>
    </div>
  )
}

// app/dashboard/@analytics/page.tsx
export default async function AnalyticsSlot() {
  const stats = await getAnalytics()
  return <AnalyticsChart data={stats} />
}
```

### 缓存策略

```typescript
// 不缓存（始终新鲜）
fetch(url, { cache: 'no-store' })

// 永久缓存（静态）
fetch(url, { cache: 'force-cache' })

// ISR - 60 秒后重新验证
fetch(url, { next: { revalidate: 60 } })

// 基于标签的失效
fetch(url, { next: { tags: ['products'] } })

// 通过 Server Action 失效
'use server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data })
  revalidateTag('products')
  revalidatePath('/products')
}
```

### 反模式

| ❌ 不要 | ✅ 应该 | 原因 |
|---------|---------|------|
| 在 Server Components 中使用 hooks | 添加 `'use client'` | Server Components 不支持 hooks |
| 在 Client Components 中获取数据 | 使用 Server Components 或 React Query | 性能和 SEO 问题 |
| 传递不可序列化的数据 | 只传递 JSON 可序列化数据 | Server → Client 边界限制 |
| 过度嵌套 layouts | 扁平化结构 | 增加组件树深度 |
| 忽略 loading 状态 | 提供 loading.tsx 或 Suspense | 用户体验差 |

## API Routes (Route Handlers)

### HTTP 方法

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET - 读取数据
export async function GET(request: NextRequest) {
  const products = await db.product.findMany()
  return NextResponse.json(products)
}

// POST - 创建数据
export async function POST(request: NextRequest) {
  const body = await request.json()
  const product = await db.product.create({ data: body })
  return NextResponse.json(product, { status: 201 })
}

// PUT/PATCH - 更新数据
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const product = await db.product.update({
    where: { id: body.id },
    data: body,
  })
  return NextResponse.json(product)
}

// DELETE - 删除数据
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  await db.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

### 最佳实践

- **验证输入**: 使用 Zod 验证请求体
- **返回正确状态码**: 200/201/400/404/500
- **错误处理**: 使用 try-catch 捕获异常
- **Edge Runtime**: 适用时使用 `export const runtime = 'edge'`

## 性能优化

### Image 优化

```typescript
import Image from 'next/image'

// 基础用法
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // 首屏图片优先加载
/>

// 响应式图片
<Image
  src="/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>

// 模糊占位符
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**最佳实践**:
- 首屏图片使用 `priority`
- 提供 `blur` 占位符
- 使用响应式 `sizes`
- 优化图片格式（WebP、AVIF）

### Bundle 优化

```typescript
// 动态导入重组件
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,  // 仅客户端渲染
})

// 条件加载
const AdminPanel = dynamic(() => import('@/components/AdminPanel'))

export default function Dashboard({ isAdmin }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {isAdmin && <AdminPanel />}
    </div>
  )
}
```

**优化策略**:
- 动态导入大型组件
- 路由级代码分割（自动）
- 使用 Bundle Analyzer 分析

## Metadata 配置

### 静态 Metadata

```typescript
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '首页 - 我的网站',
  description: '这是网站首页的描述，150-160 字符最佳',
  keywords: ['Next.js', 'React', 'TypeScript'],
  openGraph: {
    title: '首页',
    description: '网站描述',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '首页',
    description: '网站描述',
    images: ['/twitter-image.jpg'],
  },
}
```

### 动态 Metadata

```typescript
// app/products/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  return {
    title: `${product.name} - 产品详情`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  }
}
```

**最佳实践**:
- title: 50-60 字符
- description: 150-160 字符
- 提供 Open Graph 图片
- 设置 canonical URL

## 项目结构

### 推荐结构

```
app/
├── (marketing)/          # 路由组（不影响 URL）
│   ├── page.tsx         # 首页
│   └── about/
│       └── page.tsx
├── (dashboard)/          # 仪表板路由组
│   ├── layout.tsx       # Dashboard 布局
│   ├── page.tsx
│   └── settings/
│       └── page.tsx
├── api/                  # API 路由
│   └── [resource]/
│       └── route.ts
├── @modal/               # 并行路由（模态框）
│   └── (.)photo/
│       └── [id]/
│           └── page.tsx
└── components/           # 共享组件
    ├── ui/              # 基础 UI 组件
    └── domain/          # 业务组件
```

### 路由组织

| 模式 | 用途 |
|------|------|
| `(name)` | 路由组（不影响 URL） |
| `@slot` | 并行路由 |
| `(.)` | 拦截路由（同级） |
| `(..)` | 拦截路由（上一级） |
| `[id]` | 动态路由 |
| `[...slug]` | 捕获所有路由 |

## 最佳实践

### 应该做的

- **默认使用 Server Components** - 仅在需要时添加 `'use client'`
- **就近获取数据** - 在使用数据的地方获取
- **使用 Suspense 边界** - 为慢数据启用流式渲染
- **利用并行路由** - 独立的加载状态
- **使用 Server Actions** - 处理变更，支持渐进增强

### 不应该做的

- **不要传递不可序列化数据** - Server → Client 边界限制
- **不要在 Server Components 中使用 hooks** - 没有 useState、useEffect
- **不要在 Client Components 中获取数据** - 使用 Server Components 或 React Query
- **不要过度嵌套 layouts** - 每个 layout 增加组件树
- **不要忽略 loading 状态** - 始终提供 loading.tsx 或 Suspense

## 相关 Skills

- /coding-standards: React 组件模式（函数声明、客户端标记）
- /project-architecture: 应用层和 UI 层组织规范
- /ant-design: SSR 配置和 StyleProvider 设置
