'use client'

import { Controller } from '@domain/example/request'
import { useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { RequestPlayground } from '@/components/demo/request/request-playground'
import { httpClient } from '@/service/index.client'

export default function ErrorsPage() {
  const [errorMode, setErrorMode] = useState<'unified' | 'raw'>('unified')

  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Info Banner */}
        <div className="rounded-2xl border border-red-500/15 bg-linear-to-r from-red-500/4 to-orange-500/3 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <svg className="size-4.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">错误处理机制</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                演示 HTTP 错误（4xx/5xx）和业务错误的完整处理流程。
                使用 RequestError 对象获取详细的错误信息：code、raw 响应、isNetworkError、isHttpError、is4xxError、is5xxError 等。
              </p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">错误获取模式:</span>
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setErrorMode('unified')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                errorMode === 'unified'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              unifiedScenario (拦截后)
            </button>
            <button
              onClick={() => setErrorMode('raw')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                errorMode === 'raw'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              rawScenario (原始响应)
            </button>
          </div>
        </div>

        {/* Error Scenarios Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 400 Bad Request */}
          <RequestPlayground
            title="400 参数错误"
            description="客户端请求参数不合法，HTTP 状态码 400"
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="http-error"
            requestFn={() =>
              errorMode === 'unified'
                ? Controller.unifiedScenario(httpClient, 'error-400')
                : Controller.rawScenario(httpClient, 'error-400')}
          />

          {/* 404 Not Found */}
          <RequestPlayground
            title="404 资源不存在"
            description="请求的资源不存在，HTTP 状态码 404"
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="http-error"
            requestFn={() =>
              errorMode === 'unified'
                ? Controller.unifiedScenario(httpClient, 'error-404')
                : Controller.rawScenario(httpClient, 'error-404')}
          />

          {/* 500 Server Error */}
          <RequestPlayground
            title="500 服务器错误"
            description="服务器内部错误，HTTP 状态码 500"
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="http-error"
            requestFn={() =>
              errorMode === 'unified'
                ? Controller.unifiedScenario(httpClient, 'error-500')
                : Controller.rawScenario(httpClient, 'error-500')}
          />

          {/* 503 Service Unavailable */}
          <RequestPlayground
            title="503 服务不可用"
            description="服务暂时不可用，HTTP 状态码 503"
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="http-error"
            requestFn={() =>
              errorMode === 'unified'
                ? Controller.unifiedScenario(httpClient, 'error-503')
                : Controller.rawScenario(httpClient, 'error-503')}
          />

          {/* Business Error */}
          <RequestPlayground
            title="业务错误 (HTTP 200)"
            description="HTTP 状态码 200，但业务逻辑返回 success=false"
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="business-error"
            requestFn={() =>
              errorMode === 'unified'
                ? Controller.unifiedScenario(httpClient, 'business-error')
                : Controller.rawScenario(httpClient, 'business-error')}
          />

          {/* Success for comparison */}
          <RequestPlayground
            title="成功响应 (对比)"
            description="正常成功响应，HTTP 200 + success=true"
            method="POST"
            endpoint="/api/example/request/scenario"
            expectedStatus="success"
            requestFn={() =>
              errorMode === 'unified'
                ? Controller.unifiedScenario(httpClient, 'success')
                : Controller.rawScenario(httpClient, 'success')}
          />
        </div>
      </div>
    </DemoWrapper>
  )
}
