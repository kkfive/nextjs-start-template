import type { BusinessError } from '@base/utils/request/error'

/**
 * @ref https://github.com/scopsy/await-to-js/blob/master/src/await-to-js.ts
 */
function to<T, U = Error>(promise: Promise<T>, errorExt?: object): Promise<[U, undefined] | [null, T]> {
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
function httpTo<T>(promise: Promise<T>, errorExt?: object) {
  return to<T, BusinessError<T>>(promise, errorExt)
}

export { httpTo, to }
