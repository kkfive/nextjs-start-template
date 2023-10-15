'use client'
import { useState } from 'react'
import { useRequest } from 'ahooks'
import { hitokotoApi } from '@/api/hitokoto'

export function ClientPage(options: { hitokoto: string }) {
  const [hitokoto, setHitokoto] = useState(options.hitokoto)
  const { run } = useRequest(hitokotoApi.getHitokoto, {
    manual: true,
    onSuccess: (result) => {
      setHitokoto(result.hitokoto)
    },
  })
  return (
    <>
      <div className="cursor-pointer">
        {hitokoto}
        <div>
          <button className="btn" onClick={run}>刷新</button>
        </div>
      </div>

    </>
  )
}
