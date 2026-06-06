# Gotchas

## Tailwind 冲突

Tailwind 的 `transition-*` 类会覆盖 Motion 的过渡：

```tsx
// ❌ 双重过渡
<motion.div className="transition-all duration-300" animate={{ x: 100 }} />

// ✅ 移除 Tailwind transition
<motion.div animate={{ x: 100 }} transition={{ duration: 0.3 }} />
```

## Next.js

- **`useEffect / window is not defined`** → 忘记 `'use client'`
- **Hydration mismatch** → 首次渲染状态依赖 Client API；用 `initial={false}` 或挂载后再启动
- **路由切换无动画** → App Router 默认复用 layout；用 `template.tsx` 强制重挂载
- **`motion/react-client` vs `motion/react`** → Next.js 优先 `motion/react-client`，体积更小

## AnimatePresence

- **exit 不工作** → 没用 `AnimatePresence` 包裹；或被 `mode="wait"` 等待中
- **多直接子元素** → 必须每个有稳定 `key`，否则识别不到进/出
- **嵌套使用** → 多层 `AnimatePresence` 可能让 `mode="wait"` 失效；只在最外层用

## 列表

- **重排时元素闪烁** → `key` 用了下标；改为稳定 id
- **大列表 layout 卡** → 未虚拟化；或全部加了 `layout`；只给可见项加
- **拖拽列表想自动排序** → 用 `Reorder.Group` / `Reorder.Item`，别手写 drag + layout

## 性能

- **动画卡顿** → 在动 width/height/top/left；改为 transform/scale
- **首屏慢** → 全量 motion（34 KB）；上 LazyMotion 降到 4.6 KB
- **打包包重复** → `pnpm why motion`；移除老 `framer-motion`

## 命名

- **找不到 `motion`** → 包改名了，安装 `motion`、导入 `motion/react`
- **找不到 `useAnimation`** → 也是 `motion/react`
- **`LayoutGroup` 报错** → 同上，源自 `motion/react`

详见 `rules/motion.md`。
