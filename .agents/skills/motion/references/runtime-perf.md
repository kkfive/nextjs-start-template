# 运行时性能

## 只动 transform / opacity

GPU 加速属性才不触发 layout / paint：

```tsx
// ✅ 高性能
<motion.div animate={{ x: 100, y: 50, scale: 1.1, opacity: 0.8, rotate: 45 }} />

// ❌ 触发 layout 重排
<motion.div animate={{ width: 200, height: 200, top: 50, left: 50, padding: 20 }} />
```

需要变尺寸时改用 `scale` + 设计阶段保证视觉一致。

## 启用硬件加速

```tsx
// 强制 GPU 提升合成层
<motion.div style={{ willChange: 'transform' }} animate={{ x: 100 }} />
```

但 **不要全局乱用** `will-change` —— 大量元素层会暴涨内存。

## 大列表

- 列表 > 100 项：**虚拟化**（`react-window` / `react-virtuoso`）
- 仅可见项加 `layout`；不可见项不要参与动画
- 长列表用 `AnimatePresence` 全包会重渲所有 → 仅包裹"变动的小段"

```tsx
<VirtualList>
  {visibleItems.map(item => (
    <motion.div key={item.id} layout>{item.content}</motion.div>
  ))}
</VirtualList>
```

## 减少不必要重渲

- `useMotionValue` 内部不触发 React 重渲
- `useTransform` 派生值同样不触发
- 仅 `motion.div` 接收 motion value，组件其他部分不重渲

```tsx
const x = useMotionValue(0)
const opacity = useTransform(x, [0, 100], [1, 0])
// 拖拽 x 时整个组件不会 setState 重渲
<motion.div drag="x" style={{ x, opacity }} />
```

## 减少动画数量

- `whileInView` 触发后立即 `once: true`，省 IntersectionObserver
- 滚动联动避免对成百上千元素并行 `useTransform`
- 移动端把 `transition.duration` 控制在 0.3s 以内

## 无障碍：prefers-reduced-motion

```tsx
import { MotionConfig } from 'motion/react'

<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

`reducedMotion="user"` 时遵循系统设置；动画退化为瞬间状态切换。

## 检查

- [ ] 仅动 transform / opacity
- [ ] 大列表已虚拟化
- [ ] 长滚动页用 `useMotionValue` 避免重渲
- [ ] 应用根有 `MotionConfig reducedMotion="user"`
- [ ] 移动端动画 ≤ 0.3s
