import { useSyncExternalStore } from 'react'

export default function Page() {
  useSyncExternalStore(() => () => {}, () => null)
  return null
}
