'use client'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useMouseStore } from '@/store/mouse-store'

export default function Page() {
  const x = useMouseStore(state => state.x)
  const y = useMouseStore(state => state.y)
  const update = useMouseStore(state => state.update)

  useEffect(() => {
    window.addEventListener('mousemove', update)
    return () => {
      window.removeEventListener('mousemove', update)
    }
  })

  return (
    <div className="mx-auto mt-12 w-2xl">
      <Card className="text-center" text=" ">
        <p>当前鼠标位置</p>
        <p className="flex justify-center gap-4">
          <span>
            x:
            {x}
          </span>
          <span>
            y:
            {y}
          </span>

        </p>
      </Card>
    </div>

  )
}
