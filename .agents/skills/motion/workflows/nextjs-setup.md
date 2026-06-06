# Next.js App Router 集成步骤

## 1. 安装

```bash
pnpm add motion
```

## 2. 直接用法（仅小范围）

```tsx
// app/components/animated-card.tsx
'use client'
import { motion } from 'motion/react-client'   // Next 优化版

export function AnimatedCard() {
  return <motion.div animate={{ opacity: 1 }}>...</motion.div>
}
```

## 3. 推荐：统一 Client 适配层

避免到处写 `'use client'`，集中导出 Motion：

```tsx
// src/components/motion-client.ts
'use client'

export * from 'motion/react-client'
```

```tsx
// 使用方（仍需 'use client'，因为 motion 触发 React 客户端 hooks）
'use client'
import { motion, AnimatePresence } from '@/components/motion-client'
```

## 4. Server / Client 边界

| 场景 | 建议 |
|---|---|
| 仅一个按钮动画 | 抽 `AnimatedButton` Client 组件，父 Server |
| 整页动画背景 | 包一层 `'use client'` Wrapper，数据仍由 Server 拉 |
| 路由切换过渡 | App Router 用 `template.tsx`（每次重挂载），结合 `AnimatePresence mode="wait"` |
| 共享元素跨页 | Parallel Routes / Intercepting Routes（见 `/nextjs-app-router`） |

## 5. LazyMotion（推荐生产配置）

包大小 34 KB → 4.6 KB：

```tsx
'use client'
import { LazyMotion, domAnimation, m } from 'motion/react'

// 应用根 Client Wrapper
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}

// 之后所有动画用 m 而非 motion
<m.div animate={{ x: 100 }} />
```

需要 SVG path 动画时用 `domMax`（约 6 KB）。

## 6. 减少动画 CSR 闪烁

- `initial={false}` 让首次渲染不播入场动画
- 不要在 `animate` 里写"跟初始值不同"的状态依赖于客户端 hooks（hydration mismatch）

## 检查

- [ ] Motion 组件文件顶部有 `'use client'`
- [ ] 没有把整个 page.tsx 转成 Client 只为一个动画
- [ ] 生产环境用 LazyMotion + `m`
- [ ] 跨路由共享元素用 Parallel/Intercepting，不要硬塞 AnimatePresence
