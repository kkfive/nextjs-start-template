# 手势：drag / hover / tap

## 基础

```tsx
'use client'
import { motion } from 'motion/react'

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  点击
</motion.button>
```

## 拖拽

```tsx
<motion.div
  drag                                  // 同时启用 x 与 y；或 drag="x" / drag="y"
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 200 }}
  dragElastic={0.2}                     // 拖出边界的弹性 0~1
  dragMomentum={false}                  // 关闭抛掷惯性
  whileDrag={{ scale: 1.1 }}
  onDragEnd={(e, info) => console.log(info.offset, info.velocity)}
/>
```

## hover/tap 视觉反馈

```tsx
// 卡片：悬停浮起
<motion.div
  whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
/>

// 按钮：点击挤压
<motion.button whileTap={{ scale: 0.96 }} transition={{ duration: 0.08 }} />
```

## 使用要点

- `whileHover` / `whileTap` 自动管理状态，无需 `useState`
- `drag` 默认开启惯性，需要"放手立即停"用 `dragMomentum={false}`
- 触屏：`whileTap` 同时映射 `onTouchStart`，无须额外处理
- 容器需有 `position: relative`（drag 用 transform 定位）

## 反例

| ❌ | ✅ |
|---|---|
| `<motion.div className="hover:scale-105 transition">` + Motion 同时 | 二选一，避免双重动画 |
| `onMouseEnter` 手写 hover 切换 | 直接 `whileHover` |
| `drag` 但无 `dragConstraints` | 总是给定边界，避免拖丢 |
