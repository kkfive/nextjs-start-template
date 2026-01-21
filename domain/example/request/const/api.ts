const BASE_URL = ''
export default {
  unifiedScenario: {
    url: `${BASE_URL}/api/example/request/scenario`,
    method: 'POST', // Default, can be overridden
  },
  success: {
    url: `${BASE_URL}/api/example/request/success`,
    method: 'GET',
  },
  http404: {
    url: `${BASE_URL}/api/example/request/error/404`,
    method: 'GET',
  },
  http500: {
    url: `${BASE_URL}/api/example/request/error/500`,
    method: 'GET',
  },
  http503: {
    url: `${BASE_URL}/api/example/request/error/503`,
    method: 'GET',
  },
}
