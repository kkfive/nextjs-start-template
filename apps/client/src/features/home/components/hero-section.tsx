'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AtmosphereLayer } from '@/components/atmosphere/atmosphere-layer'

const heroAnnotations = [
  { id: 'F-01', label: 'Workspace', text: 'pnpm workspace + Turborepo 管线就绪' },
  { id: 'F-02', label: 'Feature', text: 'Feature-first 结构保持业务边界清晰' },
  { id: 'F-03', label: 'Runtime', text: 'client-only / server-only 双实例隔离' },
  { id: 'F-04', label: 'Tests', text: 'Vitest + MSW 预置回归能力' },
]

const heroNotes = [
  { label: 'skin note', text: '当前页面的光晕与动效只是演示皮肤，可整体替换或移除，不影响目录边界、数据层与测试基建。' },
  { label: 'theme token', text: '导航、Footer 与 Demo 页面共享同一套主题 token，替换皮肤时只需调整 token 与组件样式。' },
]

export function HeroSection() {
  return (
    <section className="px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-330">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-border/60 bg-canvas/90 px-4 py-8 shadow-soft sm:px-8 sm:py-18 lg:px-10 lg:py-20">
          <AtmosphereLayer intensity="hero" gridInset="inset-x-[12%] top-[14%] bottom-[12%]" />
          <div className="relative grid gap-7 sm:gap-12 lg:grid-cols-[minmax(28rem,0.88fr)_minmax(0,1.12fr)] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <p className="meta-mono text-muted-foreground">NEXT.JS START TEMPLATE — ENGINEERING BASELINE — V0.1</p>
              <h1 className="leading-1.08 mt-4 max-w-2xl text-[clamp(2.25rem,10vw,3.75rem)] font-semibold tracking-[-0.045em] sm:mt-6 sm:text-[clamp(2.75rem,4.2vw,3.75rem)]">
                <span className="block lg:whitespace-nowrap">从工程基础设施开始，</span>
                <span className="block lg:whitespace-nowrap">而不是从空白开始。</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground sm:mt-6">
                一个把目录边界、数据层、测试与主题系统预先搭好的 Next.js 启动模板。
                Feature-first 结构、类型安全请求层与 Vitest 回归能力开箱即用，可直接在此基础上开始业务开发。
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-10">
                <Link href="/demo" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-mono text-sm tracking-wide text-primary-foreground shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft active:scale-98">进入演示</Link>
                <Link href="https://github.com/kkfive/nextjs-start-template" target="_blank" rel="noopener noreferrer" className="glass inline-flex min-h-11 items-center rounded-full border border-border/60 px-6 font-mono text-sm tracking-wide text-foreground shadow-soft-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft active:scale-98">GITHUB ↗</Link>
              </div>
            </motion.div>

            <motion.div
              className="min-w-0"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="relative overflow-hidden rounded-[1.9rem] border border-border/60 bg-card/72 p-3 shadow-glass backdrop-blur-md sm:p-5">
                <div aria-hidden className="luminous-divider pointer-events-none absolute inset-x-0 top-0 h-px" />
                <div className="relative overflow-hidden rounded-[1.55rem] bg-[#11151d] text-[#edf2ff] shadow-soft-sm">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/6 to-transparent" aria-hidden />
                  <div className="relative flex items-center gap-2 border-b border-white/8 px-4 py-3 sm:px-5">
                    <span className="size-2.5 rounded-full bg-[#ff8768]" />
                    <span className="size-2.5 rounded-full bg-[#ffd86b]" />
                    <span className="size-2.5 rounded-full bg-[#5fd2a5]" />
                    <span className="meta-mono ml-2 text-white/45">architecture.viewport.tsx</span>
                  </div>
                  <pre className="relative scrollbar-thin overflow-x-auto px-4 pt-3 pb-2 font-mono text-[12px] leading-5.5 text-white/82 sm:px-5 sm:pt-4 sm:leading-6">
                    <code>
                      {`app/                // route composition
features/home/      // sections + view logic
features/demo/      // visual demos
service/http-*      // client / server instances
components/         // shared UI + atmosphere
styles/tailwind.css // theme variables`}
                    </code>
                  </pre>
                  <p className="relative px-4 pb-3 font-mono text-[11px] tracking-wide text-white/45 sm:px-5 sm:pb-4">
                    route
                    {' '}
                    <span className="text-accent">→</span>
                    {' '}
                    feature
                    {' '}
                    <span className="text-accent">→</span>
                    {' '}
                    service
                    {' '}
                    <span className="text-accent">→</span>
                    {' '}
                    test
                  </p>
                  <div className="relative grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/8 p-3 sm:gap-x-6 sm:gap-y-4 sm:p-4 sm:px-5">
                    {heroAnnotations.map((annotation, index) => (
                      <motion.div
                        key={annotation.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut', delay: 0.18 + index * 0.05 }}
                      >
                        <p className="meta-mono text-white/38">
                          {annotation.id}
                          {' '}
                          ·
                          {annotation.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/64 sm:mt-1.5">{annotation.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-3 text-xs leading-5 text-muted-foreground sm:mt-4 sm:gap-2.5 sm:pt-4 lg:flex-row lg:gap-8">
                  {heroNotes.map(note => (
                    <p key={note.label}>
                      <span className="meta-mono text-foreground/75">{note.label}</span>
                      <span aria-hidden className="mx-2 text-border">/</span>
                      {note.text}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
