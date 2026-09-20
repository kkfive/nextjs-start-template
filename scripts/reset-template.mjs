#!/usr/bin/env node
/**
 * pnpm reset —— 模板剥离脚本。
 *
 * 删除最简示例（example 四件套），重写引用点为空白起点，
 * 然后运行 pnpm verify 自校验。幂等：清单内已不存在的路径直接跳过。
 *
 * 用法：pnpm reset [--skip-verify]
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * 模板示例清单：删除点全部收敛于此。
 * 新增示例内容时同步维护本清单；reset-template.test.ts 守护清单不腐烂。
 */
export const TEMPLATE_EXAMPLES = [
  // client feature 四件套
  'apps/client/src/features/example',
  // 路由组合入口
  'apps/client/src/app/example',
  // api 示例端点
  'apps/api/src/routes/example.ts',
]

/** home 重写为空白起点的最小内容 */
export const BLANK_HOME = `// 空白起点。接管本项目：直接改写本文件开始开发。
export function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">My Project</h1>
    </main>
  )
}
`

/** apps/api/src/app.ts 重写内容：移除 example 路由注册，保留类型链源头 */
export const BLANK_API_APP = `import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { createCorsMiddleware, readCorsOrigins } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { healthRoutes } from './routes/health'

export type AppOptions = {
  corsOrigins?: readonly string[]
}

// 单链式表达式：让 typeof app 累积路由类型，hc<AppType> 才能推导出 typed client
export function createApp(options: AppOptions = {}) {
  return new Hono()
    .use('*', createCorsMiddleware(
      options.corsOrigins ?? [],
      context => readCorsOrigins(context),
    ))
    .use('*', logger())
    .onError(errorHandler)
    .route('/health', healthRoutes)
}

const app = createApp()

/**
 * 前端 hc<AppType> 的类型链源头（type-only 消费，不引入运行时）。
 *
 * 本文件保持纯净（不含 process 等运行时副作用），便于跨包 type-only 消费。
 */
export type AppType = typeof app

export default app
`

/** client service 测试重写内容：example 端点删除后改指骨架 /health 路由 */
export const BLANK_RPC_CLIENT_TEST = `// @vitest-environment node
// 验证 hc 注入契约：hc -> HttpService.request -> raw Response -> unwrapData
import type { AppType } from 'api'
import { BusinessError, HttpService } from '@kkfive/http-client'
import { createRpcClient, unwrapData } from '@kkfive/rpc'
import { expect, it, vi } from 'vitest'

const BASE = 'http://localhost:8787'

function mockResponse(body: unknown) {
  const http = new HttpService()
  const request = vi.spyOn(http.instance, 'request').mockImplementation(() => Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  ) as never)
  return { http, request }
}

it('hc GET health: ky 消费 hc fetch + raw Response + unwrapData', async () => {
  const { http, request } = mockResponse({
    status: 'ok',
    service: 'apps/api',
  })
  const client = createRpcClient<AppType>(http, BASE)
  const res = await client.health.$get()
  expect(res.status).toBe(200)
  expect(unwrapData(await res.json()).service).toBe('apps/api')
  expect(request).toHaveBeenCalledWith(
    '/health',
    expect.objectContaining({
      prefix: BASE,
      responseParser: { responseReturn: 'raw' },
    }),
  )
})

it('hc business-error: envelope success:false 抛 BusinessError', async () => {
  const { http } = mockResponse({
    success: false,
    code: 10086,
    message: '业务错误',
    data: null,
    errorShowType: 1,
    requestId: 'r',
    timestamp: 't',
  })
  const client = createRpcClient<AppType>(http, BASE)
  const res = await client.health.$get()
  const envelope = await res.json()
  if ('error' in envelope) {
    throw new Error('mock 响应不应命中 zod 解析错误分支')
  }
  expect(() => unwrapData(envelope)).toThrow(BusinessError)
})
`

export const BLANK_HTTP_CLIENT_TEST = `import { HttpResponse, http as mswHttp } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TEST_BASE_URL } from '@/__tests__/mocks/handlers'
import { server } from '@/__tests__/mocks/server'

describe('client http service', () => {
  beforeAll(() => server.listen())

  afterEach(() => {
    server.resetHandlers()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterAll(() => server.close())

  it('should let retryable HTTP errors retry before converting to BusinessError', async () => {
    let requestCount = 0
    server.use(
      mswHttp.get(\`\${TEST_BASE_URL}/api/health\`, () => {
        requestCount += 1

        if (requestCount === 1) {
          return HttpResponse.json(
            { success: false, code: 500, message: 'Retry me', data: null },
            { status: 500 },
          )
        }

        return HttpResponse.json({
          success: true,
          data: { status: 'ok' },
        })
      }),
    )
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8787')
    vi.stubEnv('SKIP_ENV_VALIDATION', 'true')

    const { httpClient } = await import('./http-client')
    const result = await httpClient.get('/api/health', { retry: 1 })

    expect(requestCount).toBe(2)
    expect(result).toEqual({
      success: true,
      data: { status: 'ok' },
    })
  })
})
`

export const BLANK_HANDLERS = `import { http, HttpResponse } from 'msw'

// 测试环境的基础 URL
export const TEST_BASE_URL = 'http://localhost:3000'

/**
 * MSW 请求处理器，用于模拟 API 端点
 *
 * @example
 * \`\`\`ts
 * // 添加新的处理器
 * handlers.push(
 *   http.get('/api/users', () => {
 *     return HttpResponse.json([{ id: 1, name: 'John' }])
 *   })
 * )
 * \`\`\`
 */
export const handlers = [
  // 示例：模拟 health 端点（对应 apps/api 的 GET /health）
  http.get(\`\${TEST_BASE_URL}/api/health\`, () => {
    return HttpResponse.json({
      success: true,
      data: { status: 'ok' },
    })
  }),
]
`

/** example 删除后需要同步重写的引用点（home、api app.ts、service 测试、MSW handlers） */
export const REWRITE_TARGETS = [
  { path: 'apps/client/src/features/home/components/home-page.tsx', content: BLANK_HOME, label: 'home 空白起点' },
  { path: 'apps/api/src/app.ts', content: BLANK_API_APP, label: 'api app.ts（移除 example 路由注册）' },
  { path: 'apps/client/src/service/rpc-client.test.ts', content: BLANK_RPC_CLIENT_TEST, label: 'rpc 测试改指 /health' },
  { path: 'apps/client/src/service/http-client.test.ts', content: BLANK_HTTP_CLIENT_TEST, label: 'http 测试改指 /health' },
  { path: 'apps/client/src/__tests__/mocks/handlers.ts', content: BLANK_HANDLERS, label: 'MSW handlers 最小集' },
]

export async function resetTemplate({ log = () => {} } = {}) {
  let removed = 0
  for (const relativePath of TEMPLATE_EXAMPLES) {
    const target = path.join(repoRoot, relativePath)
    if (!fs.existsSync(target)) {
      log(`  skip（不存在）: ${relativePath}`)
      continue
    }
    fs.rmSync(target, { recursive: true, force: true })
    removed++
    log(`  removed: ${relativePath}`)
  }

  // 重写引用点：home 空白起点 + api app.ts 移除 example 注册 + service 测试改指 /health
  for (const { path: relativePath, content, label } of REWRITE_TARGETS) {
    const target = path.join(repoRoot, relativePath)
    fs.writeFileSync(target, content)
    log(`  rewritten: ${relativePath}（${label}）`)
  }

  log(`\nreset 完成：删除 ${removed} 项，重写 ${REWRITE_TARGETS.length} 个引用点。`)
  return { removed, rewritten: REWRITE_TARGETS.length }
}

async function main() {
  const skipVerify = process.argv.includes('--skip-verify')

  await resetTemplate({ log: console.log })

  if (!skipVerify) {
    console.log('\n运行 pnpm verify 自校验…')
    try {
      execSync('pnpm verify', { cwd: repoRoot, stdio: 'inherit' })
      console.log('\n✓ verify 通过：模板剥离完成，可以开始开发。')
    }
    catch {
      console.error('\n✗ verify 失败：存在残留引用，按上方输出定位清理后重试。')
      process.exit(1)
    }
  }
}

// 直接执行时运行；被测试导入时不自动执行
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
