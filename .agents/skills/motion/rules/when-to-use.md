# 何时用 Motion，何时用 AutoAnimate

经验法则：**90% 列表动画用 AutoAnimate；10% 交互/滚动/布局用 Motion**。

## 用 AutoAnimate（默认）

- 列表增 / 删 / 排序
- 简单展开 / 折叠
- Toast / 通知淡入淡出
- 表单错误提示出现 / 消失
- 在乎包大小（3 KB）

## 用 Motion

| 能力 | 关键 API |
|---|---|
| 拖拽、悬停、点击 | `drag`、`whileHover`、`whileTap` |
| 滚动动画、视差 | `useScroll`、`useTransform`、`whileInView` |
| 布局动画、共享元素 | `layout`、`layoutId` |
| SVG 路径绘制、形变 | `<motion.path>`、`pathLength` |
| 弹簧物理细控 | `transition: { type: 'spring', stiffness, damping }` |
| 编排（stagger、sequence） | `variants` + `staggerChildren` |

## 不要把 Motion 当 AutoAnimate 用

```tsx
// ❌ 列表增删用 Motion（包翻 10 倍）
<motion.ul>
  {items.map(i => (
    <motion.li key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {i.name}
    </motion.li>
  ))}
</motion.ul>

// ✅ AutoAnimate（3 行搞定）
import { useAutoAnimate } from '@formkit/auto-animate/react'
const [parent] = useAutoAnimate()
<ul ref={parent}>
  {items.map(i => <li key={i.id}>{i.name}</li>)}
</ul>
```

详细特性对比见 `references/motion-vs-autoanimate.md`。
