'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { path } from '@kkproject/shared'
import { goodsDetailApi } from '@/services/mock/api'

export default function CommonIdAction() {
  const [commonId, setCommonId] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  return (
    <>
      <input
        type="text"
        className="border"
        onInput={(e) => {
          setCommonId(e.currentTarget.value)
        }}
      />
      <button className="btn" onClick={() => router.push(path.GOODS_PATH(commonId))}>
        Go
        {commonId}
      </button>
      <button className="ml-4 btn" onClick={() => goodsDetailApi('123', params.get('goodsId'))}>goodsDetailFetcher</button>
    </>
  )
}
