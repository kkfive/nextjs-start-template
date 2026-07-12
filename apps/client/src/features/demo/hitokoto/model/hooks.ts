'use client'
import type { Hitokoto } from '@kkfive/contracts'
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/service/http-client'
import { getHitokoto } from './calls'

export function useHitokoto(options?: { enabled?: boolean, initialData?: Hitokoto }) {
  return useQuery<Hitokoto>({
    queryKey: ['hitokoto'],
    queryFn: () => getHitokoto(httpClient),
    ...options,
  })
}
