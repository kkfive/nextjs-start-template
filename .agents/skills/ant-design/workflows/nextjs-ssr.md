# Next.js App Router + antd SSR

App Router 下 antd 的 CSS-in-JS 默认在客户端生成，会导致首屏样式闪烁（FOUC）。需要用 `@ant-design/cssinjs` 的 `StyleProvider` + `useServerInsertedHTML` 注入。

## 步骤

1. 安装 `@ant-design/cssinjs`（antd v6 已内置）
2. 创建 `AntdRegistry` Client Component，在 `useServerInsertedHTML` 中把样式插入到 HTML
3. 在 `app/layout.tsx` 用 `AntdRegistry` 包裹 children

## 模板

```tsx
// src/components/antd-registry.tsx
'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs'
import { useMemo } from 'react'

export function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = useMemo(() => createCache(), [])

  useServerInsertedHTML(() => (
    <style
      id="antd"
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ))

  return <StyleProvider cache={cache}>{children}</StyleProvider>
}
```

```tsx
// src/app/layout.tsx
import { AntdRegistry } from '@/components/antd-registry'
import { AppProviders } from '@/app/providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
      </body>
    </html>
  )
}
```

## 关键约束

- `AntdRegistry` 必须是 Client Component
- `cache` 必须用 `useMemo` 锁定，否则每次渲染 cache 丢失
- StyleProvider 的位置应在 ConfigProvider 之外（更高一层）
- 严格模式下 SSR 双渲染可能让 cache 重复扩张，正常现象

## 检查

- [ ] 首屏没有"先无样式闪一下"
- [ ] view-source 能看到 `<style id="antd">` 注入
- [ ] CSS 仅注入一次（不是每路由切换都重注）
- [ ] dev 模式下 hot reload 不丢主题

故障排查见 `references/gotchas.md`。
