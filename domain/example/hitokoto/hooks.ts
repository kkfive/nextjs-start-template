import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { getData } from './controller'

const QUERY_KEYS = {
  getData: ['hitokoto'] as const,
}

const STALE_TIME = 5 * 60 * 1000

export function useHitokotoData() {
  return useQuery({
    queryKey: QUERY_KEYS.getData,
    queryFn: ({ signal }) => getData(httpClient, { signal }),
    staleTime: STALE_TIME,
  })
}
