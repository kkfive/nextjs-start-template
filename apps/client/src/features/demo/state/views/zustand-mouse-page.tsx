'use client'

import type { MouseTrailPoint } from '../model/mouse-trail'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DemoWrapper } from '@/features/demo/navigation/components/demo-wrapper'
import { useMouseStore } from '../model/mouse-store'
import { addMouseTrailPoint, getRelativePosition } from '../model/mouse-trail'

function MouseTrailOverlay({ trail }: { trail: MouseTrailPoint[] }) {
  if (typeof document === 'undefined')
    return null

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      {trail.map((point, index) => {
        const progress = (index + 1) / trail.length
        return (
          <span
            key={point.id}
            data-trail-point
            className="absolute rounded-full bg-accent"
            style={{
              left: point.x,
              top: point.y,
              width: 4 + progress * 6,
              height: 4 + progress * 6,
              opacity: progress * 0.45,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </div>,
    document.body,
  )
}

export default function ZustandMousePage() {
  const x = useMouseStore(state => state.x)
  const y = useMouseStore(state => state.y)
  const update = useMouseStore(state => state.update)

  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([])
  const [isTracking, setIsTracking] = useState(true)
  const shouldReduceMotion = useReducedMotion()
  const frameRef = useRef<number | null>(null)
  const nextPointRef = useRef<{ x: number, y: number } | null>(null)

  useEffect(() => {
    if (!isTracking)
      return

    const handleMouseMove = (event: MouseEvent) => {
      nextPointRef.current = { x: event.clientX, y: event.clientY }
      if (frameRef.current !== null)
        return

      frameRef.current = requestAnimationFrame(() => {
        const point = nextPointRef.current
        frameRef.current = null
        if (!point)
          return
        update(point.x, point.y)
        setTrail(previous => addMouseTrailPoint(previous, { ...point, id: performance.now() }))
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current !== null)
        cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      nextPointRef.current = null
    }
  }, [update, isTracking])

  const relativeX = typeof window !== 'undefined' ? getRelativePosition(x, window.innerWidth) : 0
  const relativeY = typeof window !== 'undefined' ? getRelativePosition(y, window.innerHeight) : 0

  return (
    <DemoWrapper>
      <div className="max-w-4xl space-y-6">
        <MouseTrailOverlay trail={trail} />
        {/* Main Display Card */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8"
        >
          {/* 测绘场背景：径向光晕 + 同心轨道 + 中心十字 + 边缘刻度 */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {/* 柔和径向光晕 */}
            <div className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-2xl" />
            {/* 中心十字轴 */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-border/30" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-border/30" />
            {/* 同心轨道 */}
            <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/40" />
            <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/25" />
            <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/15" />
            {/* 边缘刻度 */}
            <div className="absolute inset-x-6 top-0 flex justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <span key={i} className={i % 2 === 0 ? 'h-2 w-px bg-border/50' : 'h-1 w-px bg-border/30'} />
              ))}
            </div>
            <div className="absolute inset-x-6 bottom-0 flex justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <span key={i} className={i % 2 === 0 ? 'h-2 w-px bg-border/50' : 'h-1 w-px bg-border/30'} />
              ))}
            </div>
            <div className="absolute inset-y-6 left-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i % 2 === 0 ? 'h-px w-2 bg-border/50' : 'h-px w-1 bg-border/30'} />
              ))}
            </div>
            <div className="absolute inset-y-6 right-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i % 2 === 0 ? 'h-px w-2 bg-border/50' : 'h-px w-1 bg-border/30'} />
              ))}
            </div>
            {/* 轴标签 */}
            <span className="absolute right-4 top-2.5 font-mono text-[9px] tracking-widest text-muted-foreground/50">
              X →
            </span>
            <span className="absolute bottom-2.5 left-4 font-mono text-[9px] tracking-widest text-muted-foreground/50">
              ↑ Y
            </span>
          </div>

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
                className="absolute size-3 rounded-full bg-primary shadow-soft-sm"
                style={{
                  left: `${relativeX}%`,
                  top: `${relativeY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={shouldReduceMotion ? { opacity: 0.85 } : { opacity: [0.7, 0] }}
                transition={shouldReduceMotion
                  ? { duration: 0 }
                  : {
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

          {/* Bottom status line */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-muted/60 px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {isTracking
              ? (
                  <>
                    <svg className="size-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* Store Snapshot（只读，复用现有 x/y/isTracking/relative 值） */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Store Snapshot · 只读
            </p>
            <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${isTracking ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
              {isTracking ? 'live' : 'paused'}
            </span>
          </div>
          <pre className="mt-3 scrollbar-thin overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">
            {JSON.stringify({ x, y, isTracking, relative: { x: relativeX, y: relativeY } }, null, 2)}
          </pre>
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
