---
name: motion
description: Motion (前 Framer Motion) React 动画库 - 手势（拖拽、悬停、点击）、滚动效果、布局动画、弹簧物理、SVG。用于实现拖放、视差滚动、模态框、轮播、共享元素过渡；同时给出与 AutoAnimate 的选型边界。
user-invocable: true
---

# Motion

## Scope
- Target: Motion（`motion/react`，从 `framer-motion` 改名）
- Cover: 手势、滚动、布局、退出动画、SVG、Next.js 集成、LazyMotion 包大小优化
- Avoid: 3D 动画（去 Three.js）；纯列表增删（用 `auto-animate`，包更小）

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 包名/导入路径不对（提到 framer-motion） | `rules/motion.md` |
| 决定用 Motion 还是 AutoAnimate | `rules/when-to-use.md` |
| Next.js App Router 必须 `'use client'` | `rules/nextjs-use-client.md` |
| 加手势：drag / hover / tap | `workflows/gesture.md` |
| 加滚动动画 / 视差 | `workflows/scroll-animation.md` |
| 加布局动画 / 共享元素 | `workflows/layout-animation.md` |
| 加退出动画（AnimatePresence） | `workflows/exit-animation.md` |
| Next.js 完整集成步骤 | `workflows/nextjs-setup.md` |
| 包太大想减小 | `references/bundle-optimization.md` |
| 运行时性能（虚拟化、硬件加速） | `references/runtime-perf.md` |
| Motion vs AutoAnimate 详细对比 | `references/motion-vs-autoanimate.md` |
| 常见模式速查 | `references/common-patterns.md` |
| Tailwind 冲突 / Next 报错 / Exit 不工作 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 简单列表用 Motion | 用 `@formkit/auto-animate`（3 KB vs 34 KB）|
| 忘记 `AnimatePresence` 包裹 | 退出动画必须在 `AnimatePresence` 内 |
| App Router 不加 `'use client'` | Motion 必须客户端运行 |
| 动画 width/height/top/left | 只动 `transform` / `opacity`，避免重排 |
| `<motion.div className="transition-all">` | Tailwind 的 transition 类会覆盖 Motion |

## Session Discipline

每次进入动画/交互任务时**重新阅读**：Common Tasks 路由可能调整。

## 相关 Skills

- `/nextjs-app-router`：`'use client'` 边界与 Client Component 拆分
- `/coding-standards`：组件函数式声明
