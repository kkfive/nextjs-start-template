# Next.js App Router 必须 'use client'

Motion 依赖浏览器 API（DOM、事件、`window`），**只能在 Client Component 运行**。

## 必须加 `'use client'`

```tsx
// app/components/animated-card.tsx
'use client'

import { motion } from 'motion/react'

export function AnimatedCard() {
  return <motion.div animate={{ opacity: 1 }}>...</motion.div>
}
```

## 不要把整页变 Client

只为一个动画按钮就给 `page.tsx` 加 `'use client'` 是反模式 —— 父页面保留 Server，把动画下沉到最小 Client 子组件。

```tsx
// app/products/page.tsx — Server
import { ProductGrid } from './product-grid'  // 'use client'

export default async function Page() {
  const products = await getProducts()
  return <ProductGrid products={products} />
}
```

## 推荐导入路径

Next.js 中优先使用 `motion/react-client`（针对 Next 优化）：

```tsx
'use client'
import { motion, AnimatePresence } from 'motion/react-client'
```

如果业务在非 Next 环境也复用，仍可用 `motion/react`。

## 错误信号

| 错误 | 原因 |
|---|---|
| `useEffect / Window is not defined` | 忘记 `'use client'` |
| `Cannot read properties of undefined (reading 'document')` | 同上 |
| 动画完全不发生 | 组件被当成 Server Component 渲染 |
| Hydration mismatch | 服务端渲染了初始状态，客户端立即开始动画 → 改用 `initial={false}` 或挂载后再触发 |
