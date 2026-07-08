import type { Metadata } from 'next'
import { DemoLayoutClient } from '@/components/demo/demo-layout-client'

export const metadata: Metadata = {
  title: 'Demo Examples | Next.js Start Template',
  description: 'Explore template features and examples',
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DemoLayoutClient>{children}</DemoLayoutClient>
}
