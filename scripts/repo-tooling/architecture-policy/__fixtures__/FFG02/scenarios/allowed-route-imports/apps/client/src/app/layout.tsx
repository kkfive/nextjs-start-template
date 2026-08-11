import type { ReactNode } from 'react'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'
import { HomePage } from '@/features/home'
import '@/styles/index.scss'

const font = localFont({ src: './font.woff2' })

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={font.className}>
      <Providers>
        <HomePage />
        {children}
      </Providers>
    </div>
  )
}
