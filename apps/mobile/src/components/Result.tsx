'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from 'antd-mobile'

interface ResultComponentProps {
  message: string
  code: number
  time?: number
}
export default function Result({ code, message, time }: ResultComponentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  function reload() {
    router.refresh()
    setLoading(true)
    // retry?.()
  }
  useEffect(() => {
    if (loading)
      setLoading(false)
  }, [])
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
          <Button onClick={reload} loading={loading}>重试</Button>
        </div>
      </div>
    </>
  )
}
