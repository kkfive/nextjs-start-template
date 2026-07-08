'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md text-center">
        {/* Friendly SVG Illustration */}
        <div className="mb-8 flex justify-center">
          <svg className="size-48 text-red-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3" />

            {/* Eyes */}
            <circle cx="70" cy="80" r="8" fill="currentColor" />
            <circle cx="130" cy="80" r="8" fill="currentColor" />

            {/* Worried mouth */}
            <path
              d="M70 130 Q100 110 130 130"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Error Code */}
        <h1 className="mb-4 text-6xl font-bold text-gray-800">500</h1>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">服务器出错了</h2>

        {/* Description */}
        <p className="mb-8 text-gray-600">
          很抱歉，服务器遇到了一些问题。请稍后再试，或返回首页继续浏览。
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={() => reset()}>
            重试
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
