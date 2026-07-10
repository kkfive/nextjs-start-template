'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '../components/button'
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideRotateCw,
  LucideZoomIn,
  LucideZoomOut,
} from '../components/icon'
import { cn } from '../utils/cn'

// 导入 react-pdf 样式
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

export type PdfViewerProps = {
  /** 远程 URL 或本地 File 对象 */
  file: string | File | Blob | null
  /**
   * pdfjs worker 路径，由宿主注入。
   * 宿主端构造示例：`new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href`
   * 跨包内建 worker 路径会触发打包/解析问题，故不在此硬编码。
   */
  workerUrl: string
  /** 容器类名 */
  className?: string
  /** 文档加载成功回调 */
  onLoadSuccess?: (pages: number) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

export function PdfViewer({ file, workerUrl, className, onLoadSuccess, onError }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)

  // 同步设置 worker（幂等赋值），确保 Document 加载前 workerSrc 已就绪。
  // react-pdf 默认 workerSrc 为相对路径 'pdf.worker.mjs'，浏览器无法解析，必须覆盖。
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  function handleDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
    onLoadSuccess?.(numPages)
  }

  function handleDocumentLoadError(error: Error) {
    console.error('PDF 加载失败:', error)
    onError?.(error)
  }

  function handlePreviousPage() {
    setPageNumber(p => Math.max(1, p - 1))
  }

  function handleNextPage() {
    setPageNumber(p => Math.min(numPages, p + 1))
  }

  function handleZoomIn() {
    setScale(s => Math.min(2.5, s + 0.1))
  }

  function handleZoomOut() {
    setScale(s => Math.max(0.5, s - 0.1))
  }

  function handleRotate() {
    setRotation(r => (r + 90) % 360)
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* 工具栏 */}
      <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
        {/* 翻页控制 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousPage}
          disabled={pageNumber <= 1}
          aria-label="上一页"
        >
          <LucideChevronLeft className="size-4" />
        </Button>

        <span className="min-w-20 text-center text-sm font-medium">
          {pageNumber}
          {' '}
          /
          {numPages || '--'}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextPage}
          disabled={pageNumber >= numPages}
          aria-label="下一页"
        >
          <LucideChevronRight className="size-4" />
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        {/* 缩放控制 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          aria-label="缩小"
        >
          <LucideZoomOut className="size-4" />
        </Button>

        <span className="w-12 text-center text-sm">
          {Math.round(scale * 100)}
          %
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          aria-label="放大"
        >
          <LucideZoomIn className="size-4" />
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        {/* 旋转控制 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          aria-label="旋转"
        >
          <LucideRotateCw className="size-4" />
        </Button>
      </div>

      {/* PDF 渲染区域 */}
      <div className="flex min-h-100 justify-center overflow-hidden rounded-md border bg-muted/20">
        {file
          ? (
              <Document
                file={file}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                className="flex justify-center"
                loading={(
                  <div className="animate-pulse p-10 text-muted-foreground">
                    加载 PDF 中...
                  </div>
                )}
                error={(
                  <div className="p-10 text-destructive">
                    PDF 加载失败，请检查文件格式
                  </div>
                )}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  className="shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            )
          : (
              <div className="p-10 text-muted-foreground">
                请选择 PDF 文件
              </div>
            )}
      </div>
    </div>
  )
}
