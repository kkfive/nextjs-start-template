import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** 设置为 true 跳过全局错误处理 */
      skipGlobalErrorHandler?: boolean
    }
    mutationMeta: {
      /** 设置为 true 跳过全局错误处理 */
      skipGlobalErrorHandler?: boolean
    }
  }
}

declare global {
  interface Window {}
}

export {}
