import { create } from 'zustand'

type Store = {
  x: number
  y: number
  update: (x: number, y: number) => void
}

export const useMouseStore = create<Store>(set => ({
  x: 0,
  y: 0,
  update: (x: number, y: number) => set({ x, y }),
}))
