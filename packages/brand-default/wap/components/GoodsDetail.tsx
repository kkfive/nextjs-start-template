import Link from 'next/link'
import type { GoodsDetail } from '@kkproject/types'

interface DefaultGoodsDetailProps {
  goodsDetail: GoodsDetail
}

export default function Comp(props: DefaultGoodsDetailProps) {
  return (
    <>
      <div>
        （Mobile）Default模板 -
        {props.goodsDetail.brandName}
      </div>
      <div>
        goodsName:
        {props.goodsDetail.goodsName || ''}
      </div>
      <div>
        commonId:
        {props.goodsDetail.commonId || ''}
      </div>
      <div>
        goodsId:
        {props.goodsDetail.goodsId || ''}
      </div>
      <div>
        time:
        {props.goodsDetail.now || ''}
      </div>
      <div>
        <Link href="/goods/789" className="btn">789</Link>
      </div>
    </>
  )
}
