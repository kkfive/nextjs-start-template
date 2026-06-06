# 包大小优化

`motion` 全量 34 KB。生产环境推荐 LazyMotion 把体积降到 4.6 KB。

## LazyMotion（推荐）

```tsx
'use client'
import { LazyMotion, domAnimation, m } from 'motion/react'

// Provider（放在 Client 根）
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}

// 使用 m 替代 motion
import { m } from 'motion/react'
<m.div animate={{ x: 100 }} whileHover={{ scale: 1.05 }} />
```

要点：
- `motion` 与 `m` 二选一；混用会两份打包
- Provider 写在最高层 Client 边界（如 `MotionProvider` 包应用根 client wrapper）
- 切换后**所有动画组件**改用 `m`

## features 选择

| features | 体积 | 包含 |
|---|---|---|
| `domAnimation` | 4.6 KB | transform / opacity / hover / tap / drag / layout / useScroll |
| `domMax` | ~6 KB | 上述 + SVG path、自定义值类型 |

按需选；只用 SVG 才上 `domMax`。

## useAnimate mini（最小）

仅 2.3 KB，但只能用命令式 API：

```tsx
'use client'
import { useAnimate } from 'motion/react'
import { useEffect, useRef } from 'react'

function Component() {
  const [scope, animate] = useAnimate()
  useEffect(() => {
    animate(scope.current, { opacity: 1, x: 0 })
  }, [animate, scope])

  return <div ref={scope} style={{ opacity: 0, transform: 'translateX(-20px)' }}>...</div>
}
```

适合：单点动画 / 命令式时序 / 极简包。
不适合：声明式 props 习惯 / 手势 / 布局动画。

## 进一步压缩

- 动态导入：仅在交互页加载 Motion，首屏不引入
- 移除未用：避免 `import * as motion from 'motion/react'`
- 检查重复：`pnpm why motion`，确认无 `framer-motion` + `motion` 共存

## 自检

```bash
# 看 First Load JS 是否合理
pnpm build

# 用 bundle-analyzer 看 Motion 占比
ANALYZE=true pnpm build
```
