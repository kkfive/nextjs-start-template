'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // const router = useRouter()

  useEffect(() => {
    // if (pathname === '/goods/1')
    // router.refresh()
  }, [pathname, searchParams])

  return null
}
