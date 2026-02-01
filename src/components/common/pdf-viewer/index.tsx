'use client'

import { useState } from 'react'
import { Document, Page } from 'react-pdf'
import { Button } from '@/components/ui/button'
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideRotateCw,
  LucideZoomIn,
  LucideZoomOut,
} from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import '@/lib/pdf-worker' // 导入 worker 配置

// 导入 react-pdf 样式
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

export interface PdfViewerProps {
  /** 远程 URL 或本地 File 对象 */
  file: string | File | Blob | null
  /** 容器类名 */
  className?: string
  /** 文档加载成功回调 */
  onLoadSuccess?: (pages: number) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

export function PdfViewer({ file, className, onLoadSuccess, onError }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)

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
          variant="text"
          icon={<LucideChevronLeft className="size-4" />}
          onClick={handlePreviousPage}
          disabled={pageNumber <= 1}
          aria-label="上一页"
        />

        <span className="min-w-20 text-center text-sm font-medium">
          {pageNumber}
          {' '}
          /
          {numPages || '--'}
        </span>

        <Button
          variant="text"
          icon={<LucideChevronRight className="size-4" />}
          onClick={handleNextPage}
          disabled={pageNumber >= numPages}
          aria-label="下一页"
        />

        <div className="mx-2 h-4 w-px bg-border" />

        {/* 缩放控制 */}
        <Button
          variant="text"
          icon={<LucideZoomOut className="size-4" />}
          onClick={handleZoomOut}
          aria-label="缩小"
        />

        <span className="w-12 text-center text-sm">
          {Math.round(scale * 100)}
          %
        </span>

        <Button
          variant="text"
          icon={<LucideZoomIn className="size-4" />}
          onClick={handleZoomIn}
          aria-label="放大"
        />

        <div className="mx-2 h-4 w-px bg-border" />

        {/* 旋转控制 */}
        <Button
          variant="text"
          icon={<LucideRotateCw className="size-4" />}
          onClick={handleRotate}
          aria-label="旋转"
        />
      </div>

      {/* PDF 渲染区域 */}
      <div className="flex min-h-[400px] justify-center overflow-hidden rounded-md border bg-muted/20">
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
