import type { ReactNode } from 'react'
import '@/styles/index.scss'

export const metadata = {
  title: 'Admin - Next.js Start Template',
  description: '管理后台示例应用',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
