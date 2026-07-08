'use client'

import { Controller } from '@domain/example/request'
import { useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { RequestPlayground } from '@/components/demo/request/request-playground'
import { httpClient } from '@/service/index.client'

export default function AuthPage() {
  const [skipRedirect, setSkipRedirect] = useState(false)

  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Info Banner */}
        <div className="rounded-2xl border border-orange-500/15 bg-gradient-to-r from-orange-500/[0.04] to-yellow-500/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
              <svg className="size-4.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">401 认证处理</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                演示 401 未认证错误的两种处理方式：
                1) 默认行为 — 自动跳转登录页；
                2) 禁用跳转 — 通过 skipAuthRedirect 捕获错误手动处理。
                客户端和服务端拦截器均支持此配置。
              </p>
            </div>
          </div>
        </div>

        {/* Config Toggle */}
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">认证跳转模式:</span>
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setSkipRedirect(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                !skipRedirect
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              默认 (自动跳转)
            </button>
            <button
              onClick={() => setSkipRedirect(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                skipRedirect
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              skipAuthRedirect (禁用跳转)
            </button>
          </div>
        </div>

        {/* Warning when default mode */}
        {!skipRedirect && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] px-4 py-3">
            <div className="flex items-start gap-2 text-sm text-yellow-700">
              <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="space-y-1">
                <p className="font-medium">注意：默认模式下遇到 401 会自动跳转至 /login</p>
                <p className="text-xs text-yellow-600/80">
                  客户端：window.location.href = &apos;/login&apos; | 服务端：redirect(&apos;/login&apos;)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Scenarios */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 401 with redirect */}
          <RequestPlayground
            title={skipRedirect ? '401 错误 (禁用跳转)' : '401 错误 (自动跳转)'}
            description={skipRedirect
              ? 'skipAuthRedirect=true，错误将抛出，可在 catch 中处理'
              : '默认行为，收到 401 后自动跳转登录页'}
            method="GET"
            endpoint="/api/example/request/auth"
            configDisplay={{ context: { skipAuthRedirect: skipRedirect } }}
            expectedStatus="http-error"
            requestFn={() => Controller.authExample(httpClient, 'default', {
              context: { skipAuthRedirect: skipRedirect } as Record<string, unknown>,
            })}
          />

          {/* Success auth */}
          <RequestPlayground
            title="认证成功"
            description="mode=success，模拟已认证状态，正常返回用户数据"
            method="GET"
            endpoint="/api/example/request/auth?mode=success"
            configDisplay={{ params: { mode: 'success' } }}
            expectedStatus="success"
            requestFn={() => Controller.authExample(httpClient, 'success')}
          />
        </div>

        {/* Code Reference */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">拦截器中的 401 处理逻辑</h4>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-[10px] font-medium text-muted-foreground/70">客户端拦截器</div>
              <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-[11px] leading-relaxed dark:bg-white/[0.04]">
                {`if (response.status === 401 && !options.context?.skipAuthRedirect) {
  window.location.href = '/login'
}`}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-[10px] font-medium text-muted-foreground/70">服务端拦截器</div>
              <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-[11px] leading-relaxed dark:bg-white/[0.04]">
                {`if (response.status === 401 && !options.context?.skipAuthRedirect) {
  redirect('/login')
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DemoWrapper>
  )
}
