'use client'

import type { HttpResponse } from '@kkfive/contracts'
import { callEnvelopeScenario, callScenario, fetchHitokoto, unwrapData } from '@kkfive/rpc'
import { Button } from '@kkfive/ui/components/button'
import { LucideGitBranch } from '@kkfive/ui/components/icon'
import { useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { rpcClient } from '@/service/rpc-client'

type Status = 'idle' | 'loading' | 'success' | 'error'

type UnwrapPreview
  = | { ok: true, data: unknown }
    | { ok: false, error: string }

type ResultState = {
  status: Status
  label: string
  data: unknown
  error?: string
  /** envelope 结果额外展示 unwrapData 的效果 */
  unwrapPreview?: UnwrapPreview
}

const INITIAL: ResultState = { status: 'idle', label: '', data: null }

export default function RpcPage() {
  const [result, setResult] = useState<ResultState>(INITIAL)

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setResult({ status: 'loading', label, data: null })
    try {
      const data = await fn()
      setResult({ status: 'success', label, data })
      return data
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setResult({ status: 'error', label, data: null, error: message })
      return undefined
    }
  }

  // unified：callScenario 内部调 unwrapData，业务失败抛 BusinessError。
  const handleScenario = () =>
    run('callScenario(rpcClient, "success")', () => callScenario(rpcClient, 'success'))

  const handleHitokoto = () =>
    run('fetchHitokoto(rpcClient)', () => fetchHitokoto(rpcClient))

  // envelope：返回原始响应包络；额外演示 unwrapData 在 success:false 时抛 BusinessError。
  const handleEnvelope = async () => {
    const envelope = await run(
      'callEnvelopeScenario(rpcClient, "business-error")',
      () => callEnvelopeScenario(rpcClient, 'business-error'),
    )
    if (envelope === undefined)
      return
    try {
      const data = unwrapData(envelope as HttpResponse)
      setResult(prev => ({ ...prev, unwrapPreview: { ok: true, data } }))
    }
    catch (error) {
      setResult(prev => ({
        ...prev,
        unwrapPreview: { ok: false, error: error instanceof Error ? error.message : String(error) },
      }))
    }
  }

  const is = (s: Status) => result.status === s
  const loading = is('loading')

  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Info Banner */}
        <div className="rounded-2xl border border-primary/15 bg-linear-to-r from-primary/[0.04] to-accent/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <LucideGitBranch className="size-4.5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Hono RPC 扩展通道</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                此页演示 Hono RPC 扩展通道（hc&lt;AppType&gt; → apps/api）。常规请求走 client Route
                Handler（见
                {' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">/demo/request/*</code>
                ），rpc
                仅用于需要 Hono 后端、端到端类型化调用的场景。需 apps/api 在跑且
                <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono">NEXT_PUBLIC_API_URL</code>
                已指向其地址；否则 hc 请求会失败（页面不崩，错误信息展示）。
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Button onClick={handleScenario} disabled={loading} variant="default">
            callScenario('success')
          </Button>
          <Button onClick={handleHitokoto} disabled={loading} variant="secondary">
            fetchHitokoto()
          </Button>
          <Button onClick={handleEnvelope} disabled={loading} variant="outline">
            callEnvelopeScenario('business-error')
          </Button>
        </div>

        {/* Result */}
        {result.status !== 'idle' && (
          <div className="space-y-3">
            {/* Status line */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">调用:</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{result.label}</code>
              {loading && <span className="text-muted-foreground">请求中…</span>}
              {is('success') && (
                <span className="rounded-md bg-green-500/10 px-2 py-0.5 font-medium text-green-600">
                  success
                </span>
              )}
              {is('error') && (
                <span className="rounded-md bg-red-500/10 px-2 py-0.5 font-medium text-red-600">
                  error
                </span>
              )}
            </div>

            {/* Error message */}
            {is('error') && result.error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/[0.03] p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-red-600">
                  <span>hc 请求失败（apps/api 可能未运行）</span>
                </div>
                <code className="block font-mono text-xs break-all text-red-600">{result.error}</code>
              </div>
            )}

            {/* Data */}
            {is('success') && (
              <div className="space-y-2">
                <div className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  解包结果
                </div>
                <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-4 font-mono text-xs leading-relaxed dark:bg-white/[0.04]">
                  {JSON.stringify(result.data, null, 2)}
                </pre>

                {/* unwrapData 额外演示（仅 envelope 调用） */}
                {result.unwrapPreview && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                      unwrapData(envelope) →
                    </div>
                    {result.unwrapPreview.ok
                      ? (
                          <pre className="scrollbar-thin overflow-auto rounded-lg bg-green-500/[0.04] p-4 font-mono text-xs leading-relaxed">
                            {JSON.stringify(result.unwrapPreview.data, null, 2)}
                          </pre>
                        )
                      : (
                          <div className="rounded-lg border border-orange-500/30 bg-orange-500/[0.03] p-3">
                            <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                              BusinessError
                            </span>
                            <code className="mt-1 block font-mono text-xs break-all text-orange-600">
                              {result.unwrapPreview.error}
                            </code>
                          </div>
                        )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DemoWrapper>
  )
}
