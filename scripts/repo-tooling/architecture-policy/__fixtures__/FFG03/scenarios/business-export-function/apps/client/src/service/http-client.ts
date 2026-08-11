import 'client-only'

export function fetchHitokoto() {
  return fetch('/api/hitokoto')
}
