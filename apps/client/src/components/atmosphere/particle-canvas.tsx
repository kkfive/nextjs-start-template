'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import { createAtmosphereParticles, getAtmosphereParticlePosition } from './particle-motion'
import { useAtmosphereMotion } from './use-atmosphere-motion'

type ParticleCanvasProps = {
  className?: string
  style?: CSSProperties
}

export function ParticleCanvas({ className, style }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { reducedMotion, density } = useAtmosphereMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const context = canvas.getContext('2d')
    if (!context)
      return

    let frame = 0
    let raf = 0
    let visible = false
    let pageVisible = document.visibilityState === 'visible'
    let started = false
    let colorPrimary = ''
    let colorSecondary = ''
    let dots = createAtmosphereParticles(1, 1, density)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // 颜色来自主题语义变量；缓存并按帧低频刷新以兼顾主题切换与每帧开销。
    const syncColors = () => {
      const styles = getComputedStyle(canvas)
      colorPrimary = styles.getPropertyValue('--atmosphere-b').trim() || 'rgba(120, 160, 220, 0.45)'
      colorSecondary = styles.getPropertyValue('--atmosphere-a').trim() || colorPrimary
    }

    const particles = () => createAtmosphereParticles(canvas.clientWidth, canvas.clientHeight, density)

    resize()
    syncColors()

    const draw = () => {
      raf = 0
      frame += 1
      if (frame % 120 === 1)
        syncColors()
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      context.clearRect(0, 0, width, height)
      dots.forEach((dot) => {
        const { x, y, shimmer } = getAtmosphereParticlePosition(dot, frame, width, height, reducedMotion)
        const alpha = dot.alpha * shimmer
        context.fillStyle = dot.tone === 1 ? colorSecondary : colorPrimary
        // 大颗粒先铺一圈低透明晕圈，形成柔光层次而不依赖高成本 shadowBlur。
        if (dot.radius >= 3.2) {
          context.beginPath()
          context.globalAlpha = alpha * 0.22
          context.arc(x, y, dot.radius * 2.6, 0, Math.PI * 2)
          context.fill()
        }
        context.beginPath()
        context.globalAlpha = alpha
        context.arc(x, y, dot.radius, 0, Math.PI * 2)
        context.fill()
      })
      context.globalAlpha = 1
      // draw 与 schedule 互相协作以确保同一时刻只有一个 rAF。
      // eslint-disable-next-line ts/no-use-before-define
      schedule()
    }

    const schedule = () => {
      if (!reducedMotion && visible && pageVisible && started && raf === 0)
        raf = window.requestAnimationFrame(draw)
    }

    resize()
    dots = particles()

    const resizeObserver = new ResizeObserver(() => {
      resize()
      syncColors()
      dots = particles()
      if (started && visible) {
        draw()
      }
    })
    resizeObserver.observe(canvas)

    const intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries.some(entry => entry.isIntersecting)
      if (visible && started) {
        cancelAnimationFrame(raf)
        raf = 0
        draw()
      }
      else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    intersectionObserver.observe(canvas)

    const handleVisibility = () => {
      pageVisible = document.visibilityState === 'visible'
      if (!pageVisible) {
        cancelAnimationFrame(raf)
        raf = 0
      }
      else if (visible && started) {
        draw()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const start = window.setTimeout(() => {
      started = true
      if (visible && pageVisible)
        draw()
    }, 120)

    return () => {
      window.clearTimeout(start)
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [density, reducedMotion])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={style} />
}
