import type { BusinessError } from './request/error'
import { cn } from '@esdora/biz/atom-css'
import { isExternalLink, to } from '@esdora/kit'

export * from './request'
export { cn, isExternalLink, to }

export function httpTo<T>(promise: Promise<T>, errorExt?: object) {
  return to<T, BusinessError<T>>(promise, errorExt)
}
