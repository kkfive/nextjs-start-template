'use client'
import apis from '@domain/example/hitokoto/const/api'
import { Controller } from '@domain/example/hitokoto/controller'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button/index'
import { Card } from '@/components/ui/card'
import { EosBubbleLoading } from '@/components/ui/icon'
import { http } from '@/service/index.base'

export function HitokotoCard({ initialData }: { initialData: any }) {
  const { data, refetch, isFetching } = useQuery<Hitokoto.Hitokoto>({
    initialData,
    queryKey: [apis.getData.url],
    queryFn: ({ signal }) =>
      Controller.getData(http, { signal, searchParams: { c: 'a' } }),
    enabled: false,
  })

  return (
    <div>
      <Card text={data.hitokoto}>
        <Button
          primary
          disabled={isFetching}
          className="mt-2"
          onClick={() => refetch()}
        >
          {isFetching ? <EosBubbleLoading /> : null}
          刷新
        </Button>
      </Card>
    </div>
  )
}
