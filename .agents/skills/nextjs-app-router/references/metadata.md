# Metadata

App Router 通过导出 `metadata` 或 `generateMetadata` 配置 head。

## 静态 metadata

```ts
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '首页 - 我的网站',
  description: '不超过 160 字符的描述',
  keywords: ['Next.js', 'React'],
  openGraph: {
    title: '首页',
    description: '描述',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}
```

## 动态 metadata

```ts
// app/material/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params
  const m = await Material.getDetail(httpClient, id)
  return {
    title: `${m.name} - 素材`,
    description: m.description?.slice(0, 160),
    openGraph: { images: [m.cover] },
  }
}
```

## layout 级 metadata

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: '默认', template: '%s | 站点名' },
  metadataBase: new URL('https://example.com'),
}
```

`template` 会让子页面 `title: '产品'` 自动变成 `产品 | 站点名`。

## 检查

- [ ] `title` ≤ 60 字符；`description` ≤ 160 字符
- [ ] 提供 `openGraph.images`
- [ ] 在 root layout 设置 `metadataBase`，否则 OG URL 是相对路径
- [ ] 动态 metadata 与页面共用同一次 `await getXxx`，避免重复请求（Next 自动去重 fetch）
