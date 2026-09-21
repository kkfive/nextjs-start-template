import { describe, expect, it } from 'vitest'
import { createAtmosphereParticles, getAtmosphereParticlePosition } from './particle-motion'

describe('particle motion', () => {
  it('限制粒子数量、尺寸与透明度，避免背景喧宾夺主', () => {
    const dense = createAtmosphereParticles(4000, 3000, 10)
    expect(dense).toHaveLength(18)
    expect(Math.max(...dense.map(particle => particle.radius))).toBeLessThanOrEqual(2.05)
    expect(Math.max(...dense.map(particle => particle.alpha))).toBeLessThanOrEqual(0.22)
  })

  it('粒子运动保持慢速小幅漂移，并在 reduced-motion 下静止', () => {
    const [particle] = createAtmosphereParticles(1000, 600, 1)
    const start = getAtmosphereParticlePosition(particle, 0, 1000, 600, false)
    const later = getAtmosphereParticlePosition(particle, 120, 1000, 600, false)
    expect(Math.abs(later.x - start.x)).toBeLessThanOrEqual(0.4)
    expect(Math.abs(later.y - start.y)).toBeLessThanOrEqual(0.2)
    expect(getAtmosphereParticlePosition(particle, 999, 1000, 600, true)).toEqual({
      x: particle.x,
      y: particle.y,
      shimmer: 1,
    })
  })

  it('边缘粒子不会通过取模瞬移到画布另一侧', () => {
    const particle = { x: 999.9, y: 0.1, radius: 1, offset: 1, alpha: 0.1, tone: 0 as const }
    const position = getAtmosphereParticlePosition(particle, 600, 1000, 600, false)
    expect(position.x).toBeGreaterThan(990)
    expect(position.y).toBeLessThan(10)
  })
})
