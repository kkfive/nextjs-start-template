import { create } from 'zustand'

interface BearState {
  /** @description 数量 */
  bears: number
  increase: (by: number) => void
}

export const useBearStore = create<BearState>()(set => ({
  bears: 0,
  increase: () => set((state) => {
    return { bears: state.bears + 1 }
  }),
}))
