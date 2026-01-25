'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useMouseStore } from '@/store/mouse-store'
import { DemoWrapper } from '../../components/demo-wrapper'

export default function ZustandMousePage() {
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
    <DemoWrapper>
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
    </DemoWrapper>
  )
}
