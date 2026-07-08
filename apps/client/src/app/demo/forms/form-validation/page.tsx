'use client'

import type { ContactFormData } from '@domain/example/forms/contact'
import { contactFormSchema } from '@domain/example/forms/contact'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { cn } from '@/lib/utils'

// ── 交互式输入框组件 ──
function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  description,
  icon,
  rows,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  register: any
  error?: { message?: string }
  description?: string
  icon: React.ReactNode
  rows?: number
}) {
  const isTextarea = !!rows
  const inputClasses = cn(
    'w-full rounded-xl border bg-card px-4 py-3 text-sm transition-all duration-200',
    'placeholder:text-muted-foreground/50',
    'focus:ring-2 focus:outline-none',
    error
      ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20'
      : 'border-border/60 focus:border-primary/50 focus:ring-primary/15',
  )

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium">
        <span className="text-primary/80">{icon}</span>
        {label}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {isTextarea
        ? (
            <textarea
              id={name}
              {...register(name)}
              rows={rows}
              className={inputClasses}
              placeholder={placeholder}
            />
          )
        : (
            <input
              id={name}
              type={type}
              {...register(name)}
              className={inputClasses}
              placeholder={placeholder}
            />
          )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 提交成功展示 ──
function SuccessCard({ data, onReset }: { data: ContactFormData, onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-green-500/15">
          <svg className="size-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-green-800">提交成功</h3>
          <p className="text-xs text-green-600/80">表单数据已通过验证</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-card/60 p-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="text-xs text-muted-foreground">姓名</span>
          <span className="text-sm font-medium">{data.name}</span>
        </div>
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="text-xs text-muted-foreground">邮箱</span>
          <span className="text-sm font-medium">{data.email}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-xs text-muted-foreground">留言</span>
          <span className="text-right text-sm font-medium">{data.message}</span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-4 w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-700 active:scale-[0.98]"
      >
        再次提交
      </button>
    </motion.div>
  )
}

export default function FormValidationPage() {
  const [submitted, setSubmitted] = useState<ContactFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ContactFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    setSubmitted(data)
    reset()
  }

  const handleReset = () => {
    setSubmitted(null)
    reset()
  }

  return (
    <DemoWrapper>
      <div className="mx-auto max-w-lg">
        <AnimatePresence mode="wait">
          {submitted
            ? (
                <SuccessCard key="success" data={submitted} onReset={handleReset} />
              )
            : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Validation Status Indicator */}
                  <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                    <div className={cn(
                      'size-2.5 rounded-full transition-colors duration-300',
                      isValid ? 'bg-green-500' : 'bg-amber-500',
                    )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {isValid ? '所有字段验证通过，可以提交' : '请填写所有必填字段并确保格式正确'}
                    </span>
                  </div>

                  <FormField
                    label="姓名"
                    name="name"
                    placeholder="请输入您的姓名"
                    register={register}
                    error={errors.name}
                    description="至少 2 个字符，支持中文和英文"
                    icon={(
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  />

                  <FormField
                    label="邮箱"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    register={register}
                    error={errors.email}
                    description="请输入有效的电子邮箱地址"
                    icon={(
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    )}
                  />

                  <FormField
                    label="留言"
                    name="message"
                    placeholder="请输入您的留言内容..."
                    register={register}
                    error={errors.message}
                    description="至少 10 个字符，最多 500 个字符"
                    rows={4}
                    icon={(
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                  />

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200',
                      'bg-primary shadow-md hover:shadow-lg',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                      isSubmitting && 'cursor-wait',
                    )}
                  >
                    {isSubmitting
                      ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            提交中...
                          </span>
                        )
                      : (
                          '提交表单'
                        )}
                  </motion.button>

                  {/* Tech Stack Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
                      react-hook-form
                    </span>
                    <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
                      zod
                    </span>
                    <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
                      TypeScript
                    </span>
                  </div>
                </motion.form>
              )}
        </AnimatePresence>
      </div>
    </DemoWrapper>
  )
}
