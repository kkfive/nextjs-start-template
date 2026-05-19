import { cn } from '@esdora/biz/atom-css'
import { isExternalLink, to } from '@esdora/kit'

export * from './request'
export { cn, isExternalLink, to }

export async function httpTo<T, E = Error>(
  promise: Promise<T>,
  errorExt?: object,
): Promise<[null, T] | [E, undefined]> {
  try {
    const data = await promise
    return [null, data]
  }
  catch (err) {
    if (errorExt && err !== null && typeof err === 'object') {
      Object.assign(err as object, errorExt)
    }
    return [err as E, undefined]
  }
}
