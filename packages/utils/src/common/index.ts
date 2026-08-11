/**
 * @kkfive/utils/common —— 多端通用纯算法（服务端 + 浏览器均可安全引用）。
 * 零运行时依赖，不触碰 document / window 等浏览器全局变量。
 * 浏览器交互工具请见 @kkfive/utils/dom。
 */

/** 类型守卫：排除 null 与 undefined */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

/** 断言守卫：确保值非空，否则抛错 */
export function assertNonNullable<T>(
  value: T,
  message = 'Value is null or undefined',
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message)
  }
}

/**
 * Go 风格的 async 错误处理，返回 [error, data] 元组。
 * 避免调用方写 try/catch。
 */
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
