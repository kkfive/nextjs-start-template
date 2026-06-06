# 常见模式速查

## 基础淡入

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
/>
```

## 弹簧

```tsx
<motion.div
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
/>
```

## 编排（父子 stagger）

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i.id} variants={item}>{i.name}</motion.li>
  ))}
</motion.ul>
```

## 模态框 / Drawer

```tsx
<AnimatePresence>
  {open && (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

## 滚动揭示

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
/>
```

## 手势卡片

```tsx
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300 }}
/>
```

## 拖拽排序（Reorder）

```tsx
<Reorder.Group axis="y" values={items} onReorder={setItems}>
  {items.map(item => (
    <Reorder.Item key={item.id} value={item}>{item.name}</Reorder.Item>
  ))}
</Reorder.Group>
```

`Reorder` 内置 drag + layout 动画。

## SVG 路径绘制

```tsx
<motion.svg viewBox="0 0 100 100">
  <motion.path
    d="M10 50 Q 50 10 90 50"
    fill="none"
    stroke="black"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 1.5 }}
  />
</motion.svg>
```

LazyMotion 时 `features={domMax}`。

## App Router 路由过渡

```tsx
// app/template.tsx
'use client'
import { motion } from 'motion/react'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```
