'use client'

import { useRouter } from 'next/navigation'

interface ResultComponentProps {
  message: string
  code: number
  time?: number
}
export default function Result({ code, message, time }: ResultComponentProps) {
  const router = useRouter()
  function reload() {
    router.refresh()
  }
  return (
    <>
      <div>
        <h2>
          发生了错误 -
          {code}
        </h2>
        <p>
          {message}
          {' '}
          -
          {' '}
          {time}
        </p>
        <div>
          <button className="btn" onClick={reload}>重试</button>
        </div>
      </div>
    </>
  )
}
