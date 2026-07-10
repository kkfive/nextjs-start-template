import { useQuery } from '@tanstack/react-query'
import { unwrapData } from '../rpc/envelope'
import type { BizClient } from '../rpc/client'

export function useHitokotoData(client: BizClient) {
  return useQuery({
    queryKey: ['hitokoto'],
    queryFn: async () => {
      const res = await client.hitokoto.$get()
      return unwrapData(await res.json())
    },
    staleTime: 5 * 60 * 1000,
  })
}
