import 'client-only'

export const hitokotoCalls = {
  get: () => fetch('/api/hitokoto'),
}
