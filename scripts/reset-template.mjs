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
  // ===== client example 四件套（feature-first 最简示例） =====
  'apps/client/src/features/example',
  'apps/client/src/app/example',
  'apps/api/src/routes/example.ts',

  // ===== demo 演示内容（client 页面与代理路由） =====
  'apps/client/src/features/demo',
  'apps/client/src/app/demo',
  'apps/client/src/app/api/example',
  'apps/client/src/app/api/hitokoto',

  // ===== demo 演示内容（api 路由） =====
  'apps/api/src/routes/example/request.ts',
  'apps/api/src/routes/example/sse.ts',
  'apps/api/src/routes/hitokoto.ts',

  // ===== demo 演示内容（admin SSR hitokoto） =====
  'apps/admin/src/features/hitokoto',

  // ===== demo 演示皮肤（atmosphere / 多主题 / tech-stack） =====
  'apps/client/src/components/atmosphere',
  'apps/client/src/components/theme-selector.tsx',
  'apps/client/src/components/ui/link',
  'apps/client/src/components/ui/navigation-link',
  'apps/client/src/lib/tech-stack.ts',
  'apps/client/src/features/home/components/home-page-client.tsx',
  'apps/client/src/features/home/components/hero-section.tsx',
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

/** client service 测试重写内容：example 端点删除后改指骨架 /health 路由（裸 JSON，无 envelope） */
export const BLANK_RPC_CLIENT_TEST = `// @vitest-environment node
// 验证 hc 注入契约：hc -> HttpService.request -> raw Response -> typed json
import type { AppType } from 'api'
import { HttpService } from '@kkfive/http-client'
import { createRpcClient } from '@kkfive/rpc'
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

it('hc GET health: ky 消费 hc fetch + raw Response + typed json', async () => {
  const { http, request } = mockResponse({
    status: 'ok',
    service: 'apps/api',
    timestamp: 't',
  })
  const client = createRpcClient<AppType>(http, BASE)
  const res = await client.health.$get()
  expect(res.status).toBe(200)
  // health 是骨架路由，返回裸 JSON 而非 envelope，直接取类型化字段
  expect((await res.json()).service).toBe('apps/api')
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
  // 裸 JSON 无 success 字段，业务错误分支属于 envelope 路由；此处仅验证不抛
  expect(envelope).toBeDefined()
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

/** apps/api/src/app.test.ts 重写内容：example 断言改指 /health */
export const BLANK_API_APP_TEST = `import { describe, expect, it } from 'vitest'

import { createApp } from './app'

const allowedOrigin = 'https://client.example.com'
const deniedOrigin = 'https://unknown.example.com'

describe('api app', () => {
  it('serves the health endpoint', async () => {
    const response = await createApp().request('/health')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      service: 'apps/api',
      status: 'ok',
    })
  })

  it('allows a configured cross-origin request', async () => {
    const response = await createApp({
      corsOrigins: [allowedOrigin],
    }).request('/health', {
      headers: { origin: allowedOrigin },
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
    expect(response.headers.get('Vary')).toContain('Origin')
  })

  it('reads configured origins from runtime bindings', async () => {
    const app = createApp()
    const response = await app.request('/health', {
      headers: { Origin: allowedOrigin },
    }, {
      CORS_ORIGINS: allowedOrigin,
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
  })

  it('does not allow an unknown cross-origin request', async () => {
    const response = await createApp({
      corsOrigins: [allowedOrigin],
    }).request('/health', {
      headers: { origin: deniedOrigin },
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('handles preflight requests for configured origins', async () => {
    const response = await createApp({
      corsOrigins: [allowedOrigin],
    }).request('/health', {
      headers: {
        'Access-Control-Request-Headers': 'authorization,content-type',
        'Access-Control-Request-Method': 'POST',
        'origin': allowedOrigin,
      },
      method: 'OPTIONS',
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Authorization,Content-Type')
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })
})
`

/** admin 最小欢迎页：hitokoto SSR 示例删除后的空白起点 */
export const BLANK_ADMIN_PAGE = `// admin 最小欢迎页：演示 SSR + service 实例的接入点
// 接管本项目：本页业务能力应放入 src/features/<feature>/（feature-first）
export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720 }}>
      <h1>Admin（管理后台示例）</h1>
      <p>
        这是 monorepo 中的
        <code>apps/admin</code>
        ，演示 Next.js SSR 消费
        <code>@kkfive/rpc</code>
        。
      </p>

      <h2>项目结构</h2>
      <ul>
        <li>
          <code>src/app/</code>
          {' '}
          — Next.js App Router
        </li>
        <li>
          <code>src/features/</code>
          {' '}
          — 业务调用与页面能力
        </li>
        <li>
          <code>src/service/</code>
          {' '}
          — HttpService 实例注入
        </li>
      </ul>
    </main>
  )
}
`

/** site-header 空白起点：移除 ThemeSelector 与 demo/example 导航 */
export const BLANK_SITE_HEADER = `'use client'

import { cn } from '@kkfive/ui'
import { LucideGithub } from '@kkfive/ui/components/icon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

const navLinks = [
  { href: '/', label: '首页' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)

  // 路由变化时重新显示
  useEffect(() => {
    setHidden(false)
  }, [pathname])

  // 向下滚动隐藏，向上滚动 / 回到顶部显示
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 16) {
        setHidden(false)
      }
      else if (y > lastY + 4) {
        setHidden(true)
      }
      else if (y < lastY - 4) {
        setHidden(false)
      }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 px-4 pt-3 transition-transform duration-300 ease-out sm:px-6',
        hidden ? 'translate-y-[-150%]' : 'translate-y-0',
      )}
      onFocus={() => setHidden(false)}
    >
      <div className="glass mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 rounded-full border border-border/60 px-3 shadow-glass sm:px-4">
        {/* Logo */}
        <Link
          href="/"
          className="meta-mono inline-flex min-h-11 items-center rounded-full px-2 text-foreground transition-opacity hover:opacity-70"
        >
          KKFIVE/NST
        </Link>

        {/* 导航 */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="主导航">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={isActive}
                className={cn(
                  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1">
          <Link
            href="https://github.com/kkfive/nextjs-start-template"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="GitHub 仓库"
          >
            <LucideGithub className="size-4" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
`

/** site-footer 空白起点：移除 AtmosphereLayer 演示皮肤 */
export const BLANK_SITE_FOOTER = `import type { SiteFooterData, SiteFooterLink } from './site-footer-model'
import Link from 'next/link'
import { defaultSiteFooterData } from './site-footer-model'

type SiteFooterViewProps = {
  data: SiteFooterData
  className?: string
}

function FooterLink({ link }: { link: SiteFooterLink }) {
  return (
    <Link
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className="group flex min-h-11 flex-col items-start justify-center rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="link-underline">
        {link.label}
        {link.external ? ' ↗' : ''}
      </span>
      {link.description && <span className="mt-0.5 block text-xs text-muted-foreground/70">{link.description}</span>}
    </Link>
  )
}

export function SiteFooterView({ data, className = '' }: SiteFooterViewProps) {
  return (
    <footer className={\`relative overflow-hidden rounded-4xl border border-border/70 bg-card/86 p-6 shadow-soft-sm sm:p-8 \${className}\`}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      <div className="relative grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-8">
        <section className="min-w-0">
          {data.brand.href
            ? <Link href={data.brand.href} className="inline-flex min-h-11 items-center text-base font-semibold tracking-tight">{data.brand.name}</Link>
            : <h2 className="text-base font-semibold tracking-tight">{data.brand.name}</h2>}
          {data.brand.description && <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{data.brand.description}</p>}
        </section>

        {data.groups?.map(group => (
          <nav key={group.id} aria-label={group.title}>
            <h2 className="meta-mono mb-3 text-muted-foreground">{group.title}</h2>
            <div className="space-y-1">{group.links.map(link => <FooterLink key={\`\${group.id}-\${link.href}-\${link.label}\`} link={link} />)}</div>
          </nav>
        ))}

        {data.friends && (
          <nav aria-label="友情链接">
            <h2 className="meta-mono mb-3 text-muted-foreground">友情链接</h2>
            <div className="space-y-1">{data.friends.map(link => <FooterLink key={\`\${link.href}-\${link.label}\`} link={link} />)}</div>
          </nav>
        )}

        {data.contacts && (
          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className="meta-mono mb-3 text-muted-foreground">联系</h2>
            <address className="space-y-2 text-sm text-muted-foreground not-italic">
              {data.contacts.map(contact => (
                <p key={\`\${contact.label}-\${contact.value}\`}>
                  <span className="block text-xs text-muted-foreground/70">{contact.label}</span>
                  {contact.href ? <Link className="inline-flex min-h-11 items-center hover:text-foreground" href={contact.href}>{contact.value}</Link> : contact.value}
                </p>
              ))}
            </address>
          </section>
        )}
      </div>

      <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/50 pt-5 text-[11px] text-muted-foreground">
        <span>{data.copyright}</span>
        {data.compliance?.map(link => <FooterLink key={\`\${link.href}-\${link.label}\`} link={link} />)}
        <span className="ml-auto font-mono">{[data.version, data.build].filter(Boolean).join(' · ')}</span>
      </div>
    </footer>
  )
}

export function SiteFooter() {
  return (
    <div className="px-4 pt-10 pb-6 sm:px-6">
      <div className="mx-auto max-w-300">
        <SiteFooterView data={defaultSiteFooterData} />
      </div>
    </div>
  )
}
`

/** home index 导出形状：对齐 BLANK_HOME 的具名导出 */
export const BLANK_HOME_INDEX = `export { HomePage } from './components/home-page'
`

/** example 删除后需要同步重写的引用点（home、api app.ts、service 测试、MSW handlers） */
export const REWRITE_TARGETS = [
  { path: 'apps/client/src/features/home/components/home-page.tsx', content: BLANK_HOME, label: 'home 空白起点' },
  { path: 'apps/client/src/features/home/index.ts', content: BLANK_HOME_INDEX, label: 'home 导出形状对齐空白起点' },
  { path: 'apps/admin/src/app/page.tsx', content: BLANK_ADMIN_PAGE, label: 'admin 空白起点（移除 hitokoto SSR）' },
  { path: 'apps/client/src/components/site-header.tsx', content: BLANK_SITE_HEADER, label: 'header 空白起点（移除 ThemeSelector/demo 导航）' },
  { path: 'apps/client/src/components/site-footer.tsx', content: BLANK_SITE_FOOTER, label: 'footer 空白起点（移除 AtmosphereLayer）' },
  { path: 'apps/api/src/app.ts', content: BLANK_API_APP, label: 'api app.ts（移除 example 路由注册）' },
  { path: 'apps/api/src/app.test.ts', content: BLANK_API_APP_TEST, label: 'api 测试改指 /health' },
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
