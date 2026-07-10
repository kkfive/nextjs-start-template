import { z } from 'zod'

/**
 * 示例：联系表单 schema。
 * 跨 app 共享的 zod-first schema 放这里；app 专属 schema 留各 app。
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .email('Please enter a valid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

/**
 * hitokoto（一言）—— 外部 https://hitokoto.cn 的响应形状。
 * api 代理路由用它校验上游响应，前端用它推导类型。
 */
export const hitokotoResponseSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  hitokoto: z.string(),
  type: z.string(),
  from: z.string(),
  from_who: z.string(),
  creator: z.string(),
  creator_uid: z.number(),
  reviewer: z.number(),
  commit_from: z.string(),
  created_at: z.string(),
  length: z.number(),
})

export type Hitokoto = z.infer<typeof hitokotoResponseSchema>

/**
 * request scenario 演示：请求体 schema + scenario 枚举。
 */
export const scenarioSchema = z.object({
  scenario: z.string(),
})

export type ScenarioType =
  | 'success'
  | 'business-error'
  | 'error-400'
  | 'error-401'
  | 'error-404'
  | 'error-500'
  | 'error-503'
