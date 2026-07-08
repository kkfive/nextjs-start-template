import { pdfjs } from 'react-pdf'

// 使用本地 worker 文件，避免依赖外部 CDN
// worker 文件位于 public/pdfjs/pdf.worker.min.js
pdfjs.GlobalWorkerOptions.workerSrc = '/demo/pdfjs/pdf.worker.min.js'
