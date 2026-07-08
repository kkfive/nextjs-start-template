export const unifiedScenario = {
  url: '/api/example/request/scenario',
  method: 'POST' as const,
}

export const success = {
  url: '/api/example/request/success',
  method: 'GET' as const,
}

export const http404 = {
  url: '/api/example/request/error/404',
  method: 'GET' as const,
}

export const http500 = {
  url: '/api/example/request/error/500',
  method: 'GET' as const,
}

export const http503 = {
  url: '/api/example/request/error/503',
  method: 'GET' as const,
}
