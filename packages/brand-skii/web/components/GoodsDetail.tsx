import type { GoodsDetail } from '@kkproject/types'

interface SkiiGoodsDetailProps {
  goodsDetail: GoodsDetail
}

export default function Comp(props: SkiiGoodsDetailProps) {
  return (
    <>
      <div>
        （Web）SKII模板 -
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
    </>
  )
}
