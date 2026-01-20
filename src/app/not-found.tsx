import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md text-center">
        {/* Friendly SVG Illustration */}
        <div className="mb-8 flex justify-center">
          <svg className="size-48 text-blue-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3" />

            {/* Eyes */}
            <circle cx="70" cy="80" r="8" fill="currentColor" />
            <circle cx="130" cy="80" r="8" fill="currentColor" />

            {/* Sad mouth */}
            <path
              d="M70 140 Q100 120 130 140"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Error Code */}
        <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">页面走丢了</h2>

        {/* Description */}
        <p className="mb-8 text-gray-600">
          抱歉，您访问的页面不存在。可能是链接错误或者页面已被移除。
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/">返回首页</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/example">查看示例</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
