'use client'
import { SWRConfig } from 'swr'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SWRConfig>{children}</SWRConfig>
}
