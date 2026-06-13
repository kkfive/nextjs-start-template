# 退出动画（AnimatePresence）

React 卸载组件时默认无过渡。`AnimatePresence` 让 `exit` 在卸载前播放。

## 基础

```tsx
'use client'
import { motion, AnimatePresence } from 'motion/react'

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      模态框内容
    </motion.div>
  )}
</AnimatePresence>
```

## 列表项移除

```tsx
<AnimatePresence>
  {items.map(item => (
    <motion.li
      key={item.id}              // key 必须稳定
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {item.name}
    </motion.li>
  ))}
</AnimatePresence>
```

## 模式

| `mode` | 行为 |
|---|---|
| `'sync'`（默认） | 进入与退出动画同时进行 |
| `'wait'` | 先等退出动画完成再渲染进入 |
| `'popLayout'` | 退出元素脱离布局流，避免挤压 |

```tsx
<AnimatePresence mode="wait">
  <motion.div key={page} />
</AnimatePresence>
```

## 反例

| ❌ | ✅ |
|---|---|
| 没有 `AnimatePresence`，直接写 `exit` | 必须包裹 |
| `AnimatePresence` 里渲染多个无 key 元素 | 每个直接子元素必须有稳定 `key` |
| `initial` 与 `animate` 相同但仍想入场 | 显式给不同 initial，否则被优化掉 |
| 在 Next.js 路由切换处用 | App Router 跨页面建议用 `template.tsx` 重挂载或 Parallel Routes |
