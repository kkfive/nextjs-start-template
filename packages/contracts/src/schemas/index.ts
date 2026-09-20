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
 * 示例：example ping 响应 schema。
 * 对应 apps/api 的 GET /example/ping，演示跨包 zod-first 契约的最小写法。
 */
export const examplePingSchema = z.object({
  message: z.string(),
  time: z.string(),
})

export type ExamplePing = z.infer<typeof examplePingSchema>
