'use client'

import type { SiteFooterData } from '@/components/site-footer-model'
import { SiteFooterView } from '@/components/site-footer'
import { DemoWrapper } from '../../navigation/components/demo-wrapper'

const compact: SiteFooterData = {
  brand: { name: 'Luminous Field', description: '内容很少时，页脚自然保持紧凑。' },
  groups: [{ id: 'links', title: '链接', links: [{ label: '首页', href: '/' }] }],
  copyright: '© 2026 Luminous Field',
}

const rich: SiteFooterData = {
  brand: { name: 'Luminous Field', description: '结构化导航、友链、联系方式与合规信息，共享同一呈现组件。' },
  groups: [
    { id: 'product', title: '产品', links: [{ label: '演示', href: '/demo' }, { label: '色彩系统', href: '/demo/ui/color-palette' }] },
    { id: 'resources', title: '资源', links: [{ label: 'Next.js', href: 'https://nextjs.org', external: true }, { label: 'GitHub', href: 'https://github.com/kkfive/nextjs-start-template', external: true }] },
  ],
  friends: [{ label: 'Turborepo', href: 'https://turbo.build', external: true }],
  contacts: [{ label: '邮件', value: 'hello@example.com', href: 'mailto:hello@example.com' }],
  compliance: [{ label: '示例备案信息', href: '#' }],
  version: 'V1.4',
  build: 'BUILD 2026.07',
  copyright: '© 2026 Luminous Field',
}

const stress: SiteFooterData = {
  ...rich,
  brand: { name: 'A much longer luminous product identity', description: '较长文本、更多分组和不同长度的链接用于验证网格不依赖条目数量分支。' },
  groups: [
    ...(rich.groups ?? []),
    { id: 'company', title: '关于团队与社区', links: [{ label: '一段长度明显更长的团队介绍链接', href: '#' }, { label: '设计与工程协作原则', href: '#' }] },
    { id: 'legal', title: '合规', links: [{ label: '隐私政策', href: '#' }, { label: '服务条款与可访问性声明', href: '#' }] },
  ],
}

const footerStates = [
  { id: 'footer-compact', label: 'Compact' },
  { id: 'footer-rich', label: 'Rich' },
  { id: 'footer-stress', label: 'Stress' },
  { id: 'footer-narrow-container', label: 'Narrow container' },
]

export function AdaptiveFooterPage() {
  return (
    <DemoWrapper title="自适应 Footer" description="同一数据模型与同一 CSS Grid，在紧凑、丰富、压力和窄容器中自然重排。">
      <div className="space-y-8">
        <nav aria-label="页脚状态锚点" className="flex flex-wrap gap-2">
          {footerStates.map(state => (
            <a
              key={state.id}
              href={`#${state.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border/60 bg-card/70 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/35 hover:text-foreground"
            >
              {state.label}
            </a>
          ))}
        </nav>
        <div className="space-y-12">
          <Preview title="Compact" description="品牌与少量链接，无人为数量档位。"><SiteFooterView data={compact} /></Preview>
          <Preview title="Rich" description="导航、友链、联系方式与备案信息。"><SiteFooterView data={rich} /></Preview>
          <Preview title="Stress" description="更多分组与较长内容自动扩展。"><SiteFooterView data={stress} /></Preview>
          <Preview title="Narrow container" description="容器变窄时 auto-fit 自动折行。"><div className="max-w-sm"><SiteFooterView data={rich} /></div></Preview>
        </div>
      </div>
    </DemoWrapper>
  )
}

function Preview({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <section aria-labelledby={`footer-${title.replaceAll(' ', '-').toLowerCase()}`} className="scroll-mt-24">
      <div className="mb-4">
        <p className="meta-mono text-accent">FOOTER STATE</p>
        <h2 id={`footer-${title.replaceAll(' ', '-').toLowerCase()}`} className="mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
