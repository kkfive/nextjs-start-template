export type MouseTrailPoint = {
  id: number
  x: number
  y: number
}

export const MOUSE_TRAIL_LIMIT = 16

export function addMouseTrailPoint(
  trail: readonly MouseTrailPoint[],
  point: MouseTrailPoint,
  limit = MOUSE_TRAIL_LIMIT,
) {
  return [...trail, point].slice(-limit)
}

export function getRelativePosition(value: number, size: number) {
  if (size <= 0)
    return 0

  return Math.min(100, Math.max(0, Math.round((value / size) * 100)))
}
