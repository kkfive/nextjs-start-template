'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  LucideGithub,
  LucideTerminal,
} from '@/components/ui/icon'

const codeContent = `├── domain/              # 业务逻辑层
│   └── {module}/
│       ├── const/       # API 常量
│       ├── type.d.ts    # 类型定义
│       ├── service.ts   # 纯数据获取
│       ├── controller.ts
│       └── hooks.ts     # React Query
├── src/
│   ├── app/             # 页面路由
│   ├── components/
│   │   ├── ui/          # 基础 UI
│   │   └── domain/      # 领域组件
│   ├── lib/             # 基础设施
│   └── hooks/
└── ...`

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: 'var(--gradient-hero)' }}
      />
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(var(--text-default) 1px, transparent 1px), linear-gradient(90deg, var(--text-default) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        {/* Left: Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Next.js 16 + React 19 + TypeScript 5.9
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-[5rem] lg:leading-[1.1]"
          >
            <span className="gradient-text">Next.js Start</span>
            <br />
            <span className="text-foreground">Template</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
          >
            现代化 Next.js 启动模板，采用领域驱动三层架构，
            集成完整的前端工程化方案，助你快速启动项目
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row"
          >
            <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/15" asChild>
              <Link href="/demo">
                <LucideTerminal className="size-4" />
                查看演示
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl backdrop-blur-sm"
              asChild
            >
              <Link
                href="https://github.com/kkfive/nextjs-start-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LucideGithub className="size-4" />
                GitHub
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Right: Code Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.12_0.03_270)] shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <div className="size-3 rounded-full bg-[#ff5f56]" />
              <div className="size-3 rounded-full bg-[#ffbd2e]" />
              <div className="size-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-mono text-xs text-white/40">project-structure</span>
            </div>
            {/* Code content */}
            <div className="p-5">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="text-[oklch(0.85_0.03_270)]">
                  {codeContent.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="mr-3 w-6 text-right text-white/20 select-none">
                        {i + 1}
                      </span>
                      <span>
                        {line.includes('#')
                          ? (
                              <>
                                <span className="text-white/60">{line.split('#')[0]}</span>
                                <span className="text-white/30">
                                  #
                                  {line.split('#')[1]}
                                </span>
                              </>
                            )
                          : (
                              line
                            )}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
          {/* Decorative glow behind code */}
          <div
            className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl opacity-20 blur-2xl"
            style={{ background: 'var(--gradient-glow)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
