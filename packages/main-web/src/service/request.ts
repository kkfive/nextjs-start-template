export class Request {
  private readonly defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  private readonly baseUrl: string = ''

  constructor(baseUrl: string = '', options?: RequestInit) {
    this.defaultOptions = { ...this.defaultOptions, ...options }
    this.baseUrl = baseUrl
  }

  request(url: string, options?: RequestInit) {
    // 如果传入的 url 不是以 http://、https://、/api 开头的，则拼接 baseUrl
    if (!/^(http:\/\/|https:\/\/|\/api)/.test(url))
      url = this.baseUrl + url

    const newOptions: RequestInit = { ...this.defaultOptions, ...options }
    return fetch(url, newOptions)
  }

  get(url: string, options?: RequestInit) {
    const newOptions: RequestInit = { ...this.defaultOptions, ...options }
    return this.request(url, { ...newOptions, method: 'GET' })
  }

  post(url: string, options?: RequestInit) {
    const newOptions: RequestInit = { ...this.defaultOptions, ...options }
    return this.request(url, { ...newOptions, method: 'POST' })
  }

  put(url: string, options?: RequestInit) {
    const newOptions: RequestInit = { ...this.defaultOptions, ...options }
    return this.request(url, { ...newOptions, method: 'PUT' })
  }

  delete(url: string, options?: RequestInit) {
    const newOptions: RequestInit = { ...this.defaultOptions, ...options }
    return this.request(url, { ...newOptions, method: 'DELETE' })
  }
}
export default new Request()
