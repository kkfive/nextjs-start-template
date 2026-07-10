'use client'

import { PdfViewer } from '@kkfive/render-infra'
import { DemoWrapper } from '@/components/demo/demo-wrapper'

// worker 路径由宿主注入：webpack 把 new URL(asset, import.meta.url) 编译为资源 URL。
// pdfjs-dist 须是 client 的直接依赖，打包端才能解析该路径。
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

// pdf.js 官方示例 PDF，仅用于演示渲染
const SAMPLE_PDF = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2ede41/web/compressed.tracemonkey-pldi-09.pdf'

export default function PdfViewerDemoPage() {
  return (
    <DemoWrapper>
      <PdfViewer file={SAMPLE_PDF} workerUrl={workerUrl} />
    </DemoWrapper>
  )
}
