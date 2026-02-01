# PDF 阅读组件集成文档

## 概述

本项目已成功集成通用 PDF 阅读组件，基于 `react-pdf` 库实现，支持本地文件预览和远程 URL 预览。

## 技术方案

- **库**: react-pdf v10.3.0
- **Worker**: 本地文件 (`public/pdfjs/pdf.worker.min.mjs`)
- **组件位置**: `src/components/ui/pdf-viewer/`
- **集成方式**: Dynamic import (禁用 SSR)

## 组件 API

### PdfViewer

```typescript
import { PdfViewer } from '@/components/ui/pdf-viewer'

type PdfViewerProps = {
  /** 远程 URL 或本地 File 对象 */
  file: string | File | Blob | null
  /** 容器类名 */
  className?: string
  /** 文档加载成功回调 */
  onLoadSuccess?: (pages: number) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}
```

### 功能特性

- ✅ 翻页控制（上一页/下一页）
- ✅ 缩放控制（50% - 250%）
- ✅ 旋转控制（90° 增量）
- ✅ 文本选择支持
- ✅ 注释层支持
- ✅ 加载状态提示
- ✅ 错误处理

## 使用方式

### 1. 在客户端组件中直接使用

```tsx
'use client'

import { useState } from 'react'
import { PdfViewer } from '@/components/ui/pdf-viewer'

export function MyComponent() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <PdfViewer
      file={file}
      onLoadSuccess={(pages) => console.log(`共 ${pages} 页`)}
      onError={(error) => console.error('加载失败:', error)}
    />
  )
}
```

### 2. 在服务端组件中使用（需要 dynamic import）

```tsx
import dynamic from 'next/dynamic'

const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then(mod => ({ default: mod.PdfViewer })),
  {
    ssr: false,
    loading: () => <div>初始化 PDF 阅读器...</div>,
  },
)

export default function Page() {
  return <PdfViewer file="/sample.pdf" />
}
```

### 3. 支持的文件类型

```typescript
// 本地 File 对象
<PdfViewer file={fileObject} />

// 远程 URL
<PdfViewer file="https://example.com/document.pdf" />

// Blob 对象
<PdfViewer file={blobObject} />
```

## 项目集成示例

已在 `src/app/(platform)/material/page.tsx` 中集成：

```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null)

function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  if (e.target.files && e.target.files.length > 0) {
    setSelectedFile(e.target.files[0])
  }
}

// 渲染
<PdfViewer
  file={selectedFile}
  onLoadSuccess={(pages) => toast.success(`PDF 加载成功，共 ${pages} 页`)}
  onError={(error) => toast.error(`PDF 加载失败: ${error.message}`)}
/>
```

## 文件结构

```
src/
├── components/ui/pdf-viewer/
│   └── index.tsx              # PdfViewer 组件
├── lib/
│   └── pdf-worker.ts          # Worker 配置
└── components/ui/icon/
    └── index.ts               # 新增 PDF 控制图标

public/
└── pdfjs/
    └── pdf.worker.min.mjs     # PDF.js worker 文件
```

## 新增图标

已添加以下 PDF 控制图标到 `src/components/ui/icon/index.ts`:

- `LucideChevronLeft` - 上一页
- `LucideChevronRight` - 下一页
- `LucideZoomIn` - 放大
- `LucideZoomOut` - 缩小
- `LucideRotateCw` - 旋转

## 注意事项

### 1. SSR 兼容性

PdfViewer 必须在客户端渲染，因为 PDF.js 依赖浏览器 API（canvas、window）。

**错误示例**:
```tsx
// ❌ 直接在服务端组件中使用会导致错误
import { PdfViewer } from '@/components/ui/pdf-viewer'
export default function Page() {
  return <PdfViewer file="/sample.pdf" />
}
```

**正确示例**:
```tsx
// ✅ 使用 dynamic import 禁用 SSR
import dynamic from 'next/dynamic'
const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then(mod => ({ default: mod.PdfViewer })),
  { ssr: false }
)
```

### 2. Worker 文件版本

Worker 文件版本必须与 `pdfjs-dist` 版本匹配。当前使用版本：

- `react-pdf`: 10.3.0
- `pdfjs-dist`: 5.4.296 (自动安装)
- Worker 文件: `public/pdfjs/pdf.worker.min.mjs` (v5.4.296)

如果升级 `react-pdf`，需要同步更新 worker 文件：

```bash
# 查看当前 pdfjs-dist 版本
pnpm list pdfjs-dist

# 下载对应版本的 worker 文件
curl -L -o public/pdfjs/pdf.worker.min.mjs \
  "https://unpkg.com/pdfjs-dist@<VERSION>/build/pdf.worker.min.mjs"
```

### 3. 样式定制

组件使用 Tailwind CSS 4 样式，可通过 `className` 自定义：

```tsx
<PdfViewer
  file={file}
  className="max-w-4xl mx-auto"
/>
```

### 4. 性能优化

- 组件默认只渲染当前页，避免大文件 DOM 过载
- 使用本地 worker 文件，避免 CDN 依赖
- 支持文本层和注释层，但可按需禁用：

```tsx
// 在 src/components/ui/pdf-viewer/index.tsx 中修改
<Page
  renderTextLayer={false}  // 禁用文本选择
  renderAnnotationLayer={false}  // 禁用注释
/>
```

## 测试验证

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 访问页面

打开浏览器访问: `http://localhost:5373/material`

### 3. 测试步骤

1. 点击上传区域，选择 PDF 文件
2. 验证 PDF 正常显示
3. 测试翻页、缩放、旋转功能
4. 验证文本选择功能
5. 测试错误处理（上传非 PDF 文件）

## 故障排查

### 问题 1: Worker 加载失败

**错误信息**: `Setting up fake worker failed`

**解决方案**:
1. 检查 `public/pdfjs/pdf.worker.min.mjs` 文件是否存在
2. 验证 worker 版本与 pdfjs-dist 版本匹配
3. 检查浏览器控制台网络请求

### 问题 2: PDF 不显示

**可能原因**:
1. 文件格式不正确（非 PDF）
2. 文件损坏
3. CORS 问题（远程 URL）

**解决方案**:
- 检查 `onError` 回调中的错误信息
- 验证文件是否为有效 PDF
- 远程 URL 需要配置 CORS 头

### 问题 3: 样式错乱

**解决方案**:
- 确保导入了 react-pdf 样式文件：
  ```tsx
  import 'react-pdf/dist/Page/TextLayer.css'
  import 'react-pdf/dist/Page/AnnotationLayer.css'
  ```

## 扩展功能

### 添加全屏模式

```tsx
import { LucideMaximize } from '@/components/ui/icon'

// 在工具栏添加全屏按钮
<Button onClick={() => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen()}>
  <LucideMaximize className="size-4" />
</Button>
```

### 添加下载功能

```tsx
import { LucideDownload } from '@/components/ui/icon'

function handleDownload() {
  if (file instanceof File) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }
}
```

### 添加打印功能

```tsx
import { LucidePrinter } from '@/components/ui/icon'

function handlePrint() {
  window.print()
}
```

## 参考资料

- [react-pdf 官方文档](https://github.com/wojtekmaj/react-pdf)
- [PDF.js 官方文档](https://mozilla.github.io/pdf.js/)
- [Next.js Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
