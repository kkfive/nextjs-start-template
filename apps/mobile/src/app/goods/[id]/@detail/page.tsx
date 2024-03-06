import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import Result from '@/components/Result'
import { goodsDetailApi } from '@/services/mock/api'

export default async function Page({ params, searchParams }: { params: { id: string }, searchParams: Record<string, string | undefined> }) {
  let compName = 'default'

  function fetData() {
    return goodsDetailApi(params.id, searchParams.goodsId)
  }

  const data = await fetData()

  compName = data.datas.brandName

  if (!data || data.code === 404)
    notFound()

  const DynamicComponent: any = dynamic(async () => {
    let comp
    try {
      comp = await import(`@kkproject/brand-${compName}`)
    }
    catch (e) {
      comp = await import(`@kkproject/brand-default`)
    }
    return comp.GoodsDetailCompMobile
  })

  return (
    <>

      {
        data.code === 200
          ? <DynamicComponent goodsDetail={data.datas || {}} />
          : <Result code={data.code} message={data.datas?.error || ''} time={data.datas.now} />
      }

    </>
  )
}
