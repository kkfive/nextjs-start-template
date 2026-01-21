import process from 'node:process'
import { cookies } from 'next/headers'
import { env } from '@/config/env'
import { HttpService } from '@/lib/request'

const http = new HttpService({
  prefixUrl: env.API_BASE_URL || 'http://localhost:5373',
  hooks: {
    beforeRequest: [
      // Cookie injection interceptor - injects customer ID from cookies
      async (input, options) => {
        const cookieStore = await cookies()
        options.headers = {
          ...options.headers,
          'x-customer-id': cookieStore.get('x-customer-id')?.value || '',
        }
      },

      // Token injection interceptor - adds authorization token from environment or cookies
      async (input, options) => {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value || process.env.API_TOKEN

        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          }
        }
      },

      // Request logging interceptor - logs outgoing requests
      async (input, options) => {
        const url = typeof input === 'string' ? input : input.url
        const method = options.method || 'GET'
        const timestamp = new Date().toISOString()

        // eslint-disable-next-line no-console
        console.log(`[Server Request] ${timestamp} ${method} ${url}`, {
          headers: options.headers,
          hasBody: !!options.body,
        })
      },
    ],
    afterResponse: [
      // Response logging interceptor - logs response status and timing
      async (input, options, response) => {
        const url = typeof input === 'string' ? input : input.url
        const method = options.method || 'GET'
        const status = response.status
        const statusText = response.statusText
        const timestamp = new Date().toISOString()

        // eslint-disable-next-line no-console
        console.log(
          `[Server Response] ${timestamp} ${method} ${url} - ${status} ${statusText}`,
        )

        return response
      },

      // Server-side error handling interceptor - handles authentication and server errors
      async (input, options, response) => {
        const url = typeof input === 'string' ? input : input.url

        // Handle 401 Unauthorized - could trigger server-side redirect
        if (response.status === 401) {
          console.error(
            `[Server Error] Unauthorized request to ${url}`,
            'Consider redirecting to login page',
          )
          // In a real app, you might want to:
          // - Clear invalid cookies
          // - Redirect to login page
          // - Return a specific error response
        }

        // Handle 5xx server errors
        if (response.status >= 500) {
          console.error(
            `[Server Error] Server error ${response.status} for ${url}`,
            'Upstream service may be down',
          )
          // In a real app, you might want to:
          // - Trigger retry logic
          // - Send error to monitoring service
          // - Return fallback data
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
          console.warn(
            `[Server Error] Access forbidden to ${url}`,
            'User may lack required permissions',
          )
        }

        return response
      },

      // Performance monitoring interceptor - tracks slow requests
      async (input, options, response) => {
        // Note: In a real implementation, you would track request start time
        // and calculate duration here. This is a simplified example.
        const url = typeof input === 'string' ? input : input.url

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
