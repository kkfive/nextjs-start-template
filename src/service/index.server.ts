import { cookies } from 'next/headers'
import { HttpService } from '@/lib/request'

const http = new HttpService({
  hooks: {
    beforeRequest: [
      async (input, options) => {
        const cookieStore = await cookies()
        options.headers = {
          ...options.headers,
          'x-customer-id': cookieStore.get('x-customer-id')?.value || '',
        }
      },
    ],
    afterResponse: [
      async (input, options, response) => {
        // console.log('afterResponse', response.status === 401)
        return response
      },
    ],
  },
})

export { http as httpServer }
