import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import '@/style/index.scss'
import { Suspense } from 'react'
import { Providers } from './providers'
import { NavigationEvents } from '@/components/NavigationEvents'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}
export const viewport: Viewport = {
  width: 'device-width',
  userScalable: false,
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Suspense fallback={null}>
            <NavigationEvents />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
