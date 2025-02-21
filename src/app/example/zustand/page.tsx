'use client'
import { Card } from '@/components/ui/card'
import { useMouseStore } from '@/store/mouse-store'
import { useEffect } from 'react'

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
    <div className="w-2xl mt-12 mx-auto">
      <Card className="text-center" text=" ">
        <p>当前鼠标位置</p>
        <p className="flex gap-4 justify-center">
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
