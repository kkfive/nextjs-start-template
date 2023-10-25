'use client'

import { useRequest } from 'ahooks'
import { debounce } from 'lodash-es'
import { useState } from 'react'

import hitokotoApi from '@/service/hitokoto'

export default function ClientPage(options: { hitokoto: string }) {
  const [hitokoto, setHitokoto] = useState(options.hitokoto)
  const { run } = useRequest(hitokotoApi.getHitokoto, {
    manual: true,
    staleTime: 86400,
    onSuccess: (result) => {
      setHitokoto(result.hitokoto)
    },
  })
  return (
    <>
      {hitokoto}
      <div className="cursor-pointer">
        <button className="btn" onClick={debounce(() => run(), 200)}>刷新</button>
      </div>
    </>
  )
}
