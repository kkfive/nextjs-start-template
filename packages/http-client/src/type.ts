import type { Request, RequestOption } from '@kkfive/request'

/** 请求输入（URL） */
export type RequestInput = string

/** 请求选项，透传 @kkfive/request 的 RequestOption */
export type RequestOptions = RequestOption

/** 请求实例类型，透传 @kkfive/request 的 Request */
export type RequestInstance = Request

export type { Request, RequestOption } from '@kkfive/request'
