import { useQuery } from '@tanstack/react-query'
import type { BizClient } from '../rpc/client'
import { fetchHitokoto } from './calls'

export function useHitokotoData(client: BizClient) {
  return useQuery({
    queryKey: ['hitokoto'],
    queryFn: () => fetchHitokoto(client),
    staleTime: 5 * 60 * 1000,
  })
}
