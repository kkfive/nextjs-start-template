# @kkfive/render-infra

重型渲染能力包：PDF / 图表 / 富文本等纯渲染组件。组件不含业务逻辑，只负责把数据/文件渲染到屏幕。

## 作用
- **PdfViewer**：基于 `react-pdf` 的 PDF 预览组件（翻页 / 缩放 / 旋转），工具栏用 `@kkfive/ui` 的基础控件
- worker 路径不内建，由宿主注入（见下），规避跨包 worker 打包问题

## 红线
- **纯渲染**：禁止 import `@kkfive/contracts` / `@kkfive/biz` / `@kkfive/http-client`，不发起任何业务请求
- **不绑业务 UI 库**：不含 antd；只用 `@kkfive/ui`（基础控件）+ `react-pdf`
- 含 React（peer），前端专用包

## 依赖
- `react-pdf`（渲染引擎，传递依赖 `pdfjs-dist`）
- `@kkfive/ui`（Button / icon / cn，基础控件）
- `react`（peer）

## 消费方式
worker 路径必须由宿主注入——`pdfjs-dist` 的 worker 需在宿主打包环境解析，跨包内建会触发资源解析失败：

```tsx
import { PdfViewer } from '@kkfive/render-infra'

const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

export function Page() {
  return <PdfViewer file="/sample.pdf" workerUrl={workerUrl} />
}
```

宿主 app 需直接依赖 `pdfjs-dist`（版本与 `react-pdf` 对齐），以便 `new URL(..., import.meta.url)` 在打包端可解析。
