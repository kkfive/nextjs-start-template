/* eslint-disable node/prefer-global/process */

import consola from 'consola'
import { getUUID } from '@kkproject/utils'
import { isServer } from '@kkproject/utils/is'

const { BASE_API_HOST = '' } = process.env
const NEXT_PUBLIC_BASE_API_HOST = process.env.NEXT_PUBLIC_BASE_API_HOST
export interface IRequestInit extends RequestInit {
  /**
   * 是否添加自动添加请求前缀
   * @default true
   */
  cIsPrefix?: boolean
  /**
   * 自动进行 JSON 解析
   * @default true
   */
  isOnlyResponseData?: boolean
}
export function request<T>(input: string, init: IRequestInit): Promise<T | undefined>
export function request<_T>(input: string, init: IRequestInit & { isOnlyResponseData: false }): Promise<Response | undefined>
export function request<T>(input: string, init: IRequestInit & { isOnlyResponseData: true | undefined }): Promise<T | undefined>
export async function request<T>(input: string, init?: IRequestInit | undefined): Promise<T | Response | undefined> {
  const measureTime = new MeasureTime(input, init)
  init = defaultCustom(init)
  measureTime.start()

  const uuid = getUUID()

  try {
    if (init?.isOnlyResponseData) {
      const response = await fetch(getRealRequestUrl(input, init), init)
      const data: T = await response.json()
      measureTime.end().log()
      return data
    }
    measureTime.end().log()
    return fetch(getRealRequestUrl(input, init), init)
  }
  catch (e) {
    measureTime.end().error(uuid, e)
    return Promise.reject(e)
  }
}

function isHttpLink(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}
function getRealRequestUrl(input: string, custom?: IRequestInit) {
  const isHttp = isHttpLink(input)
  // custom = defaultCustom(custom)
  const withSlashUrl = isHttp ? input : input.startsWith('/') ? input : `/${input}`

  if (custom?.cIsPrefix && !isHttp)
    return isServer() ? `${BASE_API_HOST}${withSlashUrl}` : `${NEXT_PUBLIC_BASE_API_HOST}${withSlashUrl}`

  return withSlashUrl
}
function defaultCustom(custom?: IRequestInit): IRequestInit {
  return {
    cIsPrefix: true,
    isOnlyResponseData: true,
    ...custom,
  }
}

class MeasureTime {
  startTime: number = 0
  endTime: number = 0
  input: string = ''
  init: RequestInit | undefined
  constructor(input: string, init?: RequestInit | undefined) {
    this.input = input
    this.init = init
  }

  start() {
    this.startTime = Date.now()
    return this
  }

  end() {
    this.endTime = Date.now()
    return this
  }

  log() {
    const { input, init, startTime, endTime } = this
    const tookTime = endTime - startTime
    if (tookTime > 1000)
      consola.withTag(`${endTime - startTime}ms`).warn(input, init, 'request end')
  }

  error(uuid: string, error: any) {
    const { input, init, startTime, endTime } = this
    const tookTime = endTime - startTime
    consola.withTag(`${tookTime}ms`).error(`fetch请求失败: ${uuid}`, input, init, error)
  }
}
