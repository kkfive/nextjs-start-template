# 滚动动画 / 视差

## whileInView：进入视口触发一次

```tsx
'use client'
import { motion } from 'motion/react'

<motion.section
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}   // 只触发一次，露出 30% 即激活
  transition={{ duration: 0.6 }}
/>
```

## useScroll + useTransform：进度联动

```tsx
import { useScroll, useTransform, motion } from 'motion/react'

function Parallax() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0])

  return <motion.div style={{ y, opacity }} />
}
```

## 元素相对滚动

```tsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ['start end', 'end start'],   // 元素顶部到达视口底部 → 元素底部到达视口顶部
})
```

## 滚动进度条

```tsx
const { scrollYProgress } = useScroll()

<motion.div
  className="fixed inset-x-0 top-0 h-1 bg-blue-500 origin-left"
  style={{ scaleX: scrollYProgress }}
/>
```

## 注意

- `useScroll` 在 SSR 取不到滚动值 → 仅 Client Component
- 视差 / 进度建议只动 `transform`（`y` / `scale`），不要改 `top`、`marginTop`
- `viewport={{ once: true }}` 避免反复触发，省 CPU
- 长页面多处 `whileInView` 时无需手动节流 —— Motion 已用 IntersectionObserver
