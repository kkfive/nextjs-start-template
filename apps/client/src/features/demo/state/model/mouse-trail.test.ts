import { describe, expect, it } from 'vitest'
import { addMouseTrailPoint, getRelativePosition } from './mouse-trail'

describe('mouse trail', () => {
  it('保留最新轨迹并限制长度', () => {
    const trail = Array.from({ length: 4 }, (_, id) => ({ id, x: id, y: id }))
    expect(addMouseTrailPoint(trail, { id: 4, x: 4, y: 4 }, 3).map(point => point.id)).toEqual([2, 3, 4])
  })

  it('计算并约束相对坐标', () => {
    expect(getRelativePosition(50, 200)).toBe(25)
    expect(getRelativePosition(-1, 200)).toBe(0)
    expect(getRelativePosition(300, 200)).toBe(100)
    expect(getRelativePosition(1, 0)).toBe(0)
  })
})
