import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { path } from '@kkproject/business'
import Result from '@/components/Result'
import CommonIdAction from '@/components/CommonIdAction'
import { goodsDetailApi } from '@/services/mock/api'

export default async function Page({ params, searchParams }: { params: { id: string }, searchParams: Record<string, string | undefined> }) {
  let compName = 'default'

  const data = await goodsDetailApi(params.id, searchParams.goodsId)
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
    return comp.GoodsDetailCompWeb
  })

  return (
    <>

      {
        data.code === 200 ? <DynamicComponent goodsDetail={data.datas || {}} /> : <Result code={data.code} message={data.datas?.error || ''} time={data.datas.now} />
      }

      <div>
        <Link href={path.GOODS_PATH('16799')}>
          <button className="mr-4 inline-block cursor-pointer rounded bg-teal-600 px-4 py-1 text-white disabled:cursor-default disabled:bg-gray-600 hover:bg-teal-700 disabled:opacity-50">
            SKII
          </button>
        </Link>
        <Link href={path.GOODS_PATH('19953')}>
          <button className="mr-4 inline-block cursor-pointer rounded bg-teal-600 px-4 py-1 text-white disabled:cursor-default disabled:bg-gray-600 hover:bg-teal-700 disabled:opacity-50">
            default
          </button>
        </Link>
        <Link href={path.GOODS_PATH('1')}>
          <button className="mr-4 inline-block cursor-pointer rounded bg-teal-600 px-4 py-1 text-white disabled:cursor-default disabled:bg-gray-600 hover:bg-teal-700 disabled:opacity-50">
            404
          </button>
        </Link>
      </div>

      <div className="mt-4">
        <CommonIdAction />
      </div>
    </>
  )
}
