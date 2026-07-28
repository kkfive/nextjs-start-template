'use client'

import type { TechStackItem } from '@/lib/tech-stack'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { AtmosphereLayer } from '@/components/atmosphere/atmosphere-layer'
import { HeroSection } from './hero-section'

type HomePageClientProps = {
  techStack: TechStackItem[]
}

const capabilities = [
  {
    no: '01',
    title: 'Feature-first 边界',
    description: '业务能力按 feature 聚合，app 层只负责组合路由与入口，让目录本身就是协作协议。',
    href: '/demo',
  },
  {
    no: '02',
    title: '类型安全数据层',
    description: 'ky HTTP、Zod 响应校验与 React Query hooks 形成清晰分层，请求与 UI 自然解耦。',
    href: '/demo/request/basic',
  },
  {
    no: '03',
    title: '双实例运行时',
    description: 'client-only / server-only 文件级边界，把运行时差异变成结构而不是组件内部判断。',
    href: '/demo/request/config',
  },
  {
    no: '04',
    title: '测试基建就绪',
    description: 'Vitest + MSW 预置完成，组件、状态与请求回归从第一天开始可验证。',
    href: '/demo/forms/form-validation',
  },
  {
    no: '05',
    title: '类型化 RPC 通道',
    description: 'hc<AppType> 直连 Hono 服务，前后端接口同步演进，减少契约漂移。',
    href: '/demo/rpc',
  },
  {
    no: '06',
    title: '主题化视觉系统',
    description: 'CSS Variables 主题 token、亮暗模式与五套预置主题统一驱动，换肤只需调整 token，无需改动组件结构。',
    href: '/demo/ui/color-palette',
  },
]

const workflowSteps = [
  {
    no: 'A1',
    title: '定义 feature',
    description: '先在 feature 内落位视图、数据与模型，再决定哪些能力需要共享。',
  },
  {
    no: 'A2',
    title: '组合路由',
    description: 'App Router 只暴露稳定入口，让路由成为最薄的一层组合代码。',
  },
  {
    no: 'A3',
    title: '接入 service',
    description: '浏览器与服务端实例分离，读取环境能力时不污染 UI 组件实现。',
  },
  {
    no: 'A4',
    title: '测试收口',
    description: '用纯逻辑测试与组件行为测试关闭回归，让模板从示例升级为可复用基础设施。',
  },
]

const demoLinks = [
  { label: 'HTTP Playground', href: '/demo/request/basic', note: '请求层与错误语义' },
  { label: 'Adaptive Footer', href: '/demo/ui/adaptive-footer', note: '数据驱动布局' },
  { label: 'Color Palette', href: '/demo/ui/color-palette', note: '主题 token 与亮暗模式' },
  { label: 'Zustand Mouse', href: '/demo/state/zustand-mouse', note: '轻量状态演示' },
]

const quickStartSteps = [
  {
    command: 'git clone https://github.com/kkfive/nextjs-start-template.git my-project',
    note: '克隆模板仓库',
  },
  {
    command: 'cd my-project && pnpm install',
    note: '安装依赖（pnpm workspace）',
  },
  {
    command: 'pnpm dev',
    note: '启动全部应用（Turborepo 并行）',
  },
]

function SectionHeading({ number, label, description }: { number: string, label: string, description: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="meta-mono text-accent">{number}</span>
          <span className="h-px w-10 bg-border/70" aria-hidden />
          <span className="meta-mono text-muted-foreground">STARTER SYSTEM</span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:mt-3 sm:text-[2rem]">{label}</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function CapabilityCell({ item, index }: { item: typeof capabilities[0], index: number }) {
  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/78 p-4 shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-soft sm:p-6"
    >
      <div aria-hidden className="luminous-divider pointer-events-none absolute inset-x-8 top-0 h-px opacity-70" />
      <span className="meta-mono text-muted-foreground">{item.no}</span>
      <h3 className="mt-2 text-lg font-semibold tracking-tight sm:mt-4">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3">{item.description}</p>
      <Link href={item.href} className="link-underline mt-1 inline-flex min-h-11 w-fit items-center font-mono text-xs tracking-wide text-foreground sm:mt-3">
        查看演示 →
      </Link>
    </motion.article>
  )
}

function WorkflowStep({ step, index }: { step: typeof workflowSteps[0], index: number }) {
  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.05 }}
      className="rounded-3xl border border-border/60 bg-card/76 p-4 shadow-soft-sm sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="meta-mono text-accent">{step.no}</span>
        <h3 className="text-base font-semibold">{step.title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3">{step.description}</p>
    </motion.article>
  )
}

function CommandRow({ step, index }: { step: typeof quickStartSteps[0], index: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(step.command)
    setCopied(true)
    setTimeout(setCopied, 2000, false)
  }

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.18, ease: 'easeOut', delay: index * 0.06 }}
      className="group flex flex-wrap items-center gap-3 rounded-[1.35rem] border border-border/60 bg-card/78 p-4 shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft sm:px-5"
    >
      <span className="meta-mono shrink-0 text-accent">$</span>
      <code className="min-w-0 flex-1 font-mono text-sm break-all">{step.command}</code>
      <span className="text-xs text-muted-foreground">{step.note}</span>
      <button
        onClick={handleCopy}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-border/70 px-4 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label={copied ? '已复制' : '复制命令'}
      >
        {copied ? 'OK' : 'COPY'}
      </button>
    </motion.div>
  )
}

export function HomePageClient({ techStack }: HomePageClientProps) {
  return (
    <>
      <HeroSection />

      <section className="px-4 py-10 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-300">
          <SectionHeading
            number="01"
            label="能力索引"
            description="六项能力对应模板的核心分层，每项都附有可运行的演示入口，验证后再决定是否保留。"
          />
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((item, index) => (
              <CapabilityCell key={item.no} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-300">
          <div className="relative overflow-hidden rounded-4xl border border-border/60 bg-canvas/88 px-4 py-6 shadow-soft sm:px-8 sm:py-10">
            <AtmosphereLayer intensity="quiet" gridInset="inset-x-[14%] top-[12%] bottom-[18%]" />
            <div className="relative">
              <SectionHeading
                number="02"
                label="工作流程与架构视图"
                description="从定义 feature 到测试收口的四步工作流，配合目录结构视图，说明每层代码的落位规则与依赖方向。"
              />
              <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.6rem] border border-border/60 bg-card/78 p-4 shadow-soft-sm sm:p-5">
                  <div className="overflow-hidden rounded-[1.35rem] border border-border/50 bg-[#11151d] text-[#edf2ff] shadow-soft-sm">
                    <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                      <span className="size-2.5 rounded-full bg-[#ff8768]" />
                      <span className="size-2.5 rounded-full bg-[#ffd86b]" />
                      <span className="size-2.5 rounded-full bg-[#5fd2a5]" />
                      <span className="meta-mono ml-2 text-white/45">route / feature / service</span>
                    </div>
                    <pre className="scrollbar-thin overflow-x-auto p-4 font-mono text-[12px] leading-5.5 text-white/82 sm:leading-6">
                      <code>
                        {`src/
├── app/          # 只组合路由与 metadata
├── features/     # 视图 + 数据层 + 模型
├── service/      # HTTP / RPC / SSE 运行时实例
├── components/   # 共享 UI 与 provider
└── styles/       # token 与全局样式`}
                      </code>
                    </pre>
                  </div>
                  <div className="mt-4 rounded-[1.35rem] border border-border/55 bg-background/68 p-4">
                    <p className="meta-mono text-muted-foreground">structure note</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">目录即协议：app 只组合路由，feature 承载业务，service 隔离运行时差异，components 与 styles 提供共享基础。</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  {workflowSteps.map((step, index) => (
                    <WorkflowStep key={step.no} step={step} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-300">
          <SectionHeading
            number="03"
            label="Demo 导览"
            description="四个代表性演示分别对应请求层、数据驱动布局、主题 token 与状态管理，可直接跳转到真实页面逐项验证。"
          />
          <div className="overflow-hidden rounded-[1.8rem] border border-border/60 bg-card/76 px-4 py-3 shadow-soft-sm sm:px-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
              {demoLinks.map(link => (
                <Link key={link.href} href={link.href} className="group flex min-h-11 items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-colors hover:bg-muted/60 sm:py-3 lg:flex-1">
                  <span>
                    <span className="block font-medium">{link.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{link.note}</span>
                  </span>
                  <span className="meta-mono text-accent transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04→05 共享 quiet 环境场：同一承载层跨越 04 尾部与区间留白延续至 05，顶部淡入，无明确起点与边界。 */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[30%] bottom-0">
          <AtmosphereLayer intensity="quiet" fade gridInset="inset-x-[12%] top-[10%] bottom-[8%]" />
        </div>

        <section className="relative px-4 pb-10 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-300">
            <SectionHeading
              number="04"
              label="快速开始"
              description="命令、技术栈与职责映射保持在同一节奏中，方便从浏览过渡到真正启动项目。"
            />
            <div className="space-y-3">
              {quickStartSteps.map((step, index) => (
                <CommandRow key={step.command} step={step} index={index} />
              ))}
            </div>
            {techStack.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-border/60 bg-card/76 shadow-soft-sm sm:mt-10">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border/70">
                        <th className="meta-mono px-4 py-3 font-normal text-muted-foreground sm:px-5 sm:py-4">TECHNOLOGY</th>
                        <th className="meta-mono px-4 py-3 font-normal text-muted-foreground sm:px-5 sm:py-4">ROLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {techStack.map((tech, index) => (
                        <tr key={tech.technology} className={index < techStack.length - 1 ? 'border-b border-border/60' : ''}>
                          <td className="px-4 py-3 font-mono text-sm sm:px-5 sm:py-4">{tech.technology}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground sm:px-5 sm:py-4">{tech.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-300">
            <div className="relative overflow-hidden rounded-4xl border border-transparent px-6 py-8 text-center sm:px-10 sm:py-12">
              <p className="meta-mono text-muted-foreground">05 · ENTER THE DEMO</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">看完工程结构，就到真实页面里逐项验证。</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">每个演示对应一个真实 feature 模块，覆盖请求、状态、表单、RPC 与主题 token，验证过的能力可直接复用到业务代码。</p>
              <Link href="/demo" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-border/60 bg-card/72 px-6 font-mono text-sm shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft sm:mt-8">进入 Demo →</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
