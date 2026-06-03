'use client'

import type { TechStackItem } from '@/lib/tech-stack'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  LucideArrowRight,
  LucideCheck,
  LucideCode2,
  LucideCopy,
  LucideCpu,
  LucideGitBranch,
  LucideGithub,
  LucideLayers,
  LucideRocket,
  LucideTerminal,
  LucideZap,
} from '@/components/ui/icon'
import { HeroSection } from './hero-section'

type HomePageClientProps = {
  techStack: TechStackItem[]
}

const features = [
  {
    icon: LucideLayers,
    title: '三层架构',
    description: 'Domain / 应用 / UI 严格分层，依赖方向清晰可控。业务逻辑与框架解耦，便于测试和维护。',
    href: '/demo',
  },
  {
    icon: LucideCode2,
    title: 'TypeScript 优先',
    description: '完整的类型系统，开发时即可获得类型安全保证。',
    href: '/demo',
  },
  {
    icon: LucideZap,
    title: '现代化工具链',
    description: 'Tailwind CSS 4 + TanStack Query + Zustand + Vitest',
    href: '/demo',
  },
  {
    icon: LucideCpu,
    title: 'Server Components',
    description: '默认 Server Component，按需使用 Client Component',
    href: '/demo',
  },
  {
    icon: LucideGitBranch,
    title: '规范约束',
    description: 'ESLint + commitlint + 代码分层校验',
    href: '/demo',
  },
  {
    icon: LucideRocket,
    title: '快速启动',
    description: '预置基础设施，接入业务即可开始开发',
    href: '/demo',
  },
]

const quickStartSteps = [
  {
    step: 1,
    title: '克隆模板',
    code: 'git clone https://github.com/kkfive/nextjs-start-template.git my-project',
  },
  {
    step: 2,
    title: '安装依赖',
    code: 'cd my-project && pnpm install',
  },
  {
    step: 3,
    title: '启动开发',
    code: 'pnpm dev',
  },
]

const architectureCode = `// domain/example/service.ts
export const exampleService = {
  getList: async (http: HttpService, query?: ListQuery) => {
    return http.get('/api/list', { params: query })
  },

  create: async (http: HttpService, data: CreateData) => {
    return http.post('/api/create', data)
  },
}

// 纯数据获取，零框架依赖`

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const Icon = feature.icon
  return (
    <motion.div
      variants={itemVariants}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-all duration-300 group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      <div className="mt-4 flex items-center text-sm font-medium text-primary transition-all group-hover:gap-1">
        <span>查看示例</span>
        <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.div>
  )
}

function StepCard({ step, index }: { step: typeof quickStartSteps[0], index: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(step.code)
    setCopied(true)
    setTimeout(setCopied, 2000, false)
  }

  return (
    <motion.div
      variants={itemVariants}
      className="relative"
    >
      <div className="flex gap-6">
        {/* Node */}
        <div className="relative flex flex-col items-center">
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-lg">
            {step.step}
          </div>
          {index < quickStartSteps.length - 1 && (
            <div className="mt-2 w-px flex-1 bg-border" />
          )}
        </div>
        {/* Content */}
        <div className="flex-1 pb-10">
          <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
          <div className="relative flex items-center rounded-xl bg-[oklch(0.12_0.03_270)] p-4">
            <code className="flex-1 font-mono text-sm text-[oklch(0.85_0.03_270)]">
              {step.code}
            </code>
            <button
              onClick={handleCopy}
              className="ml-3 rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
              title="复制"
            >
              {copied ? <LucideCheck className="size-4" /> : <LucideCopy className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HomePageClient({ techStack }: HomePageClientProps) {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Tech Stack Marquee */}
      {techStack.length > 0 && (
        <section className="overflow-hidden border-y border-border/40 py-8">
          <div className="flex animate-[scroll_30s_linear_infinite] gap-8 whitespace-nowrap">
            {[...techStack, ...techStack].map((tech, index) => (
              <span
                key={`${tech.technology}-${index}`}
                className="inline-flex items-center rounded-full border border-border/50 bg-secondary/40 px-4 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {tech.technology}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              核心特性
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              精心设计的工程化方案，覆盖现代前端开发的关键环节
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map(feature => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="bg-[oklch(0.12_0.03_270)] px-6 py-32 text-[oklch(0.92_0.01_270)]">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              领域驱动三层架构
            </h2>
            <p className="mb-8 text-lg text-[oklch(0.7_0.02_270)]">
              清晰的分层架构，让业务逻辑与 UI 框架解耦，代码更易测试、维护和演进。
            </p>
            <ul className="space-y-4">
              {[
                'Domain 层：纯业务逻辑，零框架依赖',
                '应用层：基础设施与状态管理',
                'UI 层：组件与页面，专注呈现',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <LucideCheck className="size-3 text-primary" />
                  </div>
                  <span className="text-[oklch(0.8_0.015_270)]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.08_0.02_270)] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                <div className="size-3 rounded-full bg-[#ff5f56]" />
                <div className="size-3 rounded-full bg-[#ffbd2e]" />
                <div className="size-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 font-mono text-xs text-white/40">domain/example/service.ts</span>
              </div>
              <div className="p-5">
                <pre className="font-mono text-sm leading-relaxed">
                  <code className="text-[oklch(0.85_0.03_270)]">
                    {architectureCode.split('\n').map((line, i) => (
                      <div key={i}>
                        {line.startsWith('//')
                          ? (
                              <span className="text-white/30">{line}</span>
                            )
                          : line.includes('//')
                            ? (
                                <>
                                  <span className="text-[oklch(0.6_0.12_270)]">{line.split('//')[0]}</span>
                                  <span className="text-white/30">
                                    //
                                    {line.split('//')[1]}
                                  </span>
                                </>
                              )
                            : (
                                <span>{line}</span>
                              )}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              快速开始
            </h2>
            <p className="text-muted-foreground">
              三步即可启动你的项目
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {quickStartSteps.map((step, index) => (
              <StepCard key={step.step} step={step} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-6 py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(to bottom, oklch(from var(--text-primary) l c h / 0.03), oklch(from var(--action-accent) l c h / 0.03))',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            开始你的下一个项目
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            基于这个模板，专注于业务逻辑而非基础设施搭建
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/15" asChild>
              <Link href="/demo">
                <LucideTerminal className="size-4" />
                查看演示
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 rounded-xl" asChild>
              <Link
                href="https://github.com/kkfive/nextjs-start-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LucideGithub className="size-4" />
                GitHub
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  )
}
