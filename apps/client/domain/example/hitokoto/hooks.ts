import type { HttpService } from '@kkfive/http-client'
import { Controller } from '@kkfive/domain-core/example/hitokoto'
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'

const QUERY_KEYS = {
  getData: ['hitokoto'] as const,
}

const STALE_TIME = 5 * 60 * 1000

export function useHitokotoData(http?: HttpService) {
  const client = http ?? httpClient
  return useQuery({
    queryKey: QUERY_KEYS.getData,
    queryFn: ({ signal }) => Controller.getData(client, { signal }),
    staleTime: STALE_TIME,
  })
}
