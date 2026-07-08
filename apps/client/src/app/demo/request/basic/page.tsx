'use client'

import { Controller } from '@domain/example/request'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { RequestPlayground } from '@/components/demo/request/request-playground'
import { httpClient } from '@/service/index.client'

export default function BasicRequestPage() {
  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Info Banner */}
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-accent/[0.03] p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <svg className="size-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">HTTP 请求方法</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                演示 HttpService 封装的全部 HTTP 方法：GET、POST、PUT、DELETE、PATCH。
                每个方法对应不同的 RESTful 语义，点击下方卡片发送请求查看响应结果。
              </p>
            </div>
          </div>
        </div>

        {/* Method Cards Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RequestPlayground
            title="GET 请求"
            description="获取数据，参数通过 URL query 传递"
            method="GET"
            endpoint="/api/example/request/methods"
            requestFn={() => Controller.getExample(httpClient, { page: '1', limit: '10' })}
          />

          <RequestPlayground
            title="POST 请求"
            description="创建数据，参数通过请求体传递"
            method="POST"
            endpoint="/api/example/request/methods"
            requestFn={() => Controller.postExample(httpClient, { name: '示例数据', value: 42 })}
          />

          <RequestPlayground
            title="PUT 请求"
            description="全量更新，替换整个资源"
            method="PUT"
            endpoint="/api/example/request/methods"
            requestFn={() => Controller.putExample(httpClient, { id: '123', name: '更新后的数据', value: 100 })}
          />

          <RequestPlayground
            title="DELETE 请求"
            description="删除数据，通过 query 参数指定资源 ID"
            method="DELETE"
            endpoint="/api/example/request/methods?id=123"
            requestFn={() => Controller.deleteExample(httpClient, '123')}
          />

          <RequestPlayground
            title="PATCH 请求"
            description="部分更新，只修改指定字段"
            method="PATCH"
            endpoint="/api/example/request/methods"
            requestFn={() => Controller.patchExample(httpClient, { name: '仅更新名称' })}
          />
        </div>
      </div>
    </DemoWrapper>
  )
}
