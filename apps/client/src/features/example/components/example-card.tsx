'use client'

import type { ExamplePing } from '@kkfive/contracts'
import { useState } from 'react'
import { fetchExamplePing } from '../model/calls.client'

type ExampleCardProps = {
  initialData: ExamplePing | null
}

// 客户端组件：SSR 已提供首屏数据，组件只展示与提供交互钩子。
// 业务调用经 model 层（fetchExamplePing），组件不直接摸 service 实例。
export function ExampleCard({ initialData }: ExampleCardProps) {
  const [ping, setPing] = useState<ExamplePing | null>(initialData)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      setPing(await fetchExamplePing())
    }
    catch (error) {
      setPing({ message: `请求失败：${error instanceof Error ? error.message : '未知错误'}`, time: '' })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
      <h2 className="meta-mono text-muted-foreground">example / ping</h2>
      <p className="mt-3 text-lg font-medium">
        {ping ? ping.message : '加载中…'}
      </p>
      {ping?.time && <p className="mt-1 text-xs text-muted-foreground">{ping.time}</p>}
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={loading}
        className="mt-4 inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm text-accent-foreground transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {loading ? '请求中…' : '再次请求'}
      </button>
    </div>
  )
}
