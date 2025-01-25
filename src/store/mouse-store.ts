import { create } from 'zustand'

interface Store {
  x: number
  y: number
  update: () => void
}

export const useMouseStore = create<Store>(set => ({
  x: 0,
  y: 0,
  update: () => set(state => ({ x: state.x + 1, y: state.y + 1 })),
}))
