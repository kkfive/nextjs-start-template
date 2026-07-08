'use client'

import { Controller } from '@domain/example/request'
import { useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { RequestPlayground } from '@/components/demo/request/request-playground'
import { httpClient } from '@/service/index.client'

export default function ConfigPage() {
  const [retryCount, setRetryCount] = useState(2)
  const [timeoutMs, setTimeoutMs] = useState(5000)
  const [delayMs, setDelayMs] = useState(0)
  const [failRate, setFailRate] = useState(0)

  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Info Banner */}
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-accent/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <svg className="size-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m4.22-13.22l-4.24 4.24m-4.24 4.24l4.24 4.24M23 12h-6m-6 0H1m20.07 4.93l-4.24-4.24m-4.24-4.24l-4.24 4.24" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">请求配置参数</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                演示 request 库的核心配置参数：retry（重试次数）、timeout（超时时间）。
                调整下方参数后点击发送请求，观察配置对请求行为的影响。
              </p>
            </div>
          </div>
        </div>

        {/* Timeout Demo */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">超时配置 (timeout)</h3>
          <RequestPlayground
            title="超时测试"
            description="服务端延迟响应，测试 timeout 配置的效果"
            method="GET"
            endpoint="/api/example/request/config"
            configDisplay={{ timeout: timeoutMs, delay: delayMs }}
            expectedStatus={delayMs > timeoutMs ? 'http-error' : 'success'}
            requestFn={() => Controller.configExample(httpClient, delayMs, 0, { timeout: timeoutMs })}
          >
            <div className="space-y-3 rounded-lg bg-muted/30 p-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">超时时间 (timeout)</label>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {timeoutMs}
                    ms
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={timeoutMs}
                  onChange={e => setTimeoutMs(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/20 accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
                  <span>500ms</span>
                  <span>10000ms</span>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">服务端延迟 (delay)</label>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {delayMs}
                    ms
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8000"
                  step="500"
                  value={delayMs}
                  onChange={e => setDelayMs(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/20 accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
                  <span>0ms</span>
                  <span>8000ms</span>
                </div>
              </div>
              {delayMs > timeoutMs && (
                <div className="rounded-md bg-yellow-500/10 px-2.5 py-1.5 text-[11px] text-yellow-600">
                  注意: 服务端延迟 (
                  {delayMs}
                  ms) 超过超时时间 (
                  {timeoutMs}
                  ms)，请求将超时失败
                </div>
              )}
            </div>
          </RequestPlayground>
        </div>

        {/* Retry Demo */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">重试配置 (retry)</h3>
          <RequestPlayground
            title="重试测试"
            description="服务端随机失败，测试 retry 配置的效果"
            method="GET"
            endpoint="/api/example/request/config"
            configDisplay={{ retry: retryCount, failRate: `${failRate}%` }}
            expectedStatus={failRate > 0 ? 'http-error' : 'success'}
            requestFn={() => Controller.configExample(httpClient, 0, failRate, { retry: retryCount })}
          >
            <div className="space-y-3 rounded-lg bg-muted/30 p-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">重试次数 (retry)</label>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {retryCount}
                    {' '}
                    次
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={retryCount}
                  onChange={e => setRetryCount(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/20 accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
                  <span>0 (不重试)</span>
                  <span>5 次</span>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">失败概率 (failRate)</label>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {failRate}
                    %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={failRate}
                  onChange={e => setFailRate(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/20 accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
                  <span>0% (总是成功)</span>
                  <span>100% (总是失败)</span>
                </div>
              </div>
              {failRate > 0 && (
                <div className="rounded-md bg-blue-500/10 px-2.5 py-1.5 text-[11px] text-blue-600">
                  提示: 服务端以
                  {' '}
                  {failRate}
                  % 概率返回 500 错误，设置 retry 可在失败时自动重试
                </div>
              )}
            </div>
          </RequestPlayground>
        </div>
      </div>
    </DemoWrapper>
  )
}
