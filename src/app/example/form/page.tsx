'use client'

import type { ContactFormData } from '@domain/example/forms/contact'
import { contactFormSchema } from '@domain/example/forms/contact'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function FormExamplePage() {
  const [submitted, setSubmitted] = useState<ContactFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(data)
    reset()
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-2xl font-bold">Form Validation Example</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Using react-hook-form + zod for type-safe form validation
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={4}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none"
            placeholder="Your message..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {submitted && (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
          <h3 className="font-medium text-green-800">Form Submitted!</h3>
          <pre className="mt-2 text-sm text-green-700">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
