import { HttpService } from '@base/utils/request'

const http = new HttpService({
  hooks: {
    afterResponse: [
      async (input, options, response) => {
        // console.log('afterResponse', response)
        return response
      },
    ],
  },
})

export { http as httpClient }
