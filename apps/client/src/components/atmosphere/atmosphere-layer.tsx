'use client'

import { motion } from 'framer-motion'
import { ParticleCanvas } from './particle-canvas'
import { useAtmosphereMotion } from './use-atmosphere-motion'

/**
 * Luminous Field 唯一场原语：光晕、网格与粒子共用同一语义强度标尺。
 * 调用方只选择档位与结构开关，不再叠加裸 opacity 或覆盖网格定位类名。
 */
export type AtmosphereIntensity = 'hero' | 'section' | 'quiet' | 'footer'

type AtmospherePreset = {
  /** 整层不透明度，统一衰减光晕 / 网格 / 粒子。 */
  opacity: number
  /** 粒子相对 --particle-opacity 的系数。 */
  particleScale: number
  /** 关闭光晕漂移，用于页脚等静态场域。 */
  staticField: boolean
}

const atmospherePresets: Record<AtmosphereIntensity, AtmospherePreset> = {
  hero: { opacity: 0.85, particleScale: 1, staticField: false },
  section: { opacity: 0.7, particleScale: 1, staticField: false },
  quiet: { opacity: 0.55, particleScale: 0.8, staticField: false },
  footer: { opacity: 0.5, particleScale: 0.55, staticField: true },
}

const defaultGridInset = 'inset-x-[8%] top-[8%] bottom-[10%]'

type AtmosphereLayerProps = {
  intensity?: AtmosphereIntensity
  /** 网格内缩定位，作为唯一 inset 来源，避免基类与调用类冲突。 */
  gridInset?: string
  grid?: boolean
  particles?: boolean
  /** 顶部淡入遮罩：跨区共享场没有可见起点，光场自然流入而非从边缘开始。 */
  fade?: boolean
  className?: string
}

export function AtmosphereLayer({
  intensity = 'section',
  gridInset = defaultGridInset,
  grid = true,
  particles = true,
  fade = false,
  className = '',
}: AtmosphereLayerProps) {
  const { parallaxEnabled } = useAtmosphereMotion()
  const preset = atmospherePresets[intensity]
  const drift = parallaxEnabled && !preset.staticField

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${fade ? 'atmosphere-fade ' : ''}${className}`}
      style={{ opacity: preset.opacity }}
    >
      <motion.div
        className="absolute -left-24 top-0 size-72 rounded-full bg-[var(--atmosphere-a)] opacity-[var(--atmosphere-glow)] blur-3xl"
        animate={drift ? { x: [0, 16, 0], y: [0, 10, 0] } : undefined}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-24 size-80 rounded-full bg-[var(--atmosphere-b)] opacity-[calc(var(--atmosphere-glow)*0.9)] blur-3xl"
        animate={drift ? { x: [0, -18, 0], y: [0, 8, 0] } : undefined}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-64 rounded-full bg-[var(--atmosphere-c)] opacity-[calc(var(--atmosphere-glow)*0.7)] blur-3xl"
        animate={drift ? { x: [0, 12, 0], y: [0, -10, 0] } : undefined}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      {grid && <div className={`absolute atmosphere-grid-mask ${gridInset}`} />}
      {particles && (
        <ParticleCanvas
          className="absolute inset-0 h-full w-full"
          style={{ opacity: `calc(var(--particle-opacity) * ${preset.particleScale})` }}
        />
      )}
    </div>
  )
}
