import type { z } from 'zod'
import type { contactFormSchema } from './schema'

export type ContactFormData = z.infer<typeof contactFormSchema>
