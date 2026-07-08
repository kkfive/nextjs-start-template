'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { useMouseStore } from '@/store/mouse-store'

export default function ZustandMousePage() {
  const x = useMouseStore(state => state.x)
  const y = useMouseStore(state => state.y)
  const update = useMouseStore(state => state.update)

  const [, setTrail] = useState<{ x: number, y: number, id: number }[]>([])
  const [isTracking, setIsTracking] = useState(true)

  useEffect(() => {
    if (!isTracking)
      return

    const handleMouseMove = (e: MouseEvent) => {
      update(e.clientX, e.clientY)
      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }]
        return newTrail.slice(-20)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [update, isTracking])

  // Calculate relative position (percentage)
  const relativeX = typeof window !== 'undefined' ? Math.round((x / window.innerWidth) * 100) : 0
  const relativeY = typeof window !== 'undefined' ? Math.round((y / window.innerHeight) * 100) : 0

  return (
    <DemoWrapper>
      <div className="mx-auto max-w-xl space-y-6">
        {/* Main Display Card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-sm"
        >
          {/* Background grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative space-y-6">
            {/* Coordinate Display */}
            <div className="flex items-center justify-center gap-8">
              <motion.div
                className="text-center"
                animate={{ scale: x > 0 ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  X 坐标
                </div>
                <div className="text-4xl font-bold text-primary tabular-nums">
                  {x}
                </div>
              </motion.div>

              <div className="h-12 w-px bg-border/60" />

              <motion.div
                className="text-center"
                animate={{ scale: y > 0 ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Y 坐标
                </div>
                <div className="text-4xl font-bold text-accent tabular-nums">
                  {y}
                </div>
              </motion.div>
            </div>

            {/* Relative Position */}
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M12 2v20" />
                  <path d="M2 12h20" />
                </svg>
                相对 X:
                {' '}
                {relativeX}
                %
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M12 2v20" />
                  <path d="M2 12h20" />
                </svg>
                相对 Y:
                {' '}
                {relativeY}
                %
              </span>
            </div>

            {/* Visual Position Indicator */}
            <div className="relative mx-auto h-32 w-48 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              <motion.div
                className="absolute size-3 rounded-full bg-primary shadow-md"
                style={{
                  left: `${relativeX}%`,
                  top: `${relativeY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 0 0px oklch(0.55 0.18 270 / 0.3)',
                    '0 0 0 8px oklch(0.55 0.18 270 / 0)',
                  ],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              {/* Crosshair */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px bg-border/30" />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-px w-full bg-border/30" />
              </div>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className="flex items-center gap-2 rounded-xl bg-muted/60 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {isTracking
              ? (
                  <>
                    <svg className="size-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    跟踪中
                  </>
                )
              : (
                  <>
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    已暂停
                  </>
                )}
          </button>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
            Zustand
          </span>
          <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
            React
          </span>
          <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
            TypeScript
          </span>
        </div>
      </div>
    </DemoWrapper>
  )
}
