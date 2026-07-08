/**
 * @kkfive/utils —— 纯工具函数（零运行时依赖）。
 * 只放与业务无关的通用工具；业务相关工具留各 app 的 src/lib/。
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
