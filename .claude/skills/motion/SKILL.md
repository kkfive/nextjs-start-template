---
name: motion
description: Motion (Framer Motion) React 动画库 - 手势（拖拽、悬停、点击）、滚动效果、弹簧物理、布局动画、SVG。包大小：2.3 KB (mini) 到 34 KB (full)。用于拖放、滚动动画、模态框、轮播、视差效果。
user-invocable: true
---

# Motion 动画库

## S - Scope（范围）
- Target: Motion (Framer Motion) React 动画库
- Cover: 手势交互、滚动动画、布局动画、弹簧物理、SVG 动画、性能优化
- Avoid: 3D 动画（使用 Three.js）、简单列表动画（使用 auto-animate）

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
Motion vs AutoAnimate | 决策指南：何时使用 Motion 或 AutoAnimate | `references/motion-vs-auto-animate.md`
性能优化 | 包大小、LazyMotion、虚拟化、硬件加速 | `references/performance-optimization.md`
Next.js 集成 | App Router vs Pages Router、"use client"、已知问题 | `references/nextjs-integration.md`
常见模式 | 15 个常见模式的完整代码示例 | `references/common-patterns.md`

## P - Process（流程）
1. **评估需求**: 确定是否需要复杂交互（手势、滚动、布局动画）
2. **选择方案**: 简单列表动画用 auto-animate，复杂交互用 Motion
3. **安装配置**: `pnpm add motion`，Next.js 需添加 `'use client'`
4. **实现动画**: 使用 `motion` 组件和声明式 props
5. **优化性能**: 使用 LazyMotion 减小包大小，虚拟化处理大列表
6. **遇到复杂情况**: 打开对应的 `Reference` 文件

## O - Output（输出）
- 推荐的动画方案（Motion 或 AutoAnimate）
- 代码示例和配置
- 性能优化建议（包大小、硬件加速）
- Next.js 集成注意事项
- 常见陷阱和解决方案

## 何时使用

### ✅ 使用 Motion

**复杂交互**:
- 拖放界面（可排序列表、看板、滑块）
- 悬停状态（缩放/旋转/颜色变化）
- 点击反馈（弹跳/挤压效果）

**滚动动画**:
- 视差效果的英雄区域
- 滚动触发的显示动画
- 与滚动位置关联的进度条

**布局动画**:
- 路由间的共享元素过渡
- 自动高度的展开/折叠
- 网格/列表视图切换

### ❌ 不使用 Motion

**简单列表动画** → 使用 `auto-animate`:
- 待办事项添加/删除（auto-animate: 3.28 KB vs motion: 34 KB）
- 搜索结果过滤
- 购物车项目
- 通知提示

## 快速参考

### 安装

```bash
pnpm add motion
```

### 常见模式

```typescript
// 模式 1: 基础动画
import { motion } from 'motion/react'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  内容
</motion.div>

// 模式 2: 手势交互
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  drag
  dragConstraints={{ left: 0, right: 300 }}
>
  拖动我
</motion.button>

// 模式 3: 滚动动画
import { useScroll, useTransform } from 'motion/react'

function ParallaxSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <motion.div style={{ y }}>
      视差内容
    </motion.div>
  )
}

// 模式 4: 列表动画
<motion.ul>
  {items.map((item) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// 模式 5: 退出动画
import { AnimatePresence } from 'motion/react'

<AnimatePresence>
  {isVisible && (
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

### Next.js 集成

```typescript
// app/components/AnimatedButton.tsx
'use client'  // 必需！

import { motion } from 'motion/react'

export function AnimatedButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      点击我
    </motion.button>
  )
}
```

### 性能优化 (LazyMotion)

```typescript
// 减小包大小：34 KB → 4.6 KB
import { LazyMotion, domAnimation, m } from 'motion/react'

<LazyMotion features={domAnimation}>
  <m.div animate={{ x: 100 }} />
</LazyMotion>
```

### 反模式

| ❌ 不要 | ✅ 应该 | 原因 |
|---------|---------|------|
| 简单列表用 Motion | 使用 auto-animate | Motion 包太大（34 KB vs 3.28 KB）|
| 忘记 AnimatePresence | 包裹退出动画 | 退出动画不会触发 |
| 在 Next.js 中不加 'use client' | 添加 'use client' | Motion 需要客户端渲染 |
| 大列表不虚拟化 | 使用虚拟化 | 性能问题 |
| 动画太多属性 | 只动画 transform/opacity | 触发重排，性能差 |

## Motion vs AutoAnimate 对比

| 方面 | AutoAnimate | Motion | 推荐 |
|------|-------------|--------|------|
| **包大小** | 3.28 KB | 2.3-34 KB | AutoAnimate |
| **API 简洁性** | 3 行代码 | 12+ 行代码 | AutoAnimate |
| **手势控制** | ❌ | ✅ | Motion |
| **滚动动画** | ❌ | ✅ | Motion |
| **布局动画** | ❌ | ✅ | Motion |
| **SVG 动画** | ❌ | ✅ | Motion |
| **列表动画** | ✅ 自动 | ✅ 手动 | AutoAnimate |

**经验法则**: 90% 的情况使用 AutoAnimate（列表动画），10% 使用 Motion（手势、滚动、布局）。

## 常见问题

### Tailwind 冲突

**问题**: Tailwind 的 transition 类覆盖 Motion 动画

**解决**:
```typescript
// ❌ 错误
<motion.div className="transition-all" animate={{ x: 100 }} />

// ✅ 正确：移除 Tailwind transition
<motion.div animate={{ x: 100 }} />
```

### Next.js "use client"

**问题**: Server Components 中使用 Motion 报错

**解决**:
```typescript
// ✅ 在组件顶部添加
'use client'

import { motion } from 'motion/react'
```

### AnimatePresence 退出动画不工作

**问题**: 组件卸载时没有动画

**解决**:
```typescript
// ❌ 错误：没有 AnimatePresence
{isVisible && <motion.div exit={{ opacity: 0 }} />}

// ✅ 正确：包裹 AnimatePresence
<AnimatePresence>
  {isVisible && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

## 相关 Skills

- /coding-standards: React 组件模式（函数声明、客户端标记）
- /nextjs-app-router-patterns: Next.js Client Components 和 'use client'
- /project-architecture: UI 层组件组织

## 官方文档

- [Motion 官方文档](https://motion.dev/)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [GitHub 仓库](https://github.com/framer/motion)
