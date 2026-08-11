import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { PageTransition } from '@/components/page-transition'
import { Providers } from '@/components/providers'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import '@/styles/index.scss'

const geistSans = localFont({
  src: '../../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: '../../public/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Next.js Start Template',
  description: '现代化 Next.js 启动模板，集成领域驱动架构',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const colorTheme = localStorage.getItem('color-theme') || 'warm'
                const mode = localStorage.getItem('mode') || 'system'
                const resolved = mode === 'system'
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : mode
                document.documentElement.setAttribute('data-theme', colorTheme)
                if (resolved === 'dark') document.documentElement.classList.add('dark')
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} safe-area-inset-bottom antialiased`}
      >
        <Providers>
          <SiteHeader />
          <PageTransition>
            {children}
          </PageTransition>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
