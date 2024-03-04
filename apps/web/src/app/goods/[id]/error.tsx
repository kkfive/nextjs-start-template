'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  function clickHandler() {
    router.refresh()
    reset()
  }

  return (
    <div>
      <h2 className="text-red-500">发生了错误</h2>
      <button
        className="btn"
        onClick={clickHandler}
      >
        Try again
      </button>
    </div>
  )
}
