# 布局动画 / 共享元素

## `layout` prop：自动 FLIP 动画

任何尺寸或位置变化都会被平滑过渡：

```tsx
'use client'
import { motion } from 'motion/react'

<motion.div layout>{isOpen ? <LongContent /> : <ShortContent />}</motion.div>
```

## 列表重排

```tsx
<motion.ul layout>
  {items.map(i => (
    <motion.li key={i.id} layout>{i.text}</motion.li>
  ))}
</motion.ul>
```

`key` 必须稳定；`layout` 加在父和子两层最自然。

## 共享元素过渡（同一 layoutId）

```tsx
// 列表视图
<motion.img layoutId={`cover-${id}`} src={cover} />

// 详情视图（路由跳转后）
<motion.img layoutId={`cover-${id}`} src={cover} className="w-full" />
```

不同组件树之间通过同一 `layoutId` 自动建立动画桥。Next.js App Router 跨页面共享元素需用 Parallel Routes / Intercepting Routes，详见 `/nextjs-app-router`。

## `LayoutGroup`：兄弟组件协同

```tsx
import { LayoutGroup, motion } from 'motion/react'

<LayoutGroup>
  <motion.div layout />
  <motion.div layout />
</LayoutGroup>
```

让相邻组件的尺寸变化彼此感知，避免突跳。

## 反例

| ❌ | ✅ |
|---|---|
| `layout` + `animate={{ x, y }}` 同时设 | 只用其一；混用导致冲突 |
| `key` 用数组下标 | 用稳定 id |
| 给整页根 div 加 `layout` | 仅给真正需要补间的容器加 |
| 列表过长（>100）全 `layout` | 虚拟化 + 仅可见项 `layout` |

性能权衡见 `references/runtime-perf.md`。
