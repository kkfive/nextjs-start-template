'use client'
import Button from '@/components/button'
import { EosBubbleLoading } from '@/components/icon'
import { httpBase } from '@/service/index.base'
import { HitokotoCard } from '@domain/example/hitokoto/components/card'
import { useQuery } from '@tanstack/react-query'
import apis from '../../const/api'
import { getData } from '../../service'

export default function HitokotoClientCard({ initialData }: { initialData: any }) {
  const { data, refetch, isFetching } = useQuery<Hitokoto.GetDataAPI['Response']>({
    initialData,
    queryKey: [apis.getData.url],
    queryFn: ({ signal }) => getData(httpBase, { signal, params: { c: 'a' } }),
  })

  return (
    <div>
      <HitokotoCard text={data.hitokoto}>
        <Button primary disabled={isFetching} className="mt-2" onClick={() => refetch()}>
          {isFetching ? <EosBubbleLoading /> : null}
          刷新
        </Button>
      </HitokotoCard>
    </div>
  )
}
