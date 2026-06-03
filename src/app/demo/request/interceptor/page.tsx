'use client'

import { Controller } from '@domain/example/request'
import { useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { RequestPlayground } from '@/components/demo/request/request-playground'
import { httpClient } from '@/service/index.client'

export default function InterceptorPage() {
  const [showUnified, setShowUnified] = useState(true)

  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Info Banner */}
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-accent/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <svg className="size-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">请求拦截器机制</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                演示完整的拦截器链路：beforeRequest（请求前）添加 Header、注入 Cookie/Token；
                afterResponse（响应后）记录日志、处理错误、验证数据。
                对比 unifiedScenario（提取业务数据）与 envelopeScenario（响应包络）的差异。
              </p>
            </div>
          </div>
        </div>

        {/* Interceptor Flow Visualization */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <h4 className="mb-3 text-xs font-semibold text-muted-foreground">拦截器执行流程</h4>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-0">
            {/* Step 1 */}
            <div className="flex w-full flex-col items-center gap-1 sm:w-auto">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <span className="text-xs font-bold">1</span>
              </div>
              <span className="text-[10px] text-muted-foreground">beforeRequest</span>
              <span className="text-[9px] text-muted-foreground/60">注入 Header/Token</span>
            </div>
            {/* Arrow */}
            <div className="flex h-8 w-px items-center justify-center sm:h-px sm:w-8">
              <svg className="size-3 rotate-90 text-muted-foreground/30 sm:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            {/* Step 2 */}
            <div className="flex w-full flex-col items-center gap-1 sm:w-auto">
              <div className="flex size-8 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <span className="text-xs font-bold">2</span>
              </div>
              <span className="text-[10px] text-muted-foreground">HTTP 请求</span>
              <span className="text-[9px] text-muted-foreground/60">发送至服务端</span>
            </div>
            {/* Arrow */}
            <div className="flex h-8 w-px items-center justify-center sm:h-px sm:w-8">
              <svg className="size-3 rotate-90 text-muted-foreground/30 sm:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            {/* Step 3 */}
            <div className="flex w-full flex-col items-center gap-1 sm:w-auto">
              <div className="flex size-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                <span className="text-xs font-bold">3</span>
              </div>
              <span className="text-[10px] text-muted-foreground">afterResponse</span>
              <span className="text-[9px] text-muted-foreground/60">日志/错误/验证</span>
            </div>
            {/* Arrow */}
            <div className="flex h-8 w-px items-center justify-center sm:h-px sm:w-8">
              <svg className="size-3 rotate-90 text-muted-foreground/30 sm:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            {/* Step 4 */}
            <div className="flex w-full flex-col items-center gap-1 sm:w-auto">
              <div className="flex size-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                <span className="text-xs font-bold">4</span>
              </div>
              <span className="text-[10px] text-muted-foreground">拦截器处理</span>
              <span className="text-[9px] text-muted-foreground/60">提取 data / 转换错误</span>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">响应处理模式:</span>
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setShowUnified(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                showUnified
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              unifiedScenario (提取 data)
            </button>
            <button
              onClick={() => setShowUnified(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                !showUnified
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              envelopeScenario (响应包络)
            </button>
          </div>
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RequestPlayground
            title={showUnified ? '成功响应 (拦截后)' : '成功响应 (原始)'}
            description={showUnified
              ? '拦截器自动提取 data 字段，直接返回业务数据'
              : '返回完整的 { success, data, code, message } 响应包络'}
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="success"
            requestFn={() =>
              showUnified
                ? Controller.unifiedScenario(httpClient, 'success')
                : Controller.envelopeScenario(httpClient, 'success')}
          />

          <RequestPlayground
            title={showUnified ? '业务错误 (拦截后)' : '业务错误 (原始)'}
            description={showUnified
              ? '拦截器将错误响应转换为 BusinessError 抛出'
              : '返回完整的错误响应包络，success=false'}
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="business-error"
            requestFn={() =>
              showUnified
                ? Controller.unifiedScenario(httpClient, 'business-error')
                : Controller.envelopeScenario(httpClient, 'business-error')}
          />
        </div>

        {/* Interceptor Code Reference */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">拦截器配置代码</h4>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-[10px] font-medium text-muted-foreground/70">beforeRequest — 请求前处理</div>
              <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-[11px] leading-relaxed dark:bg-white/[0.04]">
                {`hooks: {
  beforeRequest: [
    // 注入 x-customer-id Cookie
    async ({ request }) => {
      request.headers.set('x-customer-id', cookieValue)
    },
    // 注入 Authorization Token
    async ({ request }) => {
      request.headers.set('Authorization', \`Bearer \${token}\`)
    },
    // 请求日志
    async ({ request }) => {
      console.log('[Request]', request.method, request.url)
    },
  ]
}`}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-[10px] font-medium text-muted-foreground/70">afterResponse — 响应后处理</div>
              <pre className="scrollbar-thin overflow-auto rounded-lg bg-black/[0.04] p-3 font-mono text-[11px] leading-relaxed dark:bg-white/[0.04]">
                {`hooks: {
  afterResponse: [
    // 响应日志
    async ({ response }) => {
      console.log('[Response]', response.status, response.statusText)
      return response
    },
    // 错误处理
    async ({ options, response }) => {
      if (!response.ok) {
        // 401 自动跳转（可通过 skipAuthRedirect 禁用）
        if (response.status === 401 && !options.context?.skipAuthRedirect) {
          window.location.href = '/login'
        }
        createErrorResponse({ url, method, status, statusText }, null, options)
      }
      return response
    },
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DemoWrapper>
  )
}
