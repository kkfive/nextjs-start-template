import process from 'node:process'
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * 服务端环境变量 schema
   * 这些变量仅在服务端可用
   */
  server: {
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    API_BASE_URL: z.string().optional(),
    // 在此添加更多服务端环境变量
    // JWT_SECRET: z.string().min(32),
    // DATABASE_URL: z.string().url(),
  },

  /**
   * 客户端环境变量 schema
   * 这些变量会暴露给浏览器（必须以 NEXT_PUBLIC_ 为前缀）
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default(''),
    NEXT_PUBLIC_API_URL: z.url().optional(),
    NEXT_PUBLIC_DEBUG: z.coerce.boolean().default(false),
    // 在此添加更多客户端环境变量
    // NEXT_PUBLIC_GA_ID: z.string().optional(),
  },

  /**
   * 运行时环境变量映射
   * 将环境变量映射到 schema
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  },

  /**
   * 在特定环境下跳过验证
   * 适用于 Docker 构建等环境变量不可用的场景
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * 将空字符串视为 undefined
   * 允许可选环境变量为空
   */
  emptyStringAsUndefined: true,
})
