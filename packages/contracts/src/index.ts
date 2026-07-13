/**
 * @kkfive/contracts —— API 契约（zod-first schema + 共享类型 + http/error 契约）。
 *
 * 零运行时框架依赖（仅 zod），可被任何环境消费：Node.js、浏览器、Edge。
 * 接口端用它校验请求/格式化响应，客户端用它做表单验证与类型推断。
 */

export * from './errors'
export * from './schemas'
export * from './types'
