import type { BusinessError } from './request/error'
import clsx from 'clsx'

import { twMerge } from 'tailwind-merge'

export * from './request'

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

/**
 * @ref https://github.com/scopsy/await-to-js/blob/master/src/await-to-js.ts
 */
export function to<T, U = Error>(promise: Promise<T>, errorExt?: object): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt)
        return [parsedError, undefined]
      }

      return [err, undefined]
    })
}
export function httpTo<T>(promise: Promise<T>, errorExt?: object) {
  return to<T, BusinessError<T>>(promise, errorExt)
}

/**
 * 检查给定链接是否为外部链接，通过评估其 href 属性来实现。
 * 如果 href 为空或为 null，则认为是内部链接。
 * 否则，如果 href 不以 / 或 # 开头，则认为是外部链接。
 *
 * @param href - 要检查的链接的 href 属性值。
 * @returns - 一个布尔值，表示链接是否为外部链接。
 */
export function isExternalLink(href: string) {
  if (!href)
    return false
  return !href.startsWith('/') && !href.startsWith('#')
}
