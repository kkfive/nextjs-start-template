import type { GoodsDetail } from '@kkproject/types'
import { request } from '@kkproject/fetch'

export async function goodsDetailApi(commonId: string, goodsId?: string | null) {
  const urlencoded = new URLSearchParams()
  urlencoded.append('commonId', commonId)
  if (goodsId)
    urlencoded.append('goodsId', goodsId)

  const result = await request<GoodsDetail>('https://mock.apifox.com/m1/4081920-0-default/goods', {
    method: 'post',
    body: urlencoded,
    // cache: 'no-store',
    next: {
      tags: ['goodsDetailApi'],
      revalidate: 10,

    },
  })
  return result
}
