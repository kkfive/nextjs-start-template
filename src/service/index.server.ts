import process from 'node:process'
import { cookies } from 'next/headers'
import { env } from '@/config/env'
import { HttpService } from '@/lib/request'
import { createErrorResponse } from '@/lib/request/error-handler'

function getBaseUrl() {
  if (env.API_BASE_URL) {
    return env.API_BASE_URL
  }
  return 'http://localhost:5373'
}

const http = new HttpService({
  prefixUrl: getBaseUrl(),
  hooks: {
    beforeRequest: [
      // Cookie injection interceptor - injects customer ID from cookies
      async (request) => {
        const cookieStore = await cookies()
        request.headers.set('x-customer-id', cookieStore.get('x-customer-id')?.value || '')
      },

      // Token injection interceptor - adds authorization token from environment or cookies
      async (request) => {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value || process.env.API_TOKEN

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },

      // Request logging interceptor - logs outgoing requests
      async (request) => {
        const url = request.url
        const method = request.method || 'GET'
        const timestamp = new Date().toISOString()

        // eslint-disable-next-line no-console
        console.log(`[Server Request] ${timestamp} ${method} ${url}`, {
          headers: Object.fromEntries(request.headers.entries()),
          hasBody: !!request.body,
        })
      },
    ],
    afterResponse: [
      // Response logging interceptor - logs response status and timing
      async (request, options, response) => {
        const url = request.url
        const method = request.method || 'GET'
        const status = response.status
        const statusText = response.statusText
        const timestamp = new Date().toISOString()

        // eslint-disable-next-line no-console
        console.log(
          `[Server Response] ${timestamp} ${method} ${url} - ${status} ${statusText}`,
        )

        return response
      },

      // Error handling interceptor - converts HTTP errors to structured BusinessError
      async (request, options, response) => {
        if (!response.ok) {
          const url = request.url
          const method = request.method || 'GET'
          createErrorResponse(
            { url, method, status: response.status, statusText: response.statusText },
            null,
            options,
          )
        }

        return response
      },

      // Performance monitoring interceptor - tracks slow requests
      async (request, options, response) => {
        // Note: In a real implementation, you would track request start time
        // and calculate duration here. This is a simplified example.
        const url = request.url

        // Check if response took too long (this is a placeholder)
        // In production, you'd use performance.now() or similar
        if (response.status === 200) {
          // eslint-disable-next-line no-console
          console.log(`[Server Performance] Request to ${url} completed successfully`)
        }

        return response
      },
    ],
  },
})

export { http as httpServer }
