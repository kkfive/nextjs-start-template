export type AtmosphereParticle = {
  x: number
  y: number
  radius: number
  offset: number
  alpha: number
  tone: 0 | 1
}

export function createAtmosphereParticles(width: number, height: number, density: number) {
  const area = width * height
  const count = Math.max(5, Math.min(18, Math.round((area / 52000) * density)))

  return Array.from({ length: count }, (_, index): AtmosphereParticle => ({
    x: (index * 197 + 53) % Math.max(width, 1),
    y: (index * 89 + 37) % Math.max(height, 1),
    radius: 0.7 + ((index * 7) % 4) * 0.45,
    offset: index * 0.68,
    alpha: 0.12 + (index % 3) * 0.05,
    tone: index % 3 === 2 ? 1 : 0,
  }))
}

export function getAtmosphereParticlePosition(
  particle: AtmosphereParticle,
  frame: number,
  width: number,
  height: number,
  reducedMotion: boolean,
) {
  if (reducedMotion)
    return { x: particle.x, y: particle.y, shimmer: 1 }

  // 极慢、同向的环境尘埃：完整呼吸周期约 90 秒，并用 clamp 避免跨边界瞬移。
  const phase = frame / 900 + particle.offset
  const x = particle.x + Math.sin(phase) * 2.2
  const y = particle.y - Math.sin(phase * 0.42) * 1.6
  return {
    x: Math.min(Math.max(width, 1), Math.max(0, x)),
    y: Math.min(Math.max(height, 1), Math.max(0, y)),
    shimmer: 0.9 + 0.1 * Math.sin(phase * 0.36),
  }
}
