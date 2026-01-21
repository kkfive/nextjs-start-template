import { HttpService } from '@/lib/request'

const http = new HttpService({
  hooks: {
    afterResponse: [
      // Response logging interceptor - logs request details and timing
      async (input, options, response) => {
        const url = typeof input === 'string' ? input : input.url
        const method = options.method || 'GET'
        const status = response.status
        const statusText = response.statusText

        // eslint-disable-next-line no-console
        console.log(
          `[Client Request] ${method} ${url} - ${status} ${statusText}`,
        )

        return response
      },

      // Error transformation interceptor - converts HTTP errors to user-friendly messages
      async (input, options, response) => {
        if (!response.ok) {
          const url = typeof input === 'string' ? input : input.url
          console.error(
            `[Client Error] Request failed: ${response.status} ${response.statusText}`,
            { url, method: options.method || 'GET' },
          )

          // For client-side, we can show user-friendly error messages
          if (response.status >= 500) {
            console.error('[Client Error] Server error occurred, please try again later')
          }
          else if (response.status === 401) {
            console.warn('[Client Error] Authentication required, redirecting to login...')
          }
          else if (response.status === 403) {
            console.warn('[Client Error] Access denied')
          }
          else if (response.status === 404) {
            console.warn('[Client Error] Resource not found')
          }
        }

        return response
      },

      // Response data validation interceptor - checks response format
      async (input, options, response) => {
        // Only validate JSON responses
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json') && response.ok) {
          try {
            // Clone response to peek at data without consuming the stream
            const clonedResponse = response.clone()
            const data = await clonedResponse.json()

            // Validate response structure (optional - can be customized)
            if (data && typeof data === 'object') {
              if ('success' in data && !data.success && 'code' in data) {
                console.warn('[Client Validation] Business error detected:', {
                  code: data.code,
                  message: data.message,
                })
              }
            }
          }
          catch (error) {
            console.error('[Client Validation] Failed to parse JSON response:', error)
          }
        }

        return response
      },
    ],
  },
})

export { http as httpClient }
