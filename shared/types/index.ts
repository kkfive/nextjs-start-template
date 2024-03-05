export interface BaseResponse<T> {
  code: number
  message: string
  datas: T
}

export interface GoodsDetail {
  goodsName: string
  goodsId: number
  commonId: number
  image: string
  now: number
  brandName: string
  error?: string
}
