# Motion vs AutoAnimate（详细对比）

**经验法则：90% 用 AutoAnimate，10% 用 Motion。** 决策速判见 `rules/when-to-use.md`。

## 包大小

| 选项 | 包体 | 适用 |
|---|---|---|
| `@formkit/auto-animate` | 3.28 KB | 简单列表 |
| `motion` useAnimate mini | 2.3 KB | 最小命令式 |
| `motion` + LazyMotion | 4.6 KB | 大多数声明式场景 |
| `motion` 全量 | 34 KB | 全特性 |

LazyMotion 配置见 `references/bundle-optimization.md`。

## API 简洁度

AutoAnimate（3 行）：

```tsx
import { useAutoAnimate } from '@formkit/auto-animate/react'
const [parent] = useAutoAnimate()
<ul ref={parent}>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>
```

Motion（12 行）：

```tsx
import { motion, AnimatePresence } from 'motion/react'
<AnimatePresence>
  <ul>
    {items.map(i => (
      <motion.li
        key={i.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        layout
      >{i.text}</motion.li>
    ))}
  </ul>
</AnimatePresence>
```

## 能力对照

| 能力 | AutoAnimate | Motion |
|---|---|---|
| 列表增删/重排 | ✅ 自动 | ✅ 手动 |
| 手风琴展开 | ✅ 自动 | ✅ 手动 |
| 拖拽 / 悬停 / 点击手势 | ❌ | ✅ |
| 滚动动画 / 视差 | ❌ | ✅ |
| 布局动画（FLIP） | ❌ | ✅ `layout` |
| 共享元素 | ❌ | ✅ `layoutId` |
| SVG 路径动画 | ❌ | ✅ |
| 弹簧物理细控 | ❌ | ✅ |
| 编排（stagger / sequence） | ❌ | ✅ `variants` |
| 退出动画 | ✅ 自动 | ✅ `AnimatePresence` |
| 无障碍（prefers-reduced-motion） | ✅ 自动 | ⚠️ 需 `MotionConfig` |
| Next.js SSR | ✅ | ✅（需 `'use client'`） |
| Cloudflare Workers | ✅ | ⚠️ 用 `framer-motion` 老名兼容更好 |

## 选型决策树

```
需要手势 / 滚动 / 布局动画 / SVG / 弹簧物理？
├── 是 → Motion
└── 否 → 仅增删/排序/淡入淡出？
        ├── 是 → AutoAnimate
        └── 否 → CSS transition / animation
```

## 反例

| ❌ | ✅ |
|---|---|
| 列表淡入淡出用 Motion + AnimatePresence 全套 | AutoAnimate 3 行 |
| 需要拖拽却选 AutoAnimate | Motion |
| 用 Motion 但没配 LazyMotion 上 34 KB | LazyMotion + `m` 降到 4.6 KB |
