import { cn } from '@esdora/biz/atom-css'
import { isExternalLink, to } from '@esdora/kit'

export * from './request'
export { cn, isExternalLink, to }

export function httpTo<T, E = Error>(promise: Promise<T>, errorExt?: object) {
  return to<T, E>(promise, errorExt)
}
