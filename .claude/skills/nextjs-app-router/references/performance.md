# 性能优化

## next/image

```tsx
import Image from 'next/image'

// 固定尺寸
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />

// 响应式 fill
<Image
  src="/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>

// 模糊占位
<Image
  src="/photo.jpg"
  alt=""
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

要点：
- 首屏图加 `priority`，关闭懒加载
- 永远写 `alt`；装饰图写 `alt=""`
- `sizes` 决定下发分辨率，写错则带宽浪费

## 动态导入

```tsx
import dynamic from 'next/dynamic'

const Heavy = dynamic(() => import('@/components/Heavy'), {
  loading: () => <Skeleton />,
  ssr: false, // 仅客户端
})
```

何时用：
- 仅特定路径需要的大组件（Markdown 编辑器、图表）
- 在 Server Component 中：用 `next/dynamic` 仅控制 Client 组件加载策略

## Bundle 优化

- `next build` 后看 First Load JS：> 200KB 需介入
- 用 `@next/bundle-analyzer` 找重组件
- 避免在 root layout 里 import 整库（如 `import * as antd from 'antd'`）

## 流式渲染

为慢数据加 `<Suspense>` / `loading.tsx`，让首屏先到：

```tsx
<Suspense fallback={<Skeleton />}>
  <SlowData />
</Suspense>
```

## 反例

- ❌ 用 `<img>` 加载本地图：丢失自动优化
- ❌ 在 Server Component 里 `dynamic(..., { ssr: false })` 的同时还期待服务端渲染
- ❌ `priority` 加在折叠下方图片，浪费 LCP 预算
