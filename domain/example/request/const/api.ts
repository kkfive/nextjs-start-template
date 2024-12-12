const BASE_URL = 'http://localhost:3000'
export default {
  successApi: {
    url: `${BASE_URL}/api/example/request/success`,
    method: 'GET',
  },
  errorBusinessApi: {
    url: `${BASE_URL}/api/example/request/error/bussiness`,
    method: 'GET',
  },
  error400Api: {
    url: `${BASE_URL}/api/example/request/error/400`,
    method: 'GET',
  },
  error401Api: {
    url: `${BASE_URL}/api/example/request/error/401`,
    method: 'GET',
  },
}
