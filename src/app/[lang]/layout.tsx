import '@/style/index.scss'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | DreamyTZK',
    default: '小康的自留地 | DreamyTZK',
  },
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover',
  description: '欢迎来到小康（DreamyTZK）的自留地，这里分享技术、开发技巧、生活等内容。',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#18171d' },
    { media: '(prefers-color-scheme: light)', color: '#f7f9fe' },
  ],
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  return (
    <html lang={params?.lang || 'en'}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
