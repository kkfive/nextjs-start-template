'use client'

import { useEffect, useState } from 'react'

export type AtmosphereMotionState = {
  reducedMotion: boolean
  mobile: boolean
  parallaxEnabled: boolean
  density: number
}

export function useAtmosphereMotion(): AtmosphereMotionState {
  const [state, setState] = useState<AtmosphereMotionState>({
    reducedMotion: false,
    mobile: false,
    parallaxEnabled: false,
    density: 1,
  })

  useEffect(() => {
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileQuery = window.matchMedia('(max-width: 768px)')

    const sync = () => {
      const reducedMotion = reducedQuery.matches
      const mobile = mobileQuery.matches
      setState({
        reducedMotion,
        mobile,
        parallaxEnabled: !reducedMotion && !mobile,
        density: mobile ? 0.55 : 1,
      })
    }

    sync()
    reducedQuery.addEventListener('change', sync)
    mobileQuery.addEventListener('change', sync)
    return () => {
      reducedQuery.removeEventListener('change', sync)
      mobileQuery.removeEventListener('change', sync)
    }
  }, [])

  return state
}
