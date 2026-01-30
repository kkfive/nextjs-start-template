import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'
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
  title: 'Nextjs Start Template',
  description: 'Nextjs Start Template',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} safe-area-inset-bottom antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
