'use client'

import dynamic from 'next/dynamic'
import { DemoWrapper } from '@/features/demo/navigation/components/demo-wrapper'

// worker 路径由宿主注入：webpack 把 new URL(asset, import.meta.url) 编译为资源 URL。
// pdfjs-dist 须是 client 的直接依赖，打包端才能解析该路径。
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

// pdfjs 依赖浏览器 API（DOMMatrix 等），SSR prerender 会失败，故 ssr:false 仅客户端渲染。
const PdfViewer = dynamic(() => import('@kkfive/ui/widgets/pdf-viewer').then(m => m.PdfViewer), { ssr: false })

// pdf.js 官方演示 PDF（mozilla.github.io 稳定地址），仅用于演示渲染
const SAMPLE_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

export default function PdfViewerDemoPage() {
  return (
    <DemoWrapper>
      <PdfViewer file={SAMPLE_PDF} workerUrl={workerUrl} />
    </DemoWrapper>
  )
}
